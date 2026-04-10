import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDueCards, reviewFlashcard } from '../controllers/flashcardController.js';

const router = Router();

// All flashcard routes are protected
router.use(protect);

// GET due cards for a specific deck
router.get('/due/:deckId', getDueCards);

// POST review for a specific card
router.post('/:id/review', reviewFlashcard);

export default router;
