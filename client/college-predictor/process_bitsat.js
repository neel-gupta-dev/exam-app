import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawText = `Campus	Program	Cut-off Score	BITSAT maximum marks
Pilani	B.E. Chemical	210	390
Pilani	B.E. Civil	206	390
Pilani	B.E. Electrical & Electronics	260	390
Pilani	B.E. Mechanical	235	390
Pilani	B.E. Computer Science	304	390
Pilani	B.E. Electronics & Instrumentation	250	390
Pilani	B.E. Electronics & Communication	285	390
Pilani	B.E. Manufacturing	211	390
Pilani	B.E. Mathematics and Computing	295	390
Pilani	B.E. Environmental and Sustainability	203	390
Pilani	B. Pharm	168	390
Pilani	M.Sc. Biological Sciences	208	390
Pilani	M.Sc. Chemistry	212	390
Pilani	M.Sc. Economics	251	390
Pilani	M.Sc. Mathematics	229	390
Pilani	M.Sc. Physics	223	390
Pilani	M.Sc. Semiconductor and Nanoscience	239	390

K K Birla Goa	B.E. Chemical	206	390
K K Birla Goa	B.E. Electrical & Electronics	243	390
K K Birla Goa	B.E. Mechanical	223	390
K K Birla Goa	B.E. Computer Science	274	390
K K Birla Goa	B.E. Electronics & Instrumentation	234	390
K K Birla Goa	B.E. Electronics & Communication	255	390
K K Birla Goa	B.E. Electronics and Computer	262	390
K K Birla Goa	B.E. Mathematics and Computing	268	390
K K Birla Goa	B.E. Environmental and Sustainability	189	390
K K Birla Goa	M.Sc. Biological Sciences	203	390
K K Birla Goa	M.Sc. Chemistry	205	390
K K Birla Goa	M.Sc. Economics	237	390
K K Birla Goa	M.Sc. Mathematics	216	390
K K Birla Goa	M.Sc. Physics	212	390
K K Birla Goa	M.Sc. Semiconductor and Nanoscience	225	390

Hyderabad	B.E. Chemical	205	390
Hyderabad	B.E. Civil	203	390
Hyderabad	B.E. Electrical & Electronics	239	390
Hyderabad	B.E. Mechanical	214	390
Hyderabad	B.E. Computer Science	270	390
Hyderabad	B.E. Electronics & Instrumentation	232	390
Hyderabad	B.E. Electronics & Communication	256	390
Hyderabad	B.E. Mathematics and Computing	266	390
Hyderabad	B.E. Environmental and Sustainability	181	390
Hyderabad	B. Pharm	151	390
Hyderabad	M.Sc. Biological Sciences	203	390
Hyderabad	M.Sc. Chemistry	203	390
Hyderabad	M.Sc. Economics	231	390
Hyderabad	M.Sc. Mathematics	212	390
Hyderabad	M.Sc. Physics	209	390
Hyderabad	M.Sc. Semiconductor and Nanoscience	225	390`;

const campusMap = {
  'Pilani': {
    code: 'BITS_PILANI',
    name: 'BITS Pilani'
  },
  'K K Birla Goa': {
    code: 'BITS_GOA',
    name: 'BITS Pilani - Goa Campus'
  },
  'Hyderabad': {
    code: 'BITS_HYD',
    name: 'BITS Pilani - Hyderabad Campus'
  }
};

const cutoffs = [];
const lines = rawText.split('\n');

for (const line of lines) {
  if (!line.trim() || line.startsWith('Campus')) continue;
  
  // Split by tab or multiple spaces
  const parts = line.split(/\t|\s{2,}/);
  if (parts.length >= 3) {
    const campusStr = parts[0].trim();
    const programStr = parts[1].trim();
    const scoreStr = parts[2].trim();
    
    const campusInfo = campusMap[campusStr];
    if (campusInfo && scoreStr && !isNaN(parseInt(scoreStr))) {
      cutoffs.push({
        institute_code: campusInfo.code,
        institute_name: campusInfo.name,
        program_code: programStr.toUpperCase().replace(/[^A-Z]/g, ''),
        program_name: programStr,
        quota: "AI",
        seat_type: "OPEN",
        gender: "Gender-Neutral",
        opening_rank: 390,
        closing_rank: parseInt(scoreStr),
        round: 1,
        year: 2025,
        counseling: "BITSAT"
      });
    }
  }
}

// 1. Update cutoffs-all.json
const cutoffsFilePath = path.join(__dirname, 'public', 'data', 'cutoffs-all.json');
const existingCutoffs = JSON.parse(fs.readFileSync(cutoffsFilePath, 'utf8'));

// Filter out any existing BITSAT cutoffs to avoid duplicates if run multiple times
const newCutoffsArray = existingCutoffs.filter(c => c.counseling !== "BITSAT").concat(cutoffs);
fs.writeFileSync(cutoffsFilePath, JSON.stringify(newCutoffsArray, null, 2));
console.log(`Appended ${cutoffs.length} BITSAT entries to cutoffs-all.json`);

// 2. Update institute-metadata.json
const metaFilePath = path.join(__dirname, 'public', 'data', 'institute-metadata.json');
const existingMeta = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));

const bitsInstitutes = [
  {
    institute_code: 'BITS_PILANI',
    institute_name: 'Birla Institute of Technology and Science, Pilani',
    short_name: 'BITS Pilani',
    type: 'BITS',
    city: 'Pilani',
    state: 'Rajasthan',
    city_tier: 3,
    nirf_rank: 20,
    placement_median_lpa: 18.0,
    placement_highest_lpa: 60.0,
    campus_rating: 4.8,
    established_year: 1964,
    website: 'https://www.bits-pilani.ac.in/'
  },
  {
    institute_code: 'BITS_GOA',
    institute_name: 'BITS Pilani - K.K. Birla Goa Campus',
    short_name: 'BITS Goa',
    type: 'BITS',
    city: 'Zuarinagar',
    state: 'Goa',
    city_tier: 2,
    nirf_rank: null,
    placement_median_lpa: 16.0,
    placement_highest_lpa: 50.0,
    campus_rating: 4.7,
    established_year: 2004,
    website: 'https://www.bits-pilani.ac.in/goa/'
  },
  {
    institute_code: 'BITS_HYD',
    institute_name: 'BITS Pilani - Hyderabad Campus',
    short_name: 'BITS Hyderabad',
    type: 'BITS',
    city: 'Hyderabad',
    state: 'Telangana',
    city_tier: 1,
    nirf_rank: null,
    placement_median_lpa: 15.5,
    placement_highest_lpa: 50.0,
    campus_rating: 4.6,
    established_year: 2008,
    website: 'https://www.bits-pilani.ac.in/hyderabad/'
  }
];

// Add if not exists
for (const bits of bitsInstitutes) {
  if (!existingMeta.find(m => m.institute_code === bits.institute_code)) {
    existingMeta.push(bits);
  }
}

fs.writeFileSync(metaFilePath, JSON.stringify(existingMeta, null, 2));
console.log('Appended BITS institutes to institute-metadata.json');
