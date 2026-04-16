import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import CheatsheetSection from '../models/CheatsheetSection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const htmlFilePath = path.join(__dirname, '../../../client/frontend/JEE rote stuff.html');

const styleToAccent = (style = '') => {
  if (style.includes('var(--t)')) return 'teal';
  if (style.includes('var(--o)')) return 'orange';
  if (style.includes('var(--p)')) return 'purple';
  return 'yellow';
};

const classToAccent = (cls = '') => {
  // fbox classes: "fbox", "fbox o", "fbox t", "fbox p"
  const parts = cls.split(' ').map(s => s.trim());
  if (parts.includes('t')) return 'teal';
  if (parts.includes('o')) return 'orange';
  if (parts.includes('p')) return 'purple';
  return 'yellow';
};

const parseTable = ($, $table) => {
  const tableData = { headers: [], rows: [] };
  $table.find('tr').each((_, row) => {
    const $row = $(row);
    const isHeader = $row.find('th').length > 0;
    const cells = [];
    $row.find('th, td').each((_, cell) => cells.push($(cell).text().trim()));
    if (isHeader) {
      tableData.headers = cells;
    } else if (cells.some(c => c)) {
      tableData.rows.push(cells);
    }
  });
  return tableData;
};

/**
 * Parse the .acc-body using a simple, flat approach:
 * 1. Find all .fbox → group into one formula block
 * 2. Find all tables → each becomes a table block
 * 3. Find all .mgrid → each becomes a grid block
 */
const parseAccBody = ($, $body) => {
  const blocks = [];

  // --- FORMULA BLOCKS ---
  // Group fboxes, optionally with a preceding .seclbl as label
  const allFboxes = $body.find('.fbox');
  if (allFboxes.length > 0) {
    // Try to group by preceding seclbl
    const groups = {}; // label -> items[]
    let currentLabel = '';

    // Walk all children recursively to maintain order
    const gatherFboxesInOrder = ($el) => {
      $el.children().each((_, child) => {
        const $child = $(child);
        const cls = $child.attr('class') || '';
        if (cls.includes('seclbl')) {
          currentLabel = $child.text().trim();
        } else if (cls.includes('fbox')) {
          if (!groups[currentLabel]) groups[currentLabel] = [];
          groups[currentLabel].push({
            text: $child.text().trim(),
            color: classToAccent(cls),
          });
        } else {
          gatherFboxesInOrder($child);
        }
      });
    };
    gatherFboxesInOrder($body);

    for (const [label, items] of Object.entries(groups)) {
      if (items.length > 0) {
        blocks.push({ type: 'formula', label, items });
      }
    }
  }

  // --- TABLE BLOCKS ---
  $body.find('table').each((_, tbl) => {
    const $tbl = $(tbl);
    // Find the closest preceding seclbl or h3 for a label
    const $prevSeclbl = $tbl.closest('.fcard').find('h3').first();
    const label = $prevSeclbl.length ? $prevSeclbl.text().trim() : '';
    const tableData = parseTable($, $tbl);
    if (tableData.rows.length > 0) {
      blocks.push({ type: 'table', label, items: [tableData] });
    }
  });

  // --- GRID BLOCKS ---
  $body.find('.mgrid').each((_, mg) => {
    const $mg = $(mg);
    const gridItems = [];
    $mg.find('.mc').each((_, mc) => {
      gridItems.push({
        key: $(mc).find('.mk').text().trim(),
        value: $(mc).find('.mv').text().trim(),
      });
    });
    if (gridItems.length > 0) {
      blocks.push({ type: 'grid', label: '', items: [gridItems] });
    }
  });

  return blocks;
};

const runSeeder = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI env var not set. Run: MONGO_URI=... node src/seeds/seedCheatsheet.js');

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected.\n');

    const htmlContent = await fs.readFile(htmlFilePath, 'utf-8');
    const $ = cheerio.load(htmlContent);

    await CheatsheetSection.deleteMany({});
    console.log('🗑  Cleared existing CheatsheetSections.\n');

    const subjects = [
      { panelId: 'chem', subject: 'chemistry' },
      { panelId: 'phys', subject: 'physics' },
      { panelId: 'math', subject: 'mathematics' },
    ];

    let totalCreated = 0;
    let globalOrder = 0;
    const creates = [];

    for (const { panelId, subject } of subjects) {
      console.log(`📚 Parsing ${subject}...`);
      const $panel = $(`#${panelId}`);
      if (!$panel.length) {
        console.warn(`  ⚠️  #${panelId} not found in HTML`);
        continue;
      }

      const $accBlocks = $panel.find('.acc-block');
      console.log(`  Found ${$accBlocks.length} acc-blocks\n`);

      $accBlocks.each((_, block) => {
        const $block = $(block);
        const title = $block.find('.acc-name').text().trim() || 'Untitled';
        const dotStyle = $block.find('.acc-dot').attr('style') || '';
        const accentColor = styleToAccent(dotStyle);
        const $body = $block.find('.acc-body');

        const parsedBlocks = parseAccBody($, $body);

        if (parsedBlocks.length === 0) {
          console.warn(`  ⚠️  "${title}" — 0 blocks parsed, skipping`);
          return;
        }

        creates.push(
          CheatsheetSection.create({
            subject,
            title,
            order: globalOrder++,
            accentColor,
            blocks: parsedBlocks,
            isPublished: true,
          }).then(() => {
            totalCreated++;
            console.log(`  ✅ [${subject}] "${title}" → ${parsedBlocks.length} blocks (accent: ${accentColor})`);
          }).catch(err => {
            console.error(`  ❌ Failed "${title}": ${err.message}`);
          })
        );
      });
    }

    // Wait for all DB writes
    await Promise.all(creates);

    // Verify the data was written
    const verifyCount = await CheatsheetSection.countDocuments();
    console.log(`\n🎉 Done! Inserted ${totalCreated} sections. Verified ${verifyCount} docs in DB.`);

    // Properly close the connection before exiting
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runSeeder();
