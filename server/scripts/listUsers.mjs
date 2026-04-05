import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

const users = await mongoose.connection.db.collection('users')
  .find({}, { projection: { name: 1, email: 1, role: 1 } })
  .toArray();

console.log('\nAll users in database:');
console.log('─'.repeat(60));
users.forEach(u => {
  console.log(`Name : ${u.name}`);
  console.log(`Email: ${u.email}`);
  console.log(`Role : ${u.role || 'student'}`);
  console.log(`ID   : ${u._id}`);
  console.log('─'.repeat(60));
});

await mongoose.disconnect();
