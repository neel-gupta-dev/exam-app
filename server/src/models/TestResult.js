import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Middleware to calculate percentage before saving
TestResultSchema.pre('save', function() {
  if (this.total > 0) {
    this.percentage = (this.score / this.total) * 100;
  }
});

const TestResult = mongoose.model('TestResult', TestResultSchema);
export default TestResult;
