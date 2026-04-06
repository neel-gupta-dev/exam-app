import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Administrative Reset Utility
 * Use this to restore access to an admin account if the password hash 
 * has been corrupted or if you've lost the password.
 * 
 * Usage: node scripts/reset-admin.mjs <email> <newPassword>
 */

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error('\n❌ Usage: node scripts/reset-admin.mjs <email> <newPassword>');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\n❌ Error: MONGO_URI not found in .env file.');
  process.exit(1);
}

async function resetAdmin() {
  try {
    console.log(`\n📂 Connecting to database...`);
    await mongoose.connect(MONGO_URI);

    // Find the user first to ensure they are an admin
    const user = await mongoose.connection.db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`\n❌ Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.role !== 'admin') {
      console.error(`\n❌ Error: User "${email}" is not an admin. Role: ${user.role}`);
      process.exit(1);
    }

    console.log(`\n🔐 Hashing new password for ${user.name}...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(`\n💾 Updating database...`);
    await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword, 
          authMethod: 'local',
          isOnboarded: true // Ensure admin isn't stuck in onboarding
        } 
      }
    );

    console.log(`\n✅ Success! Admin credentials restored.`);
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`\n🚀 You can now login at https://api.vayl.in/sys-9f3k-ctrl\n`);

  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdmin();
