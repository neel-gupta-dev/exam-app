/**
 * compute-program-stats.js
 * 
 * Pre-computes per-program statistical data for conservative admission probability.
 * The public cutoff file is stored as compact arrays:
 * [institute_code, program_code, program_name, quota, seat_type, gender, opening_rank, closing_rank, round, year, counseling]
 * 
 * Output: public/data/program-stats.json
 */
const fs = require('fs');
const path = require('path');

const CUTOFFS_PATH = path.join(__dirname, '../client/college-predictor/public/data/cutoffs-all.json');
const OUTPUT_PATH = path.join(__dirname, '../client/college-predictor/public/data/program-stats.json');

function computeStats() {
  const rawCutoffs = JSON.parse(fs.readFileSync(CUTOFFS_PATH, 'utf-8'));
  const cutoffs = rawCutoffs.map(normalizeCutoff).filter(Boolean);
  
  // Group cutoffs by unique program tuple
  // Key: institute_code|program_code|quota|seat_type|gender|counseling
  const groups = new Map();
  
  for (const c of cutoffs) {
    const key = [
      c.institute_code,
      c.program_code,
      c.quota,
      c.seat_type,
      c.gender,
      c.counseling,
    ].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  
  const stats = [];
  
  for (const [key, entries] of groups) {
    entries.sort((a, b) => a.year - b.year || a.round - b.round);

    const finalByYear = new Map();
    for (const entry of entries) {
      const current = finalByYear.get(entry.year);
      if (!current || entry.round > current.round) {
        finalByYear.set(entry.year, entry);
      }
    }

    const yearlyFinals = Array.from(finalByYear.values())
      .sort((a, b) => a.year - b.year);
    const latestEntry = yearlyFinals[yearlyFinals.length - 1];
    const latestClosing = latestEntry.closing_rank;
    const closingRanks = yearlyFinals.map(e => e.closing_rank);

    const mean = closingRanks.reduce((sum, value) => sum + value, 0) / closingRanks.length;
    let std = latestClosing * 0.05;
    if (closingRanks.length >= 2) {
      const variance = closingRanks.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / closingRanks.length;
      std = Math.sqrt(variance);
    }

    // Keep historical volatility helpful but never dominant over the real latest cutoff.
    std = Math.max(std, latestClosing * 0.03, 10);
    std = Math.min(std, Math.max(latestClosing * 0.25, 25));
    
    stats.push({
      k: key,
      m: Math.round(mean),
      s: Math.round(std),
      l: latestClosing,
    });
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stats));
  
  console.log(`✅ Computed stats for ${stats.length} program tuples`);
  console.log(`   Average σ: ${Math.round(stats.reduce((s, v) => s + v.s, 0) / stats.length)}`);
  console.log(`   Output: ${OUTPUT_PATH} (${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(0)} KB)`);
}

function normalizeCutoff(c) {
  if (Array.isArray(c)) {
    return {
      institute_code: c[0],
      program_code: c[1],
      quota: c[3],
      seat_type: c[4],
      gender: c[5] === 'F' ? 'Female-only (including Supernumerary)' : 'Gender-Neutral',
      opening_rank: Number(c[6]),
      closing_rank: Number(c[7]),
      round: Number(c[8]),
      year: Number(c[9]),
      counseling: normalizeCounseling(c[10]),
    };
  }

  if (c && typeof c === 'object') {
    return {
      institute_code: c.institute_code,
      program_code: c.program_code,
      quota: c.quota,
      seat_type: c.seat_type,
      gender: c.gender,
      opening_rank: Number(c.opening_rank),
      closing_rank: Number(c.closing_rank),
      round: Number(c.round),
      year: Number(c.year),
      counseling: normalizeCounseling(c.counseling),
    };
  }

  return null;
}

function normalizeCounseling(counseling) {
  const normalized = String(counseling || '').toUpperCase();
  return normalized === 'JOSAA' ? 'JOSAA' : normalized;
}

computeStats();
