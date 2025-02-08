import { fileModel } from "../models/fileModel.js";
import { repoModel } from "../models/repoModel.js";
import { userModel } from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";


export const createRepositoryController = async (request, response) => {
    try {
        const { name, id, description, isPrivate, collaborators } = request.body;

        if (!name || !id) {
            return response.status(400).json({
                success: false,
                error: 'Repository name and owner id are required',
            });
        }

        // Find the owner of the repository
        const owner = await userModel.findOne({ _id: id });
        if (!owner) {
            return response.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Create the repository first
        const newRepo = await repoModel.create({
            name,
            owner: owner._id,
            description,
            isPrivate,
            collaborators: [] // Initialize with an empty array for collaborators
        });

        // Create the default README.md file
        const readmeFile = await fileModel.create({
            repo: newRepo._id,            // Link the file to the new repository
            parent: null,                  // Root-level file, so parent is null
            name: 'README.md',             // File name
            isFile: true,                  // Indicating that it's a file
            content: '',                   // Empty content for now
            path: `README.md`,             // Path in the repo
            children: []                   // No children since it's a file
        });

        // Add the README.md file to the repository's main folders
        newRepo.mainFolders = [readmeFile._id];  // Add the file to the repository's root
        await newRepo.save();

        // Now handle collaborators (send emails and add to collaborators list)
        let collaboratorsId = [];
        if (collaborators && collaborators.length > 0) {
            // Find users for each collaborator
            for (const collaborator of collaborators) {
                const user = await userModel.findOne({ email: collaborator });
                if (!user) {
                    return response.status(404).json({
                        success: false,
                        message: `Collaborator with email ${collaborator} not found`
                    });
                }
                collaboratorsId.push(user._id);

                // Send an invitation email to the collaborator
                await sendMail(user.email, "Repository Invitation", newRepo.name, owner.name);
            }
        }

        // Update the repository's collaborators list
        newRepo.collaborators = collaboratorsId || [];
        await newRepo.save();

        return response.status(201).json({
            success: true,
            message: "Repository created successfully with a README.md file and collaborators invited",
            repo: newRepo,
        });

    } catch (error) {
        console.error(error);
        return response.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



export const commitToRepoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { updatedFiles, commitMessage } = req.body; // List of modified files and commit message

        // Find the current repository
        const currentRepo = await repoModel.findById(id).populate("mainFolders");
        if (!currentRepo) return res.status(404).json({ message: "Repository not found" });

        // Clone the repository (excluding _id)
        const newRepoData = {
            name: currentRepo.name,
            owner: currentRepo.owner,
            description: currentRepo.description,
            isPrivate: currentRepo.isPrivate,
            collaborators: currentRepo.collaborators,
            mainFolders: [],
            previousCommit: currentRepo._id, // Link previous repo version
        };

        // Create a new repository version
        const newRepo = await repoModel.create(newRepoData);

        // Update the current repo to point to the new commit (FORWARD LINK)
        currentRepo.nextCommit = newRepo._id;
        await currentRepo.save(); // Save the forward link

        // Clone the folder structure and update files
        for (const folderId of currentRepo.mainFolders) {
            const clonedFolder = await cloneFolder(folderId, newRepo._id, updatedFiles);
            newRepo.mainFolders.push(clonedFolder._id);
        }

        await newRepo.save();

        return res.status(201).json({
            message: "Commit successful",
            commitMessage,
            newRepo,
        });

    } catch (error) {
        console.error("Error committing changes:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const cloneFolder = async (folderId, newRepoId, updatedFiles) => {
    const folder = await fileModel.findById(folderId).populate("children");

    if (!folder) return null;

    // Check if this is a file and needs to be updated
    let newContent = folder.content;
    if (folder.isFile) {
        const updatedFile = updatedFiles.find(file => file.fileId === folder._id.toString());
        if (updatedFile) {
            newContent = updatedFile.content; // Update file content
        }
    }

    // Clone folder metadata
    const newFolder = await fileModel.create({
        repo: newRepoId,
        parent: null, // Will be updated if it's a subfolder
        name: folder.name,
        isFile: folder.isFile,
        path: folder.path.replace(folder.repo.toString(), newRepoId.toString()), // Adjust path for new repo
        content: newContent, // Updated content if modified
        children: [],
    });

    // Recursively clone subfolders and files
    for (const childId of folder.children) {
        const clonedChild = await cloneFolder(childId, newRepoId, updatedFiles);
        if (clonedChild) {
            newFolder.children.push(clonedChild._id);
        }
    }

    await newFolder.save();
    return newFolder;
};


export const getRepoController = async (req, res) => {
    try {
        const name = req.params.name;
        // Find the repository by name
        let repo = await repoModel.findOne({ name: name }).populate("mainFolders");
        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Traverse to the latest commit if there is a previous commit (linked list of commits)
        while (repo.nextCommit) {
            repo = await repoModel.findById(repo.nextCommit).populate("mainFolders");
        }

        // Populate the main folders with their files and subfolders
        const populatedRepo = await populateRepoFolders(repo);

        return res.status(200).json({
            message: "Latest version of the repository",
            repo: populatedRepo,
        });

    } catch (error) {
        console.error("Error getting repository:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Recursively populate the folders and files in the repository
 */
const populateFolderRecursively = async (folder) => {
    if (!folder || folder.isFile) return folder; // Base case: return if it's a file or null

    // Populate children (subfolders & files)
    folder = await fileModel.findById(folder._id).populate("children");

    // Recursively populate child folders
    for (let i = 0; i < folder.children.length; i++) {
        folder.children[i] = await populateFolderRecursively(folder.children[i]);
    }

    return folder;
};

export const populateRepoFolders = async (repo) => {
    const populatedFolders = [];

    for (const folderId of repo.mainFolders) {
        let folder = await fileModel.findById(folderId).populate("children");
        folder = await populateFolderRecursively(folder); // Populate nested folders
        populatedFolders.push(folder);
    }

    repo.mainFolders = populatedFolders; // Replace folder IDs with populated folder objects
    return repo;
};


export const getUserRepoController = async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from request params

        // Find all repositories owned by the user where `nextCommit` is null (latest version)
        let repos = await repoModel.find({ owner: id, nextCommit: null }).select("-mainFolders");

        if (!repos || repos.length === 0) {
            return res.status(404).json({ message: "No repositories found for this user" });
        }

        // Populate all repositories concurrently

        return res.status(200).json({
            message: "User's repositories fetched successfully",
            repos
        });

    } catch (error) {
        console.error("Error fetching user repositories:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addCollaboratorsController = async (req, res) => {
    try {
        const { ownerId, repoName, collaborators } = req.body;

        // Find all repositories owned by the given ownerId and having the given repoName
        const repos = await repoModel.find({ owner: ownerId, name: repoName });
        const owner = await userModel.findOne({ _id: ownerId })

        if (!repos.length) {
            return res.status(404).json({ message: "No repositories found matching the criteria" });
        }

        // Fetch users by emails
        const users = await Promise.all(
            collaborators.map(email => userModel.findOne({ email }))
        );

        // Check if any user is not found
        if (users.includes(null)) {
            return res.status(404).json({
                success: false,
                message: "One or more collaborators not found"
            });
        }

        // Extract user IDs
        const collaboratorsId = users.map(user => user._id);

        // Update all matching repositories
        for (const repo of repos) {
            // Add collaborators to the repository
            repo.collaborators = [...new Set([...repo.collaborators, ...collaboratorsId])];
            await repo.save();

            // Send invitation email to each collaborator
            for (const user of users) {
                await sendMail(user.email, "Repository Invitation", repo.name, owner.name); // You can send the email with details like repo name and owner
            }
        }

        return res.status(200).json({
            success: true,
            message: "Collaborators added and invitation emails sent successfully",
            updatedRepos: repos
        });

    } catch (error) {
        console.error("Error adding collaborators:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


