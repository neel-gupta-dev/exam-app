import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['formula', 'table', 'grid', 'text'],
      required: true,
    },
    label: { type: String, default: '' },
    // For 'formula': items = ["F = ma", "v = u + at"]
    // For 'table': items = { headers: ["Col1","Col2"], rows: [["val","val"],...] }
    // For 'grid': items = [{ key: "KE", value: "½mv²" }, ...]
    // For 'text': items = ["paragraph text"]
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
    accentColor: { type: String, default: '' }, // per-block override
  },
  { _id: false }
);

const cheatsheetSectionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      enum: ['chemistry', 'physics', 'mathematics'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    accentColor: {
      type: String,
      enum: ['yellow', 'orange', 'teal', 'purple'],
      default: 'yellow',
    },
    blocks: [blockSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

cheatsheetSectionSchema.index({ subject: 1, order: 1 });

const CheatsheetSection = mongoose.model('CheatsheetSection', cheatsheetSectionSchema);
export default CheatsheetSection;
