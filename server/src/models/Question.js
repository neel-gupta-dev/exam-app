import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const normalizeQuestionType = (value) => {
  const raw = String(value || 'single').trim().toLowerCase();
  if (raw === 'scq') return 'single';
  if (raw === 'mcq' || raw === 'multi') return 'multiple';
  if (raw === 'numerical' || raw === 'numeric') return 'integer';
  if (raw === 'decimal') return 'float';
  if (raw === 'matrix' || raw === 'match') return 'matrix';
  if (raw === 'comprehension' || raw === 'paragraph') return 'comprehension_parent';
  return raw;
};

// Reusable sub-schema for a content table (header row + data rows)
const contentTableSchema = new mongoose.Schema({
  headers: [{ type: String }],
  rows: [[{ type: String }]],
}, { _id: false });

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
      enum: ['single', 'multiple', 'integer', 'float', 'matrix', 'comprehension_parent', 'comprehension_child'],
      set: normalizeQuestionType,
      get: normalizeQuestionType,
      required: true,
    },
    parentQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    order: {
      type: Number,
      default: 0,
    },
    // Question body — text, image, OR a content table (or a combination)
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
    contentTable: contentTableSchema,

    // Options (for single/multiple/comprehension_child types)
    options: [
      {
        key:    { type: String, required: false },
        label:  { type: String, required: false },
        text:   { type: String },
        content: { type: String },
        imageUrl: { type: String },
        contentTable: contentTableSchema,  // table embedded inside an option
      }
    ],

    // Matrix Match fields (List I rows and List II columns)
    matrixRows: [
      {
        label:   { type: String },
        content: { type: String },
      }
    ],
    matrixColumns: [
      {
        label:   { type: String },
        content: { type: String },
      }
    ],

    // Per-question marking scheme override (overrides section scheme)
    markingSchemeOverride: {
      correct:             { type: Number },
      incorrect:           { type: Number },
      unattempted:         { type: Number },
      partial:             { type: Boolean },
      partialMarkPerOption: { type: Number },
      partialIncorrect:    { type: Number },
    },

    correctAnswer: {
      type: [String], // ["A"] or ["A", "C"] or ["42"] or ["A-P,Q", "B-R"]
      required: true,
    },
    solution: { type: String },
    solutionImageUrl: { type: String },
    positiveMarks: { type: Number },
    negativeMarks: { type: Number },
    tags: [String],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  {
    timestamps: true,
    toJSON:   { getters: true },
    toObject: { getters: true },
  }
);

questionSchema.pre('validate', function normalizeQuestion() {
  this.type = normalizeQuestionType(this.type);

  if (!this.content && this.text) this.content = this.text;
  if (!this.text && this.content) this.text = this.content;

  // Allow contentTable as a substitute for text content
  const hasContent = String(this.content || this.text || this.imageUrl || '').trim() ||
                     (this.contentTable?.headers?.length > 0);

  if (!hasContent) {
    this.invalidate('content', 'Question content, image, or table is required');
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
        // Allow contentTable as option content substitute
        const hasOptContent = String(option.content || option.text || option.imageUrl || '').trim() ||
                              (option.contentTable?.headers?.length > 0);
        if (!hasOptContent) {
          this.invalidate(`options.${index}.content`, 'Option content, image, or table is required');
        }
      });
    }
  }

  if (this.type !== 'comprehension_parent' && (!Array.isArray(this.correctAnswer) || this.correctAnswer.length === 0)) {
    this.invalidate('correctAnswer', 'Correct answer is required');
  }
});

// Fast lookup for questions in a test within a tenant
questionSchema.index({ tenantId: 1, testId: 1, order: 1 });

const Question = coreConnection.model('Question', questionSchema);

export default Question;
