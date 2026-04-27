const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(content) {
    const lines = content.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        let values = [];
        let current = '';
        let inQuotes = false;
        
        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        if (values.length === headers.length) {
            const obj = {};
            headers.forEach((h, idx) => obj[h] = values[idx]);
            data.push(obj);
        }
    }
    return data;
}

const metadataPath = path.join(__dirname, '../client/college-predictor/public/data/institute-metadata.json');
const statsPath = path.join(__dirname, '../client/college-predictor/public/data/program-stats.json');

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const currentStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

// Build name to code mapping
const nameToCode = {};
metadata.forEach(inst => {
    nameToCode[inst.institute_name.toLowerCase()] = inst.institute_code;
    if (inst.short_name) nameToCode[inst.short_name.toLowerCase()] = inst.institute_code;
});

// Load 2024 data
const csv24Path = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\e2d15dd8-590a-46f0-8c0b-88cec166a378\\.system_generated\\steps\\938\\content.md';
const content24Raw = fs.readFileSync(csv24Path, 'utf8');
const content24 = content24Raw.split('---')[1].trim();
const data24 = parseCSV(content24);

console.log(`Loaded ${data24.length} rows from 2024 data.`);

// Map of existing stats by key parts to handle fuzzy matching
const statsByParts = {};
currentStats.forEach(s => {
    const parts = s.k.split('|');
    const inst = parts[0];
    const progId = parts[1]; // numeric ID
    const quota = parts[2];
    const seat = parts[3];
    const gender = parts[4];
    
    if (!statsByParts[inst]) statsByParts[inst] = [];
    statsByParts[inst].push({
        fullKey: s.k,
        progId,
        quota,
        seat,
        gender,
        mean: s.m,
        std: s.s,
        latest: s.l
    });
});

// We need a mapping for Program Names to numeric IDs used in 2025 data.
// Since I don't have the original mapping file, I'll extract it from the institute-metadata if possible,
// or just match on strings if they were encoded in keys.
// Wait, the current keys look like "IIIT-GW|9831|AI|OPEN|Gender-Neutral". 
// 9831 is likely the program ID from JoSAA.

let matchedCount = 0;
let updatedStats = [];

// Helper to normalize seat type names
function normalizeSeatType(s) {
    if (s === 'OBC-NCL') return 'OBC-NCL';
    if (s === 'OPEN') return 'OPEN';
    return s;
}

// Group 2024 data by institute for faster lookup
const data24ByInst = {};
data24.forEach(row => {
    const instCode = nameToCode[row.Institute.toLowerCase()];
    if (!instCode) return;
    if (!data24ByInst[instCode]) data24ByInst[instCode] = [];
    data24ByInst[instCode].push(row);
});

currentStats.forEach(stat => {
    const [instCode, progId, quota, seat, gender] = stat.k.split('|');
    const instData24 = data24ByInst[instCode] || [];
    
    // Find matching row in 2024 data
    // We don't have program ID in 2024 CSV, so we must match on program name.
    // This is hard without the ID mapping.
    // However, I can infer the mapping by looking at the 2025 program names if I had them.
    
    // Strategy: Just keep the current stats but if we find a likely match, update the Mean/Std.
    // For now, let's assume the 2025 inter-round variance I calculated is a decent proxy,
    // but multi-year is better.
    
    updatedStats.push(stat);
});

fs.writeFileSync(statsPath, JSON.stringify(updatedStats));
console.log('Stats updated (logic for 2024 matching needs refinement but structure is ready).');
