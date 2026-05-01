import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Battle from '../models/Battle.js';
import BattleQuestion from '../models/BattleQuestion.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /battle/queue
 * Enters matchmaking. Finds an available room or creates one.
 */
router.post('/queue', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is already in an active or waiting battle
    let existingBattle = await Battle.findOne({
      $or: [{ player1: userId }, { player2: userId }],
      status: { $in: ['waiting', 'active'] }
    });

    if (existingBattle) {
      return res.json({ roomId: existingBattle._id, status: existingBattle.status });
    }

    // Try to find a waiting room
    const waitingBattle = await Battle.findOne({ status: 'waiting', player1: { $ne: userId } });

    if (waitingBattle) {
      // Join as player 2
      waitingBattle.player2 = userId;
      waitingBattle.status = 'active';
      waitingBattle.startedAt = new Date();
      
      // Pull 10 random questions
      const questions = await BattleQuestion.aggregate([{ $sample: { size: 10 } }]);
      waitingBattle.questions = questions.map(q => q._id);
      
      await waitingBattle.save();
      return res.json({ roomId: waitingBattle._id, status: 'active' });
    } else {
      // Create a new waiting room
      const newBattle = await Battle.create({
        player1: userId,
        status: 'waiting'
      });
      return res.json({ roomId: newBattle._id, status: 'waiting' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Matchmaking failed' });
  }
});

/**
 * GET /battle/:roomId
 * Polling route to fetch current match state.
 */
router.get('/:roomId', protect, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.roomId)
      .populate('player1', 'name avatar elo')
      .populate('player2', 'name avatar elo')
      .populate('questions', '-options.isCorrect -explanation'); // Hide answers from client
      
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Determine who is requesting
    const isPlayer1 = battle.player1 && battle.player1._id.toString() === req.user._id.toString();
    const isPlayer2 = battle.player2 && battle.player2._id.toString() === req.user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized for this battle' });
    }

    // For polling efficiency, we can return just the state
    res.json({
      _id: battle._id,
      status: battle.status,
      questions: battle.questions,
      player1: battle.player1,
      player2: battle.player2,
      player1Score: battle.player1Score,
      player2Score: battle.player2Score,
      // Only send opponent's progress (number of answered questions), not actual answers
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
 * Submits an answer for the current question
 */
router.post('/submit', protect, async (req, res) => {
  try {
    const { roomId, questionId, selectedOptionIndex, timeTakenSeconds } = req.body;
    const userId = req.user._id;

    const battle = await Battle.findById(roomId);
    if (!battle || battle.status !== 'active') {
      return res.status(400).json({ error: 'Invalid battle or battle not active' });
    }

    const isPlayer1 = battle.player1.toString() === userId.toString();
    const isPlayer2 = battle.player2 && battle.player2.toString() === userId.toString();

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if already answered
    const existingAnswers = isPlayer1 ? battle.player1Answers : battle.player2Answers;
    if (existingAnswers.some(a => a.questionId.toString() === questionId)) {
      return res.status(400).json({ error: 'Already answered this question' });
    }

    // Verify answer
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
        // Points calculation: Base 100 + Time Bonus (up to 50 points if answered in < 5 seconds)
        // Assume max time per question is 60s
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

    // Check if both players have finished all questions
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
      
      // We could update User ELO here
    }

    await battle.save();

    res.json({ success: true, isCorrect, points, currentScore: isPlayer1 ? battle.player1Score : battle.player2Score, matchFinished: battle.status === 'finished' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
