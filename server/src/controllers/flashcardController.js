import asyncHandler from 'express-async-handler';
import UserCardProgress from '../models/UserCardProgress.js';
import Flashcard from '../models/Flashcard.js';
import { calculateSM2 } from '../utils/sm2.js';
import { logActivity } from '../utils/telemetry.js';

/**
 * @desc    Get all flashcards in a specific deck that are due for review
 * @route   GET /api/flashcards/due/:deckId
 * @access  Private
 */
export const getDueCards = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const userId = req.user._id;

  // Find progress documents that are due for review
  const dueProgress = await UserCardProgress.find({
    userId,
    deckId,
    nextReviewDate: { $lte: new Date() },
  })
    .sort({ nextReviewDate: 1 }) // Oldest overdue first
    .populate('cardId') // Bring in the frontText and backText
    .lean();

  // Map to a cleaner format for the frontend
  const dueCards = dueProgress
    .filter((p) => p.cardId)
    .map((p) => ({
      _id: p.cardId._id,
      frontText: p.cardId.frontText,
      backText: p.cardId.backText,
      progress: {
        interval: p.interval,
        repetition: p.repetition,
        efactor: p.easeFactor,
        nextReviewDate: p.nextReviewDate,
      },
    }));

  res.json(dueCards);
});

/**
 * @desc    Submit a review for a flashcard and update its SRS parameters
 * @route   POST /api/flashcards/:id/review
 * @access  Private
 */
export const reviewFlashcard = asyncHandler(async (req, res) => {
  const { id: cardId } = req.params; // Flashcard ID
  const { quality, deckId } = req.body; // quality: 0-5
  const userId = req.user._id;

  if (quality === undefined || quality < 0 || quality > 5) {
    res.status(400);
    throw new Error('Please provide a quality score between 0 and 5');
  }

  const card = await Flashcard.findOne({ _id: cardId, userId });
  if (!card) {
    res.status(404);
    throw new Error('Flashcard not found or not owned by you');
  }

  if (deckId && card.deckId.toString() !== deckId.toString()) {
    res.status(400);
    throw new Error('deckId does not match the flashcard');
  }

  // 1. Fetch existing progress or initialize defaults
  let progress = await UserCardProgress.findOne({ userId, cardId });

  const currentStats = {
    interval: progress ? progress.interval : 0,
    repetition: progress ? progress.repetition : 0,
    efactor: progress ? progress.easeFactor : 2.5,
  };

  // 2. Run the SM-2 Algorithm
  const updatedStats = calculateSM2(
    quality,
    currentStats.interval,
    currentStats.repetition,
    currentStats.efactor
  );

  const nextReviewDate = new Date(Date.now() + updatedStats.interval * 24 * 60 * 60 * 1000);

  // 3. Upsert the document
  if (progress) {
    progress.interval = updatedStats.interval;
    progress.repetition = updatedStats.repetition;
    progress.easeFactor = updatedStats.efactor;
    progress.nextReviewDate = nextReviewDate;
    await progress.save();
  } else {
    progress = await UserCardProgress.create({
      userId,
      cardId,
      deckId: card.deckId,
      interval: updatedStats.interval,
      repetition: updatedStats.repetition,
      easeFactor: updatedStats.efactor,
      nextReviewDate,
    });
  }

  res.json(progress);

  logActivity({
    userId,
    actionType: 'FLASHCARD_RATED',
    resourceId: cardId,
    metadata: { deckId: card.deckId, quality, algorithm: 'sm2' },
  });
});
