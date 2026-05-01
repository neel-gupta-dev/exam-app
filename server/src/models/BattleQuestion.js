import mongoose from 'mongoose';

const BattleQuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, // Optional image for the question
  },
  options: [{
    text: String,
    imageUrl: String,
    isCorrect: Boolean,
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  explanation: {
    type: String,
  }
}, { timestamps: true });

// Prevent model overwrite upon hot reloads in serverless environments
const BattleQuestion = mongoose.models.BattleQuestion || mongoose.model('BattleQuestion', BattleQuestionSchema);

export default BattleQuestion;
