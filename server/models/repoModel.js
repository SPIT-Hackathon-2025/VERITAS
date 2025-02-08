import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }, // Repository name
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }, // Repository owner
    description: {
        type: String,
        default: ""
    }, // Description of the repository
    isPrivate: {
        type: Boolean,
        default: false
    }, // Visibility (private/public)
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }], // Users with access
    mainFolders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    }], // Root-level folders
    createdAt: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true });

export const repoModel = mongoose.model('repos', repoSchema);