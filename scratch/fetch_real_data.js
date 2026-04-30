const fs = require('fs');

async function processHistoricalData() {
  try {
    console.log("Loading 2025 data and metadata...");
    // Load 2025 cutoff data to extract the base set
    const data2025Raw = JSON.parse(fs.readFileSync('client/college-predictor/public/data/cutoffs-all.json', 'utf8'));
    
    // Filter out our previously generated fake 2023/2024 data
    const data2025 = data2025Raw.filter(c => c[9] === 2025);
    
    // Load metadata to map names to codes
    const metadataRaw = JSON.parse(fs.readFileSync('client/college-predictor/public/data/institute-metadata.json', 'utf8'));
    
    const nameToInstCode = new Map();
    const normalizeInstName = (name) => {
      let n = name.replace(/\([^)]*\)/g, ''); // remove (IIIT) etc
      n = n.replace(/,/g, ''); // remove commas
      n = n.replace(/&amp;/g, '&'); // fix html entities
      return n.replace(/\s+/g, ' ').trim().toLowerCase();
    };

    for (const meta of metadataRaw) {
      nameToInstCode.set(normalizeInstName(meta.institute_name), meta.institute_code);
    }
    
    // Create a reverse mapping for programs from 2025 data
    // inst_code|program_name -> program_code
    const instProgToProgCode = new Map();
    for (const c of data2025) {
       instProgToProgCode.set(`${c[0]}|${c[2].trim().toLowerCase()}`, c[1]);
    }

    const historicalData = [...data2025]; // We will append real historical data
    const seen = new Set();
    // seed seen with 2025 to avoid any weird collisions
    for (const c of data2025) {
      seen.add(`${c[0]}|${c[1]}|${c[3]}|${c[4]}|${c[5]}|${c[8]}|${c[9]}|${c[10]}`);
    }

    // Helper to fetch JSON from raw github url
    async function fetchJson(url) {
      console.log("Fetching: " + url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }

    // Process a round file
    async function processRound(year, round, isCsab = false) {
      try {
        let url;
        if (year === 2023) {
            url = `https://raw.githubusercontent.com/sickboydroid/JoSAA-DataSet/main/2023/round${round}.json`;
        } else if (year === 2024) {
            url = `https://raw.githubusercontent.com/sickboydroid/JoSAA-DataSet/main/2024/round${round}.json`;
        } else {
            return;
        }
        
        const rawData = await fetchJson(url);
        let matched = 0;
        let unmatched = 0;

        for (const row of rawData) {
          if (!row || row.length < 7 || typeof row[0] !== 'string' || typeof row[1] !== 'string' || typeof row[4] !== 'string') continue;
          
          const instName = normalizeInstName(row[0]);
          const progName = row[1].replace(/\s+/g, ' ').trim().toLowerCase();
          const quota = row[2];
          const seatType = row[3];
          const genderStr = row[4];
          let opening = parseInt(row[5]);
          let closing = parseInt(row[6]);
          
          if (isNaN(opening)) opening = 0;
          if (isNaN(closing)) closing = 0;

          // Convert sickboydroid gender format to our format
          let gender = "M";
          if (genderStr.toLowerCase().includes("female")) gender = "F";
          
          const instCode = nameToInstCode.get(instName);
          const progCode = instCode ? instProgToProgCode.get(`${instCode}|${progName}`) : null;

          if (instCode && progCode) {
             const counseling = isCsab ? "CSAB" : "JOSAA";
             const key = `${instCode}|${progCode}|${quota}|${seatType}|${gender}|${round}|${year}|${counseling}`;
             
             if (!seen.has(key)) {
               seen.add(key);
               historicalData.push([
                 instCode,
                 progCode,
                 row[1],
                 quota,
                 seatType,
                 gender,
                 opening,
                 closing,
                 round,
                 year,
                 counseling
               ]);
               matched++;
             }
          } else {
             unmatched++;
          }
        }
        console.log(`Processed ${year} Round ${round}: ${matched} matched, ${unmatched} unmatched.`);
      } catch(e) {
        console.log(`Skipped ${year} Round ${round} (${e.message})`);
      }
    }

    // We only need rounds 1, 2, and 6 (final) for trends usually.
    // The predictor specifically looks for round 2 or 1 for trend charts. Let's fetch round 1, 2, 6.
    await processRound(2023, 1);
    await processRound(2023, 2);
    await processRound(2023, 6);
    
    await processRound(2024, 1);
    await processRound(2024, 2);
    await processRound(2024, 5); // 2024 only had 5 rounds

    // Save
    fs.writeFileSync('client/college-predictor/public/data/cutoffs-all.json', JSON.stringify(historicalData));
    console.log(`Successfully merged real historical data! Total records: ${historicalData.length}`);

  } catch(e) {
    console.error(e);
  }
}

processHistoricalData();
