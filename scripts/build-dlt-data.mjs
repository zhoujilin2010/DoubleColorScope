import fs from 'fs';

// ============ DLT Config ============
const FRONT_COUNT = 5;
const FRONT_RANGE = 35;
const BACK_COUNT = 2;
const BACK_RANGE = 12;
const TOTAL_FRONT_COMBOS = 324_632; // C(35,5)

// ============ Combination Rank (front area) ============
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
const ZONES = [[1, 12], [13, 24], [25, 35]];
const MIDPOINT = 17; // 1-17 small, 18-35 big

console.log('Loading DLT CSV...');
const csvPath = 'D:/QQball/dlt_1000期_20260426_164748.csv';
const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const header = lines[0];

const draws = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  draws.push({
    issue: cols[0],
    date: cols[1],
    fronts: [parseInt(cols[2]), parseInt(cols[3]), parseInt(cols[4]), parseInt(cols[5]), parseInt(cols[6])],
    backs: [parseInt(cols[7]), parseInt(cols[8])],
  });
}

// Sort by issue ascending for sequential processing
draws.sort((a, b) => a.issue.localeCompare(b.issue));

console.log(`Enhancing ${draws.length} draws...`);
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

// Sort by issue descending for display
enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

const ranks = new Set(enhanced.map(d => d.rank));
const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev);

console.log('Writing DLT enhanced data...');
fs.writeFileSync(
  'D:/dev/DoubleColorScope/public/data/dlt-enhanced.json',
  JSON.stringify(enhanced),
  'utf-8'
);

const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
console.log(`Done! ${enhanced.length} draws written.`);
console.log(`  Unique front combos: ${ranks.size} / ${TOTAL_FRONT_COMBOS} (${(ranks.size / TOTAL_FRONT_COMBOS * 100).toFixed(4)}%)`);
console.log(`  Avg repeat: ${avgRepeat.toFixed(2)}`);
console.log(`  Avg distance: ${(FRONT_COUNT - avgRepeat).toFixed(2)}`);
console.log(`  File size: ${(fs.statSync('D:/dev/DoubleColorScope/public/data/dlt-enhanced.json').size / 1024).toFixed(0)} KB`);
