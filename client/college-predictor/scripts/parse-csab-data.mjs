// Quick script to parse the CSAB Excel files into JSON
// Usage: node scripts/parse-csab-data.mjs

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

async function main() {
  let XLSX;
  try {
    const xlsxModule = await import("xlsx");
    XLSX = xlsxModule.default || xlsxModule;
  } catch {
    console.error("Installing xlsx...");
    const { execSync } = await import("child_process");
    execSync("npm install xlsx", { cwd: join(__dirname, ".."), stdio: "inherit" });
    const xlsxModule = await import("xlsx");
    XLSX = xlsxModule.default || xlsxModule;
  }

  // Map quota strings from Excel to our internal codes
  const quotaMap = {
    "All India": "AI",
    "Home State": "HS",
    "Other State": "OS",
  };

  function parseFile(filename, instituteType, roundNumber, counseling = "CSAB") {
    const filePath = join(DATA_DIR, filename);
    console.log(`\n📖 Reading: ${filename}`);

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`   Found ${rows.length} rows`);

    const entries = [];
    let skippedDasa = 0;

    for (const row of rows) {
      const instituteName = String(row["Institute"] || "").trim();
      const programName = String(row["Academic Program Name"] || "").trim();
      const quotaRaw = String(row["Quota"] || "").trim();
      const seatType = String(row["Seat Type"] || "").trim();
      const gender = String(row["Gender"] || "").trim();
      const openingRank = parseInt(String(row["Opening Rank"]).replace(/[^0-9]/g, ""));
      const closingRank = parseInt(String(row["Closing Rank"]).replace(/[^0-9]/g, ""));

      if (!instituteName || !programName) continue;
      if (isNaN(openingRank) || isNaN(closingRank)) continue;

      // Skip DASA entries — they use different rank system
      if (quotaRaw.includes("DASA")) {
        skippedDasa++;
        continue;
      }

      const quota = quotaMap[quotaRaw] || "AI";

      entries.push({
        institute_code: generateInstituteCode(instituteName, instituteType),
        institute_name: instituteName,
        program_code: hashCode(programName),
        program_name: programName,
        quota,
        seat_type: seatType,
        gender,
        opening_rank: openingRank,
        closing_rank: closingRank,
        round: roundNumber, // Dynamic round from file
        year: 2025,
        counseling: counseling,
      });
    }

    console.log(`   Parsed: ${entries.length} entries (skipped ${skippedDasa} DASA entries)`);

    // Get unique institutes
    const uniqueInstitutes = new Set(entries.map((e) => e.institute_name));
    console.log(`   Unique institutes: ${uniqueInstitutes.size}`);
    for (const inst of uniqueInstitutes) {
      console.log(`     - ${inst}`);
    }

    return entries;
  }

  // Parse all files
  const iiitR1 = parseFile("IIITs Csab(Round 1 2025).xlsx", "IIIT", 1);
  const iiitR2 = parseFile("IIITs Csab.xlsx", "IIIT", 2); // Assumed Round 2
  const iiitR3 = parseFile("IIITs Csab(Round 3 2025).xlsx", "IIIT", 3);
  
  const nitR1 = parseFile("NITs Csab(Round 1 2025).xlsx", "NIT", 1);
  const nitR2 = parseFile("NITs Csab.xlsx", "NIT", 2); // Assumed Round 2
  const nitR3 = parseFile("NITs Csab(Round 3 2025).xlsx", "NIT", 3);

  const gftiR1 = parseFile("GFTIs Csab(Round 1 2025).xlsx", "GFTI", 1);
  
  const iitR5 = parseFile("IITs Josaa(Round 5 2025).xlsx", "IIT", 5, "JoSAA");

  const iiitEntries = [...iiitR1, ...iiitR2, ...iiitR3];
  const nitEntries = [...nitR1, ...nitR2, ...nitR3];
  const gftiEntries = [...gftiR1];
  const iitEntries = [...iitR5];

  // Write output
  const iiitOutput = join(DATA_DIR, "cutoffs-iiit-csab.json");
  const nitOutput = join(DATA_DIR, "cutoffs-nit-csab.json");
  const gftiOutput = join(DATA_DIR, "cutoffs-gfti-csab.json");
  const allOutput = join(DATA_DIR, "cutoffs-all.json");

  writeFileSync(iiitOutput, JSON.stringify(iiitEntries, null, 2));
  console.log(`\n✅ Written ${iiitEntries.length} IIIT entries to cutoffs-iiit-csab.json`);

  writeFileSync(nitOutput, JSON.stringify(nitEntries, null, 2));
  console.log(`✅ Written ${nitEntries.length} NIT entries to cutoffs-nit-csab.json`);

  writeFileSync(gftiOutput, JSON.stringify(gftiEntries, null, 2));
  console.log(`✅ Written ${gftiEntries.length} GFTI entries to cutoffs-gfti-csab.json`);

  const iitOutput = join(DATA_DIR, "cutoffs-iit-josaa.json");
  writeFileSync(iitOutput, JSON.stringify(iitEntries, null, 2));
  console.log(`✅ Written ${iitEntries.length} IIT entries to cutoffs-iit-josaa.json`);

  const allEntries = [...iiitEntries, ...nitEntries, ...gftiEntries, ...iitEntries];
  writeFileSync(allOutput, JSON.stringify(allEntries, null, 2));
  console.log(`✅ Written ${allEntries.length} total entries to cutoffs-all.json`);

  // Print summary stats
  console.log("\n📊 Summary:");
  console.log(`   Total entries: ${allEntries.length}`);
  console.log(`   Unique quotas: ${[...new Set(allEntries.map((e) => e.quota))].join(", ")}`);
  console.log(`   Unique seat types: ${[...new Set(allEntries.map((e) => e.seat_type))].join(", ")}`);
  console.log(`   Unique genders: ${[...new Set(allEntries.map((e) => e.gender))].join(", ")}`);
}

function generateInstituteCode(name, type) {
  // Map institute names to codes matching our metadata
  const codeMap = {
    // NITs — exact names from Excel
    "dr. b r ambedkar national institute of technology, jalandhar": "NIT-JL",
    "malaviya national institute of technology jaipur": "NIT-J",
    "maulana azad national institute of technology bhopal": "NIT-B",
    "motilal nehru national institute of technology allahabad": "NIT-A",
    "national institute of technology agartala": "NIT-AG",
    "national institute of technology, andhra pradesh": "NIT-AP",
    "national institute of technology andhra pradesh": "NIT-AP",
    "national institute of technology calicut": "NIT-C",
    "national institute of technology delhi": "NIT-DEL",
    "national institute of technology durgapur": "NIT-DGP",
    "national institute of technology goa": "NIT-GOA",
    "national institute of technology hamirpur": "NIT-H",
    "national institute of technology, jamshedpur": "NIT-JSR",
    "national institute of technology jamshedpur": "NIT-JSR",
    "national institute of technology karnataka, surathkal": "NIT-K",
    "national institute of technology, kurukshetra": "NIT-KKR",
    "national institute of technology kurukshetra": "NIT-KKR",
    "national institute of technology, manipur": "NIT-MNP",
    "national institute of technology manipur": "NIT-MNP",
    "national institute of technology meghalaya": "NIT-MGH",
    "national institute of technology, mizoram": "NIT-MZ",
    "national institute of technology mizoram": "NIT-MZ",
    "national institute of technology nagaland": "NIT-NG",
    "national institute of technology patna": "NIT-P",
    "national institute of technology puducherry": "NIT-PY",
    "national institute of technology raipur": "NIT-R",
    "national institute of technology, rourkela": "NIT-RKL",
    "national institute of technology rourkela": "NIT-RKL",
    "national institute of technology sikkim": "NIT-SK",
    "national institute of technology, silchar": "NIT-S",
    "national institute of technology silchar": "NIT-S",
    "national institute of technology, srinagar": "NIT-SR",
    "national institute of technology srinagar": "NIT-SR",
    "national institute of technology, tiruchirappalli": "NIT-T",
    "national institute of technology tiruchirappalli": "NIT-T",
    "national institute of technology, uttarakhand": "NIT-UK",
    "national institute of technology uttarakhand": "NIT-UK",
    "national institute of technology, warangal": "NIT-W",
    "national institute of technology warangal": "NIT-W",
    "sardar vallabhbhai national institute of technology, surat": "NIT-SRT",
    "visvesvaraya national institute of technology, nagpur": "NIT-N",
    "national institute of technology arunachal pradesh": "NIT-ARP",
    "indian institute of engineering science and technology, shibpur": "NIT-IIEST",
    // IIITs — exact names from Excel
    "atal bihari vajpayee indian institute of information technology & management gwalior": "IIIT-GW",
    "atal bihari vajpayee indian institute of information technology and management gwalior": "IIIT-GW",
    "indian institute of information technology (iiit)kota, rajasthan": "IIIT-KT",
    "indian institute of information technology guwahati": "IIIT-GU",
    "indian institute of information technology(iiit) kalyani, west bengal": "IIIT-KLY",
    "indian institute of information technology (iiit), kalyani, west bengal": "IIIT-KLY",
    "indian institute of information technology(iiit) kilohrad, sonepat, haryana": "IIIT-SNP",
    "indian institute of information technology (iiit), sonepat, haryana": "IIIT-SNP",
    "indian institute of information technology(iiit) una, himachal pradesh": "IIIT-UNA",
    "indian institute of information technology (iiit), una, himachal pradesh": "IIIT-UNA",
    "indian institute of information technology (iiit), sri city, chittoor": "IIIT-SC",
    "indian institute of information technology(iiit), vadodara, gujrat": "IIIT-VDR",
    "indian institute of information technology(iiit), vadodara": "IIIT-VDR",
    "indian institute of information technology, vadodara international campus diu (iiitvicd)": "IIIT-VICD",
    "indian institute of information technology, allahabad": "IIIT-A",
    "indian institute of information technology, design & manufacturing, kancheepuram": "IIIT-KC",
    "indian institute of information technology design and manufacturing kancheepuram": "IIIT-KC",
    "pt. dwarka prasad mishra indian institute of information technology, design & manufacture jabalpur": "IIIT-JB",
    "indian institute of information technology, design & manufacturing, jabalpur": "IIIT-JB",
    "indian institute of information technology design and manufacturing, kurnool, andhra pradesh": "IIIT-KR",
    "indian institute of information technology design & manufacturing kurnool, andhra pradesh": "IIIT-KR",
    "indian institute of information technology lucknow": "IIIT-LK",
    "indian institute of information technology senapati manipur": "IIIT-MNP",
    "indian institute of information technology manipur": "IIIT-MNP",
    "indian institute of information technology tiruchirappalli": "IIIT-TRC",
    "indian institute of information technology(iiit) dharwad": "IIIT-DWD",
    "indian institute of information technology, dharwad": "IIIT-DWD",
    "indian institute of information technology(iiit) kottayam": "IIIT-KTY",
    "indian institute of information technology, kottayam": "IIIT-KTY",
    "indian institute of information technology (iiit) ranchi": "IIIT-RNC",
    "indian institute of information technology, ranchi": "IIIT-RNC",
    "indian institute of information technology (iiit) nagpur": "IIIT-NGP",
    "indian institute of information technology, nagpur": "IIIT-NGP",
    "indian institute of information technology (iiit) pune": "IIIT-PNE",
    "indian institute of information technology, pune": "IIIT-PNE",
    "indian institute of information technology bhagalpur": "IIIT-BH",
    "indian institute of information technology, bhagalpur": "IIIT-BH",
    "indian institute of information technology bhopal": "IIIT-BPL",
    "indian institute of information technology, bhopal": "IIIT-BPL",
    "indian institute of information technology surat": "IIIT-SRT",
    "indian institute of information technology(iiit) surat, gujarat": "IIIT-SRT",
    "indian institute of information technology, agartala": "IIIT-AG",
    "indian institute of information technology, raichur, karnataka": "IIIT-RCR",
    "indian institute of information technology(iiit), vadodara, international campus, diu": "IIIT-VICD",
  };

  const lower = name.toLowerCase().trim();

  // Try exact match first
  if (codeMap[lower]) return codeMap[lower];

  // Try partial match
  for (const [key, code] of Object.entries(codeMap)) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }

  // Fallback: generate from name
  const prefix = type === "NIT" ? "NIT" : type === "IIIT" ? "IIIT" : "GFTI";
  const words = name.split(/[\s,]+/).filter((w) => w.length > 2);
  const suffix = words[words.length - 1].substring(0, 3).toUpperCase();
  return `${prefix}-${suffix}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash) % 10000).padStart(4, "0");
}

main().catch(console.error);
