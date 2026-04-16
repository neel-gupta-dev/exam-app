import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import CheatsheetSection from '../models/CheatsheetSection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const htmlFilePath = path.join(__dirname, '../../../client/frontend/JEE rote stuff.html');

/**
 * Helper to determine accent color based on class name or style
 */
const getAccentColor = (el) => {
  const cn = el.attr('class') || '';
  const st = el.attr('style') || '';
  if (cn.includes('fy') || cn.includes('y') || st.includes('var(--y)')) return 'yellow';
  if (cn.includes('fo') || cn.includes('o') || st.includes('var(--o)')) return 'orange';
  if (cn.includes('ft') || cn.includes('t') || st.includes('var(--t)')) return 'teal';
  if (cn.includes('fp') || cn.includes('p') || st.includes('var(--p)')) return 'purple';
  return 'yellow'; // default
};

/**
 * Parse a section block (like fcard or a direct element block)
 */
const parseBlock = ($, el) => {
  const $el = $(el);
  const blockData = { type: 'text', label: '', items: [] };

  // Check if it's an fcard
  if ($el.hasClass('fcard')) {
    const $h3 = $el.find('h3');
    if ($h3.length) {
      blockData.label = $h3.text().trim();
      blockData.accentColor = getAccentColor($h3);
    }

    // Is it a table inside fcard?
    const $tables = $el.find('table');
    if ($tables.length) {
      blockData.type = 'table';
      $tables.each((_, tbl) => {
        const tableData = { headers: [], rows: [] };
        $(tbl).find('tr').each((i, row) => {
          const rowData = [];
          $(row).find('th, td').each((_, cell) => {
            rowData.push($(cell).text().trim());
          });
          if (i === 0 && $(row).find('th').length) {
            tableData.headers = rowData;
          } else {
            tableData.rows.push(rowData);
          }
        });
        blockData.items.push(tableData);
      });
      return blockData;
    }

    // Is it a grid (mgrid) inside fcard?
    const $mgrids = $el.find('.mgrid');
    if ($mgrids.length) {
      blockData.type = 'grid';
      $mgrids.each((_, grid) => {
        const gridItems = [];
        $(grid).find('.mc').each((_, mc) => {
          gridItems.push({
            key: $(mc).find('.mk').text().trim(),
            value: $(mc).find('.mv').text().trim(),
          });
        });
        blockData.items.push(gridItems);
      });
      return blockData;
    }

    // Otherwise, treat fbox/inner text as formulas
    blockData.type = 'formula';
    $el.find('.fbox, .tag-p').each((_, box) => {
      blockData.items.push({ text: $(box).text().trim(), color: getAccentColor($(box)) });
    });
    return blockData;
  }

  // Check direct mgrid (not in fcard)
  if ($el.hasClass('mgrid')) {
     blockData.type = 'grid';
     const gridItems = [];
     $el.find('.mc').each((_, mc) => {
       gridItems.push({
         key: $(mc).find('.mk').text().trim(),
         value: $(mc).find('.mv').text().trim(),
       });
     });
     blockData.items.push(gridItems);
     return blockData;
  }

  // Check direct table
  if ($el.is('table')) {
      blockData.type = 'table';
      const tableData = { headers: [], rows: [] };
      $el.find('tr').each((i, row) => {
        const rowData = [];
        $(row).find('th, td').each((_, cell) => {
          rowData.push($(cell).text().trim());
        });
        if (i === 0 && $(row).find('th').length) {
          tableData.headers = rowData;
        } else {
          tableData.rows.push(rowData);
        }
      });
      blockData.items.push(tableData);
      return blockData;
  }
  
  // Generic formula/text (e.g. solitary fbox)
  if ($el.hasClass('fbox') || $el.hasClass('tag-p') || $el.hasClass('seclbl')) {
     blockData.type = 'formula';
     blockData.items.push({ text: $el.text().trim(), color: getAccentColor($el) });
     return blockData;
  }

  return null; // Ignore unrecognized
};

const runSeeder = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vayl';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected.');

    const htmlContent = await fs.readFile(htmlFilePath, 'utf-8');
    const $ = cheerio.load(htmlContent);

    // Clear existing
    await CheatsheetSection.deleteMany({});
    console.log('Cleared existing CheatsheetSections.');

    const subjects = ['chem', 'phys', 'math'];
    const subjectMap = { chem: 'chemistry', phys: 'physics', math: 'mathematics' };

    let globalOrder = 0;

    for (const sub of subjects) {
      const $accContainer = $(`#${sub}-acc`); // Use accordion layout
      if (!$accContainer.length) continue;

      const $blocks = $accContainer.find('.acc-block');
      
      $blocks.each((_, block) => {
        const title = $(block).find('.acc-name').text().trim();
        const $dot = $(block).find('.acc-dot');
        const accentColor = getAccentColor($dot);

        const newSection = {
            subject: subjectMap[sub],
            title: title || 'Untitled Section',
            order: globalOrder++,
            accentColor: accentColor,
            blocks: [],
            isPublished: true
        };

        const $body = $(block).find('.acc-body');
        
        // Find direct children or top-level elements that form logic blocks
        $body.children().each((_, child) => {
            const parsed = parseBlock($, child);
            if (parsed) {
                newSection.blocks.push(parsed);
            } else {
                // If the child is a wrapper (like g2, g3) iterate its children
                if ($(child).hasClass('g1') || $(child).hasClass('g2') || $(child).hasClass('g3') || $(child).hasClass('g4') || $(child).hasClass('g-wrap')) {
                     $(child).children().each((_, subChild) => {
                          const parsedSub = parseBlock($, subChild);
                          if (parsedSub) newSection.blocks.push(parsedSub);
                     })
                }
            }
        });

        if (newSection.blocks.length > 0) {
           CheatsheetSection.create(newSection);
           console.log(`Created: [${newSection.subject}] ${newSection.title} (${newSection.blocks.length} blocks)`);
        }
      });
    }

    console.log('Cheatsheet Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

runSeeder();
