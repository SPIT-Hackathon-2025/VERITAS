import { fileModel } from "../models/fileModel.js";
import { repoModel } from "../models/repoModel.js";
import { userModel } from "../models/userModel.js";
import { diffLines } from "diff";
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
            parentBranch: currentRepo.parentBranch
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
        const id = req.params.id;
        // Find the repository by name
        let repo = await repoModel.findById(id).populate("mainFolders");
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

        // Find repositories owned by the user (latest versions only)
        const ownedRepos = await repoModel.find({ owner: id, nextCommit: null }).select("-mainFolders");

        // Find repositories where the user is a collaborator (latest versions only)
        const collaboratedRepos = await repoModel.find({
            collaborators: { $in: [id] }, // Check if id exists in collaborators array
            nextCommit: null
        }).select("-mainFolders");

        // Combine results
        const repos = [...ownedRepos, ...collaboratedRepos];

        if (repos.length === 0) {
            return res.status(204).json({ message: "No repositories found for this user" });
        }

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

export const createBranchController = async (req, res) => {
    try {
        const { repoId, userId, branchName } = req.body;  // Get repoName, ownerId from params and userId from body  

        // Step 1: Find the original repository by repoName and ownerId
        const originalRepo = await repoModel.findOne({ _id: repoId }).populate('mainFolders');
        if (!originalRepo) {
            return res.status(404).json({ message: "Original repository not found" });
        }

        // Step 2: Find the latest version of the repository (this could be the next commit or latest branch)
        let latestRepo = originalRepo;
        if (originalRepo.nextCommit) {
            latestRepo = await repoModel.findById(originalRepo.nextCommit).populate('mainFolders');
        }

        // Step 3: Clone the latest version of the repository (create a new branch)
        const newRepoData = {
            name: branchName,
            owner: userId,  // Set the owner of the new repo as the provided userId
            description: latestRepo.description,
            isPrivate: latestRepo.isPrivate,
            collaborators: latestRepo.collaborators,  // Same collaborators as the original repo (you can adjust this later)
            mainFolders: [],  // To hold the folder structure of the new repo
            previousCommit: latestRepo._id,  // Link the previous commit to the latest repo
        };

        // Create the new repository (branch)
        const newRepo = await repoModel.create(newRepoData);

        // Step 4: Add the new repo (branch) to the original repo's `branches` array
        originalRepo.branches = [...(originalRepo.branches || []), newRepo._id];
        await originalRepo.save();  // Save the updated original repo with the new branch

        // Step 5: Clone the folder structure and files from the latest version
        for (const folderId of latestRepo.mainFolders) {
            const clonedFolder = await cloneFolderBranch(folderId, newRepo._id, userId);  // Clone each folder
            newRepo.mainFolders.push(clonedFolder._id);  // Add the cloned folder to the new repo
        }

        newRepo.parentBranch = originalRepo._id

        await newRepo.save();  // Save the new repo with its folder structure

        return res.status(201).json({
            message: "Branch created successfully",
            newRepo,
        });

    } catch (error) {
        console.error("Error creating branch:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const cloneFolderBranch = async (folderId, newRepoId, userId) => {
    const folder = await fileModel.findById(folderId).populate("children");

    if (!folder) return null;

    // Clone folder metadata
    const newFolder = await fileModel.create({
        repo: newRepoId, // New repo for the clone
        parent: null, // Root-level folder has no parent
        name: folder.name,
        isFile: folder.isFile,
        path: folder.path.replace(folder.repo.toString(), newRepoId.toString()), // Update path to the new repo
        content: folder.content, // Copy content of the file if it is a file
        owner: userId, // Set the owner to the new user (userId)
        children: [], // Children will be populated recursively
    });

    // Recursively clone subfolders and files
    for (const childId of folder.children) {
        const clonedChild = await cloneFolderBranch(childId, newRepoId, userId);
        if (clonedChild) {
            newFolder.children.push(clonedChild._id); // Add the cloned child to the new folder
        }
    }

    await newFolder.save(); // Save the newly cloned folder (or file)
    return newFolder;
};

export const compareBranchWithMasterController = async (req, res) => {
    try {
        const { branchRepoId } = req.body; // Get the branch repo ID from request params

        // Step 1: Fetch the branch repository
        let branchRepo = await repoModel.findById(branchRepoId)
        if (!branchRepo) {
            return res.status(404).json({ message: "Branch repository not found" });
        }

        while (branchRepo.nextCommit) {
            branchRepo = await repoModel.findById(branchRepo.nextCommit)
        }

        // Step 2: Fetch the master repository (parentBranch)
        const masterRepo = await repoModel.findById(branchRepo.parentBranch);
        if (!masterRepo) {
            return res.status(404).json({ message: "Master repository not found" });
        }

        // Step 3: Populate folder structures for both repositories
        const populatedBranchRepo = await populateRepoFolders(branchRepo);
        const populatedMasterRepo = await populateRepoFolders(masterRepo);

        // Step 4: Compare files between the two repositories
        const fileDifferences = compareRepoFiles(populatedBranchRepo, populatedMasterRepo);

        // Step 5: Send response with both repo structures and file differences
        return res.status(200).json({
            message: "Branch and Master comparison",
            branchRepo: populatedBranchRepo,
            masterRepo: populatedMasterRepo,
            fileDifferences,
        });

    } catch (error) {
        console.error("Error comparing branch with master:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Function to compare files between two repositories
const compareRepoFiles = (branchRepo, masterRepo) => {
    let differences = [];

    // Flatten the files from both repositories into a single list
    const branchFiles = getAllFiles(branchRepo.mainFolders);
    const masterFiles = getAllFiles(masterRepo.mainFolders);

    // Create a map for easy lookup of master branch files by path
    const masterFileMap = {};
    for (const file of masterFiles) {
        masterFileMap[file.path] = file;
    }

    // Compare each file in the branch with its corresponding file in the master repo
    for (const branchFile of branchFiles) {
        if (!masterFileMap[branchFile.path]) {
            differences.push({
                filePath: branchFile.path,
                message: "File exists in branch but not in master",
            });
            continue;
        }

        const masterFile = masterFileMap[branchFile.path];
        const diffResult = getLineDifferences(branchFile.content, masterFile.content);

        if (diffResult.length > 0) {
            differences.push({
                filePath: branchFile.path,
                differences: diffResult,
            });
        }
    }

    return differences;
};

// Function to recursively retrieve all files from a repository's folder structure
const getAllFiles = (folders) => {
    let files = [];
    for (const folder of folders) {
        if (folder.isFile) {
            files.push(folder);
        } else if (folder.children) {
            files = files.concat(getAllFiles(folder.children)); // Recursively get files
        }
    }
    return files;
};

// Function to compare two file contents line-by-line
const getLineDifferences = (branchContent, masterContent) => {
    const differences = [];
    const diff = diffLines(masterContent, branchContent); // Line-by-line comparison

    let lineNum = 1;
    for (const part of diff) {
        if (part.added) {
            differences.push({ line: lineNum, type: "added", content: part.value });
        } else if (part.removed) {
            differences.push({ line: lineNum, type: "removed", content: part.value });
        }
        lineNum += part.count || 0;
    }

    return differences;
};

export const mergeWithMasterBranchController = async (req, res) => {
    try {
        const { branchRepoId } = req.body;

        // Find the latest commit of the branch
        let branchRepo = await repoModel.findById(branchRepoId).populate("mainFolders");
        if (!branchRepo) {
            return res.status(404).json({ success: false, message: "Branch repository not found" });
        }

        while (branchRepo.nextCommit) {
            branchRepo = await repoModel.findById(branchRepo.nextCommit).populate("mainFolders");
        }

        // Find the master branch (parent branch)
        const masterRepo = await repoModel.findById(branchRepo.parentBranch).populate("mainFolders");
        if (!masterRepo) {
            return res.status(404).json({ success: false, message: "Master branch repository not found" });
        }

        // Populate master and branch repositories with full folder structures
        await populateRepoFolders(masterRepo);
        await populateRepoFolders(branchRepo);

        // Map branch files by relative path for easy lookup
        const branchFilesMap = new Map();
        for (const folder of branchRepo.mainFolders) {
            mapFilesRecursively(folder, branchFilesMap);
        }

        // Merge files into the master branch
        for (const folder of masterRepo.mainFolders) {
            mergeFilesRecursively(folder, branchFilesMap);
        }

        // Save all updated master files
        for (const folder of masterRepo.mainFolders) {
            await saveFilesRecursively(folder);
        }

        // Delete the branch repository after merging
        await repoModel.findByIdAndDelete(branchRepo._id);

        return res.status(200).json({
            success: true,
            message: "Branch successfully merged with master and deleted",
        });

    } catch (error) {
        console.error("Error merging branch with master:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const mapFilesRecursively = (folder, fileMap, path = "") => {
    if (!folder) return;

    const newPath = path + "/" + folder.name;

    if (folder.isFile) {
        fileMap.set(newPath, folder);
    } else {
        for (const child of folder.children) {
            mapFilesRecursively(child, fileMap, newPath);
        }
    }
};

const mergeFilesRecursively = (folder, branchFilesMap, path = "") => {
    if (!folder) return;

    const newPath = path + "/" + folder.name;

    if (folder.isFile && branchFilesMap.has(newPath)) {
        const branchFile = branchFilesMap.get(newPath);

        // Merge file content line by line
        const masterContent = folder.content.split("\n");
        const branchContent = branchFile.content.split("\n");

        const maxLength = Math.max(masterContent.length, branchContent.length);
        let mergedContent = "";

        for (let i = 0; i < maxLength; i++) {
            const masterLine = masterContent[i] || "";
            const branchLine = branchContent[i] || "";
            mergedContent += masterLine + "\n" + branchLine + "\n";
        }

        folder.content = mergedContent; // Update master branch file content
    } else {
        for (const child of folder.children) {
            mergeFilesRecursively(child, branchFilesMap, newPath);
        }
    }
};

const saveFilesRecursively = async (folder) => {
    if (!folder) return;

    if (folder.isFile) {
        await folder.save();
    } else {
        for (const child of folder.children) {
            await saveFilesRecursively(child);
        }
    }
};

export const getCommitHistoryController = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the latest version of the repository by traversing back to the first commit
        let repo = await repoModel.findById(id);
        if (!repo) {
            return res.status(404).json({ success: false, message: "Repository not found" });
        }

        // Traverse back to the first commit
        while (repo.previousCommit) {
            repo = await repoModel.findById(repo.previousCommit);
            if (!repo) break; // Prevent infinite loop if something goes wrong
        }

        // Collect all commit IDs by traversing forward using nextCommit
        let commitHistory = [];
        while (repo) {
            commitHistory.push(repo._id);
            repo = repo.nextCommit ? await repoModel.findById(repo.nextCommit) : null;
        }

        return res.status(200).json({
            success: true,
            message: "Commit history fetched successfully",
            commits: commitHistory
        });

    } catch (error) {
        console.error("Error fetching commit history:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

