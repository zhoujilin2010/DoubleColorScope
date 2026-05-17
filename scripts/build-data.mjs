import fs from 'fs';

// Parse CSV: 期号,日期,红1,红2,红3,红4,红5,红6,蓝
const csvPath = 'D:/QQball/ssq_1000期_20260426_164748.csv';
const csvText = fs.readFileSync(csvPath, 'utf-8');
const lines = csvText.trim().split('\n');

const draws = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const dateRaw = parts[1].replace(/\(.\)$/, ''); // Remove weekday suffix
  draws.push({
    issue: parts[0],
    date: dateRaw,
    reds: parts.slice(2, 8).map(Number),
    blue: parseInt(parts[8], 10),
  });
}

// New draws from web search (2026-04-26 to 2026-05-14)
const newDraws = [
  { issue: '26046', date: '2026-04-26', reds: [2, 9, 10, 24, 31, 33], blue: 16 },
  { issue: '26047', date: '2026-04-28', reds: [7, 16, 21, 24, 27, 30], blue: 7 },
  { issue: '26048', date: '2026-04-30', reds: [9, 15, 18, 24, 28, 33], blue: 1 },
  { issue: '26049', date: '2026-05-03', reds: [3, 4, 14, 15, 18, 20], blue: 2 },
  { issue: '26050', date: '2026-05-05', reds: [6, 9, 25, 27, 28, 30], blue: 3 },
  { issue: '26051', date: '2026-05-07', reds: [9, 14, 15, 16, 29, 30], blue: 10 },
  { issue: '26052', date: '2026-05-10', reds: [1, 3, 11, 22, 26, 31], blue: 11 },
  { issue: '26053', date: '2026-05-12', reds: [1, 2, 3, 8, 13, 14], blue: 2 },
  { issue: '26054', date: '2026-05-14', reds: [13, 20, 25, 29, 30, 33], blue: 2 },
];

// Add new draws to the beginning (they're newer than the CSV data)
// The CSV starts with newest first: 26045, 26044, ..., 19084
// New draws 26046-26054 should go BEFORE 26045
const combined = [...newDraws, ...draws];

// Sort by issue descending
combined.sort((a, b) => b.issue.localeCompare(a.issue));

// Write JSON
const outPath = 'D:/dev/DoubleColorScope/public/data/ssq-history.json';
fs.mkdirSync('D:/dev/DoubleColorScope/public/data', { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(combined, null, 2), 'utf-8');

console.log(`Written ${combined.length} draws to ${outPath}`);
console.log(`Range: ${combined[combined.length - 1].issue} (${combined[combined.length - 1].date}) → ${combined[0].issue} (${combined[0].date})`);
