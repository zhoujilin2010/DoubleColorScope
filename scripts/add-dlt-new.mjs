// Add new DLT draws to the existing CSV and regenerate enhanced JSON
import fs from 'fs';

// New DLT draws from 26045 to 26053
const newDraws = [
  { issue: '26045', date: '2026-04-28(一)', fronts: [1, 15, 21, 26, 33], backs: [4, 7] },
  { issue: '26046', date: '2026-04-30(三)', fronts: [1, 13, 18, 27, 33], backs: [4, 7] },
  { issue: '26047', date: '2026-05-02(六)', fronts: [9, 20, 21, 23, 28], backs: [6, 11] },
  { issue: '26048', date: '2026-05-04(一)', fronts: [11, 17, 20, 23, 35], backs: [1, 10] },
  { issue: '26049', date: '2026-05-06(三)', fronts: [1, 6, 14, 15, 17], backs: [2, 3] },
  { issue: '26050', date: '2026-05-09(六)', fronts: [6, 10, 14, 23, 33], backs: [8, 10] },
  { issue: '26051', date: '2026-05-11(一)', fronts: [13, 18, 28, 32, 33], backs: [2, 11] },
  { issue: '26052', date: '2026-05-13(三)', fronts: [2, 3, 20, 28, 33], backs: [2, 12] },
  { issue: '26053', date: '2026-05-16(六)', fronts: [2, 9, 14, 20, 31], backs: [5, 9] },
];

// Read existing CSV and prepend new lines
const csvPath = 'D:/QQball/dlt_1000期_20260426_164748.csv';
let csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const header = lines[0];

// Build new CSV lines
const newLines = newDraws.map(d => {
  const fronts = d.fronts.map(n => String(n).padStart(2, '0')).join(',');
  const backs = d.backs.map(n => String(n).padStart(2, '0')).join(',');
  return `${d.issue},${d.date},${fronts},${backs}`;
});

// Insert new lines after header (before existing data, since newest first)
const updatedCsv = [header, ...newLines, ...lines.slice(1)].join('\n');
fs.writeFileSync(csvPath, updatedCsv, 'utf-8');
console.log(`Added ${newDraws.length} new DLT draws to CSV. Total: ${lines.length + newDraws.length - 1} draws.`);

// Now regenerate the enhanced JSON
console.log('Regenerating DLT enhanced data...');

// (Reuse the same logic from build-dlt-data.mjs)
const FRONT_COUNT = 5;
const FRONT_RANGE = 35;
const BACK_COUNT = 2;
const BACK_RANGE = 12;
const TOTAL_FRONT_COMBOS = 324_632;

const CACHE = [];
function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (!CACHE[n]) CACHE[n] = [];
  if (CACHE[n][k] !== undefined) return CACHE[n][k];
  CACHE[n][k] = comb(n - 1, k - 1) + comb(n - 1, k);
  return CACHE[n][k];
}

function getCombinationRank(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  let rank = 0;
  for (let i = 0; i < FRONT_COUNT; i++) {
    const prev = i === 0 ? 0 : sorted[i - 1];
    for (let j = prev + 1; j < sorted[i]; j++) {
      rank += comb(FRONT_RANGE - j, FRONT_COUNT - i - 1);
    }
  }
  return rank + 1;
}

function getRepeatCount(a, b) { const setB = new Set(b); return a.filter(x => setB.has(x)).length; }
function getSum(nums) { return nums.reduce((s, x) => s + x, 0); }
function getOddEvenCount(nums, total) { const odd = nums.filter(x => x % 2 === 1).length; return { odd, even: total - odd }; }
function getBigSmallCount(nums, total, midpoint) { const small = nums.filter(x => x <= midpoint).length; return { big: total - small, small }; }
function getZoneCounts(nums, zones) {
  const counts = new Array(zones.length).fill(0);
  for (const x of nums) for (let z = 0; z < zones.length; z++) if (x >= zones[z][0] && x <= zones[z][1]) { counts[z]++; break; }
  return counts;
}
function toVector(nums, length) { const vec = new Array(length).fill(0); for (const r of nums) vec[r - 1] = 1; return vec; }

// PCA functions (simplified - load existing PCA and only compute for new)
function transpose(m) { return m[0].map((_, i) => m.map(row => row[i])); }
function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function scale(v, s) { return v.map(x => x * s); }
function norm(v) { return Math.sqrt(v.reduce((s, x) => s + x * x, 0)); }
function meanMatrixCols(m) { return Array.from({ length: m[0].length }, (_, j) => { let sum = 0; for (let i = 0; i < m.length; i++) sum += m[i][j]; return sum / m.length; }); }
function centerMatrix(m) { const means = meanMatrixCols(m); return m.map(row => row.map((v, j) => v - means[j])); }
function powerIteration(A, iterations = 50) {
  const n = A.length;
  let v = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
  for (let iter = 0; iter < iterations; iter++) {
    const Av = A.map(row => dot(row, v));
    const nrm = norm(Av);
    if (nrm < 1e-10) break;
    v = scale(Av, 1 / nrm);
  }
  const Av = A.map(row => dot(row, v));
  return { eigenvalue: dot(v, Av), eigenvector: v };
}
function pca(data, components = 2) {
  if (data.length === 0) return [];
  const centered = centerMatrix(data);
  const eigenvectors = [];
  let residual = centered;
  for (let c = 0; c < components; c++) {
    const covMat = transpose(residual).map((_, i) =>
      transpose(residual).map((_, j) => {
        let sum = 0;
        for (let k = 0; k < residual.length; k++) sum += residual[k][i] * residual[k][j];
        return sum / (residual.length - 1);
      })
    );
    const { eigenvector } = powerIteration(covMat, 50);
    eigenvectors.push(eigenvector);
    residual = residual.map(row => { const proj = dot(row, eigenvector); return row.map((v, j) => v - proj * eigenvector[j]); });
  }
  return centered.map(row => eigenvectors.map(ev => dot(row, ev)));
}

const ZONES = [[1, 12], [13, 24], [25, 35]];
const MIDPOINT = 17;

// Re-read updated CSV
const updatedCsv2 = fs.readFileSync(csvPath, 'utf-8');
const allLines = updatedCsv2.trim().split('\n');
const draws = [];
for (let i = 1; i < allLines.length; i++) {
  const cols = allLines[i].split(',');
  draws.push({
    issue: cols[0],
    date: cols[1],
    fronts: [parseInt(cols[2]), parseInt(cols[3]), parseInt(cols[4]), parseInt(cols[5]), parseInt(cols[6])],
    backs: [parseInt(cols[7]), parseInt(cols[8])],
  });
}
draws.sort((a, b) => a.issue.localeCompare(b.issue));

console.log(`Processing ${draws.length} total DLT draws...`);
const enhanced = [];
for (let i = 0; i < draws.length; i++) {
  const d = draws[i];
  const sortedFront = [...d.fronts].sort((a, b) => a - b);
  const sortedBack = [...d.backs].sort((a, b) => a - b);
  const rank = getCombinationRank(sortedFront);
  const sum = getSum(sortedFront);
  const { odd, even } = getOddEvenCount(sortedFront, FRONT_COUNT);
  const { big, small } = getBigSmallCount(sortedFront, FRONT_COUNT, MIDPOINT);
  const zoneCounts = getZoneCounts(sortedFront, ZONES);
  const vector35 = toVector(sortedFront, FRONT_RANGE);
  const prevMain = i > 0 ? enhanced[i - 1].mainBalls : sortedFront;
  const repeatWithPrev = i === 0 ? 0 : getRepeatCount(sortedFront, prevMain);

  enhanced.push({
    issue: d.issue,
    date: d.date,
    mainBalls: sortedFront,
    specialBalls: sortedBack,
    mainCount: FRONT_COUNT,
    specialCount: BACK_COUNT,
    rank,
    percentile: rank / TOTAL_FRONT_COMBOS,
    sum,
    oddCount: odd,
    evenCount: even,
    bigCount: big,
    smallCount: small,
    zoneCounts,
    repeatWithPrev,
    distanceWithPrev: i === 0 ? 0 : FRONT_COUNT - repeatWithPrev,
    vector: vector35,
  });
}

console.log('Computing PCA...');
const vectors = enhanced.map(d => d.vector);
const pcaResults = pca(vectors, 2);
for (let i = 0; i < enhanced.length; i++) {
  enhanced[i].pcaX = pcaResults[i][0];
  enhanced[i].pcaY = pcaResults[i][1];
}

enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

fs.writeFileSync('D:/dev/DoubleColorScope/public/data/dlt-enhanced.json', JSON.stringify(enhanced), 'utf-8');

const ranks = new Set(enhanced.map(d => d.rank));
const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev);
const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
console.log(`Done! ${enhanced.length} draws written.`);
console.log(`  Unique combos: ${ranks.size} / ${TOTAL_FRONT_COMBOS}`);
console.log(`  Avg repeat: ${avgRepeat.toFixed(2)}`);
console.log(`  Latest draw: ${enhanced[0].issue} ${enhanced[0].date}`);
