// Hardcoded Answer Key for JEE Advanced 2026 Paper 1
// We can expand this or move to DB later
const HARDCODED_KEYS = {
  '2026_1': {
    // Mathematics
    '2015962': { type: 'MCQ', answer: 'A' },
    '2015961': { type: 'MCQ', answer: 'D' },
    '2015964': { type: 'MCQ', answer: 'A' },
    '2015963': { type: 'MCQ', answer: 'B' },
    '2015967': { type: 'MSQ', answer: ['B', 'C'] },
    '2015966': { type: 'MSQ', answer: ['C', 'D'] },
    '2015965': { type: 'MSQ', answer: ['B', 'C'] },
    '2015968': { type: 'MSQ', answer: ['B', 'C', 'D'] },
    '20159610': { type: 'SA', answer: 5, tolerance: 0 },
    '20159611': { type: 'SA', answer: 206, tolerance: 0 },
    '2015969': { type: 'SA', answer: 2520, tolerance: 0 },
    '20159612': { type: 'SA', answer: 5, tolerance: 0 },
    '20159615': { type: 'MCQ', answer: 'B' },
    '20159613': { type: 'MCQ', answer: 'C' },
    '20159614': { type: 'MCQ', answer: 'A' },
    '20159616': { type: 'MCQ', answer: 'C' },

    // Physics
    '20159618': { type: 'MCQ', answer: 'D' },
    '20159619': { type: 'MCQ', answer: 'B' },
    '20159620': { type: 'MCQ', answer: 'B' },
    '20159617': { type: 'MCQ', answer: 'D' },
    '20159623': { type: 'MSQ', answer: ['B', 'D'] },
    '20159624': { type: 'MSQ', answer: ['C', 'D'] },
    '20159622': { type: 'MSQ', answer: ['B', 'C'] },
    '20159621': { type: 'MSQ', answer: ['A', 'B', 'C'] },
    '20159628': { type: 'SA', answer: 3, tolerance: 0 },
    '20159627': { type: 'SA', answer: 1.4, tolerance: 0 },
    '20159626': { type: 'SA', answer: 0.33, tolerance: 0 },
    '20159625': { type: 'SA', answer: 3, tolerance: 0 },
    '20159632': { type: 'MCQ', answer: 'B' },
    '20159631': { type: 'MCQ', answer: 'C' },
    '20159629': { type: 'MCQ', answer: 'B' },
    '20159630': { type: 'MCQ', answer: 'D' },

    // Chemistry
    '20159633': { type: 'MCQ', answer: 'A' },
    '20159635': { type: 'MCQ', answer: 'C' },
    '20159636': { type: 'MCQ', answer: 'A' },
    '20159634': { type: 'MCQ', answer: 'C' },
    '20159638': { type: 'MSQ', answer: ['A', 'B', 'C'] },
    '20159640': { type: 'MSQ', answer: ['A', 'B', 'D'] },
    '20159639': { type: 'MSQ', answer: ['A', 'D'] },
    '20159637': { type: 'MSQ', answer: ['A'] },
    '20159644': { type: 'SA', answer: 3, tolerance: 0 },
    '20159643': { type: 'SA', answer: 6, tolerance: 0 },
    '20159641': { type: 'SA', answer: 4, tolerance: 0 },
    '20159642': { type: 'SA', answer: 4, tolerance: 0 },
    '20159645': { type: 'MCQ', answer: 'B' },
    '20159646': { type: 'MCQ', answer: 'A' },
    '20159648': { type: 'MCQ', answer: 'A' },
    '20159647': { type: 'MCQ', answer: 'A' }
  }
};

/**
 * Calculates scores based on parsed responses and answer key
 */
export const calculateScores = (parsedData, year, paper) => {
  const keyMap = HARDCODED_KEYS[`${year}_${paper}`] || {};
  
  const results = {
    totalScore: 0,
    maxScore: 168,
    positiveMarks: 0,
    negativeMarks: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    subjectWise: {
      'Mathematics': { score: 0, max: 56, correct: 0, wrong: 0, unattempted: 0 },
      'Physics': { score: 0, max: 56, correct: 0, wrong: 0, unattempted: 0 },
      'Chemistry': { score: 0, max: 56, correct: 0, wrong: 0, unattempted: 0 },
    },
    sectionWise: {},
    questions: []
  };

  parsedData.allQuestions.forEach(q => {
    // Initialize section stats if not present
    if (!results.sectionWise[q.section]) {
      const typeMax = (q.type === 'MCQ' || q.type === 'SA') ? 12 : 16;
      results.sectionWise[q.section] = {
        name: q.section,
        type: q.type,
        score: 0,
        max: typeMax, // assuming 4 q per section. MCQ=12, MSQ=16, SA=16, MCQ=12 -> 56
        correct: 0,
        wrong: 0,
        unattempted: 0
      };
    }
    
    // Adjust max for MCQ sections since some are 3 marks max, SA/MSQ are 4 marks max
    if(q.type === 'MCQ' && results.sectionWise[q.section].max === 16) {
        results.sectionWise[q.section].max = 12;
    }

    const key = keyMap[q.questionId];
    
    const isAttempted = q.status === 'Answered' || 
                        q.status === 'Answered and Marked For Review' ||
                        q.chosenOption || q.givenAnswer;

    const resultQ = {
      ...q,
      correctAnswer: key ? (Array.isArray(key.answer) ? key.answer.join(',') : key.answer) : null,
      marks: 0,
      isCorrect: false,
      isAttempted: !!isAttempted
    };

    if (!isAttempted) {
      resultQ.evalStatus = 'unattempted';
      results.subjectWise[q.subject].unattempted++;
      results.sectionWise[q.section].unattempted++;
    } else if (!key) {
      // Key missing, treat as unattempted for scoring to be safe
      resultQ.evalStatus = 'key_missing';
      results.subjectWise[q.subject].unattempted++;
      results.sectionWise[q.section].unattempted++;
    } else {
      results.totalAttempted++;
      
      if (q.type === 'MCQ') {
        if (q.chosenOption === key.answer) {
          resultQ.marks = 3;
          resultQ.evalStatus = 'correct';
          resultQ.isCorrect = true;
        } else {
          resultQ.marks = -1;
          resultQ.evalStatus = 'wrong';
        }
      } 
      else if (q.type === 'MSQ') {
        const chosenOptions = q.chosenOption ? q.chosenOption.split(',').map(s=>s.trim()) : [];
        const correctOptions = key.answer;
        
        const hasWrongOption = chosenOptions.some(opt => !correctOptions.includes(opt));
        
        if (hasWrongOption) {
          resultQ.marks = -2;
          resultQ.evalStatus = 'wrong';
        } else {
          // No wrong options selected. Check how many correct options selected.
          if (chosenOptions.length === correctOptions.length) {
            resultQ.marks = 4; // all correct
            resultQ.evalStatus = 'correct';
            resultQ.isCorrect = true;
          } else {
            resultQ.marks = chosenOptions.length; // partial marks = +1 per correct option
            resultQ.evalStatus = 'partial';
            resultQ.isCorrect = true; // count as correct/partial
          }
        }
      }
      else if (q.type === 'SA') {
        const givenVal = parseFloat(q.givenAnswer);
        const correctVal = parseFloat(key.answer);
        const tol = key.tolerance || 0;
        
        if (!isNaN(givenVal) && Math.abs(givenVal - correctVal) <= tol) {
          resultQ.marks = 4;
          resultQ.evalStatus = 'correct';
          resultQ.isCorrect = true;
        } else {
          resultQ.marks = 0; // No negative for SA typically
          resultQ.evalStatus = 'wrong';
        }
      }

      // Aggregate scores
      results.totalScore += resultQ.marks;
      if (resultQ.marks > 0) results.positiveMarks += resultQ.marks;
      if (resultQ.marks < 0) results.negativeMarks += resultQ.marks;
      
      results.subjectWise[q.subject].score += resultQ.marks;
      results.sectionWise[q.section].score += resultQ.marks;
      
      if (resultQ.isCorrect) {
        results.totalCorrect++;
        results.subjectWise[q.subject].correct++;
        results.sectionWise[q.section].correct++;
      } else if (resultQ.evalStatus === 'wrong') {
        results.subjectWise[q.subject].wrong++;
        results.sectionWise[q.section].wrong++;
      }
    }

    results.questions.push(resultQ);
  });

  return results;
};
