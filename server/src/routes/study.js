import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { protect } from '../middlewares/authMiddleware.js';
import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import UserCardProgress from '../models/UserCardProgress.js';
import { calculateNextReview } from '../utils/srs.js';

const router = Router();

router.use(protect);

// @desc    Get all decks for user
// @route   GET /api/study/decks
router.get(
  '/decks',
  asyncHandler(async (req, res) => {
    const decks = await Deck.find({ userId: req.user.id }).lean();
    
    // For each deck, we also want to know how many cards are due and total count
    // This is for the UI dashboard
    const decksWithStats = await Promise.all(decks.map(async (deck) => {
      const totalCards = await Flashcard.countDocuments({ deckId: deck._id, userId: req.user.id });
      const dueCards = await UserCardProgress.countDocuments({
        deckId: deck._id,
        userId: req.user.id,
        nextReviewDate: { $lte: new Date() }
      });
      
      return {
        ...deck,
        totalCards,
        dueCards,
        id: deck._id, // Frontend uses id
      };
    }));

    res.json(decksWithStats);
  })
);

// @desc    Fetch random cards for Cram Mode
// @route   GET /api/study/cram/:deckId
router.get(
  '/cram/:deckId',
  asyncHandler(async (req, res) => {
    const { deckId } = req.params;
    const userId = req.user.id;

    // Fetch up to 20 random cards for this deck and user
    const cards = await Flashcard.aggregate([
      { $match: { deckId: new mongoose.Types.ObjectId(deckId), userId: new mongoose.Types.ObjectId(userId) } },
      { $sample: { size: 20 } }
    ]);

    // Format like session cards but with no progress needed for math
    const sessionCards = cards.map(card => ({
      ...card,
      _id: card._id,
      progress: null,
      type: 'cram'
    }));

    res.json(sessionCards);
  })
);

// @desc    Create a new private deck
// @route   POST /api/study/deck
router.post(
  '/deck',
  asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;

    const deck = await Deck.create({
      userId: req.user.id,
      title,
      description,
      category,
    });

    res.status(201).json(deck);
  })
);

// @desc    Create a new flashcard
// @route   POST /api/study/card
router.post(
  '/card',
  asyncHandler(async (req, res) => {
    const { deckId, frontText, backText } = req.body;

    // Validate deck ownership
    const deck = await Deck.findOne({ _id: deckId, userId: req.user.id });
    if (!deck) {
      res.status(404);
      throw new Error('Deck not found or you do not have permission');
    }

    const card = await Flashcard.create({
      deckId,
      userId: req.user.id,
      frontText,
      backText,
    });

    res.status(201).json(card);
  })
);

// @desc    Fetch a study session (Due + New cards)
// @route   GET /api/study/session/:deckId
router.get(
  '/session/:deckId',
  asyncHandler(async (req, res) => {
    const { deckId } = req.params;
    const userId = req.user.id;

    // 1. Find up to 15 "Due" cards in UserCardProgress
    const dueProgress = await UserCardProgress.find({
      deckId,
      userId,
      nextReviewDate: { $lte: new Date() },
    })
      .limit(15)
      .lean();

    // Population of Flashcard data for due cards
    const dueCardIds = dueProgress.map((p) => p.cardId);
    const dueCardsData = await Flashcard.find({ _id: { $in: dueCardIds } }).lean();

    // Map progress state back to cards
    const dueSessionCards = dueCardsData.map((card) => {
      const progress = dueProgress.find((p) => p.cardId.toString() === card._id.toString());
      return { ...card, progress, type: 'due' };
    });

    // 2. Fill remaining quota with "New" cards
    const remainingQuota = 15 - dueSessionCards.length;
    let sessionCards = [...dueSessionCards];

    if (remainingQuota > 0) {
      // Find IDs of cards that already have progress docs
      const allProgressDocs = await UserCardProgress.find({ deckId, userId }).select('cardId').lean();
      const cardIdsWithProgress = allProgressDocs.map((p) => p.cardId.toString());

      const newCards = await Flashcard.find({
        deckId,
        userId,
        _id: { $nin: cardIdsWithProgress },
      })
        .limit(remainingQuota)
        .lean();

      const newSessionCards = newCards.map((card) => ({
        ...card,
        progress: null,
        type: 'new',
      }));

      sessionCards = [...sessionCards, ...newSessionCards];
    }

    res.json(sessionCards);
  })
);

// @desc    Accept review and update progress
// @route   POST /api/study/review
router.post(
  '/review',
  asyncHandler(async (req, res) => {
    const { cardId, deckId, grade, isCram } = req.body;
    const userId = req.user.id;

    // If Cram Mode, do not update anything in DB, just return success
    if (isCram) {
      return res.status(200).json({ message: "Cram review logged (no DB update)" });
    }

    // Validate ownership/existence of card
    const card = await Flashcard.findOne({ _id: cardId, userId });
    if (!card) {
      res.status(404);
      throw new Error('Flashcard not found or not owned by you');
    }

    // Find or create progress doc
    let progress = await UserCardProgress.findOne({ userId, cardId });

    const currentInterval = progress ? progress.interval : 0;
    const currentRepetition = progress ? progress.repetition : 0;
    const currentEaseFactor = progress ? progress.easeFactor : 2.5;

    const updated = calculateNextReview(
      grade,
      currentInterval,
      currentRepetition,
      currentEaseFactor
    );

    if (progress) {
      progress.interval = updated.interval;
      progress.repetition = updated.repetition;
      progress.easeFactor = updated.easeFactor;
      progress.nextReviewDate = updated.nextReviewDate;
      await progress.save();
    } else {
      progress = await UserCardProgress.create({
        userId,
        cardId,
        deckId,
        interval: updated.interval,
        repetition: updated.repetition,
        easeFactor: updated.easeFactor,
        nextReviewDate: updated.nextReviewDate,
      });
    }

    res.json(progress);
  })
);

export default router;
