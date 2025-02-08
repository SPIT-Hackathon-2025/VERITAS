import express from 'express'
import { addCollaboratorsController, commitToRepoController, createRepositoryController, getRepoController, getUserRepoController } from '../controllers/repositoryController.js'

const router = express.Router()

router.route('/create-repo').post(createRepositoryController)
router.route('/commit-repo/:id').post(commitToRepoController)
router.route('/get-repo/:name').get(getRepoController)
router.route('/get-user-repos/:id').get(getUserRepoController)
router.route('/add-collabs').post(addCollaboratorsController)

export default router