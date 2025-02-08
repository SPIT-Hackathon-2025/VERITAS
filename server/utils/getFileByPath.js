import { repoModel } from "../models/repoModel.js";
import { fileModel } from "../models/fileModel.js";

const getFileId = async (repoName, ownerId, filePath) => {
    try {
        // Extract file name from the given file path
        const fileName = filePath.split("/").pop();

        // Find the latest version of the repository
        let repo = await repoModel.findOne({ name: repoName, owner: ownerId, nextCommit: null }).populate("mainFolders");

        if (!repo) {
            return "Repo not found";
        }

        // Function to recursively search for the file inside folders
        const findFileInRepo = async (folders) => {
            for (const folder of folders) {
                const populatedFolder = await populateFolderRecursively(folder);
                for (const file of populatedFolder.children) {
                    if (file.isFile && file.name === fileName) {
                        return file._id; // Return file ID if found
                    }
                }
            }
            return null; // File not found
        };

        // Search for the file in the repository
        const fileId = await findFileInRepo(repo.mainFolders);

        if (!fileId) {
            return "File Not found";
        }

        return {
            repoId: repo._id,
            fileId
        }

    } catch (error) {
        return "Not found"
    }
}

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

export default getFileId;