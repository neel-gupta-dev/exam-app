import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const upcomingExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  registrationLink: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Engineering', 'Medical', 'Other'],
    default: 'Other',
  },
  icon: {
    type: String, // lucide icon name or emoji
    default: 'Calendar',
  }
}, {
  timestamps: true,
});

const UpcomingExam = coreConnection.model('UpcomingExam', upcomingExamSchema);

export default UpcomingExam;
