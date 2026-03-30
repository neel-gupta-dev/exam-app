import { Router } from 'express';
import { getCourses, getCoursework, getAllAssignments, getAnnouncements } from '../controllers/classroomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// All classroom routes are protected (require user to be logged in)
router.use(protect);

/**
 * GET List all courses
 */
router.get('/courses', getCourses);

/**
 * GET Sync all upcoming assignments 
 */
router.get('/assignments/all', getAllAssignments);

/**
 * GET List coursework for a specific course
 */
router.get('/assignments/:courseId', getCoursework);

/**
 * GET List announcements for a specific course
 */
router.get('/announcements/:courseId', getAnnouncements);

export default router;
