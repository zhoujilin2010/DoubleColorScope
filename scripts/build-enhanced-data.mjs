import fs from 'fs';

// ============ Combination Rank ============
const CACHE = [];
function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (!CACHE[n]) CACHE[n] = [];
  if (CACHE[n][k] !== undefined) return CACHE[n][k];
  CACHE[n][k] = comb(n - 1, k - 1) + comb(n - 1, k);
  return CACHE[n][k];
}

function getCombinationRank(reds) {
  const sorted = [...reds].sort((a, b) => a - b);
  let rank = 0;
  for (let i = 0; i < 6; i++) {
    const prev = i === 0 ? 0 : sorted[i - 1];
    for (let j = prev + 1; j < sorted[i]; j++) {
      rank += comb(33 - j, 6 - i - 1);
    }
  }
  return rank + 1;
}

const TOTAL_RED_COMBOS = 1_107_568;

// ============ Statistics ============
function getRepeatCount(a, b) {
  const setB = new Set(b);
  return a.filter(x => setB.has(x)).length;
}
function getRedSum(reds) { return reds.reduce((s, x) => s + x, 0); }
function getOddEvenCount(reds) {
  const odd = reds.filter(x => x % 2 === 1).length;
  return { odd, even: 6 - odd };
}
function getBigSmallCount(reds) {
  const small = reds.filter(x => x <= 16).length;
  return { big: 6 - small, small };
}
function getZoneCounts(reds) {
  return [
    reds.filter(x => x >= 1 && x <= 11).length,
    reds.filter(x => x >= 12 && x <= 22).length,
    reds.filter(x => x >= 23 && x <= 33).length,
  ];
}
function toVector33(reds) {
  const vec = new Array(33).fill(0);
  for (const r of reds) vec[r - 1] = 1;
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
  let v = Array.from({ length: n }, (_, i) => i === 0 ? 1 : 0);
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
console.log('Loading raw data...');
const raw = JSON.parse(fs.readFileSync('D:/dev/DoubleColorScope/public/data/ssq-history.json', 'utf-8'));

// Sort by issue ascending for sequential processing
raw.sort((a, b) => a.issue.localeCompare(b.issue));

console.log(`Enhancing ${raw.length} draws...`);
const enhanced = [];
for (let i = 0; i < raw.length; i++) {
  const d = raw[i];
  const sorted = [...d.reds].sort((a, b) => a - b);
  const rank = getCombinationRank(sorted);
  const sum = getRedSum(sorted);
  const { odd, even } = getOddEvenCount(sorted);
  const { big, small } = getBigSmallCount(sorted);
  const zoneCounts = getZoneCounts(sorted);
  const vector33 = toVector33(sorted);
  const prevReds = i > 0 ? enhanced[i - 1].reds : sorted;
  const repeatWithPrev = i === 0 ? 0 : getRepeatCount(sorted, prevReds);

  enhanced.push({
    issue: d.issue,
    date: d.date,
    reds: sorted,
    blue: d.blue,
    rank,
    percentile: rank / TOTAL_RED_COMBOS,
    sum,
    oddCount: odd,
    evenCount: even,
    bigCount: big,
    smallCount: small,
    zoneCounts,
    repeatWithPrev,
    distanceWithPrev: i === 0 ? 0 : 6 - repeatWithPrev,
    vector33,
  });
}

console.log('Computing PCA...');
const vectors = enhanced.map(d => d.vector33);
const pcaResults = pca(vectors, 2);
for (let i = 0; i < enhanced.length; i++) {
  enhanced[i].pcaX = pcaResults[i][0];
  enhanced[i].pcaY = pcaResults[i][1];
}

// Sort by issue descending for display
enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

// Compute aggregate metrics
const ranks = new Set(enhanced.map(d => d.rank));
const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev).filter(r => r > 0 || true);

console.log('Writing enhanced data...');
fs.writeFileSync(
  'D:/dev/DoubleColorScope/public/data/ssq-enhanced.json',
  JSON.stringify(enhanced),
  'utf-8'
);

const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
console.log(`Done! ${enhanced.length} draws written.`);
console.log(`  Unique combos: ${ranks.size} / ${TOTAL_RED_COMBOS} (${(ranks.size / TOTAL_RED_COMBOS * 100).toFixed(4)}%)`);
console.log(`  Avg repeat: ${avgRepeat.toFixed(2)}`);
console.log(`  Avg distance: ${(6 - avgRepeat).toFixed(2)}`);
console.log(`  PCA sample: draw[0] = (${enhanced[0].pcaX.toFixed(2)}, ${enhanced[0].pcaY.toFixed(2)})`);
console.log(`  File size: ${(fs.statSync('D:/dev/DoubleColorScope/public/data/ssq-enhanced.json').size / 1024).toFixed(0)} KB`);
