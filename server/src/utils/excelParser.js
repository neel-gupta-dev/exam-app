import * as XLSX from 'xlsx';

const quotaMap = {
  "All India": "AI",
  "Home State": "HS",
  "Other State": "OS",
};

export function parseExcelBuffer(buffer, instituteType, roundNumber, counseling, year) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

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
      round: roundNumber,
      year: year,
      counseling: counseling,
    });
  }

  return entries;
}

function generateInstituteCode(name, type) {
  const codeMap = {
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
  if (codeMap[lower]) return codeMap[lower];

  for (const [key, code] of Object.entries(codeMap)) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }

  const prefix = type === "NIT" ? "NIT" : type === "IIIT" ? "IIIT" : type === "IIT" ? "IIT" : "GFTI";
  const words = name.split(/[\s,]+/).filter((w) => w.length > 2);
  const suffix = words[words.length - 1]?.substring(0, 3).toUpperCase() || "UNK";
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
