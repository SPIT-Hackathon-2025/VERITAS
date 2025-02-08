import { fileModel } from "../models/fileModel.js"; // Import the file model
import { repoModel } from "../models/repoModel.js";

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
