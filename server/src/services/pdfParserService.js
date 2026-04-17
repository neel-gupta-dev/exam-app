import pdfParse from 'pdf-parse';

/**
 * PDF → CBT Question Parser Service
 * Extracts structured questions from exam PDF buffers.
 * Handles: multi-line options, inline options with ○ bullets,
 *          (B*) / B* / *B correct answer markers, Ans-(B) inline answers,
 *          JEE/NEET/CUET style question numbering.
 */

// ─── Image Detection ─────────────────────────────────────────────────────────
function hasImageReference(text) {
  if (!text) return false;
  return [
    /\bfig(?:ure)?[\s.:]*\d*/i, /\bdiagram\b/i,
    /\bshown\s+(?:in\s+)?(?:the\s+)?(?:figure|diagram|image|picture|graph|chart)/i,
    /\bgraph\b/i, /\bcircuit\b/i, /\bimage\b/i, /\bpicture\b/i,
    /\b(?:see|refer)\s+(?:the\s+)?(?:figure|diagram)/i,
    /\bdraw(?:n|ing)?\b/i, /\bplot\b/i, /\barrangement\b.*\bshown\b/i,
  ].some(p => p.test(text));
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
  const re = /(?:Q\.?\s*)?(\d{1,3})\s*[.):\-–]\s*\(?([A-Da-d](?:\s*[,&]\s*[A-Da-d])*|\d+)\)?/g;
  let m;
  while ((m = re.exec(keySection)) !== null) {
    const qNum = parseInt(m[1]);
    const answer = m[2].trim().toUpperCase();
    answerKey[qNum] = /[,&]/.test(answer)
      ? answer.split(/\s*[,&]\s*/).map(a => a.trim())
      : [answer];
  }
  return answerKey;
}

// ─── Option Parser ───────────────────────────────────────────────────────────
/**
 * Handles ALL real-world MCQ option formats:
 *   Multi-line:  "A. text\nB. text"
 *   Inline ○:    "○ A. text ○ B. text ○ C. text"
 *   Inline O:    "O A. text  O B. text"
 *   Inline space:"A. text  B. text  C. text" (2+ spaces between)
 *   Asterisks:   (B*), (*B), B*, *B, (B)* — anywhere around the letter = correct
 */
function parseOptions(block) {
  const options = [];
  const correctFromAsterisk = [];
  if (!block) return { options, correctFromAsterisk };

  // ─── Detect if options are inline (all on one line) ──────────────────────
  const lines = block.split('\n');
  const inlineLine = lines.find(line => {
    // A line with at least 2 distinct option letters (A, B, C, D)
    const letters = [...line.matchAll(/[*]?\s*\(?([A-Da-d])[*]?\)?\s*[.*)\s]/g)];
    const unique = new Set(letters.map(l => l[1].toUpperCase()));
    return unique.size >= 2;
  });

  let parseTarget = block;

  if (inlineLine) {
    // Normalize: split inline options into separate lines
    parseTarget = inlineLine
      // Circle/bullet chars → newline
      .replace(/[○◯◉●•]\s*/g, '\n')
      // "O A." pattern (capital O used as bullet) → newline before A
      .replace(/\bO\s+(?=[A-Da-d][.*)\s])/g, '\n')
      // 2+ spaces before an option letter → newline
      .replace(/\s{2,}(?=[*]?\s*\(?[A-Da-d][*]?\)?[.*)\s])/g, '\n');
  }

  // ─── Parse each option line ───────────────────────────────────────────────
  // Matches ALL these formats on a single line:
  //   (A*) text   (*A) text   (A) text
  //   A* text     *A text     A. text    A) text
  const optionLineRe = /^\s*(?:([*]?)\s*\(\s*([A-Da-d])\s*([*]?)\s*\)\s*([*]?)|([*]?)\s*([A-Da-d])\s*([*]?)\s*[.)]\s*([*]?))\s*(.+?)?\s*$/gm;

  let m;
  while ((m = optionLineRe.exec(parseTarget)) !== null) {
    // Paren format groups: 1=pre* 2=letter 3=inner* 4=post*  content=9
    // Plain format groups: 5=pre* 6=letter 7=post*  8=post-dot*  content=9
    const letter = (m[2] || m[6] || '').toUpperCase();
    if (!letter) continue;

    const hasAsterisk = !!(m[1] || m[3] || m[4] || m[5] || m[7] || m[8]);
    let content = (m[9] || '').trim()
      .replace(/\s*Sol\..*$/i, '')   // strip trailing Sol. text
      .replace(/\s+/g, ' ').trim();

    if (content && !options.find(o => o.label === letter)) {
      options.push({ label: letter, content, imageUrl: null });
      if (hasAsterisk) correctFromAsterisk.push(letter);
    }
  }

  return { options, correctFromAsterisk };
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

  // ─── Skip intro/cover pages ───────────────────────────────────────────────
  // Find the position where actual exam questions begin.
  // Strategy: locate the first numbered item (1. / Q.1 / Q1.) that is
  // FOLLOWED within 600 chars by MCQ option markers (A. / (A) / ○ A).
  // Everything before that point is introduction/cover/instructions.
  const introSkipRe = /(?:(?:^|\n)[ \t]*(?:Q(?:uestion|ues)?\.?\s*)?\d{1,3}[.):\s–-][ \t])/gm;
  const mcqSignal = /(?:[○◯◉●•]\s*)?[*]?\s*\(?[A-Da-d][*]?\)?\s*[.):\s]/;
  let questionsStart = 0;
  let introMatch;
  while ((introMatch = introSkipRe.exec(text)) !== null) {
    const lookahead = text.substring(introMatch.index, introMatch.index + 600);
    if (mcqSignal.test(lookahead)) {
      questionsStart = introMatch.index;
      break;
    }
  }
  // Keep a small buffer before to catch section headers right before Q1
  const bufferStart = Math.max(0, questionsStart - 200);
  if (questionsStart > 0) {
    text = text.substring(bufferStart);
  }


  const patterns = [
    /(?:^|\n)[ \t]*(?:Q(?:uestion|ues)?\.?\s*)(\d{1,3})[\s.):–-]/gm,
    /(?:^|\n)[ \t]*\((\d{1,3})\)[ \t]/gm,
    /(?:^|\n)[ \t]*(\d{1,3})[.):–-][ \t]/gm,
    /(?:^|\n)[ \t]*(\d{1,3})[ \t]{2,}(?=[A-Za-z(])/gm,
  ];

  let splits = [];
  for (const pattern of patterns) {
    const candidate = [];
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      candidate.push({ index: match.index, number: parseInt(match[1]), len: match[0].length });
    }
    const sequential = candidate.filter((c, i) =>
      i === 0 || c.number === candidate[i - 1].number + 1 || c.number <= 5
    );
    if (sequential.length > splits.length) splits = candidate;
  }

  if (splits.length > 3) {
    const filtered = [splits[0]];
    for (let i = 1; i < splits.length; i++) {
      const prev = filtered[filtered.length - 1].number;
      const curr = splits[i].number;
      if (curr > prev && curr <= prev + 10) filtered.push(splits[i]);
      else if (curr === 1 && prev > 50) filtered.push(splits[i]);
    }
    if (filtered.length >= splits.length * 0.6) splits = filtered;
  }

  if (splits.length === 0) {
    return {
      questions: [],
      stats: {
        total: 0,
        error: 'No questions detected. Ensure PDF has numbered questions (e.g. "1.", "Q.1", "(1)").',
        textSample: text.substring(0, 500),
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
    let block = text.substring(start, end).trim();

    // Section detection
    const preceding = text.substring(i > 0 ? splits[i - 1].index : 0, splits[i].index);
    const secMatch = preceding.match(sectionHeaderRe);
    if (secMatch) { const d = detectSection(secMatch[secMatch.length - 1]); if (d) currentSection = d; }
    if (!config.section) { const d = detectSection(block.substring(0, 100)); if (d) currentSection = d; }

    // ─── Inline Ans-(A) / Answer: B detection ────────────────────────────────
    const inlineAnsRe = /\bAns(?:wer)?\s*[-:=]?\s*\(?([A-Da-d](?:(?:\s*[,&]\s*|\s+and\s+)[A-Da-d])*)\)?/i;
    const inlineAnsMatch = block.match(inlineAnsRe);
    let localCorrectAnswer = hasKey && answerKey[qNum] ? [...answerKey[qNum]] : [];
    if (inlineAnsMatch) {
      const letters = inlineAnsMatch[1].match(/[A-Da-d]/ig);
      if (letters) localCorrectAnswer = letters.map(l => l.toUpperCase());
      block = block.replace(inlineAnsMatch[0], '');
    }

    // ─── Strip PDF metadata header lines (GENERAL SINGLE / MULTIPLE etc.) ────
    block = block.replace(
      /^\s*(?:GENERAL|SINGLE|MULTIPLE|INTEGER|NUMERICAL|HAS\s+IMAGE)(?:\s+(?:GENERAL|SINGLE|MULTIPLE|INTEGER|NUMERICAL|HAS\s+IMAGE))*\s*\n/im,
      ''
    );

    // ─── Type from header keyword ─────────────────────────────────────────────
    const blockHead = block.substring(0, 80);
    let type = config.type;
    if (!type) {
      if (/\bINTEGER\b|\bNUMERICAL\b/i.test(blockHead)) type = 'integer';
      else if (/\bMULTIPLE\b/i.test(blockHead)) type = 'multiple';
      else if (/\bSINGLE\b/i.test(blockHead)) type = 'single';
    }

    // ─── Split question content from options block ────────────────────────────
    // Detect option start: any line or inline occurrence of A. / (A) / ○A / *A / (A*)
    const optStartRe = /(?:(?:^|\n)\s*[*]?\s*\(?[Aa][*]?\)?\s*[.):\s]|[○◯◉●•]\s*[*]?\s*\(?[Aa][*]?\)?\s*[.)\s])/m;
    const optStartMatch = block.match(optStartRe);

    let questionContent = block;
    let optionsRawBlock = '';

    if (optStartMatch) {
      const idx = block.indexOf(optStartMatch[0]);
      questionContent = block.substring(0, idx).trim();
      optionsRawBlock = block.substring(idx);
    }

    // Clean content
    questionContent = questionContent
      .replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ')
      .replace(/\s*Sol\..*$/i, '')
      .trim();

    // Skip empty question text — this prevents the "content is required" error
    if (!questionContent || questionContent.length < 3) continue;

    // ─── Parse options ────────────────────────────────────────────────────────
    const { options, correctFromAsterisk } = parseOptions(optionsRawBlock || block);

    for (const letter of correctFromAsterisk) {
      if (!localCorrectAnswer.includes(letter)) localCorrectAnswer.push(letter);
    }

    if (!type) type = detectQuestionType(questionContent, options);

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
      _meta: {
        originalNumber: qNum,
        hasImage: hasImageReference(questionContent) || hasImageReference(optionsRawBlock),
        needsAnswer: localCorrectAnswer.length === 0,
      },
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
