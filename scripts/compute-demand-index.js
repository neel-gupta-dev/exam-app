/**
 * compute-demand-index.js
 * 
 * Computes a data-driven Branch Demand Percentile Index by analyzing
 * how competitive each branch is relative to other branches at the same institute.
 * 
 * Method:
 * 1. For each institute, compute the median closing rank across all its programs
 * 2. For each cutoff entry, compute demand_ratio = institute_median / closing_rank
 *    (higher ratio = branch is harder to get into = higher demand)
 * 3. Group by branch category (using keyword matching)
 * 4. Compute mean demand_ratio per category
 * 5. Convert to percentile rank (0-100)
 * 
 * Output: public/data/demand-index.json
 */
const fs = require('fs');
const path = require('path');

const CUTOFFS_PATH = path.join(__dirname, '../client/college-predictor/public/data/cutoffs-all.json');
const BRANCH_RANKINGS_PATH = path.join(__dirname, '../client/college-predictor/public/data/branch-rankings.json');
const OUTPUT_PATH = path.join(__dirname, '../client/college-predictor/public/data/demand-index.json');

// Load existing keyword matcher
const branchRankings = JSON.parse(fs.readFileSync(BRANCH_RANKINGS_PATH, 'utf-8'));

function matchBranchCategory(programName) {
  const lower = programName.toLowerCase();
  for (const branch of branchRankings) {
    for (const kw of branch.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return branch.category;
      }
    }
  }
  return 'Other Engineering';
}

function computeDemandIndex() {
  const cutoffs = JSON.parse(fs.readFileSync(CUTOFFS_PATH, 'utf-8'));
  
  // Only use OPEN, Gender-Neutral, last round per program for a clean signal
  // Group by institute to compute institute median
  const byInstitute = new Map();
  
  for (const c of cutoffs) {
    if (c.seat_type !== 'OPEN' || c.gender !== 'Gender-Neutral') continue;
    
    if (!byInstitute.has(c.institute_code)) byInstitute.set(c.institute_code, []);
    byInstitute.get(c.institute_code).push(c);
  }
  
  // Step 1: Compute institute median closing rank
  const instituteMedian = new Map();
  for (const [code, entries] of byInstitute) {
    // Use the highest round available for each program (most relaxed cutoff)
    const programBest = new Map();
    for (const e of entries) {
      const pk = e.program_code;
      if (!programBest.has(pk) || e.round > programBest.get(pk).round) {
        programBest.set(pk, e);
      }
    }
    
    const ranks = [...programBest.values()].map(e => e.closing_rank).sort((a, b) => a - b);
    const mid = Math.floor(ranks.length / 2);
    const median = ranks.length % 2 === 0 ? (ranks[mid - 1] + ranks[mid]) / 2 : ranks[mid];
    instituteMedian.set(code, median);
  }
  
  // Step 2: Compute demand_ratio for each entry
  const categoryDemandRatios = new Map();
  
  for (const [code, entries] of byInstitute) {
    const median = instituteMedian.get(code);
    if (!median) continue;
    
    // Use highest round per program
    const programBest = new Map();
    for (const e of entries) {
      const pk = e.program_code;
      if (!programBest.has(pk) || e.round > programBest.get(pk).round) {
        programBest.set(pk, e);
      }
    }
    
    for (const [, entry] of programBest) {
      const category = matchBranchCategory(entry.program_name);
      const demandRatio = median / entry.closing_rank;
      
      if (!categoryDemandRatios.has(category)) categoryDemandRatios.set(category, []);
      categoryDemandRatios.get(category).push(demandRatio);
    }
  }
  
  // Step 3: Compute mean demand ratio per category
  const categoryStats = [];
  for (const [category, ratios] of categoryDemandRatios) {
    const avg = ratios.reduce((s, v) => s + v, 0) / ratios.length;
    categoryStats.push({
      category,
      avg_demand_ratio: avg,
      sample_size: ratios.length,
    });
  }
  
  // Step 4: Convert to percentile rank
  categoryStats.sort((a, b) => a.avg_demand_ratio - b.avg_demand_ratio);
  const total = categoryStats.length;
  
  const demandIndex = {};
  categoryStats.forEach((cat, i) => {
    const percentile = Math.round((i / (total - 1)) * 100);
    demandIndex[cat.category] = {
      demand_percentile: percentile,
      avg_demand_ratio: Math.round(cat.avg_demand_ratio * 1000) / 1000,
      sample_size: cat.sample_size,
    };
  });
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(demandIndex, null, 2));
  
  console.log(`✅ Computed demand index for ${total} branch categories`);
  console.log(`   Output: ${OUTPUT_PATH}`);
  console.log('\n   Ranking (low → high demand):');
  categoryStats.forEach((cat, i) => {
    const pct = Math.round((i / (total - 1)) * 100);
    console.log(`   ${pct.toString().padStart(3)}%  ${cat.category} (avg ratio: ${cat.avg_demand_ratio.toFixed(3)}, n=${cat.sample_size})`);
  });
}

computeDemandIndex();
