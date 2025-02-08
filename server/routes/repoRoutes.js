import express from 'express'
import { addCollaboratorsController, commitToRepoController, compareBranchWithMasterController, createBranchController, createRepositoryController, getFileByPathController, getRepoController, getUserRepoController, mergeWithMasterBranchController } from '../controllers/repositoryController.js'

const router = express.Router()

router.route('/create-repo').post(createRepositoryController)
router.route('/commit-repo/:id').post(commitToRepoController)
router.route('/get-repo/:id').get(getRepoController)
router.route('/get-user-repos/:id').get(getUserRepoController)
router.route('/add-collabs').post(addCollaboratorsController)
router.route('/create-branch').post(createBranchController)
router.route('/compare-branch').post(compareBranchWithMasterController)
router.route('/merge-branch').post(mergeWithMasterBranchController)
router.route('/get-file-id').post(getFileByPathController)

export default router