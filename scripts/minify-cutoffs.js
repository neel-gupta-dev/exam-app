const fs = require('fs');

console.log("Loading cutoffs...");
const cutoffs = JSON.parse(fs.readFileSync('client/college-predictor/public/data/cutoffs-all.json', 'utf8'));
console.log(`Original count: ${cutoffs.length}`);

// Fix codes using metadata
const metadata = JSON.parse(fs.readFileSync('client/college-predictor/public/data/institute-metadata.json', 'utf8'));
const nameToCode = {};
metadata.forEach(m => {
    nameToCode[m.institute_name.trim()] = m.institute_code;
    if (m.short_name) nameToCode[m.short_name.trim()] = m.institute_code;
});

let fixedCount = 0;
cutoffs.forEach(c => {
    const correctCode = nameToCode[c.institute_name.trim()];
    if (correctCode && c.institute_code !== correctCode) {
        c.institute_code = correctCode;
        fixedCount++;
    }
});
console.log(`Fixed ${fixedCount} institute codes.`);

// Deduplicate: keep only the latest round
const latestRounds = new Map();
cutoffs.forEach(c => {
    const key = `${c.institute_code}|${c.program_code}|${c.quota}|${c.seat_type}|${c.gender}`;
    const existing = latestRounds.get(key);
    if (!existing || c.round > existing.round) {
        latestRounds.set(key, c);
    }
});

const deduped = Array.from(latestRounds.values());
console.log(`Deduped count: ${deduped.length}`);

fs.writeFileSync('client/college-predictor/public/data/cutoffs-all-min.json', JSON.stringify(deduped));
console.log(`Saved cutoffs-all-min.json`);
