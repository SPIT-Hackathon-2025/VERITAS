import express from 'express'
import { createFileController, createFolderController, getAllFilesController } from '../controllers/fileController.js'

const router = express.Router()

router.route('/create-folder').post(createFolderController)
router.route('/create-file').post(createFileController)
router.route('/get-files').get(getAllFilesController)

export default router