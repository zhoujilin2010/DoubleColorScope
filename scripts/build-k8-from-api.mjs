import fs from 'fs';

// Read API raw data
const rawPath = 'C:/Users/zhou/AppData/Local/Temp/kl8_1000_raw.json';
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

if (raw.resCode !== '000000') {
  console.error('API error:', raw.resCode);
  process.exit(1);
}

console.log(`Loaded ${raw.data.length} raw draws from API`);

// Parse API draws
const draws = raw.data.map(d => ({
  issue: d.issue,
  date: d.openTime,
  balls: d.frontWinningNum.split(' ').map(Number),
}));

console.log(`Parsed ${draws.length} draws, range: ${draws[0].issue} to ${draws[draws.length - 1].issue}`);

// ============ Config ============
const BALL_COUNT = 20;
const BALL_RANGE = 80;
const ZONES = [];
for (let z = 0; z < 8; z++) {
  ZONES.push([z * 10 + 1, (z + 1) * 10]);
}
const MIDPOINT = 40;

// ============ Helpers ============
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

// ============ PCA ============
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

// ============ Process ============
// Sort by issue ascending for sequential processing
const sorted = [...draws].sort((a, b) => a.issue.localeCompare(b.issue));
console.log(`Processing ${sorted.length} draws (ascending)...`);

const enhanced = [];
for (let i = 0; i < sorted.length; i++) {
  const d = sorted[i];
  const ballsSorted = [...d.balls].sort((a, b) => a - b);
  const sum = getSum(ballsSorted);
  const { odd, even } = getOddEvenCount(ballsSorted, BALL_COUNT);
  const { big, small } = getBigSmallCount(ballsSorted, BALL_COUNT, MIDPOINT);
  const zoneCounts = getZoneCounts(ballsSorted, ZONES);
  const vector80 = toVector(ballsSorted, BALL_RANGE);
  const prevMain = i > 0 ? enhanced[i - 1].mainBalls : ballsSorted;
  const repeatWithPrev = i === 0 ? 0 : getRepeatCount(ballsSorted, prevMain);

  enhanced.push({
    issue: d.issue,
    date: d.date,
    mainBalls: ballsSorted,
    specialBalls: [],
    mainCount: BALL_COUNT,
    specialCount: 0,
    rank: 0,
    percentile: 0,
    sum,
    oddCount: odd,
    evenCount: even,
    bigCount: big,
    smallCount: small,
    zoneCounts,
    repeatWithPrev,
    distanceWithPrev: i === 0 ? 0 : BALL_COUNT - repeatWithPrev,
    vector: vector80,
  });
}

// ============ PCA ============
console.log('Computing PCA (80-dim, ~1000 draws)...');
const vectors = enhanced.map(d => d.vector);
const pcaResults = pca(vectors, 2);
for (let i = 0; i < enhanced.length; i++) {
  enhanced[i].pcaX = pcaResults[i][0];
  enhanced[i].pcaY = pcaResults[i][1];
}

// Sort by issue descending for display
enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

// ============ Write ============
const outPath = 'D:/dev/DoubleColorScope/public/data/k8-enhanced.json';
fs.writeFileSync(outPath, JSON.stringify(enhanced), 'utf-8');

const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev);
const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(0);

console.log('');
console.log(`Done! ${enhanced.length} draws written to k8-enhanced.json`);
console.log(`  Latest: ${enhanced[0].issue} (${enhanced[0].date})`);
console.log(`  Earliest: ${enhanced[enhanced.length - 1].issue} (${enhanced[enhanced.length - 1].date})`);
console.log(`  Avg repeat between consecutive: ${avgRepeat.toFixed(2)} of ${BALL_COUNT}`);
console.log(`  Avg distance: ${(BALL_COUNT - avgRepeat).toFixed(2)}`);
console.log(`  File size: ${sizeKB} KB`);
