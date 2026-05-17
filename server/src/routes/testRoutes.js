import { Router } from 'express';
import multer from 'multer';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createTest,
  getAllTestsAdmin,
  getStudentTests,
  getTestById,
  updateTest,
  togglePublish,
  deleteTest,
  addQuestion,
  bulkAddQuestions,
  getTestQuestions,
  updateQuestion,
  deleteQuestion,
  importPdfQuestions,
  uploadTestImage,
  getShareDetails,
} from '../controllers/testController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB max
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  },
});

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/:testId/share-details', getShareDetails);

// ─── STUDENT-FACING ───────────────────────────────────────────────────────────
// Returns only tests the logged-in user is eligible for (B2C or B2B)
router.get('/', protect, getStudentTests);

// ─── ADMIN: TEST CRUD ─────────────────────────────────────────────────────────
router.get('/admin', protectAdmin, getAllTestsAdmin);
router.post('/', protectAdmin, createTest);
router.get('/:id', protectAdmin, getTestById);
router.patch('/:id', protectAdmin, updateTest);
router.patch('/:id/publish', protectAdmin, togglePublish);
router.delete('/:id', protectAdmin, deleteTest);

// ─── ADMIN: QUESTION MANAGEMENT ──────────────────────────────────────────────
router.get('/:testId/questions', protectAdmin, getTestQuestions);
router.post('/:testId/questions', protectAdmin, addQuestion);
router.post('/:testId/questions/bulk', protectAdmin, bulkAddQuestions);
router.post('/:testId/questions/import-pdf', protectAdmin, upload.single('pdf'), importPdfQuestions);
router.post('/:testId/images', protectAdmin, imageUpload.single('image'), uploadTestImage);
router.patch('/:testId/questions/:questionId', protectAdmin, updateQuestion);
router.delete('/:testId/questions/:questionId', protectAdmin, deleteQuestion);

export default router;
