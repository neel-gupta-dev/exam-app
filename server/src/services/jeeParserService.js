import * as cheerio from 'cheerio';

/**
 * Parses the JEE Advanced response sheet HTML
 * @param {string} htmlString - Raw HTML from digialm
 * @returns {Object} Parsed response sheet data
 */
export const parseResponseSheet = (htmlString) => {
  const $ = cheerio.load(htmlString);
  
  // Extract Header Info
  const examTitle = $('div.main-info-pnl strong').text().trim();
  const candidateInfo = {};
  
  $('div.main-info-pnl table tbody tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length === 2) {
      const key = $(tds[0]).text().trim();
      const val = $(tds[1]).text().trim();
      candidateInfo[key] = val;
    }
  });

  const sections = [];

  // Iterate over each section (e.g., Math Sec 1)
  $('div.section-cntnr').each((_, sectionEl) => {
    const sectionLabel = $(sectionEl).find('.section-lbl .bold').text().trim();
    if (!sectionLabel) return;
    
    // Parse "Math Sec 1" -> subject="Math", sectionNum="1"
    const parts = sectionLabel.split(' ');
    const subjectShort = parts[0];
    const sectionNum = parseInt(parts[2], 10);
    
    let fullSubject = subjectShort;
    if (subjectShort === 'Math') fullSubject = 'Mathematics';
    if (subjectShort === 'Phy') fullSubject = 'Physics';
    if (subjectShort === 'Chem') fullSubject = 'Chemistry';

    const questions = [];

    // Iterate over each question panel within the section
    $(sectionEl).find('.question-pnl').each((_, qPanel) => {
      const qTbl = $(qPanel).find('table.questionPnlTbl');
      const menuTbl = $(qPanel).find('table.menu-tbl');
      
      const questionData = {
        section: sectionLabel,
        subject: fullSubject
      };

      // Extract from right menu table
      menuTbl.find('tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length === 2) {
          const key = $(tds[0]).text().replace(':', '').trim();
          const value = $(tds[1]).text().trim();
          
          if (key === 'Question Type') questionData.type = value;
          if (key === 'Question ID') questionData.questionId = value;
          if (key === 'Status') questionData.status = value;
        }
      });
      
      // Also look for Chosen Option in the same way (sometimes it's a sibling of tr)
      menuTbl.find('td').each((i, td) => {
        const text = $(td).text().trim();
        if (text === 'Chosen Option :') {
          const val = $(td).next('td').text().trim();
          if (val && val !== '--') {
            questionData.chosenOption = val;
          }
        }
      });

      // Extract SA 'Given Answer' from left questionRowTbl
      const qRowTbl = $(qPanel).find('table.questionRowTbl');
      qRowTbl.find('td').each((i, td) => {
        const text = $(td).text().trim();
        if (text === 'Given Answer :') {
          const val = $(td).next('td').text().trim();
          if (val && val !== '--') {
            questionData.givenAnswer = val;
          }
        }
      });

      questions.push(questionData);
    });

    sections.push({
      name: sectionLabel,
      subject: fullSubject,
      sectionNumber: sectionNum,
      questions
    });
  });

  // Flatten questions list for easier processing later
  const allQuestions = sections.flatMap(s => s.questions);

  return {
    examTitle,
    candidateInfo,
    sections,
    allQuestions
  };
};
