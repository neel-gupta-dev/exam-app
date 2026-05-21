import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { parseResponseSheet } from '../services/jeeParserService.js';
import { calculateScores } from '../services/scoringService.js';

const router = Router();

// POST /api/jee-calculator/calculate
// Accepts a digialm URL, fetches HTML, parses, and scores
router.post('/calculate', asyncHandler(async (req, res) => {
  const { url, year, paper } = req.body;

  if (!url || !url.startsWith('http')) {
    res.status(400);
    throw new Error('Valid response sheet URL is required');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }
    
    const html = await response.text();
    const parsedData = parseResponseSheet(html);
    
    // Auto-detect year/paper if not provided
    let calcYear = year || 2026;
    let calcPaper = paper || 1;
    
    if (parsedData.examTitle) {
      if (parsedData.examTitle.includes('2026')) calcYear = 2026;
      if (parsedData.examTitle.includes('2025')) calcYear = 2025;
      if (parsedData.candidateInfo?.Subject?.includes('Paper 2')) calcPaper = 2;
    }

    const results = calculateScores(parsedData, calcYear, calcPaper);

    res.json({
      success: true,
      candidateInfo: {
        ...parsedData.candidateInfo,
        examTitle: parsedData.examTitle
      },
      ...results
    });

  } catch (error) {
    console.error('Error fetching/parsing response sheet:', error.message);
    res.status(500);
    throw new Error('Failed to fetch or parse the response sheet. It might be expired or require login. Please try the "Paste HTML" option.');
  }
}));

// POST /api/jee-calculator/calculate-html
// Fallback: Accepts raw HTML string
router.post('/calculate-html', asyncHandler(async (req, res) => {
  const { html, year, paper } = req.body;

  if (!html) {
    res.status(400);
    throw new Error('HTML content is required');
  }

  try {
    const parsedData = parseResponseSheet(html);
    
    // Auto-detect
    let calcYear = year || 2026;
    let calcPaper = paper || 1;
    
    if (parsedData.examTitle) {
      if (parsedData.examTitle.includes('2026')) calcYear = 2026;
      if (parsedData.examTitle.includes('2025')) calcYear = 2025;
      if (parsedData.candidateInfo?.Subject?.includes('Paper 2')) calcPaper = 2;
    }

    const results = calculateScores(parsedData, calcYear, calcPaper);

    res.json({
      success: true,
      candidateInfo: {
        ...parsedData.candidateInfo,
        examTitle: parsedData.examTitle
      },
      ...results
    });

  } catch (error) {
    console.error('Error parsing response sheet HTML:', error.message);
    res.status(500);
    throw new Error('Failed to parse the provided HTML. Make sure you copied the correct page source.');
  }
}));

export default router;
