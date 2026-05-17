// Download latest K8 data from 917500.cn and regenerate enhanced JSON
// Run: node scripts/update-k8-full.mjs
import https from 'https';
import fs from 'fs';

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 60000,
    }, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading K8 data from data.917500.cn/kl81000_cq_asc.txt ...');
  const text = await download('https://data.917500.cn/kl81000_cq_asc.txt');
  const lines = text.trim().split('\n');
  console.log(`Downloaded ${lines.length} lines`);

  // Parse: issue date ball1...ball20 [sales data...]
  const draws = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 22) { console.log('Short line:', line.substring(0, 60)); continue; }
    const issue = parts[0];
    const date = parts[1];
    const balls = parts.slice(2, 22).map(n => parseInt(n, 10));
    if (balls.some(isNaN)) { console.log(`NaN in balls: ${issue}`); continue; }
    draws.push({ issue, date, balls });
  }

  // Sort desc (newest first)
  draws.sort((a, b) => b.issue.localeCompare(a.issue));
  console.log(`Parsed ${draws.length} draws.`);
  console.log(`Range: ${draws[0].issue} (${draws[0].date}) ~ ${draws[draws.length-1].issue} (${draws[draws.length-1].date})`);

  // Save CSV
  const csvLines = ['期号,日期,' + Array.from({length: 20}, (_, i) => `号${i+1}`).join(',')];
  for (const d of draws) {
    csvLines.push([d.issue, d.date, ...d.balls.map(n => String(n).padStart(2, '0'))].join(','));
  }
  fs.writeFileSync('D:/QQball/k8_full_latest.csv', csvLines.join('\n'), 'utf-8');
  console.log('CSV saved.');

  // Build enhanced JSON (same logic as before)
  const BALL_COUNT = 20, BALL_RANGE = 80, MIDPOINT = 40;
  const ZONES = Array.from({length: 8}, (_, z) => [z * 10 + 1, (z + 1) * 10]);

  const getRepeatCount = (a, b) => { const s = new Set(b); return a.filter(x => s.has(x)).length; };
  const getSum = nums => nums.reduce((s, x) => s + x, 0);
  const getOddEven = (nums, t) => { const o = nums.filter(x => x % 2 === 1).length; return { odd: o, even: t - o }; };
  const getBigSmall = (nums, t, m) => { const s = nums.filter(x => x <= m).length; return { big: t - s, small: s }; };
  const getZones = (nums, zs) => { const c = new Array(zs.length).fill(0); for (const x of nums) for (let z = 0; z < zs.length; z++) if (x >= zs[z][0] && x <= zs[z][1]) { c[z]++; break; } return c; };
  const toVector = (nums, len) => { const v = new Array(len).fill(0); for (const r of nums) v[r - 1] = 1; return v; };

  // PCA
  const transpose = m => m[0].map((_, i) => m.map(row => row[i]));
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const scale = (v, s) => v.map(x => x * s);
  const norm = v => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const meanCols = m => Array.from({length: m[0].length}, (_, j) => { let s = 0; for (let i = 0; i < m.length; i++) s += m[i][j]; return s / m.length; });
  const center = m => { const means = meanCols(m); return m.map(row => row.map((v, j) => v - means[j])); };
  const powerIter = (A, iters = 50) => {
    const n = A.length;
    let v = Array.from({length: n}, (_, i) => i === 0 ? 1 : 0);
    for (let iter = 0; iter < iters; iter++) {
      const Av = A.map(row => dot(row, v));
      const nrm = norm(Av);
      if (nrm < 1e-10) break;
      v = scale(Av, 1 / nrm);
    }
    const Av = A.map(row => dot(row, v));
    return { eigenvector: v };
  };
  const pca = (data, comps = 2) => {
    if (data.length === 0) return [];
    const centered = center(data);
    const evecs = [];
    let residual = centered;
    for (let c = 0; c < comps; c++) {
      const covMat = transpose(residual).map((_, i) =>
        transpose(residual).map((_, j) => {
          let sum = 0;
          for (let k = 0; k < residual.length; k++) sum += residual[k][i] * residual[k][j];
          return sum / (residual.length - 1);
        })
      );
      const { eigenvector } = powerIter(covMat, 50);
      evecs.push(eigenvector);
      residual = residual.map(row => { const p = dot(row, eigenvector); return row.map((v, j) => v - p * eigenvector[j]); });
    }
    return centered.map(row => evecs.map(ev => dot(row, ev)));
  };

  const sorted = [...draws].sort((a, b) => a.issue.localeCompare(b.issue));
  console.log(`Building enhanced data for ${sorted.length} draws...`);
  const enhanced = [];
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    const bSorted = [...d.balls].sort((a, b) => a - b);
    const sum = getSum(bSorted);
    const { odd, even } = getOddEven(bSorted, BALL_COUNT);
    const { big, small } = getBigSmall(bSorted, BALL_COUNT, MIDPOINT);
    const zc = getZones(bSorted, ZONES);
    const vec = toVector(bSorted, BALL_RANGE);
    const prev = i > 0 ? enhanced[i - 1].mainBalls : bSorted;
    const rwp = i === 0 ? 0 : getRepeatCount(bSorted, prev);
    enhanced.push({
      issue: d.issue, date: d.date, mainBalls: bSorted, specialBalls: [],
      mainCount: BALL_COUNT, specialCount: 0, rank: 0, percentile: 0,
      sum, oddCount: odd, evenCount: even, bigCount: big, smallCount: small,
      zoneCounts: zc, repeatWithPrev: rwp,
      distanceWithPrev: i === 0 ? 0 : BALL_COUNT - rwp, vector: vec,
    });
  }

  console.log('Computing PCA (80-dim)...');
  const vecs = enhanced.map(d => d.vector);
  const pcaR = pca(vecs, 2);
  for (let i = 0; i < enhanced.length; i++) {
    enhanced[i].pcaX = pcaR[i][0];
    enhanced[i].pcaY = pcaR[i][1];
  }

  enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

  const outPath = 'D:/dev/DoubleColorScope/public/data/k8-enhanced.json';
  fs.writeFileSync(outPath, JSON.stringify(enhanced), 'utf-8');

  const reps = enhanced.slice(0, -1).map(d => d.repeatWithPrev);
  const avgR = reps.reduce((s, r) => s + r, 0) / reps.length;
  console.log(`\nDone! ${enhanced.length} draws → k8-enhanced.json`);
  console.log(`  Latest:  ${enhanced[0].issue}  ${enhanced[0].date}`);
  console.log(`  Oldest:  ${enhanced[enhanced.length-1].issue}  ${enhanced[enhanced.length-1].date}`);
  console.log(`  Avg repeat: ${avgR.toFixed(2)}, Avg distance: ${(BALL_COUNT - avgR).toFixed(2)}`);
  console.log(`  File: ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
