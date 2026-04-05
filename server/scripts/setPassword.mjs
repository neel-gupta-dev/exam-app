import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Usage: node scripts/setPassword.mjs <email> <newpassword>
const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/setPassword.mjs <email> <password>');
  process.exit(1);
}

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
await mongoose.connect(uri);

const hash = await bcrypt.hash(password, 10);
const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
  { email },
  { $set: { password: hash, authMethod: 'local' } },
  { returnDocument: 'after', projection: { name: 1, email: 1, role: 1 } }
);

if (!result) {
  console.error(`No user found: ${email}`);
} else {
  console.log(`\n✅ Password set for ${result.name} (${result.email})`);
  console.log(`   Login with: ${email} / ${password}`);
}

await mongoose.disconnect();
