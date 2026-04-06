import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

try {
  const email = 'test@test.com'; // Use the test user
  const user = await User.findOne({ email }).select('+password');
  
  if (user) {
    console.log('Original hash:', user.password);
    console.log('Is modified before save?', user.isModified('password'));
    
    // Simulate a change unrelated to password
    user.currentStreak = 42;
    console.log('Is modified after unrelated change?', user.isModified('password'));
    
    // Force a save
    await user.save();
    
    // Re-fetch to see if hash changed
    const updatedUser = await User.findOne({ email }).select('+password');
    console.log('Post-save hash:', updatedUser.password);
    
    if (user.password !== updatedUser.password) {
      console.error('CRITICAL BUG: Password was re-hashed unexpectedly!');
    } else {
      console.log('Success: Password remains consistent.');
    }
  } else {
    console.log('Test user not found.');
  }
} catch (e) {
  console.error('Error:', e.message);
}

await mongoose.disconnect();
