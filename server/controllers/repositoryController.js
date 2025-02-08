import { repoModel } from "../models/repoModel.js";
import { userModel } from "../models/userModel.js";


export const createRepositoryController = async (request, response) => {
    try {
        const { name, email, description, isPrivate, collaborators } = request.body;
        if (!name || !email) {
            return response.status(400).json({
                success: false,
                error: 'Repository name and owner email are required',
            });
        }
        const owner = await userModel.findOne({ email });
        if (!owner) {
            return response.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const existingRepo = await repoModel.findOne({ name });
        if (existingRepo) {
            return response.status(400).json({
                success: false,
                error: 'Repository already exists',
            });
        }
        const newRepo = await repoModel.create({
            name,
            owner: owner._id,
            description,
            isPrivate,
            collaborators: collaborators || []
        })
        return res.status(201).json({
            success: true,
            message: "Repository created successfully",
            repo: newRepo,
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}