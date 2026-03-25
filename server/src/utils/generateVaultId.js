/**
 * Generates a unique Vault ID for a student
 * Format: #V[MMYY][ExamCode][TargetYear]-[RandomSuffix]
 * Example: #V0326J28-X7R
 */
export const generateVaultId = (user) => {
  // 1. Registration Date Part (MMYY)
  const date = user.createdAt ? new Date(user.createdAt) : new Date();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const regPart = `${mm}${yy}`;

  // 2. Exam Priority Map (JEE > NEET > BITSAT > UGEE)
  const priorityMap = {
    'JEE': 'J',
    'NEET': 'N',
    'BITSAT': 'B',
    'UGEE': 'U',
    'Other': 'X'
  };

  const exams = user.targetExam || [];
  const priorities = ['JEE', 'NEET', 'BITSAT', 'UGEE'];
  let bestExam = 'Other';
  
  for (const p of priorities) {
    if (exams.includes(p)) {
      bestExam = p;
      break;
    }
  }
  const examCode = priorityMap[bestExam];

  // 3. Target Year (Last 2 digits)
  const targetYear = String(user.targetYear || '25').slice(-2);

  // 4. Random Suffix (3-digit alphanumeric)
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `V${regPart}${examCode}${targetYear}-${randomSuffix}`;
};
