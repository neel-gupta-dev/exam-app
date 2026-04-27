import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Cutoff from '../src/models/Cutoff.js';

// Setup environment
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/knowledge-vault';

async function ingestCutoffs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Path to the existing cutoffs-all.json file
    const filePath = path.join(process.cwd(), '..', 'client', 'college-predictor', 'public', 'data', 'cutoffs-all.json');
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const cutoffsArray = JSON.parse(rawData);

    console.log(`Found ${cutoffsArray.length} entries in cutoffs-all.json. Preparing for ingestion...`);

    // Map from array format back to object format
    const documents = cutoffsArray.map(c => ({
      institute_code: c[0],
      institute_name: c[0], // We only have the code in the array, but frontend inflates it. We'll just use code or empty string. Wait, we need the name!
      program_code: c[1],
      program_name: c[2],
      quota: c[3],
      seat_type: c[4],
      gender: c[5] === "F" ? "Female-only (including Supernumerary)" : "Gender-Neutral",
      opening_rank: c[6],
      closing_rank: c[7],
      round: c[8],
      year: c[9],
      counseling: c[10]
    }));

    // Actually, we don't have institute_name in the array. 
    // We should inflate it using institute-metadata.json
    const metaPath = path.join(process.cwd(), '..', 'client', 'college-predictor', 'public', 'data', 'institute-metadata.json');
    if (fs.existsSync(metaPath)) {
      const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      const metaMap = new Map(metaData.map(m => [m.institute_code, m.institute_name]));
      documents.forEach(d => {
        d.institute_name = metaMap.get(d.institute_code) || d.institute_code;
      });
    } else {
      console.warn("Institute metadata not found. Using institute_code as name.");
    }

    // Clear existing to avoid duplicates during initial migration
    await Cutoff.deleteMany({});
    console.log('Cleared existing Cutoff collection.');

    await Cutoff.insertMany(documents);
    console.log(`Successfully ingested ${documents.length} cutoff entries into MongoDB.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

ingestCutoffs();
