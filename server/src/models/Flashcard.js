import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    frontText: {
      type: String,
      required: [true, 'Front text is required'],
      trim: true,
    },
    backText: {
      type: String,
      required: [true, 'Back text is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
