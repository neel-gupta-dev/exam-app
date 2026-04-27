const fs = require('fs');
const path = require('path');

function parseCSV(content) {
    const lines = content.split('\n').filter(l => l.trim());
    const data = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let values = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else current += char;
        }
        values.push(current.trim());
        data.push(values);
    }
    return data;
}

const choicesPath = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\e2d15dd8-590a-46f0-8c0b-88cec166a378\\.system_generated\\steps\\948\\content.md';
const contentRaw = fs.readFileSync(choicesPath, 'utf8');
const content = contentRaw.split('---')[1].trim();
const rows = parseCSV(content);

const demand = {}; // branch -> total choices

rows.forEach(row => {
    if (row.length < 4) return;
    const branch = row[1];
    const count = parseInt(row[3]);
    if (isNaN(count)) return;
    
    // Normalize branch name
    const bKey = branch.toLowerCase().replace(/[^a-z]/g, '');
    if (!demand[bKey]) demand[bKey] = { name: branch, total: 0 };
    demand[bKey].total += count;
});

// Map to our existing branch categories
const categories = {
    "Computer Science": ["computer", "data", "artificial", "ai", "ml", "software"],
    "Electronics": ["electronics", "communication", "electrical", "telecommunication", "vlsi", "microelectronics", "instrumentation"],
    "Mechanical": ["mechanical", "mechatronics", "production", "manufacturing", "industrial", "aerospace", "automobile"],
    "Civil": ["civil", "infrastructure", "construction", "architecture"],
    "Chemical": ["chemical", "biotechnology", "bioengineering", "biosciences", "food", "textile", "biomedical"],
    "Others": ["metallurgical", "materials", "mining", "petroleum", "energy", "physics", "chemistry", "mathematics", "geology", "geophysics", "earth", "ocean", "naval", "ceramic", "pharmaceutical", "agriculture", "economics"]
};

const catDemand = {};
const catCounts = {};
Object.keys(categories).forEach(cat => {
    catDemand[cat] = 0;
    catCounts[cat] = 0;
});

Object.values(demand).forEach(d => {
    let assigned = false;
    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => d.name.toLowerCase().includes(kw))) {
            catDemand[cat] += d.total;
            catCounts[cat]++;
            assigned = true;
            break;
        }
    }
    if (!assigned) {
        catDemand["Others"] += d.total;
        catCounts["Others"]++;
    }
});

// Calculate average demand per branch in category
const avgDemand = {};
Object.keys(catDemand).forEach(cat => {
    avgDemand[cat] = catCounts[cat] > 0 ? catDemand[cat] / catCounts[cat] : 0;
});

// Normalize to 0-100 index
const max = Math.max(...Object.values(avgDemand));
const index = {};
Object.keys(avgDemand).forEach(cat => {
    index[cat] = Math.round((avgDemand[cat] / max) * 100);
});

const outputPath = path.join(__dirname, '../client/college-predictor/public/data/demand-index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

console.log('Branch Demand Index updated using real choice data:');
console.log(index);
