import fs from 'fs';

// ============ K8 Config ============
const BALL_COUNT = 20;
const BALL_RANGE = 80;
// C(80,20) ≈ 3.5e18 — too large for JS number, skip rank for K8

// ============ Helpers ============
function getRepeatCount(a, b) {
  const setB = new Set(b);
  return a.filter(x => setB.has(x)).length;
}

function getSum(nums) { return nums.reduce((s, x) => s + x, 0); }

function getOddEvenCount(nums, total) {
  const odd = nums.filter(x => x % 2 === 1).length;
  return { odd, even: total - odd };
}

function getBigSmallCount(nums, total, midpoint) {
  const small = nums.filter(x => x <= midpoint).length;
  return { big: total - small, small };
}

function getZoneCounts(nums, zones) {
  const counts = new Array(zones.length).fill(0);
  for (const x of nums) {
    for (let z = 0; z < zones.length; z++) {
      if (x >= zones[z][0] && x <= zones[z][1]) {
        counts[z]++;
        break;
      }
    }
  }
  return counts;
}

function toVector(nums, length) {
  const vec = new Array(length).fill(0);
  for (const r of nums) vec[r - 1] = 1;
  return vec;
}

// ============ PCA ============
function transpose(m) { return m[0].map((_, i) => m.map(row => row[i])); }
function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function scale(v, s) { return v.map(x => x * s); }
function norm(v) { return Math.sqrt(v.reduce((s, x) => s + x * x, 0)); }

function meanMatrixCols(m) {
  return Array.from({ length: m[0].length }, (_, j) => {
    let sum = 0;
    for (let i = 0; i < m.length; i++) sum += m[i][j];
    return sum / m.length;
  });
}

function centerMatrix(m) {
  const means = meanMatrixCols(m);
  return m.map(row => row.map((v, j) => v - means[j]));
}

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
    residual = residual.map(row => {
      const proj = dot(row, eigenvector);
      return row.map((v, j) => v - proj * eigenvector[j]);
    });
  }
  return centered.map(row => eigenvectors.map(ev => dot(row, ev)));
}

// ============ Main ============
// K8: 8 zones of 10 numbers each
const ZONES = [];
for (let z = 0; z < 8; z++) {
  ZONES.push([z * 10 + 1, (z + 1) * 10]);
}
const MIDPOINT = 40; // 1-40 small, 41-80 big

console.log('Loading K8 CSV...');
const csvPath = 'D:/QQball/k8_932期_20260426_164748.csv';
const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');

const draws = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  const balls = [];
  for (let j = 2; j <= 21; j++) {
    balls.push(parseInt(cols[j]));
  }
  draws.push({
    issue: cols[0],
    date: cols[1],
    balls,
  });
}

// Sort by issue ascending for sequential processing
draws.sort((a, b) => a.issue.localeCompare(b.issue));

console.log(`Enhancing ${draws.length} draws...`);
const enhanced = [];
for (let i = 0; i < draws.length; i++) {
  const d = draws[i];
  const sorted = [...d.balls].sort((a, b) => a - b);
  const sum = getSum(sorted);
  const { odd, even } = getOddEvenCount(sorted, BALL_COUNT);
  const { big, small } = getBigSmallCount(sorted, BALL_COUNT, MIDPOINT);
  const zoneCounts = getZoneCounts(sorted, ZONES);
  const vector80 = toVector(sorted, BALL_RANGE);
  const prevMain = i > 0 ? enhanced[i - 1].mainBalls : sorted;
  const repeatWithPrev = i === 0 ? 0 : getRepeatCount(sorted, prevMain);

  enhanced.push({
    issue: d.issue,
    date: d.date,
    mainBalls: sorted,
    specialBalls: [],
    mainCount: BALL_COUNT,
    specialCount: 0,
    rank: 0, // K8 combination space too large, rank N/A
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

console.log('Computing PCA (80-dim, this may take a minute)...');
const vectors = enhanced.map(d => d.vector);
const pcaResults = pca(vectors, 2);
for (let i = 0; i < enhanced.length; i++) {
  enhanced[i].pcaX = pcaResults[i][0];
  enhanced[i].pcaY = pcaResults[i][1];
}

// Sort by issue descending for display
enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev);

console.log('Writing K8 enhanced data...');
fs.writeFileSync(
  'D:/dev/DoubleColorScope/public/data/k8-enhanced.json',
  JSON.stringify(enhanced),
  'utf-8'
);

const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
console.log(`Done! ${enhanced.length} draws written.`);
console.log(`  Avg repeat: ${avgRepeat.toFixed(2)}`);
console.log(`  Avg distance: ${(BALL_COUNT - avgRepeat).toFixed(2)}`);
console.log(`  File size: ${(fs.statSync('D:/dev/DoubleColorScope/public/data/k8-enhanced.json').size / 1024).toFixed(0)} KB`);
