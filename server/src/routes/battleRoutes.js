import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Battle from '../models/Battle.js';
import BattleQuestion from '../models/BattleQuestion.js';

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

/**
 * POST /battle/queue
 * Random matchmaking — finds a waiting room or creates one.
 */
router.post('/queue', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is already in an active or waiting battle
    const existingBattle = await Battle.findOne({
      $or: [{ player1: userId }, { player2: userId }],
      status: { $in: ['waiting', 'active'] }
    });

    if (existingBattle) {
      return res.json({ roomCode: existingBattle.roomCode, status: existingBattle.status });
    }

    // Try to find a random waiting room (not created by this user)
    const waitingBattle = await Battle.findOne({ status: 'waiting', player1: { $ne: userId } });

    if (waitingBattle) {
      waitingBattle.player2 = userId;
      waitingBattle.status = 'active';
      waitingBattle.startedAt = new Date();
      
      const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
      waitingBattle.questions = questions.map(q => q._id);
      
      await waitingBattle.save();
      return res.json({ roomCode: waitingBattle.roomCode, status: 'active' });
    } else {
      const roomCode = await uniqueRoomCode();
      const newBattle = await Battle.create({
        roomCode,
        player1: userId,
        status: 'waiting'
      });
      return res.json({ roomCode: newBattle.roomCode, status: 'waiting' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Matchmaking failed' });
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

    const battle = await Battle.findOne({ roomCode: roomCode.toUpperCase(), status: 'waiting' });

    if (!battle) {
      return res.status(404).json({ error: 'Room not found or already started' });
    }

    if (battle.player1.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You cannot join your own room' });
    }

    battle.player2 = userId;
    battle.status = 'active';
    battle.startedAt = new Date();

    const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
    battle.questions = questions.map(q => q._id);

    await battle.save();
    return res.json({ roomCode: battle.roomCode, status: 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join room' });
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
