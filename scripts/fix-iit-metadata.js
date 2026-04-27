/**
 * fix-iit-metadata.js
 * 
 * Fixes the IIT type mismatch bug:
 * 1. Merges enriched data from orphan IIT-* entries into the GFTI-* entries that cutoffs reference
 * 2. Sets type to "IIT" for all actual IITs
 * 3. Removes orphan IIT-* entries
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../client/college-predictor/public/data/institute-metadata.json');

// Mapping from orphan IIT-* code to GFTI-* code (matched by name)
const IIT_CODE_MAP = {
  'IIT-B':   'GFTI-BOM',   // IIT Bombay
  'IIT-D':   'GFTI-DEL',   // IIT Delhi
  'IIT-M':   'GFTI-MAD',   // IIT Madras
  'IIT-K':   'GFTI-KAN',   // IIT Kanpur
  'IIT-KGP': 'GFTI-KHA',   // IIT Kharagpur
  'IIT-R':   'GFTI-ROO',   // IIT Roorkee
  'IIT-G':   'GFTI-GUW',   // IIT Guwahati
  'IIT-H':   'GFTI-HYD',   // IIT Hyderabad
  'IIT-BHU': 'GFTI-VAR',   // IIT (BHU) Varanasi
  'IIT-ISM': null,          // IIT Dhanbad (ISM) - may not have GFTI-* entry
  'IIT-I':   'GFTI-IND',   // IIT Indore
  'IIT-GN':  'GFTI-GAN',   // IIT Gandhinagar
  'IIT-RP':  'GFTI-ROP',   // IIT Ropar
  'IIT-BBS': 'GFTI-BHU',   // IIT Bhubaneswar
  'IIT-P':   'GFTI-PAT',   // IIT Patna
  'IIT-J':   'GFTI-JOD',   // IIT Jodhpur
  'IIT-MN':  'GFTI-MAN',   // IIT Mandi
  'IIT-PKD': 'GFTI-PAL',   // IIT Palakkad
  'IIT-TP':  'GFTI-TIR',   // IIT Tirupati
  'IIT-DH':  'GFTI-DHA',   // IIT Dharwad
  'IIT-BH':  'GFTI-BHI',   // IIT Bhilai
  'IIT-GOA': 'GFTI-GOA',   // IIT Goa
  'IIT-JMU': 'GFTI-JAM',   // IIT Jammu
};

function fixMetadata() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  
  // Build lookup maps
  const byCode = new Map();
  data.forEach(inst => byCode.set(inst.institute_code, inst));

  let mergedCount = 0;
  const orphansToRemove = new Set();

  for (const [orphanCode, gftiCode] of Object.entries(IIT_CODE_MAP)) {
    const orphan = byCode.get(orphanCode);
    if (!orphan) {
      console.log(`  SKIP: orphan ${orphanCode} not found`);
      continue;
    }

    if (!gftiCode) {
      // No GFTI match — this IIT needs to stay but get type fixed
      console.log(`  KEEP: ${orphanCode} (${orphan.short_name}) — no GFTI-* equivalent, fixing type only`);
      orphan.type = 'IIT';
      continue;
    }

    const target = byCode.get(gftiCode);
    if (!target) {
      console.log(`  SKIP: target ${gftiCode} not found`);
      continue;
    }

    // Merge: copy enriched fields from orphan into target
    target.type = 'IIT';
    target.short_name = orphan.short_name; // Use the cleaner name
    
    // Copy enriched data only if the orphan has better values
    if (orphan.nirf_rank !== null && orphan.nirf_rank !== undefined) {
      target.nirf_rank = orphan.nirf_rank;
    }
    if (orphan.placement_median_lpa !== null && orphan.placement_median_lpa !== undefined) {
      target.placement_median_lpa = orphan.placement_median_lpa;
    }
    if (orphan.placement_highest_lpa !== null && orphan.placement_highest_lpa !== undefined) {
      target.placement_highest_lpa = orphan.placement_highest_lpa;
    }
    if (orphan.campus_rating) {
      target.campus_rating = orphan.campus_rating;
    }
    if (orphan.city_tier) {
      target.city_tier = orphan.city_tier;
    }
    if (orphan.established_year) {
      target.established_year = orphan.established_year;
    }
    if (orphan.website) {
      target.website = orphan.website;
    }

    orphansToRemove.add(orphanCode);
    mergedCount++;
    console.log(`  MERGE: ${orphanCode} → ${gftiCode} (${target.short_name}) ✓`);
  }

  // Remove orphans
  const cleanedData = data.filter(inst => !orphansToRemove.has(inst.institute_code));

  fs.writeFileSync(DATA_PATH, JSON.stringify(cleanedData, null, 2));
  
  console.log(`\n✅ Fixed ${mergedCount} IIT entries (merged orphan data, set type to "IIT")`);
  console.log(`Removed ${orphansToRemove.size} orphan entries`);
  console.log(`Total institutes: ${cleanedData.length}`);
  
  // Verify
  const verify = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const iits = verify.filter(i => i.type === 'IIT');
  console.log(`IIT type count after fix: ${iits.length}`);
  iits.forEach(i => console.log(`  ${i.institute_code} → ${i.short_name} (NIRF: ${i.nirf_rank}, Pkg: ${i.placement_median_lpa})`));
}

fixMetadata();
