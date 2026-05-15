import { Router } from 'express';
import multer from 'multer';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import {
  createStudyMaterial,
  getStudyMaterials,
  getAdminStudyMaterials,
  getStudyMaterialBySlug,
  deleteStudyMaterial,
} from '../controllers/studyMaterialController.js';

const router = Router();

// Multer config: accept PDF/documents into memory buffer (limit 25MB for high-yield study guides)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

/**
 * ─── PUBLIC ENDPOINTS ─────────────────────────────────────────────────────────
 */
// Fetch all published notes/study material metadata for dashboard grid
router.get('/', getStudyMaterials);

// Fetch detailed single study material by unique SEO slug
router.get('/slug/:slug', getStudyMaterialBySlug);

/**
 * ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────
 */
// Fetch all study materials including draft/unpublished documents
router.get('/admin', protectAdmin, getAdminStudyMaterials);

// Upload study material file directly into memory and stream it to Cloudinary
router.post('/', protectAdmin, upload.single('file'), createStudyMaterial);

// Remove database record and corresponding asset inside Cloudinary CDN
router.delete('/:id', protectAdmin, deleteStudyMaterial);

export default router;
