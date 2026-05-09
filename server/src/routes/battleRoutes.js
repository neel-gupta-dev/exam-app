import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Battle from '../models/Battle.js';
import BattleQuestion from '../models/BattleQuestion.js';
import BattleLeaderboard from '../models/BattleLeaderboard.js';
import User from '../models/User.js';

/** Get today's date string in IST ("YYYY-MM-DD") */
function getTodayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

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
    const existing = await Battle.findOne({ roomCode: code });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique room code');
}

/** Auto-abandon stale waiting/active rooms */
async function cleanupStaleRooms() {
  const waitingThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 min
  const activeThreshold = new Date(Date.now() - 60 * 60 * 1000);  // 60 min
  
  await Battle.updateMany(
    { 
      $or: [
        { status: 'waiting', createdAt: { $lt: waitingThreshold } },
        { status: 'active', startedAt: { $lt: activeThreshold } }
      ]
    },
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

    // Find waiting rooms and check if player1 is online (Heartbeat < 45s)
    const cutoff = new Date(Date.now() - 45 * 1000);
    const waitingRooms = await Battle.find({
      status: 'waiting',
      player1: { $ne: userId },
      isCustomRoom: { $ne: true }
    }).sort({ createdAt: 1 }).limit(10).populate('player1', 'battleLastSeen');

    let matchedBattle = null;
    for (const room of waitingRooms) {
      if (room.player1 && room.player1.battleLastSeen >= cutoff) {
        matchedBattle = await Battle.findOneAndUpdate(
          { _id: room._id, status: 'waiting' },
          {
            $set: {
              player2: userId,
              status: 'active',
              startedAt: new Date(Date.now() + 5000),
              player1LastAnswerAt: new Date(Date.now() + 5000),
              player2LastAnswerAt: new Date(Date.now() + 5000),
              questions: questions.map(q => q._id)
            }
          },
          { new: true }
        );
        if (matchedBattle) break;
      }
    }

    if (matchedBattle) {
      return res.json({ roomCode: matchedBattle.roomCode, status: 'active', matched: true, isAdmin: req.user.role === 'admin' });
    }

    // No waiting room found — create a new one with robust collision handling
    let newBattle = null;
    for (let i = 0; i < 5; i++) {
      try {
        const roomCode = generateRoomCode();
        newBattle = await Battle.create({
          roomCode,
          player1: userId,
          status: 'waiting',
          isCustomRoom: false
        });
        break;
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }
    if (!newBattle) return res.status(500).json({ error: 'Failed to generate room code' });
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

    let newBattle = null;
    for (let i = 0; i < 5; i++) {
      try {
        const roomCode = generateRoomCode();
        newBattle = await Battle.create({
          roomCode,
          player1: userId,
          status: 'waiting',
          isCustomRoom: true
        });
        break;
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }
    if (!newBattle) return res.status(500).json({ error: 'Failed to create room' });

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

    // Cleanup stale rooms
    await cleanupStaleRooms();

    // Check if user is already in an active or waiting battle
    const existingBattle = await Battle.findOne({
      $or: [{ player1: userId }, { player2: userId }],
      status: { $in: ['waiting', 'active'] }
    });

    if (existingBattle) {
      return res.json({ roomCode: existingBattle.roomCode, status: existingBattle.status, isAdmin: req.user.role === 'admin' });
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
          startedAt: new Date(Date.now() + 5000),
          player1LastAnswerAt: new Date(Date.now() + 5000),
          player2LastAnswerAt: new Date(Date.now() + 5000),
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
 * POST /battle/solo/create
 * Create a solo practice room.
 */
router.post('/solo/create', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch 5 random questions for Solo Rush
    const questions = await BattleQuestion.aggregate([{ $sample: { size: 5 } }]);
    if (questions.length === 0) {
      return res.status(500).json({ error: 'No battle questions available' });
    }

    let battle = null;
    for (let i = 0; i < 5; i++) {
      try {
        const roomCode = generateRoomCode();
        battle = await Battle.create({
          roomCode,
          player1: userId,
          status: 'active',
          isSolo: true,
          questions: questions.map(q => q._id),
          startedAt: new Date(),
          player1LastAnswerAt: new Date(),
        });
        break;
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }
    if (!battle) return res.status(500).json({ error: 'Failed to create room' });

    res.json({ roomCode: battle.roomCode, status: 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create solo room' });
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

    const startDelay = new Date(Date.now() + 5000);
    battle.status = 'active';
    battle.startedAt = startDelay;
    battle.player1LastAnswerAt = startDelay;
    battle.player2LastAnswerAt = startDelay;

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
 * GET /battle/leaderboard
 * Public endpoint — returns top 50 players for a given day (defaults to today IST).
 * Query params: ?date=YYYY-MM-DD (optional)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const date = req.query.date || getTodayIST();

    const entries = await BattleLeaderboard.find({ date })
      .sort({ points: -1 })
      .limit(50)
      .lean();

    // Populate user info
    const userIds = entries.map(e => e.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name avatar')
      .lean();

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const leaderboard = entries.map((entry, i) => {
      const user = userMap[entry.userId.toString()] || {};
      return {
        rank: i + 1,
        userId: entry.userId,
        name: user.name || 'Unknown',
        avatar: user.avatar || null,
        points: entry.points,
        gamesPlayed: entry.gamesPlayed,
        correctAnswers: entry.correctAnswers,
        wrongAnswers: entry.wrongAnswers,
      };
    });

    res.json({ date, leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
      .populate('questions', '-options.isCorrect -explanation -correctInteger');
      
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isPlayer1 = battle.player1 && battle.player1._id.toString() === req.user._id.toString();
    const isPlayer2 = battle.player2 && battle.player2._id.toString() === req.user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized for this battle' });
    }

    let stateChanged = false;
    const totalQuestions = battle.questions.length;
    const p1Progress = battle.player1Answers.length;
    const p2Progress = battle.player2Answers.length;

    // Auto-submit for disconnected player 1
    if (p1Progress < totalQuestions && battle.player1LastAnswerAt) {
      if (Date.now() - battle.player1LastAnswerAt.getTime() > 130 * 1000) {
        battle.player1Answers.push({
          questionId: battle.questions[p1Progress]._id,
          selectedOptionIndex: -1,
          selectedOptionIndices: [],
          isCorrect: false,
          lbPoints: 0,
          timeTakenSeconds: 120,
          points: 0
        });
        battle.player1LastAnswerAt = new Date();
        stateChanged = true;
      }
    }

    // Auto-submit for disconnected player 2
    if (battle.player2 && p2Progress < totalQuestions && battle.player2LastAnswerAt) {
      if (Date.now() - battle.player2LastAnswerAt.getTime() > 130 * 1000) {
        battle.player2Answers.push({
          questionId: battle.questions[p2Progress]._id,
          selectedOptionIndex: -1,
          selectedOptionIndices: [],
          isCorrect: false,
          lbPoints: 0,
          timeTakenSeconds: 120,
          points: 0
        });
        battle.player2LastAnswerAt = new Date();
        stateChanged = true;
      }
    }

    if (stateChanged) {
      const p1Finished = battle.player1Answers.length === totalQuestions;
      const p2Finished = battle.player2 ? (battle.player2Answers.length === totalQuestions) : true;
      if (p1Finished && p2Finished && battle.status !== 'finished') {
        battle.status = 'finished';
        battle.finishedAt = new Date();
        if (battle.player2) {
          if (battle.player1Score > battle.player2Score) battle.winner = battle.player1;
          else if (battle.player2Score > battle.player1Score) battle.winner = battle.player2;
        }
      }
      await battle.save();
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
      isSolo: battle.isSolo,
      isAdmin: req.user.role === 'admin',
      serverNow: Date.now(),
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
    const { roomCode, questionId, selectedOptionIndex, selectedOptionIndices, submittedInteger, timeTakenSeconds } = req.body;
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

    const lastAnswerAt = isPlayer1 ? battle.player1LastAnswerAt : battle.player2LastAnswerAt;
    const serverTimeTakenSeconds = lastAnswerAt ? Math.max(0, (Date.now() - lastAnswerAt.getTime()) / 1000) : timeTakenSeconds;
    const actualTimeTaken = Math.min(120, serverTimeTakenSeconds);

    let isCorrect = false;
    let points = 0;
    let lbPoints = 0;
    let lbCorrect = 0;
    let lbWrong = 0;

    const qType = question.type || 'single';

    if (qType === 'single') {
      const correctIndex = Array.isArray(question.options)
        ? question.options.findIndex(opt => opt?.isCorrect)
        : -1;

      if (correctIndex >= 0 && selectedOptionIndex === correctIndex) {
        lbPoints = battle.isSolo ? 2 : 4;
        lbCorrect = 1;
        isCorrect = true;
        const timeBonus = battle.isSolo ? 0 : Math.max(0, Math.floor((120 - actualTimeTaken) * (50 / 120)));
        points = 100 + timeBonus;
      } else if (selectedOptionIndex !== null && selectedOptionIndex !== undefined && selectedOptionIndex !== -1111 && selectedOptionIndex !== -1) {
        lbPoints = -1;
        lbWrong = 1;
      }
    } else if (qType === 'integer') {
      if (submittedInteger === question.correctInteger) {
        lbPoints = battle.isSolo ? 1 : 4;
        lbCorrect = 1;
        isCorrect = true;
        const timeBonus = battle.isSolo ? 0 : Math.max(0, Math.floor((120 - actualTimeTaken) * (50 / 120)));
        points = 100 + timeBonus;
      } else if (submittedInteger !== null && submittedInteger !== undefined && submittedInteger !== -1111) {
        lbPoints = -1;
        lbWrong = 1;
      }
    } else if (qType === 'multi') {
      const rawSelected = Array.isArray(selectedOptionIndices) ? selectedOptionIndices : [];
      const selected = rawSelected
        .filter(n => Number.isInteger(n))
        .filter(n => n >= 0 && n < (question.options?.length || 0));
      const correctIndices = question.options
        .map((opt, idx) => (opt.isCorrect ? idx : -1))
        .filter(idx => idx !== -1);

      if (rawSelected.length > 0 && rawSelected[0] !== -1111) {
        const hasIncorrect = selected.some(idx => !question.options[idx]?.isCorrect);
        const allCorrectSelected = correctIndices.every(idx => selected.includes(idx)) && selected.length === correctIndices.length;
        
        if (battle.isSolo) {
          if (allCorrectSelected && !hasIncorrect) {
            lbPoints = 2;
            lbCorrect = 1;
            isCorrect = true;
            points = 100;
          } else {
            lbPoints = -2;
            lbWrong = 1;
          }
        } else {
          if (hasIncorrect) {
            lbPoints = -2;
            lbWrong = 1;
          } else if (allCorrectSelected) {
            lbPoints = 4;
            lbCorrect = 1;
            isCorrect = true;
            const timeBonus = Math.max(0, Math.floor((120 - actualTimeTaken) * (50 / 120)));
            points = 100 + timeBonus;
          } else {
            const correctSelectedCount = selected.filter(idx => question.options[idx]?.isCorrect).length;
            lbPoints = correctSelectedCount;
            lbCorrect = 1; 
            points = correctSelectedCount * 25;
          }
        }
      }
    }

    if (isPlayer1) {
      battle.player1LastAnswerAt = new Date();
    } else {
      battle.player2LastAnswerAt = new Date();
    }

    const answerRecord = {
      questionId,
      selectedOptionIndex: qType === 'integer' ? -3 : (qType === 'multi' ? -2 : (selectedOptionIndex ?? -1)),
      selectedOptionIndices: qType === 'multi' ? selectedOptionIndices : [],
      submittedInteger: qType === 'integer' ? submittedInteger : undefined,
      isCorrect,
      lbPoints,
      timeTakenSeconds: actualTimeTaken,
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
    const p2Finished = battle.player2 ? (battle.player2Answers.length === totalQuestions) : true;

    if (p1Finished && p2Finished) {
      battle.status = 'finished';
      battle.finishedAt = new Date();
      if (battle.player2) {
        if (battle.player1Score > battle.player2Score) {
          battle.winner = battle.player1;
        } else if (battle.player2Score > battle.player1Score) {
          battle.winner = battle.player2;
        }
      }
    }

    await battle.save();

    if (battle.isSolo) {
      await User.findByIdAndUpdate(userId, { $inc: { soloPoints: lbPoints } });
    } else {
      const todayIST = getTodayIST();
      const lbUpdate = {
        $inc: {
          points: lbPoints,
          correctAnswers: lbCorrect,
          wrongAnswers: lbWrong,
        },
      };
      const isFirstAnswer = isPlayer1 ? (battle.player1Answers.length === 1) : (battle.player2Answers.length === 1);
      if (isFirstAnswer) {
        lbUpdate.$inc.gamesPlayed = 1;
      }

      await BattleLeaderboard.findOneAndUpdate(
        { userId, date: todayIST },
        lbUpdate,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      isCorrect,
      points,
      lbPoints, // Added for clarity
      currentScore: isPlayer1 ? battle.player1Score : battle.player2Score,
      matchFinished: battle.status === 'finished'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
