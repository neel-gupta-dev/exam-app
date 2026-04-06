import mongoose from 'mongoose';
import User from '../src/models/User.js';
import * as authService from '../src/services/authService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

async function verifyPersistence() {
  const email = 'test@test.com';
  const userBefore = await User.findOne({ email }).select('+password');
  
  if (!userBefore) {
    console.error('Test user not found.');
    await mongoose.disconnect();
    return;
  }

  const oldLoginDate = userBefore.lastLoginDate;
  const oldStreak = userBefore.currentStreak;
  const newDateStr = '2099-01-01'; // Future date for testing

  console.log(`Original Date: ${oldLoginDate}, Streak: ${oldStreak}`);

  // We'll mock the streak logic by setting a specific login date that triggers a reset
  // or just check if manual updates to the instance are saved.
  userBefore.lastLoginDate = newDateStr;
  userBefore.currentStreak = 999;

  // Simulate a login (with correct password logic)
  try {
    // We are manually calling save() now in authService, 
    // so let's call the actual service if we had the password, 
    // but here we just check if the model.save() hardened logic works.
    await userBefore.save();
    
    const userAfter = await User.findOne({ email });
    console.log(`Updated Date: ${userAfter.lastLoginDate}, Streak: ${userAfter.currentStreak}`);
    
    if (userAfter.lastLoginDate === newDateStr && userAfter.currentStreak === 999) {
      console.log('✅ Persistence Verification SUCCESSFUL!');
    } else {
      console.error('❌ Persistence Verification FAILED! Updates not found in DB.');
    }

    // Reset for next time
    userAfter.lastLoginDate = oldLoginDate;
    userAfter.currentStreak = oldStreak;
    await userAfter.save();
    
  } catch (e) {
    console.error('Error during verification:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyPersistence();
