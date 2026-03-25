import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createResource, getResources, getResourceById, deleteResource } from '../controllers/resourceController.js';

const router = Router();

router.use(protect);

router.route('/').post(createResource).get(getResources);
router.route('/:id').get(getResourceById).delete(deleteResource);

export default router;
