#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PDF → CBT Exam Converter                                      ║
 * ║  Parses JEE/NEET/CUET style PDF papers into structured JSON     ║
 * ║  and optionally bulk-uploads to your Vayl CBT engine.           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   node converter.js <input.pdf> [--test-id <id>] [--upload] [--api <url>] [--token <jwt>]
 *
 * Flags:
 *   --test-id   Target test ID to upload questions to
 *   --upload    Actually push to the API (otherwise just generates JSON)
 *   --api       Backend API URL (default: http://localhost:5000)
 *   --token     Admin JWT token for authenticated upload
 *   --section   Force all questions into a section (e.g. "Physics")
 *   --type      Force question type: single | multiple | integer (default: auto-detect)
 *   --pos       Default positive marks (default: 4)
 *   --neg       Default negative marks (default: 1)
 *
 * Output:
 *   Creates <input>_questions.json alongside the PDF with parsed questions.
 *   Questions containing images are flagged with hasImage: true and imageUrl: null
 *   so you can fill them in manually from the admin dashboard.
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// ─── CLI Argument Parser ─────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    pdfPath: null,
    testId: null,
    upload: false,
    apiUrl: 'http://localhost:5000',
    token: null,
    section: null,   // auto-detect from PDF
    type: null,      // auto-detect
    posMark: 4,
    negMark: 1,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--test-id') config.testId = args[++i];
    else if (arg === '--upload') config.upload = true;
    else if (arg === '--api') config.apiUrl = args[++i];
    else if (arg === '--token') config.token = args[++i];
    else if (arg === '--section') config.section = args[++i];
    else if (arg === '--type') config.type = args[++i];
    else if (arg === '--pos') config.posMark = Number(args[++i]);
    else if (arg === '--neg') config.negMark = Number(args[++i]);
    else if (!arg.startsWith('--')) config.pdfPath = arg;
  }

  if (!config.pdfPath) {
    console.error('❌ Usage: node converter.js <input.pdf> [options]');
    console.error('   Run with --help for all options.');
    process.exit(1);
  }

  return config;
}

// ─── Core PDF Text Extraction ────────────────────────────────────────────────

async function extractText(pdfPath) {
  const absolutePath = path.resolve(pdfPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(absolutePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// ─── Image Detection ─────────────────────────────────────────────────────────

/**
 * Detects if a text block likely references an image/figure/diagram.
 * These questions will be flagged so the admin can add images manually.
 */
function hasImageReference(text) {
  const imagePatterns = [
    /\bfig(?:ure)?[\s.:]*\d*/i,
    /\bdiagram\b/i,
    /\b(?:as\s+)?shown\s+(?:in\s+)?(?:the\s+)?(?:figure|diagram|image|picture|graph|chart)/i,
    /\bgraph\b/i,
    /\bcircuit\b/i,
    /\bimage\b/i,
    /\bpicture\b/i,
    /\b(?:see|refer)\s+(?:the\s+)?(?:figure|diagram)/i,
    /\bdraw(?:n|ing)?\b/i,
    /\bplot\b/i,
    /\barrangement\b.*\bshown\b/i,
    /\bbelow\s+(?:figure|diagram|image)\b/i,
  ];
  return imagePatterns.some(p => p.test(text));
}

// ─── Section Detection ───────────────────────────────────────────────────────

function detectSection(text) {
  const sectionPatterns = [
    { pattern: /\b(?:PHYSICS|Physics)\b/, section: 'Physics' },
    { pattern: /\b(?:CHEMISTRY|Chemistry)\b/, section: 'Chemistry' },
    { pattern: /\b(?:MATH(?:EMATICS|S)?|Maths?)\b/i, section: 'Mathematics' },
    { pattern: /\b(?:BIOLOGY|Biology)\b/, section: 'Biology' },
    { pattern: /\b(?:BOTANY|Botany)\b/, section: 'Botany' },
    { pattern: /\b(?:ZOOLOGY|Zoology)\b/, section: 'Zoology' },
    { pattern: /\b(?:ENGLISH|English)\b/, section: 'English' },
    { pattern: /\b(?:GK|General\s+Knowledge)\b/i, section: 'General Knowledge' },
    { pattern: /\b(?:REASONING|Reasoning)\b/, section: 'Reasoning' },
  ];

  for (const { pattern, section } of sectionPatterns) {
    if (pattern.test(text)) return section;
  }
  return null;
}

// ─── Question Type Detection ─────────────────────────────────────────────────

function detectQuestionType(text, options) {
  // Integer type detection
  const integerPatterns = [
    /\binteger\b/i,
    /\bnumerical\s+(?:value|answer|type)\b/i,
    /\bfind\s+the\s+(?:value|number)\b/i,
    /\banswer\s+is\s+(?:a\s+)?(?:\d+|number|integer)\b/i,
    /\bnumerical\b/i,
  ];
  if (integerPatterns.some(p => p.test(text)) || options.length === 0) {
    return 'integer';
  }

  // Multiple correct detection
  const multiplePatterns = [
    /\bmultiple\s+correct\b/i,
    /\bmore\s+than\s+one\s+(?:correct|right|option)\b/i,
    /\bone\s+or\s+more\b/i,
    /\bchoose\s+(?:all|the\s+correct)\b/i,
  ];
  if (multiplePatterns.some(p => p.test(text))) {
    return 'multiple';
  }

  return 'single';
}

// ─── Answer Key Extraction ───────────────────────────────────────────────────

/**
 * Tries to extract an answer key block from the end of the PDF.
 * Common formats:
 *   1. A    2. B    3. C    ...
 *   Q1: A   Q2: B   Q3: C   ...
 *   1) A    2) B    3) C    ...
 *   1-A, 2-B, 3-C, ...
 */
function extractAnswerKey(fullText) {
  const answerKey = {};

  // Look for answer key section headers
  const keyStartPatterns = [
    /ANSWER\s*KEY/i,
    /ANSWERS?\s*:/i,
    /CORRECT\s*ANSWERS?/i,
    /SOLUTION\s*KEY/i,
    /KEY\s*:/i,
  ];

  let keySection = null;
  for (const pattern of keyStartPatterns) {
    const match = fullText.search(pattern);
    if (match !== -1) {
      keySection = fullText.substring(match);
      break;
    }
  }

  if (!keySection) return answerKey;

  // Pattern 1:  "1. A"  or  "1) A"  or  "1: A"  or "1-A" or "Q1. A"
  const answerPatterns = [
    /(?:Q\.?\s*)?(\d{1,3})\s*[.):\-–]\s*\(?([A-Da-d](?:\s*[,&]\s*[A-Da-d])*)\)?/g,
    /(?:Q\.?\s*)?(\d{1,3})\s*[.):\-–]\s*(\d+)/g, // Integer answers
  ];

  for (const pattern of answerPatterns) {
    let m;
    while ((m = pattern.exec(keySection)) !== null) {
      const qNum = parseInt(m[1]);
      const answer = m[2].trim().toUpperCase();

      // Handle multiple answers like "A, C" or "A & B"
      if (/[,&]/.test(answer)) {
        answerKey[qNum] = answer.split(/\s*[,&]\s*/).map(a => a.trim());
      } else {
        answerKey[qNum] = [answer];
      }
    }
  }

  return answerKey;
}

// ─── Main Question Parser ────────────────────────────────────────────────────

function parseQuestions(rawText, config) {
  const questions = [];
  let currentSection = config.section || 'General';

  // Extract answer key if present
  const answerKey = extractAnswerKey(rawText);
  const hasAnswerKey = Object.keys(answerKey).length > 0;

  if (hasAnswerKey) {
    console.log(`✅ Found answer key with ${Object.keys(answerKey).length} answers`);
  } else {
    console.log('⚠️  No answer key block detected. Correct answers will be empty — fill them in the admin dashboard.');
  }

  // Normalize text: clean up common PDF artifacts
  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\f/g, '\n')          // Form feeds
    .replace(/\t/g, ' ')           // Tabs
    .replace(/ {3,}/g, '  ')       // Excessive spaces
    .replace(/\n{4,}/g, '\n\n\n'); // Excessive newlines

  // ─── Detect Section Boundaries ──────────────────────────────────────
  // Common patterns: "SECTION – A : PHYSICS" or "Part I: Physics"
  const sectionHeaderPattern = /(?:SECTION|PART|विभाग)\s*[-–:]\s*[A-Z0-9]{0,3}\s*[-–:.]?\s*(Physics|Chemistry|Math(?:ematics|s)?|Biology|Botany|Zoology|English|General\s*Knowledge|Reasoning)/gi;

  // ─── Split into question blocks ─────────────────────────────────────
  // Pattern: question number at start of line or after newline
  // Handles: "Q.1", "Q1.", "Q 1.", "1.", "1)", "Q.1)", "(1)", "Ques. 1"
  const questionSplitPattern = /(?:^|\n)\s*(?:Q(?:ues)?\.?\s*)?(\d{1,3})\s*[.):\-–]\s*/g;

  const splits = [];
  let match;
  while ((match = questionSplitPattern.exec(text)) !== null) {
    splits.push({
      index: match.index,
      number: parseInt(match[1]),
      matchLength: match[0].length,
    });
  }

  if (splits.length === 0) {
    console.error('❌ Could not detect any questions in the PDF. The format may not be supported.');
    console.error('   Supported formats: "Q.1)", "1.", "1)", "(1)", "Ques. 1"');
    return [];
  }

  console.log(`📋 Detected ${splits.length} question blocks`);

  // Process each question block
  for (let i = 0; i < splits.length; i++) {
    const start = splits[i].index + splits[i].matchLength;
    const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
    const qNum = splits[i].number;

    let block = text.substring(start, end).trim();

    // Check for section change in the preceding text
    const precedingText = text.substring(
      i > 0 ? splits[i - 1].index : 0,
      splits[i].index
    );
    const sectionMatch = precedingText.match(sectionHeaderPattern);
    if (sectionMatch) {
      const detected = detectSection(sectionMatch[sectionMatch.length - 1]);
      if (detected) currentSection = detected;
    }

    // Also check the block itself for inline section markers
    if (!config.section) {
      const inlineSection = detectSection(block.substring(0, 100));
      if (inlineSection) currentSection = inlineSection;
    }

    // ─── Parse Options from block ──────────────────────────────────────
    // Options pattern: "(A)" or "(a)" or "A." or "A)" at start of line or inline
    const optionPattern = /(?:^|\n)\s*\(?([A-Da-d])\)?[.):\s]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-Da-d]\)?[.):\s])|$)/g;

    const options = [];
    let optionMatch;
    let questionContent = block;
    let firstOptionIdx = block.length;

    // Find where options start
    const optStartSearch = /(?:^|\n)\s*\(?[Aa]\)?[.):\s]/m;
    const optStartMatch = block.match(optStartSearch);
    if (optStartMatch) {
      firstOptionIdx = block.indexOf(optStartMatch[0]);
      questionContent = block.substring(0, firstOptionIdx).trim();
    }

    const optionsBlock = block.substring(firstOptionIdx);

    // Extract individual options
    const optLinePattern = /\(?([A-Da-d])\)?[.):\s]\s*([\s\S]*?)(?=\n\s*\(?[A-Da-d]\)?[.):\s]|$)/g;
    while ((optionMatch = optLinePattern.exec(optionsBlock)) !== null) {
      const label = optionMatch[1].toUpperCase();
      let content = optionMatch[2].trim()
        .replace(/\n+/g, ' ')   // Flatten newlines within option
        .replace(/\s{2,}/g, ' ') // Clean spaces
        .trim();

      if (content) {
        options.push({ label, content, imageUrl: null });
      }
    }

    // Clean up question content
    questionContent = questionContent
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Skip empty / garbage blocks
    if (questionContent.length < 5 && options.length === 0) continue;

    // ─── Detect question type ──────────────────────────────────────────
    const type = config.type || detectQuestionType(questionContent, options);

    // ─── Image detection ───────────────────────────────────────────────
    const questionHasImage = hasImageReference(questionContent);
    const optionsHaveImage = options.some(o => hasImageReference(o.content));
    const flagImage = questionHasImage || optionsHaveImage;

    // ─── Get correct answer ────────────────────────────────────────────
    let correctAnswer = [];
    if (hasAnswerKey && answerKey[qNum]) {
      correctAnswer = answerKey[qNum];
    }

    // Build question object matching your schema exactly
    const question = {
      section: currentSection,
      type,
      content: questionContent,
      imageUrl: null,
      options: type === 'integer' ? [] : options,
      correctAnswer,
      positiveMarks: config.posMark,
      negativeMarks: config.negMark,
      solution: '',
      solutionImageUrl: null,
      // Metadata (not sent to API, used for review)
      _meta: {
        originalNumber: qNum,
        hasImage: flagImage,
        imageNote: flagImage
          ? '⚠️ This question likely contains an image/figure. Add it manually in the dashboard.'
          : null,
        needsAnswer: correctAnswer.length === 0,
      },
    };

    questions.push(question);
  }

  return questions;
}

// ─── Upload to API ───────────────────────────────────────────────────────────

async function uploadQuestions(questions, config) {
  if (!config.testId) {
    console.error('❌ --test-id is required for upload');
    process.exit(1);
  }
  if (!config.token) {
    console.error('❌ --token (admin JWT) is required for upload');
    process.exit(1);
  }

  // Strip _meta before sending
  const payload = questions.map(q => {
    const { _meta, ...rest } = q;
    return rest;
  });

  const url = `${config.apiUrl}/api/tests/${config.testId}/questions/bulk`;
  console.log(`\n🚀 Uploading ${payload.length} questions to ${url}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({ questions: payload }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`❌ Upload failed (${res.status}):`, data.message || data);
      process.exit(1);
    }

    console.log(`✅ Successfully uploaded! ${data.count || payload.length} questions added.`);
  } catch (err) {
    console.error('❌ Network error during upload:', err.message);
    process.exit(1);
  }
}

// ─── Report Generator ────────────────────────────────────────────────────────

function printReport(questions) {
  const total = questions.length;
  const withImages = questions.filter(q => q._meta.hasImage).length;
  const withAnswers = questions.filter(q => q.correctAnswer.length > 0).length;
  const noAnswers = total - withAnswers;
  const sections = [...new Set(questions.map(q => q.section))];
  const types = {};
  questions.forEach(q => { types[q.type] = (types[q.type] || 0) + 1; });

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║       📊 CONVERSION REPORT           ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Total Questions:    ${String(total).padStart(4)}             ║`);
  console.log(`║  With Answers:       ${String(withAnswers).padStart(4)}             ║`);
  console.log(`║  Missing Answers:    ${String(noAnswers).padStart(4)}             ║`);
  console.log(`║  Contains Images:    ${String(withImages).padStart(4)}  ⚠️          ║`);
  console.log(`║  Sections:  ${sections.join(', ').substring(0, 22).padEnd(22)}  ║`);
  console.log('╠══════════════════════════════════════╣');
  Object.entries(types).forEach(([t, c]) => {
    console.log(`║  ${t.padEnd(20)} ${String(c).padStart(4)} questions   ║`);
  });
  console.log('╚══════════════════════════════════════╝');

  if (withImages > 0) {
    console.log(`\n⚠️  ${withImages} question(s) reference images/figures/diagrams.`);
    console.log('   These have imageUrl: null. Add images manually from the admin dashboard.');
    console.log('   Questions with images:');
    questions.forEach((q, i) => {
      if (q._meta.hasImage) {
        console.log(`     → Q${q._meta.originalNumber} (${q.section}): "${q.content.substring(0, 60)}..."`);
      }
    });
  }

  if (noAnswers > 0) {
    console.log(`\n⚠️  ${noAnswers} question(s) have no correct answer set.`);
    console.log('   Add them via the admin dashboard or put an ANSWER KEY at the end of the PDF.');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const config = parseArgs();

  console.log('╔══════════════════════════════════════╗');
  console.log('║    📄 PDF → CBT Exam Converter       ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n📂 Reading: ${config.pdfPath}`);

  // 1. Extract raw text
  const rawText = await extractText(config.pdfPath);
  console.log(`📝 Extracted ${rawText.length} characters of text`);

  // 2. Parse into structured questions
  const questions = parseQuestions(rawText, config);

  if (questions.length === 0) {
    console.error('\n❌ No questions could be parsed. Check the PDF format.');
    process.exit(1);
  }

  // 3. Print report
  printReport(questions);

  // 4. Save JSON output
  const outputPath = config.pdfPath.replace(/\.pdf$/i, '_questions.json');
  const outputData = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(config.pdfPath),
    totalQuestions: questions.length,
    questions: questions.map(q => {
      const { _meta, ...apiReady } = q;
      return { ...apiReady, _meta };
    }),
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`\n💾 Saved: ${outputPath}`);

  // 5. Upload if requested
  if (config.upload) {
    await uploadQuestions(questions, config);
  } else {
    console.log('\n💡 To upload to your CBT engine, re-run with:');
    console.log(`   node converter.js "${config.pdfPath}" --upload --test-id <TEST_ID> --token <ADMIN_JWT>`);
  }

  console.log('\n✨ Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
