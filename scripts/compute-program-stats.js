/**
 * compute-program-stats.js
 * 
 * Pre-computes per-program statistical data for Z-score based admission probability:
 * - Weighted closing rank mean (from last round per year, or inter-round if single year)
 * - Standard deviation (from inter-round variance)
 * - Trend slope
 * 
 * Output: public/data/program-stats.json
 */
const fs = require('fs');
const path = require('path');

const CUTOFFS_PATH = path.join(__dirname, '../client/college-predictor/public/data/cutoffs-all.json');
const OUTPUT_PATH = path.join(__dirname, '../client/college-predictor/public/data/program-stats.json');

function computeStats() {
  const cutoffs = JSON.parse(fs.readFileSync(CUTOFFS_PATH, 'utf-8'));
  
  // Group cutoffs by unique program tuple
  // Key: institute_code|program_code|quota|seat_type|gender
  const groups = new Map();
  
  for (const c of cutoffs) {
    const key = `${c.institute_code}|${c.program_code}|${c.quota}|${c.seat_type}|${c.gender}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  
  const stats = [];
  
  for (const [key, entries] of groups) {
    // Sort entries by round (ascending)
    entries.sort((a, b) => a.round - b.round);
    
    const parts = key.split('|');
    const closingRanks = entries.map(e => e.closing_rank);
    const rounds = entries.map(e => e.round);
    const years = [...new Set(entries.map(e => e.year))];
    
    // Use the LAST round's closing rank as the primary reference (most relaxed cutoff)
    const latestClosing = closingRanks[closingRanks.length - 1];
    
    // Compute mean of closing ranks across all rounds
    const mean = closingRanks.reduce((s, v) => s + v, 0) / closingRanks.length;
    
    // Compute standard deviation from inter-round variance
    let std;
    if (closingRanks.length >= 2) {
      const variance = closingRanks.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / closingRanks.length;
      std = Math.sqrt(variance);
    } else {
      // Single data point — use 5% of the closing rank as a conservative estimate
      std = latestClosing * 0.05;
    }
    
    // Floor: minimum σ is 3% of mean to prevent division by tiny numbers
    std = Math.max(std, mean * 0.03);
    
    // Round volatility: spread between first and last round
    const roundVolatility = closingRanks.length >= 2 
      ? closingRanks[closingRanks.length - 1] - closingRanks[0]
      : 0;
    
    // Trend slope: for single year, use inter-round trend
    // For multi-year, would use year-over-year regression
    let trendSlope = 0;
    if (closingRanks.length >= 2) {
      // Simple slope: (last - first) / number of intervals
      trendSlope = (closingRanks[closingRanks.length - 1] - closingRanks[0]) / (closingRanks.length - 1);
    }
    
    stats.push({
      key,
      institute_code: parts[0],
      program_code: parts[1],
      quota: parts[2],
      seat_type: parts[3],
      gender: parts[4],
      closing_rank_mean: Math.round(mean),
      closing_rank_std: Math.round(std),
      closing_rank_latest: latestClosing,
      trend_slope: Math.round(trendSlope),
      round_volatility: roundVolatility,
      rounds_available: rounds,
      years_of_data: years.length,
    });
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stats));
  
  console.log(`✅ Computed stats for ${stats.length} program tuples`);
  console.log(`   Average σ: ${Math.round(stats.reduce((s, v) => s + v.closing_rank_std, 0) / stats.length)}`);
  console.log(`   Tuples with >1 round: ${stats.filter(s => s.rounds_available.length > 1).length}`);
  console.log(`   Output: ${OUTPUT_PATH} (${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(0)} KB)`);
}

computeStats();
