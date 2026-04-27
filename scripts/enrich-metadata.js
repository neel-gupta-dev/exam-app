const fs = require('fs');
const path = require('path');

const enrichmentData = {
    "IIT-B": { nirf: 3, median: 21.8, highest: 150 },
    "IIT-D": { nirf: 2, median: 20.5, highest: 140 },
    "IIT-M": { nirf: 1, median: 20.1, highest: 130 },
    "IIT-K": { nirf: 4, median: 19.5, highest: 120 },
    "IIT-KGP": { nirf: 6, median: 18.9, highest: 110 },
    "IIT-R": { nirf: 5, median: 18.5, highest: 100 },
    "IIT-G": { nirf: 7, median: 17.5, highest: 95 },
    "IIT-H": { nirf: 8, median: 20.0, highest: 90 },
    "IIT-BHU": { nirf: 10, median: 16.5, highest: 85 },
    "IIT-ISM": { nirf: 17, median: 16.98, highest: 120 },
    "IIT-GN": { nirf: 18, median: 16.0, highest: 75 },
    "IIT-BBS": { nirf: 28, median: 15.0, highest: 70 },
    "IIT-IND": { nirf: 14, median: 18.0, highest: 80 },
    "IIT-JOD": { nirf: 30, median: 15.5, highest: 65 },
    "IIT-PAT": { nirf: 41, median: 16.2, highest: 72 },
    "IIT-ROP": { nirf: 22, median: 17.0, highest: 78 },
    "IIT-MAN": { nirf: 33, median: 14.5, highest: 60 },
    "IIT-TP": { nirf: 59, median: 13.5, highest: 55 },
    "IIT-PLK": { nirf: 69, median: 13.0, highest: 50 },
    "IIT-DHA": { nirf: 73, median: 12.5, highest: 48 },
    "IIT-BHILAI": { nirf: 81, median: 12.0, highest: 45 },
    "IIT-JAM": { nirf: 125, median: 11.5, highest: 42 },
    "IIT-GOA": { nirf: 85, median: 12.8, highest: 46 },
    
    "NIT-T": { nirf: 9, median: 15.0, highest: 55 },
    "NIT-K": { nirf: 12, median: 14.5, highest: 50 },
    "NIT-W": { nirf: 21, median: 15.5, highest: 52 },
    "NIT-R": { nirf: 16, median: 13.0, highest: 48 },
    "NIT-C": { nirf: 23, median: 12.5, highest: 45 },
    "NIT-M": { nirf: 25, median: 12.0, highest: 42 },
    "NIT-JLR": { nirf: 46, median: 11.5, highest: 40 },
    "NIT-KRP": { nirf: 31, median: 11.0, highest: 38 },
    "NIT-S": { nirf: 40, median: 10.5, highest: 35 },
    "NIT-D": { nirf: 51, median: 13.5, highest: 45 },
    
    "IIIT-H": { nirf: 55, median: 32.0, highest: 102 },
    "IIIT-B": { nirf: 74, median: 26.5, highest: 85 },
    "IIIT-A": { nirf: 89, median: 28.0, highest: 125 },
    "IIIT-GW": { nirf: 94, median: 22.0, highest: 65 },
    "IIIT-D": { nirf: 101, median: 18.5, highest: 70 }
};

const metadataPath = path.join(__dirname, '../client/college-predictor/public/data/institute-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

const updated = metadata.map(inst => {
    const data = enrichmentData[inst.institute_code];
    if (data) {
        return {
            ...inst,
            nirf_rank: data.nirf,
            placement_median_lpa: data.median,
            placement_highest_lpa: data.highest
        };
    }
    return inst;
});

fs.writeFileSync(metadataPath, JSON.stringify(updated, null, 2));
console.log('Enriched metadata for', Object.keys(enrichmentData).length, 'top colleges.');
