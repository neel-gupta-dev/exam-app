import pdfParse from 'pdf-parse';

/**
 * PDF → CBT Question Parser Service
 * Extracts structured questions from exam PDF buffers.
 * Flags image-dependent questions for manual review.
 */

// ─── Image Detection ─────────────────────────────────────────────────────────
function hasImageReference(text) {
  const patterns = [
    /\bfig(?:ure)?[\s.:]*\d*/i,
    /\bdiagram\b/i,
    /\bshown\s+(?:in\s+)?(?:the\s+)?(?:figure|diagram|image|picture|graph|chart)/i,
    /\bgraph\b/i, /\bcircuit\b/i, /\bimage\b/i, /\bpicture\b/i,
    /\b(?:see|refer)\s+(?:the\s+)?(?:figure|diagram)/i,
    /\bdraw(?:n|ing)?\b/i, /\bplot\b/i,
    /\barrangement\b.*\bshown\b/i,
  ];
  return patterns.some(p => p.test(text));
}

// ─── Section Detection ───────────────────────────────────────────────────────
function detectSection(text) {
  const map = [
    { p: /\b(?:PHYSICS|Physics)\b/, s: 'Physics' },
    { p: /\b(?:CHEMISTRY|Chemistry)\b/, s: 'Chemistry' },
    { p: /\b(?:MATH(?:EMATICS|S)?|Maths?)\b/i, s: 'Mathematics' },
    { p: /\b(?:BIOLOGY|Biology)\b/, s: 'Biology' },
    { p: /\b(?:BOTANY|Botany)\b/, s: 'Botany' },
    { p: /\b(?:ZOOLOGY|Zoology)\b/, s: 'Zoology' },
    { p: /\b(?:ENGLISH|English)\b/, s: 'English' },
    { p: /\b(?:GK|General\s+Knowledge)\b/i, s: 'General Knowledge' },
    { p: /\b(?:REASONING|Reasoning)\b/, s: 'Reasoning' },
  ];
  for (const { p, s } of map) if (p.test(text)) return s;
  return null;
}

// ─── Question Type Detection ─────────────────────────────────────────────────
function detectQuestionType(text, options) {
  if (/\binteger\b/i.test(text) || /\bnumerical\s+(?:value|answer|type)\b/i.test(text) || options.length === 0) return 'integer';
  if (/\bmultiple\s+correct\b/i.test(text) || /\bmore\s+than\s+one\b/i.test(text) || /\bone\s+or\s+more\b/i.test(text)) return 'multiple';
  return 'single';
}

// ─── Answer Key Extraction ───────────────────────────────────────────────────
function extractAnswerKey(fullText) {
  const answerKey = {};
  const keyPatterns = [/ANSWER\s*KEY/i, /ANSWERS?\s*:/i, /CORRECT\s*ANSWERS?/i, /SOLUTION\s*KEY/i];
  let keySection = null;

  for (const p of keyPatterns) {
    const idx = fullText.search(p);
    if (idx !== -1) { keySection = fullText.substring(idx); break; }
  }
  if (!keySection) return answerKey;

  // "1. A" or "1) A" or "Q1: A" patterns
  const re = /(?:Q\.?\s*)?(\d{1,3})\s*[.):\-–]\s*\(?([A-Da-d](?:\s*[,&]\s*[A-Da-d])*|\d+)\)?/g;
  let m;
  while ((m = re.exec(keySection)) !== null) {
    const qNum = parseInt(m[1]);
    const answer = m[2].trim().toUpperCase();
    answerKey[qNum] = /[,&]/.test(answer) ? answer.split(/\s*[,&]\s*/).map(a => a.trim()) : [answer];
  }
  return answerKey;
}

// ─── Main Parser ─────────────────────────────────────────────────────────────
export async function parsePdfBuffer(buffer, opts = {}) {
  const data = await pdfParse(buffer);
  const rawText = data.text;

  const config = {
    section: opts.section || null,
    type: opts.type || null,
    posMark: opts.positiveMarks ?? 4,
    negMark: opts.negativeMarks ?? 1,
  };

  const answerKey = extractAnswerKey(rawText);
  const hasKey = Object.keys(answerKey).length > 0;

  let text = rawText
    .replace(/\r\n/g, '\n').replace(/\f/g, '\n').replace(/\t/g, ' ')
    .replace(/ {3,}/g, '  ').replace(/\n{4,}/g, '\n\n\n');

  // ─── Multi-format question boundary detection ──────────────────────────────
  // Supports:
  //   "1."  "1)"  "1:"  "Q.1"  "Q1."  "Ques.1"  "(1)"  "1 " at start of line
  //   Numbers must be at the start of a line (after optional whitespace)
  //   Deliberately excludes pure numbers inside sentences (like option values)
  const patterns = [
    // Format: "Q.1", "Q1.", "Ques. 1", "Question 1" etc.
    /(?:^|\n)[ \t]*(?:Q(?:uestion|ues)?\.?\s*)(\d{1,3})[\s.):\-–]/gm,
    // Format: "(1)", "(12)" — number inside parens at line start
    /(?:^|\n)[ \t]*\((\d{1,3})\)[ \t]/gm,
    // Format: "1." or "1)" or "1:" at line start
    /(?:^|\n)[ \t]*(\d{1,3})[.):\-–][ \t]/gm,
    // Format: "1  " — number followed by 2+ spaces then text (common in some JEE PDFs)
    /(?:^|\n)[ \t]*(\d{1,3})[ \t]{2,}(?=[A-Za-z(])/gm,
  ];

  // Try each pattern and take whichever finds the most matches (best fit for this PDF)
  let splits = [];
  for (const pattern of patterns) {
    const candidate = [];
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      candidate.push({ index: match.index, number: parseInt(match[1]), len: match[0].length });
    }
    // Prefer the pattern that finds sequential numbered questions (1, 2, 3...)
    // Filter: must have at least 3 sequential numbers to be considered real
    const sequential = candidate.filter((c, i) =>
      i === 0 || c.number === candidate[i - 1].number + 1 || c.number <= 5
    );
    if (sequential.length > splits.length) {
      splits = candidate;
    }
  }

  // Final filter: remove false positives — keep only entries where numbers
  // are roughly sequential (skip wild jumps like 1 → 45 → 2)
  if (splits.length > 3) {
    const filtered = [splits[0]];
    for (let i = 1; i < splits.length; i++) {
      const prev = filtered[filtered.length - 1].number;
      const curr = splits[i].number;
      // Allow same number or +1 to +5 sequential jump (handles multi-part questions)
      if (curr > prev && curr <= prev + 10) filtered.push(splits[i]);
      else if (curr === 1 && prev > 50) filtered.push(splits[i]); // new section restart
    }
    // Only use filtered if it's not much smaller (don't over-filter)
    if (filtered.length >= splits.length * 0.6) splits = filtered;
  }

  if (splits.length === 0) {
    // Last resort: return diagnostic info
    return {
      questions: [],
      stats: {
        total: 0,
        error: 'No questions detected. Ensure PDF has numbered questions (e.g. "1.", "Q.1", "(1)").',
        textSample: text.substring(0, 500), // first 500 chars for debugging
      }
    };
  }

  const sectionHeaderRe = /(?:SECTION|PART)\s*[-–:]\s*[A-Z0-9]{0,3}\s*[-–:.]?\s*(Physics|Chemistry|Math(?:ematics|s)?|Biology|Botany|Zoology|English|General\s*Knowledge|Reasoning)/gi;
  let currentSection = config.section || 'General';
  const questions = [];

  for (let i = 0; i < splits.length; i++) {
    const start = splits[i].index + splits[i].len;
    const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
    const qNum = splits[i].number;
    const block = text.substring(start, end).trim();

    // Section detection
    const preceding = text.substring(i > 0 ? splits[i - 1].index : 0, splits[i].index);
    const secMatch = preceding.match(sectionHeaderRe);
    if (secMatch) { const d = detectSection(secMatch[secMatch.length - 1]); if (d) currentSection = d; }
    if (!config.section) { const d = detectSection(block.substring(0, 100)); if (d) currentSection = d; }

    // Extract inline Answers like "Ans-(a)" or "Answer: A, C"
    const inlineAnsRe = /\bAns(?:wer)?\s*[-:=]?\s*\(?([A-Da-d](?:(?:\s*[,&]\s*|\s+and\s+)[A-Da-d])*)\)?/i;
    const inlineAnsMatch = block.match(inlineAnsRe);
    let localCorrectAnswer = hasKey && answerKey[qNum] ? answerKey[qNum] : [];

    if (inlineAnsMatch) {
      const letters = inlineAnsMatch[1].match(/[A-Da-d]/ig);
      if (letters) {
         localCorrectAnswer = letters.map(l => l.toUpperCase());
      }
      block = block.replace(inlineAnsMatch[0], ''); // remove from text
    }

    // Parse options
    let questionContent = block;
    let firstOptionIdx = block.length;
    // Allow optional asterisk marking the first option e.g. *(a) or (a)*
    const optStart = block.match(/(?:^|\n)\s*[*]?\s*\(?[Aa]\)?[*.):\s]/m);
    if (optStart) {
      firstOptionIdx = block.indexOf(optStart[0]);
      questionContent = block.substring(0, firstOptionIdx).trim();
    }
    const optionsBlock = block.substring(firstOptionIdx);
    const options = [];
    // Match option letter, checking for * before or after it
    const optRe = /\(?([A-Da-d])\)?[.):\s]*([*]?)\s*([\s\S]*?)(?=\n\s*\(?[A-Da-d]\)?[.):\s]|$)/g;
    
    // Let's redefine optRe to better capture optional asterisks before or after the option marker
    const advancedOptRe = /(?:^|\n)\s*([*]?)\s*\(?([A-Da-d])\)?([*.:\s]*)([\s\S]*?)(?=(?:\n\s*[*]?\s*\(?[A-Da-d]\)?[*.:\s])|$)/g;

    let om;
    while ((om = advancedOptRe.exec(optionsBlock)) !== null) {
      const isAsteriskMarked = om[1] === '*' || om[3].includes('*');
      const letter = om[2].toUpperCase();
      const content = om[4].trim().replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
      
      if (content) {
        options.push({ label: letter, content, imageUrl: null });
        if (isAsteriskMarked) {
          if (!localCorrectAnswer.includes(letter)) localCorrectAnswer.push(letter);
        }
      }
    }

    questionContent = questionContent.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (questionContent.length < 5 && options.length === 0) continue;

    const type = config.type || detectQuestionType(questionContent, options);
    const flagImage = hasImageReference(questionContent) || options.some(o => hasImageReference(o.content));

    questions.push({
      section: currentSection,
      type,
      content: questionContent,
      imageUrl: null,
      options: type === 'integer' ? [] : options,
      correctAnswer: localCorrectAnswer,
      positiveMarks: config.posMark,
      negativeMarks: config.negMark,
      solution: '',
      solutionImageUrl: null,
      _meta: { originalNumber: qNum, hasImage: flagImage, needsAnswer: localCorrectAnswer.length === 0 },
    });
  }

  const stats = {
    total: questions.length,
    withAnswers: questions.filter(q => q.correctAnswer.length > 0).length,
    withImages: questions.filter(q => q._meta.hasImage).length,
    sections: [...new Set(questions.map(q => q.section))],
    hasAnswerKey: hasKey,
  };

  return { questions, stats };
}
