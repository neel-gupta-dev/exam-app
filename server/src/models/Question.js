import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const normalizeQuestionType = (value) => {
  const raw = String(value || 'single').trim().toLowerCase();
  if (raw === 'scq') return 'single';
  if (raw === 'mcq' || raw === 'multi') return 'multiple';
  if (raw === 'numerical' || raw === 'numeric') return 'integer';
  if (raw === 'decimal') return 'float';
  return raw;
};

const questionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      default: 'General',
      index: true,
    },
    type: {
      type: String,
      enum: ['single', 'multiple', 'integer', 'float'],
      set: normalizeQuestionType,
      get: normalizeQuestionType,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
    },
    options: [
      {
        key: { type: String, required: false },
        label: { type: String, required: false },
        text: { type: String },
        content: { type: String },
        imageUrl: { type: String },
      }
    ],
    correctAnswer: {
      type: [String], // ["A"] or ["A", "C"] or ["42"]
      required: true,
    },
    solution: {
      type: String,
    },
    solutionImageUrl: {
      type: String,
    },
    positiveMarks: {
      type: Number,
    },
    negativeMarks: {
      type: Number,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

questionSchema.pre('validate', function normalizeQuestion(next) {
  this.type = normalizeQuestionType(this.type);

  if (!this.content && this.text) this.content = this.text;
  if (!this.text && this.content) this.text = this.content;
  if (!String(this.content || this.text || '').trim()) {
    this.invalidate('content', 'Question content is required');
  }

  if (this.section && (!this.subject || this.subject === 'General')) {
    this.subject = this.section;
  }

  if (['single', 'multiple'].includes(this.type)) {
    if (!Array.isArray(this.options) || this.options.length < 2) {
      this.invalidate('options', 'At least two options are required for objective questions');
    } else {
      this.options.forEach((option, index) => {
        const fallbackLabel = String.fromCharCode(65 + index);
        if (!option.label && option.key) option.label = option.key;
        if (!option.key && option.label) option.key = option.label;
        if (!option.label) option.label = fallbackLabel;
        if (!option.key) option.key = option.label;
        if (!option.content && option.text) option.content = option.text;
        if (!option.text && option.content) option.text = option.content;
        if (!String(option.content || option.text || '').trim()) {
          this.invalidate(`options.${index}.content`, 'Option content is required');
        }
      });
    }
  }

  if (!Array.isArray(this.correctAnswer) || this.correctAnswer.length === 0) {
    this.invalidate('correctAnswer', 'Correct answer is required');
  }

  next();
});

// Fast lookup for questions in a test within a tenant
questionSchema.index({ tenantId: 1, testId: 1, order: 1 });

const Question = coreConnection.model('Question', questionSchema);

export default Question;
