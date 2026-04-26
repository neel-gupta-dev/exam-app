// ============================================================
// Excel to JSON Converter
// Run: node scripts/convert-excel.mjs <path-to-excel>
// ============================================================
// Install dependency first: npm install xlsx
//
// Expected Excel columns (adjust COLUMN_MAP if different):
//   - Institute, Academic Program Name, Quota, Seat Type,
//   - Gender, Opening Rank, Closing Rank, Round No.
// ============================================================

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "public", "data");

// Column name mapping — adjust these to match your Excel headers
const COLUMN_MAP = {
  institute_code: "Institute",
  institute_name: "Institute",
  program_code: "Academic Program Name",
  program_name: "Academic Program Name",
  quota: "Quota",
  seat_type: "Seat Type",
  gender: "Gender",
  opening_rank: "Opening Rank",
  closing_rank: "Closing Rank",
  round: "Round",
  year: 2024, // hardcoded for now
};

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node convert-excel.mjs <path-to-excel-file>");
    console.error("Example: node convert-excel.mjs ./data/josaa-2024.xlsx");
    process.exit(1);
  }

  // Dynamic import xlsx (install separately)
  let XLSX;
  try {
    XLSX = await import("xlsx");
  } catch {
    console.error("Please install xlsx first: npm install xlsx");
    process.exit(1);
  }

  console.log(`📖 Reading: ${filePath}`);
  const workbook = XLSX.readFile(filePath);

  const allEntries = [];

  for (const sheetName of workbook.SheetNames) {
    console.log(`  📄 Processing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      // Extract institute code from name (first word or code)
      const instituteName = String(row[COLUMN_MAP.institute_name] || "").trim();
      const programName = String(row[COLUMN_MAP.program_name] || "").trim();

      if (!instituteName || !programName) continue;

      // Parse ranks — handle non-numeric values
      let openingRank = parseInt(String(row[COLUMN_MAP.opening_rank]).replace(/[^0-9]/g, ""));
      let closingRank = parseInt(String(row[COLUMN_MAP.closing_rank]).replace(/[^0-9]/g, ""));

      if (isNaN(openingRank) || isNaN(closingRank)) continue;

      const entry = {
        institute_code: generateInstituteCode(instituteName),
        institute_name: instituteName,
        program_code: generateProgramCode(programName),
        program_name: programName,
        quota: String(row[COLUMN_MAP.quota] || "AI").trim(),
        seat_type: String(row[COLUMN_MAP.seat_type] || "OPEN").trim(),
        gender: String(row[COLUMN_MAP.gender] || "Gender-Neutral").trim(),
        opening_rank: openingRank,
        closing_rank: closingRank,
        round: parseInt(String(row[COLUMN_MAP.round] || "1")),
        year: COLUMN_MAP.year,
        counseling: detectCounseling(sheetName, row),
      };

      allEntries.push(entry);
    }
  }

  console.log(`\n✅ Total entries parsed: ${allEntries.length}`);

  // Split by institute type
  const iitEntries = allEntries.filter((e) =>
    e.institute_name.toLowerCase().includes("indian institute of technology")
  );
  const nitEntries = allEntries.filter((e) =>
    e.institute_name.toLowerCase().includes("national institute of technology")
  );
  const iiitEntries = allEntries.filter(
    (e) =>
      e.institute_name.toLowerCase().includes("information technology") &&
      !e.institute_name.toLowerCase().includes("national institute")
  );
  const gftiEntries = allEntries.filter(
    (e) =>
      !iitEntries.includes(e) &&
      !nitEntries.includes(e) &&
      !iiitEntries.includes(e)
  );

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Write split files
  await writeJSON("cutoffs-iit.json", iitEntries);
  await writeJSON("cutoffs-nit.json", nitEntries);
  await writeJSON("cutoffs-iiit.json", iiitEntries);
  await writeJSON("cutoffs-gfti.json", gftiEntries);
  await writeJSON("cutoffs-all.json", allEntries);

  console.log(`\n📊 Split results:`);
  console.log(`   IIT:  ${iitEntries.length} entries`);
  console.log(`   NIT:  ${nitEntries.length} entries`);
  console.log(`   IIIT: ${iiitEntries.length} entries`);
  console.log(`   GFTI: ${gftiEntries.length} entries`);
  console.log(`\n✨ Done! Files saved to ${OUTPUT_DIR}`);
}

function generateInstituteCode(name) {
  // Simple code generation — can be improved with a mapping file
  const words = name.split(/\s+/);
  if (name.includes("Indian Institute of Technology")) {
    const city = words[words.length - 1];
    return `IIT-${city.substring(0, 3).toUpperCase()}`;
  }
  if (name.includes("National Institute of Technology")) {
    const city = words[words.length - 1];
    return `NIT-${city.substring(0, 3).toUpperCase()}`;
  }
  return words
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 6);
}

function generateProgramCode(name) {
  // Hash-based code for consistency
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash) % 10000).padStart(4, "0");
}

function detectCounseling(sheetName, _row) {
  if (sheetName.toLowerCase().includes("csab")) return "CSAB";
  return "JOSAA";
}

async function writeJSON(filename, data) {
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
  console.log(`   📝 ${filename}: ${data.length} entries`);
}

main().catch(console.error);
