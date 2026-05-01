import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Battle from '../models/Battle.js';
import BattleQuestion from '../models/BattleQuestion.js';
import User from '../models/User.js';

const router = express.Router();

/** Generate a random 5-letter uppercase code */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I or O to avoid confusion with 1/0
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Generate a unique room code (retry on collision) */
async function uniqueRoomCode() {
  for (let i = 0; i < 10; i++) {
    const code = generateRoomCode();
    const existing = await Battle.findOne({ roomCode: code, status: { $in: ['waiting', 'active'] } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique room code');
}

/** Auto-abandon stale waiting rooms older than 10 minutes */
async function cleanupStaleRooms() {
  const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 min
  await Battle.updateMany(
    { status: 'waiting', createdAt: { $lt: staleThreshold } },
    { $set: { status: 'abandoned' } }
  );
}

/**
 * GET /battle/online-count
 * Heartbeat endpoint — stamps caller as "seen", returns count of players
 * who have been on the lobby in the last 45 seconds.
 */
router.get('/online-count', protect, async (req, res) => {
  try {
    // Stamp this user as online right now (upsert-style, no version conflicts)
    await User.updateOne(
      { _id: req.user._id },
      { $set: { battleLastSeen: new Date() } }
    );

    // Count all users seen in the last 45 seconds
    const cutoff = new Date(Date.now() - 45 * 1000);
    const onlinePlayers = await User.countDocuments({
      battleLastSeen: { $gte: cutoff }
    });

    res.json({ onlinePlayers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get online count' });
  }
});

/**
 * POST /battle/queue
 * Random matchmaking — finds a waiting room or creates one.
 * Uses atomic findOneAndUpdate to prevent race conditions.
 */
router.post('/queue', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Cleanup stale waiting rooms first
    await cleanupStaleRooms();

    // Check if user is already in an active or waiting battle
    const existingBattle = await Battle.findOne({
      $or: [{ player1: userId }, { player2: userId }],
      status: { $in: ['waiting', 'active'] }
    });

    if (existingBattle) {
      return res.json({ roomCode: existingBattle.roomCode, status: existingBattle.status, isAdmin: req.user.role === 'admin' });
    }

    // Fetch questions ahead of time
    const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
    if (questions.length === 0) {
      return res.status(500).json({ error: 'No battle questions available in the database' });
    }

    // Atomically find a waiting room and join it (prevents race conditions)
    const matchedBattle = await Battle.findOneAndUpdate(
      {
        status: 'waiting',
        player1: { $ne: userId },
        isCustomRoom: { $ne: true } // Don't match custom/private rooms
      },
      {
        $set: {
          player2: userId,
          status: 'active',
          startedAt: new Date(),
          questions: questions.map(q => q._id)
        }
      },
      { new: true }
    );

    if (matchedBattle) {
      return res.json({ roomCode: matchedBattle.roomCode, status: 'active', matched: true, isAdmin: req.user.role === 'admin' });
    }

    // No waiting room found — create a new one
    const roomCode = await uniqueRoomCode();
    const newBattle = await Battle.create({
      roomCode,
      player1: userId,
      status: 'waiting',
      isCustomRoom: false
    });
    return res.json({ roomCode: newBattle.roomCode, status: 'waiting', matched: false, isAdmin: req.user.role === 'admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Matchmaking failed' });
  }
});

/**
 * POST /battle/create
 * Create a custom/private room with a shareable code.
 */
router.post('/create', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Cleanup stale waiting rooms first
    await cleanupStaleRooms();

    // Check if user is already in an active or waiting battle
    const existingBattle = await Battle.findOne({
      $or: [{ player1: userId }, { player2: userId }],
      status: { $in: ['waiting', 'active'] }
    });

    if (existingBattle) {
      return res.json({ roomCode: existingBattle.roomCode, status: existingBattle.status, isAdmin: req.user.role === 'admin' });
    }

    const roomCode = await uniqueRoomCode();
    const newBattle = await Battle.create({
      roomCode,
      player1: userId,
      status: 'waiting',
      isCustomRoom: true // Mark as custom so random queue won't pick it up
    });

    return res.json({ roomCode: newBattle.roomCode, status: 'waiting', isAdmin: req.user.role === 'admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * POST /battle/join
 * Join a specific room by code (friend battles).
 */
router.post('/join', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomCode } = req.body;

    if (!roomCode || roomCode.length !== 5) {
      return res.status(400).json({ error: 'Invalid room code' });
    }

    // Fetch questions
    const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
    if (questions.length === 0) {
      return res.status(500).json({ error: 'No battle questions available' });
    }

    // Atomically join to prevent race conditions
    const battle = await Battle.findOneAndUpdate(
      {
        roomCode: roomCode.toUpperCase(),
        status: 'waiting',
        player1: { $ne: userId } // Can't join your own room
      },
      {
        $set: {
          player2: userId,
          status: 'active',
          startedAt: new Date(),
          questions: questions.map(q => q._id)
        }
      },
      { new: true }
    );

    if (!battle) {
      // Check if the room exists but user is player1
      const ownRoom = await Battle.findOne({ roomCode: roomCode.toUpperCase(), player1: userId, status: 'waiting' });
      if (ownRoom) {
        return res.status(400).json({ error: 'You cannot join your own room' });
      }
      return res.status(404).json({ error: 'Room not found or already started' });
    }

    return res.json({ roomCode: battle.roomCode, status: 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

/**
 * POST /battle/cancel
 * Cancel a waiting room (abandon it before anyone joins).
 */
router.post('/cancel', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomCode } = req.body;

    const battle = await Battle.findOneAndUpdate(
      {
        roomCode: roomCode.toUpperCase(),
        player1: userId,
        status: 'waiting'
      },
      { $set: { status: 'abandoned' } },
      { new: true }
    );

    if (!battle) {
      return res.status(404).json({ error: 'Waiting room not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel room' });
  }
});

/**
 * POST /battle/solo-start
 * Admin only: force-start a waiting room without an opponent (for testing).
 */
router.post('/solo-start', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { roomCode } = req.body;
    const battle = await Battle.findOne({ roomCode: roomCode.toUpperCase(), status: 'waiting' });

    if (!battle) {
      return res.status(404).json({ error: 'Waiting room not found' });
    }

    battle.status = 'active';
    battle.startedAt = new Date();

    const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
    battle.questions = questions.map(q => q._id);

    await battle.save();
    res.json({ roomCode: battle.roomCode, status: 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to solo-start battle' });
  }
});

/**
 * GET /battle/:roomCode
 * Polling route — fetch current match state by room code.
 */
router.get('/:roomCode', protect, async (req, res) => {
  try {
    const battle = await Battle.findOne({ roomCode: req.params.roomCode.toUpperCase() })
      .populate('player1', 'name avatar')
      .populate('player2', 'name avatar')
      .populate('questions', '-options.isCorrect -explanation');
      
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isPlayer1 = battle.player1 && battle.player1._id.toString() === req.user._id.toString();
    const isPlayer2 = battle.player2 && battle.player2._id.toString() === req.user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized for this battle' });
    }

    res.json({
      roomCode: battle.roomCode,
      status: battle.status,
      questions: battle.questions,
      player1: battle.player1,
      player2: battle.player2,
      player1Score: battle.player1Score,
      player2Score: battle.player2Score,
      opponentProgress: isPlayer1 ? battle.player2Answers.length : battle.player1Answers.length,
      myProgress: isPlayer1 ? battle.player1Answers.length : battle.player2Answers.length,
      myAnswers: isPlayer1 ? battle.player1Answers : battle.player2Answers,
      winner: battle.winner,
      startedAt: battle.startedAt,
      isAdmin: req.user.role === 'admin',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch battle state' });
  }
});

/**
 * POST /battle/submit
 * Submit an answer for the current question.
 */
router.post('/submit', protect, async (req, res) => {
  try {
    const { roomCode, questionId, selectedOptionIndex, timeTakenSeconds } = req.body;
    const userId = req.user._id;

    const battle = await Battle.findOne({ roomCode: roomCode.toUpperCase() });
    if (!battle || battle.status !== 'active') {
      return res.status(400).json({ error: 'Invalid battle or battle not active' });
    }

    const isPlayer1 = battle.player1.toString() === userId.toString();
    const isPlayer2 = battle.player2 && battle.player2.toString() === userId.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const existingAnswers = isPlayer1 ? battle.player1Answers : battle.player2Answers;
    if (existingAnswers.some(a => a.questionId.toString() === questionId)) {
      return res.status(400).json({ error: 'Already answered this question' });
    }

    const question = await BattleQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let isCorrect = false;
    let points = 0;

    if (selectedOptionIndex !== undefined && selectedOptionIndex !== null && selectedOptionIndex !== -1) {
      const option = question.options[selectedOptionIndex];
      if (option && option.isCorrect) {
        isCorrect = true;
        const timeBonus = Math.max(0, Math.floor((60 - timeTakenSeconds) * (50 / 60)));
        points = 100 + timeBonus;
      }
    }

    const answerRecord = {
      questionId,
      selectedOptionIndex,
      isCorrect,
      timeTakenSeconds,
      points
    };

    if (isPlayer1) {
      battle.player1Answers.push(answerRecord);
      battle.player1Score += points;
    } else {
      battle.player2Answers.push(answerRecord);
      battle.player2Score += points;
    }

    const totalQuestions = battle.questions.length;
    const p1Finished = battle.player1Answers.length === totalQuestions;
    const p2Finished = battle.player2Answers.length === totalQuestions;

    if (p1Finished && p2Finished) {
      battle.status = 'finished';
      battle.finishedAt = new Date();
      if (battle.player1Score > battle.player2Score) {
        battle.winner = battle.player1;
      } else if (battle.player2Score > battle.player1Score) {
        battle.winner = battle.player2;
      }
    }

    await battle.save();

    res.json({
      success: true,
      isCorrect,
      points,
      currentScore: isPlayer1 ? battle.player1Score : battle.player2Score,
      matchFinished: battle.status === 'finished'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
