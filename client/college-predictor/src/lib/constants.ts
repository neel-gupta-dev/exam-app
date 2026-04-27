// ============================================================
// College Predictor — Constants
// ============================================================

import { Category } from "./types";

/** All Indian states and UTs */
export const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/** JEE categories */
export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "OPEN", label: "General / OPEN" },
  { value: "OBC-NCL", label: "OBC-NCL" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "EWS", label: "EWS" },
];

/** PwD variants of categories */
export const PWD_CATEGORIES: { value: Category; label: string }[] = [
  { value: "OPEN (PwD)", label: "General / OPEN (PwD)" },
  { value: "OBC-NCL (PwD)", label: "OBC-NCL (PwD)" },
  { value: "SC (PwD)", label: "SC (PwD)" },
  { value: "ST (PwD)", label: "ST (PwD)" },
  { value: "EWS (PwD)", label: "EWS (PwD)" },
];

/** Seat type mappings for filtering */
export const SEAT_TYPE_MAP: Record<string, string[]> = {
  OPEN: ["OPEN", "OPEN (PwD)"],
  "OBC-NCL": ["OBC-NCL", "OBC-NCL (PwD)"],
  SC: ["SC", "SC (PwD)"],
  ST: ["ST", "ST (PwD)"],
  EWS: ["EWS", "EWS (PwD)"],
  "OPEN (PwD)": ["OPEN (PwD)"],
  "OBC-NCL (PwD)": ["OBC-NCL (PwD)"],
  "SC (PwD)": ["SC (PwD)"],
  "ST (PwD)": ["ST (PwD)"],
  "EWS (PwD)": ["EWS (PwD)"],
};

/** Chance thresholds (used as fallback when Z-score stats unavailable) */
export const CHANCE_THRESHOLDS = {
  safe: 0.8,      // rank ≤ 80% of closing rank
  moderate: 1.0,  // rank between 80%-100%
  low: 1.2,       // rank between 100%-120%
} as const;

/** Institute type base scores */
export const INSTITUTE_TYPE_SCORES: Record<string, number> = {
  IIT: 100,
  BITS: 90,
  NIT: 75,
  IIIT: 70,
  GFTI: 50,
};

/** Default college preferences (all equal) */
export const DEFAULT_COLLEGE_PREFERENCES = {
  city_life: 50,
  placements: 50,
  reputation: 50,
  campus_life: 50,
};

/** Common branch names for the preference UI */
export const BRANCH_GROUPS = [
  {
    "name": "Computer Science & IT",
    "branches": [
      "Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Artificial Intelligence (5 Years, Integrated B. Tech. and M. Tech.)",
      "Artificial Intelligence and Data Engineering (4 Years, Bachelor of Technology)",
      "Artificial Intelligence and Data Science (4 Years, Bachelor of Technology)",
      "Artificial Intelligence and Machine Learning (4 Years, Bachelor of Technology)",
      "CSE ( Data Science & Analytics) (4 Years, Bachelor of Technology)",
      "Computational and Data Science (4 Years, Bachelor of Technology)",
      "Computer Science (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Artificial lntelligence and Machine Learning) (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Data Science and Analytics) (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Human Computer lnteraction and Gaming Technology) (4 Years, Bachelor of Technology)",
      "Computer Science and Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Computer Science and Business (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering ( Artificial Intelligence & Data Science) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering (Artificial Intelligence and Machine Learning) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Artificial Intelligence) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Cyber Physical System) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Cyber Security) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Data Science) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (with Specialization of Data Science and Artificial Intelligence) (4 Years, B. Tech / B. Tech (Hons.))",
      "Computer Science and Engineering with Major in Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with Specialization in Cyber Security (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering with Specialization in Data Science (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering with specialization in Artificial Intelligence and Data Science (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with specialization in Cyber Security (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with specialization in Quantum Technologies (4 Years, Bachelor of Technology)",
      "Data Science and Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Data Science and Engineering (4 Years, Bachelor of Technology)",
      "Information Technology (4 Years, Bachelor of Technology)",
      "Information Technology-Business Informatics (4 Years, Bachelor of Technology)",
      "Mathematics and Data Science (5 Years, Bachelor and Master of Technology (Dual Degree))"
    ]
  },
  {
    "name": "Electronics & Electrical",
    "branches": [
      "B.Tech. in Electronics and Communication Engineering and M.Tech. in Communication Systems (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "B.Tech. in Electronics and Communication Engineering and M.Tech. in Microelectronics and VLSI Systems (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electrical Engineering (4 Years, Bachelor of Technology)",
      "Electrical Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electrical Engineering with Specialization In Power System Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electrical and Electronics Engineering (4 Years, Bachelor of Technology)",
      "Electronics Engineering (VLSI Design and Technology) (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electronics and Communication Engineering (Internet of Things) (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering (VLSI Design and Technology) (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering (VLSI Design) (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering (with Specialization of Embedded Systems and Internet of Things) (4 Years, B. Tech / B. Tech (Hons.))",
      "Electronics and Communication Engineering with Specialization in Microelectronics and VLSI System Design (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electronics and Communication Engineering with specialization in Design and Manufacturing (4 Years, Bachelor of Technology)",
      "Electronics and Communication Engineering with specialization in VLSI and Embedded Systems (4 Years, Bachelor of Technology)",
      "Electronics and Instrumentation Engineering (4 Years, Bachelor of Technology)",
      "Electronics and Telecommunication Engineering (4 Years, Bachelor of Technology)",
      "Electronics and VLSI Engineering (4 Years, Bachelor of Technology)",
      "Energy and Electrical Vehicle Engineering (4 Years, Bachelor of Technology)",
      "Industrial Internet of Things (4 Years, Bachelor of Technology)",
      "Instrumentation and Control Engineering (4 Years, Bachelor of Technology)",
      "Microelectronics & VLSI Engineering (4 Years, Bachelor of Technology)",
      "VLSI Design and Technology (4 Years, Bachelor of Technology)"
    ]
  },
  {
    "name": "Mathematics & Computing",
    "branches": [
      "B.Tech in Mathematics and Computing (4 Years, Bachelor of Technology)",
      "Computational Mathematics (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Mathematics & Computing (5 Years, Bachelor of Science and Master of Science (Dual Degree))",
      "Mathematics (5 Years, Integrated Master of Science)",
      "Mathematics and Computing (4 Years, Bachelor of Technology)",
      "Mathematics and Computing Technology (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Mathematics and Data Science (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Mathematics and Scientific Computing (4 Years, Bachelor of Technology)"
    ]
  },
  {
    "name": "Mechanical & Manufacturing",
    "branches": [
      "B.Tech in Mechanical Engineering and M.Tech in AI and Robotics (5 Years, B.Tech. + M.Tech./MS (Dual Degree))",
      "Ceramic Engineering and M.Tech Industrial Ceramic (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Electronics and Communication Engineering with specialization in Design and Manufacturing (4 Years, Bachelor of Technology)",
      "Industrial Chemistry (4 Years, Bachelor of Technology)",
      "Industrial Design (4 Years, Bachelor of Technology)",
      "Industrial Internet of Things (4 Years, Bachelor of Technology)",
      "Industrial and Production Engineering (4 Years, Bachelor of Technology)",
      "Mechanical Engineering (4 Years, Bachelor of Technology)",
      "Mechanical Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Mechanical Engineering with Specialization in Manufacturing and Industrial Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Mechanical Engineering with specialization in Design and Manufacturing (4 Years, Bachelor of Technology)",
      "Mechatronics and Automation Engineering (4 Years, Bachelor of Technology)",
      "Production Engineering (4 Years, Bachelor of Technology)",
      "Production and Industrial Engineering (4 Years, Bachelor of Technology)",
      "Smart Manufacturing (4 Years, Bachelor of Technology)"
    ]
  },
  {
    "name": "Civil & Architecture",
    "branches": [
      "Architecture (5 Years, Bachelor of Architecture)",
      "Civil Engineering (4 Years, Bachelor of Technology)",
      "Civil Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Civil Engineering with Specialization in Construction Technology and Management (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Planning (4 Years, Bachelor of Planning)"
    ]
  },
  {
    "name": "Chemical & Materials",
    "branches": [
      "Biotechnology and Biochemical Engineering (4 Years, Bachelor of Technology)",
      "Ceramic Engineering (4 Years, Bachelor of Technology)",
      "Ceramic Engineering and M.Tech Industrial Ceramic (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Chemical Engineering (4 Years, Bachelor of Technology)",
      "Chemical Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Chemical Science and Technology (4 Years, Bachelor of Technology)",
      "Chemical Technology (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Materials Engineering (4 Years, Bachelor of Technology)",
      "Materials Science and Engineering (4 Years, Bachelor of Technology)",
      "Materials Science and Metallurgical Engineering (4 Years, Bachelor of Technology)",
      "Metallurgical and Materials Engineering (4 Years, Bachelor of Technology)",
      "Metallurgical and Materials Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Metallurgy and Materials Engineering (4 Years, Bachelor of Technology)"
    ]
  },
  {
    "name": "Physics & Core Sciences",
    "branches": [
      "Artificial Intelligence and Data Science (4 Years, Bachelor of Technology)",
      "Biosciences and Bioengineering (4 Years, Bachelor of Technology)",
      "CSE ( Data Science & Analytics) (4 Years, Bachelor of Technology)",
      "Chemical Science and Technology (4 Years, Bachelor of Technology)",
      "Chemistry (5 Years, Bachelor of Science and Master of Science (Dual Degree))",
      "Chemistry (5 Years, Integrated Master of Science)",
      "Computational and Data Science (4 Years, Bachelor of Technology)",
      "Computer Science (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Artificial lntelligence and Machine Learning) (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Data Science and Analytics) (4 Years, Bachelor of Technology)",
      "Computer Science Engineering (Human Computer lnteraction and Gaming Technology) (4 Years, Bachelor of Technology)",
      "Computer Science and Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Computer Science and Business (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering ( Artificial Intelligence & Data Science) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering (Artificial Intelligence and Machine Learning) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Artificial Intelligence) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Cyber Physical System) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Cyber Security) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (Data Science) (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering (with Specialization of Data Science and Artificial Intelligence) (4 Years, B. Tech / B. Tech (Hons.))",
      "Computer Science and Engineering with Major in Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with Specialization in Cyber Security (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering with Specialization in Data Science (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Computer Science and Engineering with specialization in Artificial Intelligence and Data Science (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with specialization in Cyber Security (4 Years, Bachelor of Technology)",
      "Computer Science and Engineering with specialization in Quantum Technologies (4 Years, Bachelor of Technology)",
      "Data Science and Artificial Intelligence (4 Years, Bachelor of Technology)",
      "Data Science and Engineering (4 Years, Bachelor of Technology)",
      "Engineering Physics (4 Years, Bachelor of Technology)",
      "Engineering Physics (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Industrial Chemistry (4 Years, Bachelor of Technology)",
      "Life Science (5 Years, Integrated Master of Science)",
      "Material Science and Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Materials Science and Engineering (4 Years, Bachelor of Technology)",
      "Materials Science and Metallurgical Engineering (4 Years, Bachelor of Technology)",
      "Mathematics & Computing (5 Years, Bachelor of Science and Master of Science (Dual Degree))",
      "Mathematics (5 Years, Integrated Master of Science)",
      "Mathematics and Data Science (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Physics (5 Years, Bachelor of Science and Master of Science (Dual Degree))",
      "Physics (5 Years, Integrated Master of Science)",
      "Physics and Computational Engineering (4 Years, Bachelor of Technology)"
    ]
  },
  {
    "name": "Other Engineering",
    "branches": [
      "Aerospace Engineering (4 Years, Bachelor of Technology)",
      "B. Tech. and M. Tech. in Engineering and Computational Mechanics (Dual Degree) (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Bio Medical Engineering (4 Years, Bachelor of Technology)",
      "Bio Technology (4 Years, Bachelor of Technology)",
      "Biotechnology (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "Design Engineering (4 Years, Bachelor of Technology)",
      "Energy Engineering (4 Years, Bachelor of Technology)",
      "Engineering and Computational Mechanics (4 Years, Bachelor of Technology)",
      "Food Process Engineering (4 Years, Bachelor of Technology)",
      "Integrated B. Tech.(IT) and M. Tech (IT) (5 Years, Integrated B. Tech. and M. Tech.)",
      "Integrated B. Tech.(IT) and MBA (5 Years, Integrated B. Tech. and MBA)",
      "Mining Engineering (4 Years, Bachelor of Technology)",
      "Mining Engineering (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "ROBOTICS & AUTOMATION (4 Years, Bachelor of Technology)",
      "SUSTAINABLE ENERGY TECHNOLOGIES (4 Years, Bachelor of Technology)",
      "Textile Technology (4 Years, Bachelor of Technology)"
    ]
  }
] as const;

/** JoSAA round numbers */
export const JOSAA_ROUNDS = [1, 2, 3, 4, 5, 6] as const;
export const CSAB_ROUNDS = [1, 2] as const;
