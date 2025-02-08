import { userModel } from "../models/userModel.js";
import bcrypt from 'bcrypt'

export const createUserController = async (request, response) => {
    try {
        const { name, email, password } = request.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return response.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashedPassword });
        return response.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}