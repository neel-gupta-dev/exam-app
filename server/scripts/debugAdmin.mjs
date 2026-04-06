import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

const user = await mongoose.connection.db.collection('users').findOne({ email: 'guptaneelhome@gmail.com' });

if (user) {
  console.log('User found:');
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('AuthMethod:', user.authMethod);
  console.log('HasPassword:', !!user.password);
  if (user.password) {
    console.log('Password Hash starts with:', user.password.substring(0, 10));
  }
} else {
  console.log('User not found.');
}

await mongoose.disconnect();
