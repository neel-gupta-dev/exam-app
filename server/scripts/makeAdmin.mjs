import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ← Change this to whichever email you want to make admin
const TARGET_EMAIL = process.argv[2];

if (!TARGET_EMAIL) {
  console.error('Usage: node scripts/makeAdmin.mjs <email>');
  process.exit(1);
}

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
  { email: TARGET_EMAIL },
  { $set: { role: 'admin' } },
  { returnDocument: 'after', projection: { name: 1, email: 1, role: 1 } }
);

if (!result) {
  console.error(`No user found with email: ${TARGET_EMAIL}`);
} else {
  console.log(`\n✅ SUCCESS — ${result.name} (${result.email}) is now role: ${result.role}`);
}

await mongoose.disconnect();
