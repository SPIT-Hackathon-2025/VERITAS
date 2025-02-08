import express from 'express'
import { createUserController } from '../controllers/userController.js'

const router = express.Router()

router.route('/create-user').post(createUserController)

export default router