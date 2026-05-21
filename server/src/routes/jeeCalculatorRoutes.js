import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { parseResponseSheet } from '../services/jeeParserService.js';
import { calculateScores } from '../services/scoringService.js';
import { protect } from '../middlewares/authMiddleware.js';
import JeeAdvResult from '../models/JeeAdvResult.js';

const router = Router();

const processPaper = async (url, html, year, paperNum) => {
  let content = html;
  if (url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL for Paper ${paperNum}. Status: ${response.status}`);
    }
    content = await response.text();
  }
  
  if (!content) return null;
  
  const parsedData = parseResponseSheet(content);
  let calcYear = year || 2026;
  let calcPaper = paperNum;
  
  if (parsedData.examTitle) {
    if (parsedData.examTitle.includes('2026')) calcYear = 2026;
    if (parsedData.examTitle.includes('2025')) calcYear = 2025;
    if (!paperNum) {
      calcPaper = parsedData.candidateInfo?.Subject?.includes('Paper 2') ? 2 : 1;
    }
  }
  
  const results = calculateScores(parsedData, calcYear, calcPaper || 1);
  return {
    candidateInfo: {
      ...parsedData.candidateInfo,
      examTitle: parsedData.examTitle,
      paperNum: calcPaper || 1
    },
    ...results
  };
};

const mergeResults = (res1, res2) => {
  if (!res1 && !res2) return null;
  if (!res1) return res2;
  if (!res2) return res1;
  
  const merged = {
    candidateInfo: {
      ...res2.candidateInfo,
      ...res1.candidateInfo,
      examTitle: 'JEE Advanced Combined Results',
      candidateName: res1.candidateInfo?.candidateName || res2.candidateInfo?.candidateName,
      candidateId: res1.candidateInfo?.candidateId || res2.candidateInfo?.candidateId,
      'Candidate Name': res1.candidateInfo?.['Candidate Name'] || res2.candidateInfo?.['Candidate Name'] || res1.candidateInfo?.['Participant Name'] || res2.candidateInfo?.['Participant Name'] || res1.candidateInfo?.candidateName || res2.candidateInfo?.candidateName,
      'Candidate ID': res1.candidateInfo?.['Candidate ID'] || res2.candidateInfo?.['Candidate ID'] || res1.candidateInfo?.['Participant ID'] || res2.candidateInfo?.['Participant ID'] || res1.candidateInfo?.candidateId || res2.candidateInfo?.candidateId,
      'Subject': (res1.candidateInfo?.['Subject'] && res2.candidateInfo?.['Subject'] && res1.candidateInfo?.['Subject'] !== res2.candidateInfo?.['Subject'])
        ? `${res1.candidateInfo?.['Subject']} & ${res2.candidateInfo?.['Subject']}`
        : (res1.candidateInfo?.['Subject'] || res2.candidateInfo?.['Subject'] || 'JEE Advanced')
    },
    totalScore: res1.totalScore + res2.totalScore,
    maxScore: res1.maxScore + res2.maxScore,
    positiveMarks: res1.positiveMarks + res2.positiveMarks,
    negativeMarks: res1.negativeMarks + res2.negativeMarks,
    totalAttempted: res1.totalAttempted + res2.totalAttempted,
    totalCorrect: res1.totalCorrect + res2.totalCorrect,
    subjectWise: {},
    sectionWise: {},
    questions: []
  };

  // Merge subjectWise
  const subjects = new Set([
    ...Object.keys(res1.subjectWise || {}),
    ...Object.keys(res2.subjectWise || {})
  ]);
  
  subjects.forEach(sub => {
    const s1 = res1.subjectWise?.[sub] || { score: 0, max: 0, correct: 0, wrong: 0, unattempted: 0 };
    const s2 = res2.subjectWise?.[sub] || { score: 0, max: 0, correct: 0, wrong: 0, unattempted: 0 };
    merged.subjectWise[sub] = {
      score: s1.score + s2.score,
      max: s1.max + s2.max,
      correct: s1.correct + s2.correct,
      wrong: s1.wrong + s2.wrong,
      unattempted: s1.unattempted + s2.unattempted
    };
  });

  // Merge sectionWise (with prefix to avoid key collisions)
  Object.entries(res1.sectionWise || {}).forEach(([sec, stats]) => {
    merged.sectionWise[`Paper 1 - ${sec}`] = stats;
  });
  Object.entries(res2.sectionWise || {}).forEach(([sec, stats]) => {
    merged.sectionWise[`Paper 2 - ${sec}`] = stats;
  });

  // Merge questions (add a paper identifier to each question)
  const q1 = (res1.questions || []).map(q => ({ ...q, paper: 1 }));
  const q2 = (res2.questions || []).map(q => ({ ...q, paper: 2 }));
  merged.questions = [...q1, ...q2];

  return merged;
};

// POST /api/jee-calculator/calculate
router.post('/calculate', protect, asyncHandler(async (req, res) => {
  const { url, paper1Url, paper2Url, year } = req.body;
  
  const p1Url = paper1Url || (!paper2Url ? url : null);
  const p2Url = paper2Url;
  
  if (!p1Url && !p2Url) {
    res.status(400);
    throw new Error('At least one response sheet URL is required');
  }
  
  try {
    const res1 = p1Url ? await processPaper(p1Url, null, year, 1) : null;
    const res2 = p2Url ? await processPaper(p2Url, null, year, 2) : null;
    
    const merged = mergeResults(res1, res2);
    
    if (req.user && merged) {
      const paper1Score = res1?.totalScore || 0;
      const paper2Score = res2?.totalScore || 0;
      
      const paperSubjectWise = {};
      if (res1?.subjectWise) {
        Object.entries(res1.subjectWise).forEach(([sub, stats]) => {
          paperSubjectWise[`Paper 1 - ${sub}`] = stats.score;
        });
      }
      if (res2?.subjectWise) {
        Object.entries(res2.subjectWise).forEach(([sub, stats]) => {
          paperSubjectWise[`Paper 2 - ${sub}`] = stats.score;
        });
      }
      
      const subjectWiseMarks = {};
      if (merged.subjectWise) {
        Object.entries(merged.subjectWise).forEach(([sub, stats]) => {
          subjectWiseMarks[sub] = stats.score;
        });
      }

      await JeeAdvResult.findOneAndUpdate(
        { user: req.user._id, candidateId: merged.candidateInfo?.['Candidate ID'] || merged.candidateInfo?.candidateId || '' },
        {
          user: req.user._id,
          candidateName: merged.candidateInfo?.['Candidate Name'] || merged.candidateInfo?.candidateName || '',
          candidateId: merged.candidateInfo?.['Candidate ID'] || merged.candidateInfo?.candidateId || '',
          paper1Url: p1Url || '',
          paper2Url: p2Url || '',
          totalScore: merged.totalScore || 0,
          paper1Score,
          paper2Score,
          subjectWise: subjectWiseMarks,
          paperSubjectWise
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    res.json({
      success: true,
      ...merged
    });
  } catch (error) {
    console.error('Error fetching/parsing response sheet:', error.message);
    res.status(500);
    throw new Error(error.message || 'Failed to fetch or parse the response sheet.');
  }
}));

export default router;
