// ============================================================
// Mock Cutoff Data Generator
// Generates realistic cutoff data for development
// Will be replaced with real data from Excel sheets
// ============================================================

import { CutoffEntry } from "./types";

interface MockConfig {
  institute_code: string;
  institute_name: string;
  programs: { code: string; name: string; baseRank: number }[];
  type: "IIT" | "NIT" | "IIIT" | "GFTI";
}

const IIT_CONFIGS: MockConfig[] = [
  {
    institute_code: "IIT-B",
    institute_name: "Indian Institute of Technology Bombay",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 70 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 400 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 1800 },
      { code: "4109", name: "Aerospace Engineering (4 Years, Bachelor of Technology)", baseRank: 2200 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 2800 },
      { code: "4178", name: "Artificial Intelligence and Data Science (4 Years, Bachelor of Technology)", baseRank: 90 },
      { code: "4191", name: "Engineering Physics (4 Years, Bachelor of Technology)", baseRank: 1200 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 3500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 250 },
      { code: "4148", name: "Metallurgical Engineering and Materials Science (4 Years, Bachelor of Technology)", baseRank: 4500 },
    ],
  },
  {
    institute_code: "IIT-D",
    institute_name: "Indian Institute of Technology Delhi",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 80 },
      { code: "4178", name: "Mathematics and Computing (4 Years, Bachelor of Technology)", baseRank: 180 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 350 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 2000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 3000 },
      { code: "4191", name: "Engineering Physics (4 Years, Bachelor of Technology)", baseRank: 1500 },
      { code: "4120", name: "Production and Industrial Engineering (4 Years, Bachelor of Technology)", baseRank: 3200 },
      { code: "4127", name: "Textile Technology (4 Years, Bachelor of Technology)", baseRank: 5500 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 3800 },
    ],
  },
  {
    institute_code: "IIT-M",
    institute_name: "Indian Institute of Technology Madras",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 100 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 600 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 400 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 2200 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 3200 },
      { code: "4109", name: "Aerospace Engineering (4 Years, Bachelor of Technology)", baseRank: 2500 },
      { code: "4191", name: "Engineering Physics (4 Years, Bachelor of Technology)", baseRank: 1400 },
      { code: "4148", name: "Metallurgical and Materials Engineering (4 Years, Bachelor of Technology)", baseRank: 5000 },
      { code: "4164", name: "Ocean Engineering and Naval Architecture (4 Years, Bachelor of Technology)", baseRank: 5800 },
    ],
  },
  {
    institute_code: "IIT-K",
    institute_name: "Indian Institute of Technology Kanpur",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 120 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 700 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 2500 },
      { code: "4109", name: "Aerospace Engineering (4 Years, Bachelor of Technology)", baseRank: 2600 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 3500 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 4200 },
      { code: "4148", name: "Materials Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 5200 },
    ],
  },
  {
    institute_code: "IIT-KGP",
    institute_name: "Indian Institute of Technology Kharagpur",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 150 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 600 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 900 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 2800 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 4500 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 3800 },
      { code: "4109", name: "Aerospace Engineering (4 Years, Bachelor of Technology)", baseRank: 3000 },
      { code: "4130", name: "Agricultural and Food Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
      { code: "4147", name: "Mining Engineering (4 Years, Bachelor of Technology)", baseRank: 6500 },
      { code: "4127", name: "Industrial and Systems Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
    ],
  },
  {
    institute_code: "IIT-R",
    institute_name: "Indian Institute of Technology Roorkee",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 800 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 2500 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 3000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 4500 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 5500 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 5800 },
      { code: "4148", name: "Metallurgical and Materials Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
    ],
  },
  {
    institute_code: "IIT-G",
    institute_name: "Indian Institute of Technology Guwahati",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 1000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 3000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 5000 },
      { code: "4178", name: "Mathematics and Computing (4 Years, Bachelor of Technology)", baseRank: 1800 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 6000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 6500 },
    ],
  },
  {
    institute_code: "IIT-H",
    institute_name: "Indian Institute of Technology Hyderabad",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 1200 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 3500 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
      { code: "4178", name: "Artificial Intelligence (4 Years, Bachelor of Technology)", baseRank: 1000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 5500 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 6500 },
    ],
  },
  {
    institute_code: "IIT-BHU",
    institute_name: "Indian Institute of Technology (BHU) Varanasi",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 1500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 4500 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 6000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 7500 },
      { code: "4148", name: "Metallurgical Engineering (4 Years, Bachelor of Technology)", baseRank: 8000 },
      { code: "4147", name: "Mining Engineering (4 Years, Bachelor of Technology)", baseRank: 8500 },
      { code: "4188", name: "Biomedical Engineering (4 Years, Bachelor of Technology)", baseRank: 7800 },
      { code: "4139", name: "Ceramic Engineering (4 Years, Bachelor of Technology)", baseRank: 9500 },
    ],
  },
  {
    institute_code: "IIT-ISM",
    institute_name: "Indian Institute of Technology (ISM) Dhanbad",
    type: "IIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 2000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 5000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 5500 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
      { code: "4147", name: "Mining Engineering (4 Years, Bachelor of Technology)", baseRank: 8000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 8500 },
    ],
  },
];

const NIT_CONFIGS: MockConfig[] = [
  {
    institute_code: "NIT-T",
    institute_name: "National Institute of Technology Tiruchirappalli",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 3500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 8000 },
      { code: "4114", name: "Electrical and Electronics Engineering (4 Years, Bachelor of Technology)", baseRank: 10000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 15000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 22000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 25000 },
    ],
  },
  {
    institute_code: "NIT-K",
    institute_name: "National Institute of Technology Karnataka",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 9000 },
      { code: "4114", name: "Electrical and Electronics Engineering (4 Years, Bachelor of Technology)", baseRank: 12000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 17000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 25000 },
      { code: "4178", name: "Artificial Intelligence and Machine Learning (4 Years, Bachelor of Technology)", baseRank: 3800 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 27000 },
    ],
  },
  {
    institute_code: "NIT-W",
    institute_name: "National Institute of Technology Warangal",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 5000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 10000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 14000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 19000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 28000 },
      { code: "4111", name: "Chemical Engineering (4 Years, Bachelor of Technology)", baseRank: 30000 },
    ],
  },
  {
    institute_code: "NIT-RKL",
    institute_name: "National Institute of Technology Rourkela",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 14000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 17000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 22000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 32000 },
      { code: "4148", name: "Metallurgical and Materials Engineering (4 Years, Bachelor of Technology)", baseRank: 38000 },
    ],
  },
  {
    institute_code: "NIT-C",
    institute_name: "National Institute of Technology Calicut",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 6000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 12000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 15000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 20000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 30000 },
    ],
  },
  {
    institute_code: "NIT-A",
    institute_name: "Motilal Nehru National Institute of Technology Allahabad",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 8000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 15000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 18000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 24000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 35000 },
      { code: "4188", name: "Biotechnology (4 Years, Bachelor of Technology)", baseRank: 42000 },
    ],
  },
  {
    institute_code: "NIT-J",
    institute_name: "Malaviya National Institute of Technology Jaipur",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 7500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 14000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 17000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 23000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 33000 },
    ],
  },
  {
    institute_code: "NIT-N",
    institute_name: "Visvesvaraya National Institute of Technology Nagpur",
    type: "NIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 9000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 16000 },
      { code: "4114", name: "Electrical Engineering (4 Years, Bachelor of Technology)", baseRank: 19000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 26000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 36000 },
    ],
  },
];

const IIIT_CONFIGS: MockConfig[] = [
  {
    institute_code: "IIIT-H",
    institute_name: "International Institute of Information Technology Hyderabad",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 3000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 7000 },
    ],
  },
  {
    institute_code: "IIIT-A",
    institute_name: "Indian Institute of Information Technology Allahabad",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Information Technology (4 Years, Bachelor of Technology)", baseRank: 5500 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 12000 },
    ],
  },
  {
    institute_code: "IIIT-D",
    institute_name: "Indraprastha Institute of Information Technology Delhi",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 4000 },
      { code: "4178", name: "Computer Science and Artificial Intelligence (4 Years, Bachelor of Technology)", baseRank: 4500 },
    ],
  },
  {
    institute_code: "IIIT-GW",
    institute_name: "ABV-Indian Institute of Information Technology and Management Gwalior",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Information Technology (4 Years, Bachelor of Technology)", baseRank: 9000 },
      { code: "4132", name: "Information and Communication Technology (4 Years, Bachelor of Technology)", baseRank: 11000 },
    ],
  },
  {
    institute_code: "IIIT-SC",
    institute_name: "Indian Institute of Information Technology Sri City",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 11000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 20000 },
    ],
  },
  {
    institute_code: "IIIT-LK",
    institute_name: "Indian Institute of Information Technology Lucknow",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 12000 },
      { code: "4132", name: "Information Technology (4 Years, Bachelor of Technology)", baseRank: 16000 },
    ],
  },
  {
    institute_code: "IIIT-VDR",
    institute_name: "Indian Institute of Information Technology Vadodara",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 13000 },
      { code: "4132", name: "Information Technology (4 Years, Bachelor of Technology)", baseRank: 18000 },
    ],
  },
  {
    institute_code: "IIIT-KT",
    institute_name: "Indian Institute of Information Technology Kota",
    type: "IIIT",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 14000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 22000 },
    ],
  },
];

const GFTI_CONFIGS: MockConfig[] = [
  {
    institute_code: "GFTI-BIT",
    institute_name: "Birla Institute of Technology Mesra",
    type: "GFTI",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 15000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 25000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 35000 },
    ],
  },
  {
    institute_code: "GFTI-PEC",
    institute_name: "Punjab Engineering College Chandigarh",
    type: "GFTI",
    programs: [
      { code: "4110", name: "Computer Science and Engineering (4 Years, Bachelor of Technology)", baseRank: 12000 },
      { code: "4115", name: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)", baseRank: 22000 },
      { code: "4116", name: "Mechanical Engineering (4 Years, Bachelor of Technology)", baseRank: 32000 },
      { code: "4113", name: "Civil Engineering (4 Years, Bachelor of Technology)", baseRank: 40000 },
    ],
  },
];

const CATEGORIES_DATA = [
  { seat_type: "OPEN", factor: 1.0 },
  { seat_type: "OBC-NCL", factor: 2.5 },
  { seat_type: "SC", factor: 5.0 },
  { seat_type: "ST", factor: 8.0 },
  { seat_type: "EWS", factor: 1.8 },
];

const GENDERS = ["Gender-Neutral", "Female-only (including Supernumerary)"];

function generateForConfig(config: MockConfig): CutoffEntry[] {
  const entries: CutoffEntry[] = [];
  const quotas: ("AI" | "HS" | "OS")[] = config.type === "IIT" ? ["AI"] : ["AI", "HS", "OS"];

  for (const program of config.programs) {
    for (const categoryData of CATEGORIES_DATA) {
      for (const gender of GENDERS) {
        for (const quota of quotas) {
          for (let round = 1; round <= 6; round++) {
            const genderFactor = gender === "Gender-Neutral" ? 1.0 : 1.15;
            const quotaFactor = quota === "HS" ? 1.3 : quota === "OS" ? 0.9 : 1.0;
            const roundFactor = 1.0 + round * 0.03;

            const closingRank = Math.round(
              program.baseRank *
                categoryData.factor *
                genderFactor *
                quotaFactor *
                roundFactor
            );
            const openingRank = Math.round(closingRank * 0.4);

            entries.push({
              institute_code: config.institute_code,
              institute_name: config.institute_name,
              program_code: program.code,
              program_name: program.name,
              quota,
              seat_type: categoryData.seat_type,
              gender: gender as "Gender-Neutral" | "Female-only (including Supernumerary)",
              opening_rank: openingRank,
              closing_rank: closingRank,
              round,
              year: 2024,
              counseling: round <= 6 ? "JOSAA" : "CSAB" as "JOSAA" | "CSAB",
            });
          }
        }
      }
    }
  }

  return entries;
}

/** Generate all mock cutoff data */
export function generateMockCutoffs(): CutoffEntry[] {
  const allConfigs = [
    ...IIT_CONFIGS,
    ...NIT_CONFIGS,
    ...IIIT_CONFIGS,
    ...GFTI_CONFIGS,
  ];

  const allEntries: CutoffEntry[] = [];
  for (const config of allConfigs) {
    allEntries.push(...generateForConfig(config));
  }

  return allEntries;
}
