import express from 'express'
import { createFileController, createFolderController } from '../controllers/fileController.js'

const router = express.Router()

router.route('/create-folder').post(createFolderController)
router.route('/create-file').post(createFileController)

export default router