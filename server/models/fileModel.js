import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    repo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "repos",
        required: true
    }, // Repository reference
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        default: null
    }, // Parent folder (null if root)
    name: {
        type: String,
        required: true
    }, // File or folder name
    isFile: {
        type: Boolean,
        required: true
    }, // True = file, False = folder
    content: {
        type: String,
        default: null
    }, // Only for files
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "File"
    }], // Only for folders
    hash: {
        type: String,
        default: null
    }, // Unique file hash for versioning
    path: {
        type: String,
        required: true
    }, // Full file path
    createdAt: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true });

export const FileModel = mongoose.model("files", fileSchema);
