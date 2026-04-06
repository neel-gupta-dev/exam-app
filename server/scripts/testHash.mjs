import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

const email = 'guptaneelhome@gmail.com';
const password = 'EnterPasswordHere'; // I need to know the password, or just test if ANY password works with the hash

const user = await mongoose.connection.db.collection('users').findOne({ email });

if (user && user.password) {
  console.log('User found. Hash:', user.password);
  // I can't know the password, but I can check if the hash is valid
  try {
    const isActuallyHash = user.password.startsWith('$2');
    console.log('Is it a bcrypt hash?', isActuallyHash);
    
    // Test a dummy compare
    const dummyMatch = await bcrypt.compare('wrong_password', user.password);
    console.log('Wrong password check (should be false):', dummyMatch);
  } catch (e) {
    console.error('Bcrypt error:', e.message);
  }
} else {
  console.log('User not found or no password.');
}

await mongoose.disconnect();
