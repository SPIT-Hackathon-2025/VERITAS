import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, // Repository name
    owner: {
        type: String,
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
        type: String,
        ref: "users"
    }], // Users with access
    mainFolders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    }], // Root-level folders
    previousCommit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "repos",
        default: null
    },
    nextCommit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "repos",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true });

export const repoModel = mongoose.model('repos', repoSchema);