const fs = require('fs');

console.log("Loading cutoffs...");
const cutoffs = JSON.parse(fs.readFileSync('client/college-predictor/public/data/cutoffs-all.json', 'utf8'));

// Fix codes
const metadata = JSON.parse(fs.readFileSync('client/college-predictor/public/data/institute-metadata.json', 'utf8'));
const nameToCode = {};
metadata.forEach(m => {
    nameToCode[m.institute_name.trim()] = m.institute_code;
    if (m.short_name) nameToCode[m.short_name.trim()] = m.institute_code;
});

cutoffs.forEach(c => {
    const correctCode = nameToCode[c.institute_name.trim()];
    if (correctCode && c.institute_code !== correctCode) {
        c.institute_code = correctCode;
    }
});

// Deduplicate
const latestRounds = new Map();
cutoffs.forEach(c => {
    const key = `${c.institute_code}|${c.program_code}|${c.quota}|${c.seat_type}|${c.gender}`;
    const existing = latestRounds.get(key);
    if (!existing || c.round > existing.round) {
        latestRounds.set(key, c);
    }
});

const deduped = Array.from(latestRounds.values());

// Compress to array of arrays:
// [institute_code, program_code, program_name, quota, seat_type, gender, opening_rank, closing_rank, round, year, counseling]
const compressed = deduped.map(c => [
    c.institute_code,
    c.program_code,
    c.program_name,
    c.quota,
    c.seat_type,
    c.gender === "Female-only (including Supernumerary)" ? "F" : "M", // compress gender
    c.opening_rank,
    c.closing_rank,
    c.round,
    c.year,
    c.counseling
]);

fs.writeFileSync('client/college-predictor/public/data/cutoffs-all-min.json', JSON.stringify(compressed));
console.log(`Saved cutoffs-all-min.json. Count: ${compressed.length}`);
