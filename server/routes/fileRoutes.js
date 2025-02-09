import express from 'express'
import { addFilesController, createFileController, createFolderController, getAllFilesController } from '../controllers/fileController.js'

const router = express.Router()

router.route('/create-folder').post(createFolderController)
router.route('/create-file').post(createFileController)
router.route('/get-files').get(getAllFilesController)
router.route('/add-files').post(addFilesController)

export default router