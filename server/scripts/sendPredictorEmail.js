import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendEmailToUser(user) {
  const mailOptions = {
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #e2e8f0; background: #0f172a; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin-bottom: 8px;">Vayl College Predictor</h1>
            <p style="color: #94a3b8; margin: 0;">Find your dream college today.</p>
        </div>
        <p>Hi ${user.name},</p>
        <p>We're thrilled to announce the launch of the <strong>Vayl College Predictor</strong>!</p>
        <p>Finding the right college with your JEE rank can be stressful and confusing. Our smart algorithm uses historical JoSAA and CSAB data to predict your chances at IITs, NITs, IIITs, and GFTIs based on your personal preferences for placements, city life, and branch.</p>
        <p>Discover your best options and see your safest bets in seconds.</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="https://predictor.vayl.in" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore the College Predictor Now</a>
        </div>
        <p>Keep saving and keep studying!</p>
        <p>Best,<br/>The Vayl Team</p>
      </div>
    `
  };

  let apiKey = process.env.ZEPTOMAIL_PASS || '';
  if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    apiKey = apiKey.slice(1, -1);
  }
  if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
    apiKey = apiKey.slice(1, -1);
  }

  const response = await fetch(ZEPTOMAIL_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Zoho-enczapikey ${apiKey}`
    },
    body: JSON.stringify({
      from: { "address": "noreply@vayl.in", "name": "Vayl" },
      to: [{ "email_address": { "address": user.email, "name": user.name } }],
      subject: 'Is your JEE rank enough for an IIT? Find out now.',
      htmlbody: mailOptions.html
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Error] Failed to send to ${user.email} - ${response.status} ${errText}`);
    return false;
  }
  
  return true;
}

async function run() {
  console.log("Connecting to database...");
  await connectDB();
  console.log("Connected.");

  console.log("Fetching users...");
  const users = await User.find({ email: { $exists: true, $ne: "" } }).select('name email');
  console.log(`Found ${users.length} users with email addresses.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`[${i + 1}/${users.length}] Sending email to ${user.email} (${user.name})...`);
    
    try {
      const success = await sendEmailToUser(user);
      if (success) {
        successCount++;
        console.log(`  -> Sent successfully.`);
      } else {
        failCount++;
      }
    } catch (err) {
      console.error(`  -> Exception sending to ${user.email}:`, err.message);
      failCount++;
    }

    // 1 second delay
    await delay(1000);
  }

  console.log("--- Campaign Finished ---");
  console.log(`Total Success: ${successCount}`);
  console.log(`Total Failed: ${failCount}`);
  
  process.exit(0);
}

run().catch(err => {
  console.error("Critical error:", err);
  process.exit(1);
});
