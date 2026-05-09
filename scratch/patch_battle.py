import re

with open('server/src/routes/battleRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. uniqueRoomCode replacement (just remove it, not used directly if we use loop in /queue and /create and /solo/create)
# Actually, keeping generateRoomCode and modifying /queue, /create, /solo/create is better.

# Wait, let's just do a big replace for /queue:
content = re.sub(
    r"    // Atomically find a waiting room and join it \(prevents race conditions\)\n    const matchedBattle = await Battle\.findOneAndUpdate\(\n      \{\n        status: 'waiting',\n        player1: \{ \$ne: userId \},\n        isCustomRoom: \{ \$ne: true \} // Don't match custom/private rooms\n      \},[\s\S]*?\{ new: true \}\n    \);",
    '''    // Find waiting rooms and check if player1 is online (Heartbeat < 45s)
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
    }''',
    content
)

# Fix duplicate key error in /queue by catching 11000
content = re.sub(
    r"    // No waiting room found — create a new one\n    const roomCode = await uniqueRoomCode\(\);\n    const newBattle = await Battle\.create\(\{\n      roomCode,\n      player1: userId,\n      status: 'waiting',\n      isCustomRoom: false\n    \}\);\n    return res\.json\(\{ roomCode: newBattle\.roomCode, status: 'waiting', matched: false, isAdmin: req\.user\.role === 'admin' \}\);",
    '''    // No waiting room found — create a new one with robust collision handling
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
    return res.json({ roomCode: newBattle.roomCode, status: 'waiting', matched: false, isAdmin: req.user.role === 'admin' });''',
    content
)

# Same for /create
content = re.sub(
    r"    const roomCode = await uniqueRoomCode\(\);\n    const newBattle = await Battle\.create\(\{\n      roomCode,\n      player1: userId,\n      status: 'waiting',\n      isCustomRoom: true // Mark as custom so random queue won't pick it up\n    \}\);",
    '''    let newBattle = null;
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
    if (!newBattle) return res.status(500).json({ error: 'Failed to create room' });''',
    content
)

# Same for /solo/create
content = re.sub(
    r"    const roomCode = await uniqueRoomCode\(\);\n\n    // Fetch 5 random questions for Solo Rush\n    const questions = await BattleQuestion\.aggregate\(\[\{ \$sample: \{ size: 5 \} \}\]\);\n    if \(questions\.length === 0\) \{\n      return res\.status\(500\)\.json\(\{ error: 'No battle questions available' \}\);\n    \}\n\n    const battle = await Battle\.create\(\{\n      roomCode,\n      player1: userId,\n      status: 'active', // Immediately active\n      isSolo: true,\n      questions: questions\.map\(q => q\._id\),\n      startedAt: new Date\(\),\n      player1LastAnswerAt: new Date\(\),\n    \}\);",
    '''    // Fetch 5 random questions for Solo Rush
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
    if (!battle) return res.status(500).json({ error: 'Failed to create room' });''',
    content
)

# Deadlock 2: Active match abandonment auto-submission in /:roomCode GET
content = re.sub(
    r"    res\.json\(\{\n      roomCode: battle\.roomCode,\n      status: battle\.status,\n      questions: battle\.questions,",
    '''    let stateChanged = false;
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
      questions: battle.questions,''',
    content
)

# Skip penalty bug fixes in /submit
content = re.sub(
    r"      } else if \(selectedOptionIndex !== -1111\) \{",
    r"      } else if (selectedOptionIndex !== null && selectedOptionIndex !== undefined && selectedOptionIndex !== -1111 && selectedOptionIndex !== -1) {",
    content
)

content = re.sub(
    r"      } else if \(submittedInteger !== -1111\) \{",
    r"      } else if (submittedInteger !== null && submittedInteger !== undefined && submittedInteger !== -1111) {",
    content
)

with open('server/src/routes/battleRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
