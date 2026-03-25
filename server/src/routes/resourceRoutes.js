import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createResource, getResources, getResourceById } from '../controllers/resourceController.js';

const router = Router();

router.use(protect);

router.route('/').post(createResource).get(getResources);
router.route('/:id').get(getResourceById);

export default router;
