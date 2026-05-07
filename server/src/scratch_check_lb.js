import mongoose from 'mongoose';
import BattleLeaderboard from './models/BattleLeaderboard.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';

async function check() {
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');
  
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  console.log('Searching for date:', today);
  
  const entries = await BattleLeaderboard.find({ date: today }).lean();
  console.log('Entries found:', entries.length);
  console.log(JSON.stringify(entries, null, 2));
  
  const allEntries = await BattleLeaderboard.find().limit(5).lean();
  console.log('Last 5 entries in total:', allEntries.length);
  console.log(JSON.stringify(allEntries, null, 2));

  await mongoose.disconnect();
}

check();
