import { Router } from 'express';
import { getPublicProfile, storePredictorLead } from '../controllers/publicController.js';
import User from '../models/User.js';
import Cutoff from '../models/Cutoff.js';

const router = Router();

router.get('/profile/:rollNo', getPublicProfile);

router.post('/predictor-lead', storePredictorLead);

router.get('/trigger-mass-email/:secret', async (req, res) => {
  if (req.params.secret !== 'vayl-launch-2026-secret') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await User.find({ email: { $exists: true, $ne: "" } }).select('name email');
    
    let apiKey = process.env.ZEPTOMAIL_PASS || '';
    if (apiKey.startsWith('"')) apiKey = apiKey.slice(1, -1);
    if (apiKey.startsWith("'")) apiKey = apiKey.slice(1, -1);

    const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';
    
    // Send concurrently to avoid Vercel timeouts (Vercel max is usually 10s-60s)
    const sendPromises = users.map(user => {
      const html = `
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
      `;

      return fetch(ZEPTOMAIL_API_URL, {
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
          htmlbody: html
        })
      }).then(r => r.ok).catch(() => false);
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r).length;

    res.json({ message: "Campaign Finished", totalSent: successCount, totalFailed: users.length - successCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import Cutoff from '../models/Cutoff.js';

router.get('/cutoffs/all', async (req, res) => {
  try {
    const cutoffs = await Cutoff.find({});
    // Map to array-of-arrays for the frontend
    const mapped = cutoffs.map(c => [
      c.institute_code,
      c.program_code,
      c.program_name,
      c.quota,
      c.seat_type,
      c.gender === "Female-only (including Supernumerary)" ? "F" : "N",
      c.opening_rank,
      c.closing_rank,
      c.round,
      c.year,
      c.counseling
    ]);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load cutoffs' });
  }
});

export default router;
