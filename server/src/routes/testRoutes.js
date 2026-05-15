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
  getShareDetails,
} from '../controllers/testController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB max

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
router.patch('/:testId/questions/:questionId', protectAdmin, updateQuestion);
router.delete('/:testId/questions/:questionId', protectAdmin, deleteQuestion);

export default router;
