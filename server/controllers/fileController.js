import { fileModel } from "../models/fileModel.js"; // Import the file model
import { repoModel } from "../models/repoModel.js";
import { userModel } from "../models/userModel.js";

// Create a new folder
export const createFolderController = async (req, res) => {
    try {
        const { repoId, parentId, name, path } = req.body; // Extract folder details from the request body

        // Check if repository exists
        const repo = await repoModel.findById(repoId);
        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Check if parent folder exists (if provided)
        let parentFolder = null;
        if (parentId) {
            parentFolder = await fileModel.findById(parentId);
            if (!parentFolder || parentFolder.isFile) {
                return res.status(400).json({ message: "Invalid parent folder" });
            }
        }

        // Create the folder
        const newFolder = new fileModel({
            repo: repoId,
            parent: parentFolder ? parentFolder._id : null,
            name,
            isFile: false, // Folders are not files
            path,
            children: [], // Folders start with no children
        });

        // Save the new folder to the database
        await newFolder.save();

        // If it's not a root folder, add the new folder to the parent's children array
        if (parentFolder) {
            parentFolder.children.push(newFolder._id);
            await parentFolder.save();
        } else {
            // If it's a root-level folder, add it to the repo's `mainFolders` array
            repo.mainFolders.push(newFolder._id);
            await repo.save();
        }

        // Respond with the created folder details
        return res.status(201).json({
            message: "Folder created successfully",
            folder: newFolder,
        });

    } catch (error) {
        console.error("Error creating folder:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const createFileController = async (req, res) => {
    try {
        const { repoId, parentId, name, content, path } = req.body; // Extract file details from the request body

        // Check if repository exists
        const repo = await repoModel.findById(repoId); // Assuming you have a repoModel to check the repository
        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Check if parent folder exists (if provided)
        let parentFolder = null;
        if (parentId) {
            parentFolder = await fileModel.findById(parentId);
            if (!parentFolder || parentFolder.isFile) {
                return res.status(400).json({ message: "Invalid parent folder" });
            }
        }

        // Create the file
        const newFile = new fileModel({
            repo: repoId,
            parent: parentFolder ? parentFolder._id : null,
            name,
            isFile: true, // True for file
            content,
            path,
        });

        // Save the new file to the database
        await newFile.save();

        // If the file is inside a folder, update the folder's `children` array
        if (parentFolder) {
            parentFolder.children.push(newFile._id);
            await parentFolder.save();
        } else {
            // If it's a root-level file, add it to the repo's `mainFolders` array
            repo.mainFolders.push(newFile._id);
            await repo.save();
        }

        // Respond with the created file details
        return res.status(201).json({
            message: "File created successfully",
            file: newFile,
        });

    } catch (error) {
        console.error("Error creating file:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllFilesController = async (req, res) => {
    try {
        // Fetch all files from the database
        const allFiles = await fileModel.find({ isFile: true });

        if (!allFiles || allFiles.length === 0) {
            return res.status(404).json({ success: false, message: "No files found" });
        }

        // Prepare an array to store the file details
        let filesArray = [];

        // Process files asynchronously
        for (const file of allFiles) {
            const { name, content, repo, path } = file;

            // Find the repository details
            const repoData = await repoModel.findById(repo);
            if (!repoData) continue;

            // Find the owner details
            const ownerData = await userModel.findById(repoData.owner);
            if (!ownerData) continue;

            // Construct the file object
            const fileObject = {
                file_name: name,
                content: content,
                repo_name: repoData.name,
                owner_name: ownerData.name,
                path: path
            };

            // Add to the array
            filesArray.push(fileObject);
        }

        return res.status(200).json({
            success: true,
            message: "All files fetched successfully",
            file: filesArray
        });

    } catch (error) {
        console.error("Error fetching all files:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const addFilesController = async (req, res) => {
    try {
        const { repoId, files } = req.body;

        // Find the latest version of the repository
        let repo = await repoModel.findById(repoId).populate("mainFolders");
        if (!repo) {
            return res.status(404).json({ success: false, message: "Repository not found" });
        }

        while (repo.nextCommit) {
            repo = await repoModel.findById(repo.nextCommit).populate("mainFolders");
        }

        // Get existing file names in the root directory
        const existingFileNames = new Set(repo.mainFolders.map(file => file.name));

        // Create and save files if they don't already exist and name isn't "addFile"
        const createdFiles = [];
        for (const file of files) {
            if (file.name === "addFile" || existingFileNames.has(file.name)) {
                continue; // Skip this file
            }

            const newFile = await fileModel.create({
                repo: repo._id,
                parent: null, // Root directory
                name: file.name,
                path: file.path,
                content: file.content,
                isFile: true,
                children: []
            });

            createdFiles.push(newFile._id);
            existingFileNames.add(file.name); // Update existing files set
        }

        // If no new files were added, return a message
        if (createdFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No new files were added (files may already exist or are restricted)"
            });
        }

        // Update repository's mainFolders array with new files
        repo.mainFolders = [...repo.mainFolders, ...createdFiles];
        await repo.save();

        return res.status(201).json({
            success: true,
            message: "Files added successfully",
            files: createdFiles
        });

    } catch (error) {
        console.error("Error adding files:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


