import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '../models');

const modelsToUpdate = [
  'Blog.js',
  'ChapterList.js',
  'CheatsheetSection.js',
  'Comment.js',
  'Cutoff.js',
  'Deck.js',
  'Doubt.js',
  'Flashcard.js',
  'Follow.js',
  'Note.js',
  'Resource.js',
  'Shortlist.js',
  'StudyMaterial.js',
  'Tenant.js',
  'UpcomingExam.js',
  'User.js',
  'UserCardProgress.js'
];

let updatedCount = 0;

for (const file of modelsToUpdate) {
  const filePath = path.join(modelsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if it already has coreConnection
  if (content.includes('import { coreConnection }') || content.includes('coreConnection.model')) {
    console.log(`Skipping ${file} - already updated`);
    continue;
  }

  // 1. Add import statement at the top
  content = `import { coreConnection } from '../config/db.js';\n` + content;

  // 2. Replace mongoose.model with coreConnection.model
  // We handle different variations: mongoose.models.User || mongoose.model('User', ...)
  
  // Regex to match: mongoose.model('ModelName', schemaName)
  content = content.replace(/mongoose\.model\(([^)]+)\)/g, "coreConnection.model($1)");
  
  // Remove mongoose.models.X || if it exists (since we don't want global models fallback)
  content = content.replace(/mongoose\.models\.[a-zA-Z]+\s*\|\|\s*/g, "");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
  updatedCount++;
}

console.log(`Successfully updated ${updatedCount} models to use coreConnection.`);
