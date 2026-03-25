import { Router } from 'express';
import { getPublicProfile } from '../controllers/publicController.js';

const router = Router();

router.get('/profile/:rollNo', getPublicProfile);

export default router;
