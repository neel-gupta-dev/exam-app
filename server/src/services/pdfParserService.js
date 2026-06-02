/**
 * NOTE: pdf-parse is loaded lazily inside parsePdfBuffer() via dynamic import.
 * This prevents Vercel serverless cold-start crashes — pdf-parse tries to load
 * test fixture files at import time that don't exist on Vercel's filesystem.
 */

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║  Production-Grade PDF → CBT Question Parser (v3)                        ║
 * ║                                                                          ║
 * ║  Handles every real-world Indian competitive exam PDF format:             ║
 * ║  JEE Main/Advanced · NEET · CUET · BITSAT · VITEEE · MHT-CET            ║
 * ║  NTA Mock Tests · Coaching institute question banks                      ║
 * ║                                                                          ║
 * ║  Features:                                                               ║
 * ║  - Auto-skip intro/instruction pages (1-5 pages)                         ║
 * ║  - Multi-format question numbering recognition                           ║
 * ║  - Inline & multi-line MCQ option extraction                             ║
 * ║  - Asterisk correct markers: (B*), B*, *B, (*B), (B)*                    ║
 * ║  - Inline answer detection: Ans-(B), Answer: A, Sol: B                   ║
 * ║  - End-of-PDF answer key block detection                                 ║
 * ║  - Section auto-detection (Physics/Chemistry/Maths/Bio...)               ║
 * ║  - Type auto-detection (single/multiple/integer)                         ║
 * ║  - Image-dependent question flagging                                     ║
 * ║  - Solution text extraction (Sol. / Solution:)                           ║
 * ║  - Page header/footer/watermark stripping                                ║
 * ║  - Integer-type numeric answer extraction                                ║
 * ║  - Per-question marks extraction (+4/-1 patterns)                        ║
 * ║  - Confidence scoring for each parsed question                           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TEXT CLEANING & NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize raw PDF text: fix encoding artifacts, strip repeated
 * headers/footers, remove page numbers, normalize whitespace.
 */
function normalizeText(raw) {
  let t = raw
    .replace(/\r\n/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\t/g, ' ')
    // Fix common PDF encoding artifacts
    .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl')
    // Normalize unicode dashes/quotes/spaces
    .replace(/[\u2013\u2014]/g, '-')     // em/en dash → hyphen
    .replace(/[\u2018\u2019]/g, "'")     // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')     // smart double quotes
    .replace(/\u00A0/g, ' ')             // non-breaking space
    .replace(/\u2022/g, '•')             // bullet
    // Collapse excessive whitespace
    .replace(/ {3,}/g, '  ')
    .replace(/\n{4,}/g, '\n\n\n');

  // ─── Strip repeated page headers / footers / watermarks ────────────────────
  // Find patterns that repeat 3+ times across the text (likely header/footer)
  const lines = t.split('\n');
  const lineCounts = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 120) {
      lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
    }
  }
  const repeatedLines = new Set(
    Object.entries(lineCounts)
      .filter(([_, count]) => count >= 3)
      .map(([line]) => line)
  );
  if (repeatedLines.size > 0) {
    t = lines.filter(l => !repeatedLines.has(l.trim())).join('\n');
  }

  // ─── Strip standalone page numbers ─────────────────────────────────────────
  // Lines with just a number (1-3 digits), optionally with "Page" or "/" prefix
  t = t.replace(/^\s*(?:Page\s*)?\d{1,3}\s*(?:of\s*\d{1,3})?\s*$/gim, '');
  // Also "/ 1 /" or "- 1 -" page number formats
  t = t.replace(/^\s*[-\/]\s*\d{1,3}\s*[-\/]\s*$/gm, '');

  return t;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INTRO / COVER PAGE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Skip intro material (cover pages, instructions, candidate info blocks).
 * Returns the text starting at the first real question.
 */
function skipIntroPages(text) {
  // Strategy: find the FIRST numbered item that has MCQ options within 800 chars
  const candidateRe = /(?:^|\n)[ \t]*(?:Q(?:uestion|ues)?\.?\s*)?(\d{1,3})\s*[.):\s–-]/gm;
  const mcqSignal = /(?:[○◯◉●•]\s*)?[*]?\s*\(?[A-Da-d][*]?\)?\s*[.):\s]/;
  // Also accept integer-type signals (numerical answer)
  const intSignal = /\b(?:integer|numerical|numeric)\b/i;

  let bestStart = 0;
  let m;
  while ((m = candidateRe.exec(text)) !== null) {
    // For question #1 specifically, only accept if we see MCQ signals nearby
    const num = parseInt(m[1]);
    const lookahead = text.substring(m.index, m.index + 800);

    if (num <= 2 && (mcqSignal.test(lookahead) || intSignal.test(lookahead))) {
      bestStart = m.index;
      break;
    }
    // For higher numbers, also accept — user might have a partial PDF
    if (num >= 1 && num <= 5 && mcqSignal.test(lookahead)) {
      bestStart = m.index;
      break;
    }
  }

  if (bestStart > 0) {
    // Keep 300 chars buffer before to capture section headers
    const bufferStart = Math.max(0, bestStart - 300);
    return text.substring(bufferStart);
  }
  return text;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. IMAGE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function hasImageReference(text) {
  if (!text) return false;
  return [
    /\bfig(?:ure)?[\s.:]*\d*/i,
    /\bdiagram\b/i,
    /\bshown\s+(?:in\s+)?(?:the\s+)?(?:figure|diagram|image|picture|graph|chart)/i,
    /\bgraph\b/i, /\bcircuit\b/i, /\bimage\b/i, /\bpicture\b/i,
    /\b(?:see|refer)\s+(?:the\s+)?(?:figure|diagram)/i,
    /\bdraw(?:n|ing)?\b/i, /\bplot\b/i,
    /\barrangement\b.*\bshown\b/i,
    /\bas\s+shown\b/i,
    /\bin\s+the\s+(?:given|adjacent|following)\s+(?:figure|diagram)/i,
    /\b(?:above|below)\s+(?:figure|diagram|graph)\b/i,
  ].some(p => p.test(text));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SECTION DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const SECTION_MAP = [
  { p: /\b(?:PHYSICS|Physics|PHY)\b/, s: 'Physics' },
  { p: /\b(?:CHEMISTRY|Chemistry|CHEM|CHE)\b/, s: 'Chemistry' },
  { p: /\b(?:MATH(?:EMATICS|S)?|Maths?|MATHS?)\b/i, s: 'Mathematics' },
  { p: /\b(?:BIOLOGY|Biology|BIO)\b/, s: 'Biology' },
  { p: /\b(?:BOTANY|Botany)\b/, s: 'Botany' },
  { p: /\b(?:ZOOLOGY|Zoology)\b/, s: 'Zoology' },
  { p: /\b(?:ENGLISH|English|ENG)\b/, s: 'English' },
  { p: /\b(?:GK|General\s*Knowledge|G\.K\.)\b/i, s: 'General Knowledge' },
  { p: /\b(?:REASONING|Reasoning|MENTAL\s*ABILITY)\b/i, s: 'Reasoning' },
  { p: /\b(?:APTITUDE|Aptitude|QUANT)\b/i, s: 'Aptitude' },
  { p: /\b(?:COMPUTER|Computer\s*Science|CS)\b/i, s: 'Computer Science' },
  { p: /\b(?:SOCIAL\s*(?:SCIENCE|STUDIES)|SST)\b/i, s: 'Social Science' },
  { p: /\b(?:HINDI|Hindi)\b/, s: 'Hindi' },
];

function detectSection(text) {
  for (const { p, s } of SECTION_MAP) if (p.test(text)) return s;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. QUESTION TYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectQuestionType(text, options) {
  const t = text.toLowerCase();
  // Integer / Numerical
  if (/\b(?:integer|numerical|numeric)\s*(?:value|answer|type)?/i.test(t)) return 'integer';
  if (/\bfind\s+the\s+value\b/i.test(t) && options.length === 0) return 'integer';
  if (options.length === 0) return 'integer';
  // Multiple correct
  if (/\bmultiple\s+correct/i.test(t)) return 'multiple';
  if (/\bmore\s+than\s+one/i.test(t)) return 'multiple';
  if (/\bone\s+or\s+more/i.test(t)) return 'multiple';
  if (/\ball\s+(?:the\s+)?correct/i.test(t)) return 'multiple';
  if (/\bcorrect\s+(?:options?|answers?)\s+(?:is|are)\b/i.test(t)) return 'multiple';
  return 'single';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ANSWER KEY EXTRACTION (end-of-PDF block)
// ═══════════════════════════════════════════════════════════════════════════════

function extractAnswerKey(fullText) {
  const answerKey = {};
  const keyPatterns = [
    /ANSWER\s*KEY/i, /ANSWERS?\s*:/i, /CORRECT\s*ANSWERS?/i,
    /SOLUTION\s*KEY/i, /ANSWER\s*SHEET/i, /KEY\s*:/i,
  ];

  let keySection = null;
  for (const p of keyPatterns) {
    const idx = fullText.search(p);
    if (idx !== -1) { keySection = fullText.substring(idx); break; }
  }
  if (!keySection) return answerKey;

  // "1. A" or "1) A" or "Q1: A" or "1- A" or "1 A" or "1. A,C" or "1. (A)"
  const re = /(?:Q\.?\s*)?(\d{1,3})\s*[.):\-–\s]\s*\(?([A-Da-d](?:\s*[,&/]\s*[A-Da-d])*|\-?\d+(?:\.\d+)?)\)?/g;
  let m;
  while ((m = re.exec(keySection)) !== null) {
    const qNum = parseInt(m[1]);
    const answer = m[2].trim().toUpperCase();
    if (/^-?\d/.test(answer)) {
      // Numeric answer (integer type)
      answerKey[qNum] = [answer];
    } else if (/[,&/]/.test(answer)) {
      answerKey[qNum] = answer.split(/\s*[,&/]\s*/).map(a => a.trim());
    } else {
      answerKey[qNum] = [answer];
    }
  }
  return answerKey;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SOLUTION EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract solution text from a question block if present.
 * Common formats: "Sol.", "Sol:", "Solution:", "Soln.", "Explanation:"
 */
function extractSolution(block) {
  const solRe = /\b(?:Sol(?:ution|n)?\.?\s*[:.]?\s*)([\s\S]*?)$/i;
  const expRe = /\b(?:Explanation\s*[:.]?\s*)([\s\S]*?)$/i;
  const hint = /\b(?:Hint\s*[:.]?\s*)([\s\S]*?)$/i;

  for (const re of [solRe, expRe, hint]) {
    const match = block.match(re);
    if (match && match[1].trim().length > 5) {
      return {
        solution: match[1].trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim(),
        cleanedBlock: block.substring(0, match.index).trim(),
      };
    }
  }
  return { solution: '', cleanedBlock: block };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MARKS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect per-question marks from patterns like:
 *   "+4, -1"  "(+4/-1)"  "Marks: +4, -1"  "[4, -1]"
 */
function extractMarks(text) {
  const patterns = [
    /\+\s*(\d+(?:\.\d+)?)\s*[,/]\s*-\s*(\d+(?:\.\d+)?)/,
    /Marks?\s*[:=]\s*\+?\s*(\d+(?:\.\d+)?)\s*[,/]\s*-\s*(\d+(?:\.\d+)?)/i,
    /\[\s*\+?\s*(\d+(?:\.\d+)?)\s*[,/]\s*-\s*(\d+(?:\.\d+)?)\s*\]/,
    /\(\s*\+?\s*(\d+(?:\.\d+)?)\s*[,/]\s*-\s*(\d+(?:\.\d+)?)\s*\)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return { pos: parseFloat(m[1]), neg: parseFloat(m[2]) };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. OPTION PARSER (handles every real-world format)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Robust MCQ option extractor. Handles:
 *
 * Multi-line formats:
 *   A. text          (A) text          A) text
 *   *A. text         (A*) text         (*A) text
 *
 * Inline formats (all options on one line):
 *   ○ A. text ○ B. text ○ C. text ○ D. text
 *   A. text  B. text  C. text  D. text  (space separated)
 *   (A) text (B) text (C) text (D) text
 *   (A*) text (B) text (C) text (D) text
 *
 * Returns { options: [...], correctFromAsterisk: ['B'] }
 */
function parseOptions(block) {
  const options = [];
  const correctFromAsterisk = [];
  if (!block || !block.trim()) return { options, correctFromAsterisk };

  // ─── Step 1: Detect inline vs multi-line ───────────────────────────────────
  // Check if ANY line has ≥ 2 distinct option letters
  let parseTarget = block;
  const lines = block.split('\n');

  for (const line of lines) {
    const optLetters = new Set();
    // Scan for option markers in this line
    const markers = [...line.matchAll(/(?:[○◯◉●•]\s*)?[*]?\s*\(?([A-Da-d])[*]?\)?\s*[.):\s]/g)];
    for (const mk of markers) optLetters.add(mk[1].toUpperCase());

    if (optLetters.size >= 2) {
      // This is an inline options line — split it into multi-line for uniform parsing
      parseTarget = line
        .replace(/[○◯◉●•]\s*/g, '\n')                              // circle bullets → newlines
        .replace(/\bO\s+(?=\(?[A-Da-d][*]?\)?\s*[.):\s])/g, '\n')  // "O A." bullet
        .replace(/\s{2,}(?=[*]?\s*\(?[A-Da-d][*]?\)?\s*[.)])/g, '\n') // 2+ spaces before option
        .replace(/(?<=\S)\s+(?=\([A-Da-d][*]?\)\s)/g, '\n')          // space before (A)
        .replace(/(?<=\S)\s+(?=[*]\s*\(?[A-Da-d])/g, '\n');          // space before *A
      break;
    }
  }

  // ─── Step 2: Parse each option ─────────────────────────────────────────────
  // This regex handles ALL known formats on a per-line basis:
  //   (A*) text | (*A) text | A. text | A) text | A* text | *A text | (A) text
  const optRe = /^\s*(?:([*]?)\s*\(\s*([A-Da-d])\s*([*]?)\s*\)\s*([*]?)|([*]?)\s*([A-Da-d])\s*([*]?)\s*[.)]\s*([*]?))\s*([\s\S]*?)$/gm;

  let mat;
  while ((mat = optRe.exec(parseTarget)) !== null) {
    const letter = (mat[2] || mat[6] || '').toUpperCase();
    if (!letter || letter < 'A' || letter > 'D') continue;

    const hasAsterisk = !!(mat[1] || mat[3] || mat[4] || mat[5] || mat[7] || mat[8]);
    let content = (mat[9] || '').trim()
      .replace(/\s*\bSol(?:ution|n)?\..*$/i, '')  // strip trailing solution
      .replace(/\s+/g, ' ')
      .trim();

    // Some PDFs put the next question's number at the end — strip trailing isolated numbers
    content = content.replace(/\s+\d{1,3}\s*$/, '').trim();

    if (content && !options.find(o => o.label === letter)) {
      options.push({ label: letter, content, imageUrl: null });
      if (hasAsterisk) correctFromAsterisk.push(letter);
    }
  }

  return { options, correctFromAsterisk };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. QUESTION BOUNDARY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find question start positions using multiple numbering format patterns.
 * Selects the pattern that yields the most sequential numbered matches.
 */
function detectQuestionBoundaries(text) {
  const patterns = [
    // "Q.1" / "Q1." / "Ques. 1" / "Question 1"
    { re: /(?:^|\n)[ \t]*(?:Q(?:uestion|ues)?\.?\s*)(\d{1,3})\s*[.):\s–-]/gm, weight: 1.5 },
    // "(1)" / "(12)" — parenthesized number at line start
    { re: /(?:^|\n)[ \t]*\((\d{1,3})\)\s/gm, weight: 1.2 },
    // "1." / "1)" / "1:" — number with delimiter at line start
    { re: /(?:^|\n)[ \t]*(\d{1,3})\s*[.):-]\s+/gm, weight: 1.0 },
    // "1  " — number + 2 spaces + text (common in many PDFs)
    { re: /(?:^|\n)[ \t]*(\d{1,3})[ \t]{2,}(?=[A-Za-z("])/gm, weight: 0.8 },
  ];

  let bestSplits = [];
  let bestScore = 0;

  for (const { re, weight } of patterns) {
    const candidate = [];
    let match;
    re.lastIndex = 0;
    while ((match = re.exec(text)) !== null) {
      candidate.push({
        index: match.index,
        number: parseInt(match[1]),
        len: match[0].length,
      });
    }
    if (candidate.length < 2) continue;

    // Score: count how many are sequential (n, n+1) weighted by pattern quality
    let seqCount = 1;
    for (let i = 1; i < candidate.length; i++) {
      const diff = candidate[i].number - candidate[i - 1].number;
      if (diff === 1) seqCount++;
      else if (diff > 0 && diff <= 3) seqCount += 0.5; // small gaps OK
    }
    const score = seqCount * weight;

    if (score > bestScore) {
      bestScore = score;
      bestSplits = candidate;
    }
  }

  // ─── Post-filter: remove wild non-sequential jumps ─────────────────────────
  if (bestSplits.length > 3) {
    const filtered = [bestSplits[0]];
    for (let i = 1; i < bestSplits.length; i++) {
      const prev = filtered[filtered.length - 1].number;
      const curr = bestSplits[i].number;
      // Sequential or small gap (handles skipped questions)
      if (curr > prev && curr <= prev + 10) filtered.push(bestSplits[i]);
      // Section restart (question numbers reset to 1)
      else if (curr <= 3 && prev > 20) filtered.push(bestSplits[i]);
    }
    if (filtered.length >= bestSplits.length * 0.5) bestSplits = filtered;
  }

  return bestSplits;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. CONFIDENCE SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Score how confident we are in a parsed question (0-100).
 * Higher = more likely a valid, well-parsed question.
 */
function calculateConfidence(q) {
  let score = 50; // base

  // Content quality
  if (q.content.length > 20) score += 10;
  if (q.content.length > 50) score += 5;
  if (q.content.length > 200) score += 5;
  if (q.content.includes('?')) score += 5;        // has a question mark
  if (q.content.length < 10) score -= 20;          // suspiciously short

  // Options quality
  if (q.type !== 'integer') {
    if (q.options.length === 4) score += 15;       // perfect 4-option MCQ
    else if (q.options.length === 3) score += 5;
    else if (q.options.length === 2) score -= 5;
    else if (q.options.length === 0) score -= 15;
    // Check options have content
    const emptyOpts = q.options.filter(o => !o.content || o.content.length < 1).length;
    score -= emptyOpts * 5;
  }

  // Answer quality
  if (q.correctAnswer.length > 0) score += 10;
  if (q.correctAnswer.length === 0) score -= 10;

  // Image flag (not bad, just needs review)
  if (q._meta.hasImage) score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. INLINE ANSWER EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract inline answers from question block text.
 * Formats: "Ans-(A)" / "Answer: B" / "Ans: A,C" / "Ans. (B)" / "Answer = D"
 * Also handles integer answers: "Ans: 42" / "Answer: -7"
 */
function extractInlineAnswer(block) {
  const patterns = [
    // Letter answers: Ans-(A), Answer: B, Ans. A, C, Ans = B
    /\bAns(?:wer)?\.?\s*[-:=(]?\s*\(?([A-Da-d](?:(?:\s*[,&/]\s*|\s+and\s+)[A-Da-d])*)\)?/i,
    // Numeric answers: Ans: 42, Answer = -7.5
    /\bAns(?:wer)?\.?\s*[-:=]\s*(-?\d+(?:\.\d+)?)/i,
  ];

  for (const re of patterns) {
    const m = block.match(re);
    if (m) {
      const raw = m[1].trim();
      // Check if numeric
      if (/^-?\d/.test(raw)) {
        return { answer: [raw], matchStr: m[0] };
      }
      // Letter(s)
      const letters = raw.match(/[A-Da-d]/ig);
      if (letters) {
        return { answer: letters.map(l => l.toUpperCase()), matchStr: m[0] };
      }
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. SECTION HEADER DETECTION (between questions)
// ═══════════════════════════════════════════════════════════════════════════════

const SECTION_HEADER_RE = /(?:SECTION|PART|SUBJECT)\s*[-–:]\s*[A-Z0-9]{0,3}\s*[-–:.]?\s*(\w[\w\s]*)/gi;

function detectSectionChange(text) {
  const match = text.match(SECTION_HEADER_RE);
  if (match) {
    const detected = detectSection(match[match.length - 1]);
    if (detected) return detected;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. MAIN PARSER — EXPORTED API
// ═══════════════════════════════════════════════════════════════════════════════

export async function parsePdfBuffer(buffer, opts = {}) {
  // Dynamic import — prevents cold-start crash on Vercel (see top-of-file note)
  const { default: pdfParse } = await import('pdf-parse');
  const data = await pdfParse(buffer);
  const rawText = data.text;
  
  // M-19 Fix: Explicitly clear the large buffer from scope so V8 can GC it while we run regexes
  buffer = null;

  const config = {
    section: opts.section || null,
    type: opts.type || null,
    posMark: opts.positiveMarks ?? 4,
    negMark: opts.negativeMarks ?? 1,
  };

  // Step 1: Extract answer key BEFORE text cleaning (preserve full text)
  const answerKey = extractAnswerKey(rawText);
  const hasKey = Object.keys(answerKey).length > 0;

  // Step 2: Normalize text
  let text = normalizeText(rawText);

  // Step 3: Skip cover/instruction pages
  text = skipIntroPages(text);

  // Step 4: Detect question boundaries
  const splits = detectQuestionBoundaries(text);

  if (splits.length === 0) {
    return {
      questions: [],
      stats: {
        total: 0,
        error: 'No questions detected. Ensure PDF has numbered questions (e.g. "1.", "Q.1", "(1)").',
        textSample: text.substring(0, 500),
      },
    };
  }

  // Step 5: Parse each question block
  let currentSection = config.section || 'General';
  const questions = [];

  for (let i = 0; i < splits.length; i++) {
    const start = splits[i].index + splits[i].len;
    const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
    const qNum = splits[i].number;
    let block = text.substring(start, end).trim();

    // ─── Section detection from gap between questions ──────────────────────
    const preceding = text.substring(
      i > 0 ? splits[i - 1].index + splits[i - 1].len : 0,
      splits[i].index
    );
    const newSection = detectSectionChange(preceding);
    if (newSection) currentSection = newSection;
    // Also check first ~80 chars of the block itself
    if (!config.section) {
      const d = detectSection(block.substring(0, 80));
      if (d) currentSection = d;
    }

    // ─── Strip metadata header lines (GENERAL SINGLE / HAS IMAGE etc.) ─────
    block = block.replace(
      /^\s*(?:GENERAL|SINGLE|MULTIPLE|INTEGER|NUMERICAL|HAS\s+IMAGE)(?:\s+(?:GENERAL|SINGLE|MULTIPLE|INTEGER|NUMERICAL|HAS\s+IMAGE))*\s*\n/im,
      ''
    );

    // ─── Detect type from header keywords ──────────────────────────────────
    const blockHead = block.substring(0, 100);
    let type = config.type;
    if (!type) {
      if (/\b(?:INTEGER|NUMERICAL|NUMERIC)\b/i.test(blockHead)) type = 'integer';
      else if (/\bMULTIPLE\b/i.test(blockHead)) type = 'multiple';
      else if (/\bSINGLE\b/i.test(blockHead)) type = 'single';
    }

    // ─── Extract per-question marks ────────────────────────────────────────
    const marksInfo = extractMarks(block);
    const posMark = marksInfo ? marksInfo.pos : config.posMark;
    const negMark = marksInfo ? marksInfo.neg : config.negMark;
    // Strip marks notation from block
    if (marksInfo) {
      block = block.replace(/\[?\s*\+?\s*\d+(?:\.\d+)?\s*[,/]\s*-\s*\d+(?:\.\d+)?\s*\]?/, '');
    }

    // ─── Extract inline answer ─────────────────────────────────────────────
    let localCorrectAnswer = hasKey && answerKey[qNum] ? [...answerKey[qNum]] : [];
    const inlineAns = extractInlineAnswer(block);
    if (inlineAns) {
      if (localCorrectAnswer.length === 0) {
        localCorrectAnswer = inlineAns.answer;
      }
      block = block.replace(inlineAns.matchStr, '');
    }

    // ─── Extract solution text ─────────────────────────────────────────────
    const { solution, cleanedBlock } = extractSolution(block);
    block = cleanedBlock;

    // ─── Split question content from options block ─────────────────────────
    // Look for where options begin: A. / (A) / ○A / *A / (A*)
    const optStartRe = /(?:(?:^|\n)\s*[*]?\s*\(?[Aa][*]?\)?\s*[.):\s]|[○◯◉●•]\s*[*]?\s*\(?[Aa][*]?\)?\s*[.)\s])/m;
    const optStartMatch = block.match(optStartRe);

    let questionContent = block;
    let optionsRawBlock = '';

    if (optStartMatch) {
      const idx = block.indexOf(optStartMatch[0]);
      questionContent = block.substring(0, idx).trim();
      optionsRawBlock = block.substring(idx);
    }

    // Clean question content
    questionContent = questionContent
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*\bSol(?:ution|n)?\..*$/i, '')
      .trim();

    // Skip questions with empty content
    if (!questionContent || questionContent.length < 3) continue;

    // ─── Parse options ────────────────────────────────────────────────────
    const { options, correctFromAsterisk } = parseOptions(optionsRawBlock);

    // If no options found from the options block, try the full block as fallback
    if (options.length === 0 && type !== 'integer') {
      const fallback = parseOptions(block);
      if (fallback.options.length > 0) {
        options.push(...fallback.options);
        correctFromAsterisk.push(...fallback.correctFromAsterisk);
      }
    }

    // Merge asterisk-detected correct answers
    for (const letter of correctFromAsterisk) {
      if (!localCorrectAnswer.includes(letter)) localCorrectAnswer.push(letter);
    }

    // Finalize type
    if (!type) type = detectQuestionType(questionContent, options);

    // Build question object
    const flagImage = hasImageReference(questionContent) || hasImageReference(optionsRawBlock);

    const question = {
      section: currentSection,
      type,
      content: questionContent,
      imageUrl: null,
      options: type === 'integer' ? [] : options,
      correctAnswer: localCorrectAnswer,
      positiveMarks: posMark,
      negativeMarks: negMark,
      solution,
      solutionImageUrl: null,
      _meta: {
        originalNumber: qNum,
        hasImage: flagImage,
        needsAnswer: localCorrectAnswer.length === 0,
        confidence: 0, // calculated below
      },
    };

    // Calculate confidence score
    question._meta.confidence = calculateConfidence(question);

    // Only include questions with minimum viable confidence
    if (question._meta.confidence >= 15) {
      questions.push(question);
    }
  }

  // ─── Build comprehensive stats ──────────────────────────────────────────────
  const stats = {
    total: questions.length,
    withAnswers: questions.filter(q => q.correctAnswer.length > 0).length,
    withImages: questions.filter(q => q._meta.hasImage).length,
    withSolutions: questions.filter(q => q.solution && q.solution.length > 0).length,
    sections: [...new Set(questions.map(q => q.section))],
    types: {
      single: questions.filter(q => q.type === 'single').length,
      multiple: questions.filter(q => q.type === 'multiple').length,
      integer: questions.filter(q => q.type === 'integer').length,
    },
    hasAnswerKey: hasKey,
    avgConfidence: questions.length > 0
      ? Math.round(questions.reduce((s, q) => s + q._meta.confidence, 0) / questions.length)
      : 0,
    lowConfidenceCount: questions.filter(q => q._meta.confidence < 50).length,
  };

  return { questions, stats };
}
