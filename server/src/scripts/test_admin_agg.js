import mongoose from 'mongoose';
import { MONGO_URI } from '../config/index.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

async function verifyAggregation(userId) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Test Heatmap Aggregation
    const heatmap = await ActivityLog.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    console.log('Heatmap Results:', heatmap);
    if (heatmap.length === 0) {
      console.log('Note: Heatmap is empty, likely no ActivityLog entries for this user in last 30 days.');
    }

    // Test Summary Stats
    const user = await User.findById(userId);
    console.log('User Vitals:', {
        name: user.name,
        hours: (user.totalActiveSeconds / 3600).toFixed(2),
        streak: user.currentStreak
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

// Use ID from previous command
verifyAggregation('69c8f1eb3270960490334a90');
