// Fetch latest K8 data from official zhcw.com API and merge with existing
import fs from 'fs';
import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.zhcw.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://jc.zhcw.com/port/client_json.php?callback=&transactionType=10001001&lotteryId=6&issueCount=2000&startIssue=&endIssue=&startDate=2020-10-28&endDate=${today}&type=2&pageNum=0&pageSize=2000&tt=${Date.now()}`;

  console.log('Fetching from zhcw.com API...');
  const jsonStr = await fetchUrl(url);

  if (!jsonStr || jsonStr.length < 100) {
    console.error('Empty or invalid response:', jsonStr?.substring(0, 200));
    process.exit(1);
  }

  const data = JSON.parse(jsonStr);
  console.log(`API response keys: ${Object.keys(data).join(', ')}`);
  console.log(`Total records: ${data.total}, Pages: ${data.pages}`);

  if (!data.data || data.data.length === 0) {
    console.error('No data in response');
    process.exit(1);
  }

  // Parse draws
  const draws = [];
  for (const item of data.data) {
    const issue = item.issue || '';
    const date = item.openDate || '';
    // 'number' contains 20 ball numbers separated by space
    const numberStr = item.number || '';
    const balls = numberStr.trim().split(/\s+/).map(Number);
    if (balls.length !== 20 || !issue || !date) {
      console.log(`Skipping: ${issue} ${date} balls=${balls.length}`);
      continue;
    }
    draws.push({ issue, date, balls });
  }

  // Sort by issue descending (newest first)
  draws.sort((a, b) => b.issue.localeCompare(a.issue));
  console.log(`Fetched ${draws.length} draws from API.`);
  console.log(`Range: ${draws[0].issue} (${draws[0].date}) to ${draws[draws.length-1].issue} (${draws[draws.length-1].date})`);

  // Write CSV
  const csvPath = 'D:/QQball/k8_full.csv';
  const header = '期号,日期,' + Array.from({length: 20}, (_, i) => `号${i+1}`).join(',');
  const csvLines = draws.map(d => {
    const ballStrs = d.balls.map(n => String(n).padStart(2, '0'));
    return [d.issue, d.date, ...ballStrs].join(',');
  });
  fs.writeFileSync(csvPath, [header, ...csvLines].join('\n'), 'utf-8');
  console.log(`Wrote ${csvPath} (${draws.length} draws)`);

  // Now build enhanced JSON
  const BALL_COUNT = 20;
  const BALL_RANGE = 80;
  const ZONES = [];
  for (let z = 0; z < 8; z++) ZONES.push([z * 10 + 1, (z + 1) * 10]);
  const MIDPOINT = 40;

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

  // Sort ascending for enhanced processing
  const sorted = [...draws].sort((a, b) => a.issue.localeCompare(b.issue));
  console.log(`Processing ${sorted.length} draws (ascending) for enhanced data...`);

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

  console.log('Computing PCA (80-dim)...');
  const vectors = enhanced.map(d => d.vector);
  const pcaResults = pca(vectors, 2);
  for (let i = 0; i < enhanced.length; i++) {
    enhanced[i].pcaX = pcaResults[i][0];
    enhanced[i].pcaY = pcaResults[i][1];
  }

  // Sort descending for display
  enhanced.sort((a, b) => b.issue.localeCompare(a.issue));

  const outPath = 'D:/dev/DoubleColorScope/public/data/k8-enhanced.json';
  fs.writeFileSync(outPath, JSON.stringify(enhanced), 'utf-8');

  const repeats = enhanced.slice(0, -1).map(d => d.repeatWithPrev);
  const avgRepeat = repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0;
  console.log(`\nDone! ${enhanced.length} draws written to k8-enhanced.json`);
  console.log(`  Latest: ${enhanced[0].issue} ${enhanced[0].date}`);
  console.log(`  Earliest: ${enhanced[enhanced.length-1].issue} ${enhanced[enhanced.length-1].date}`);
  console.log(`  Avg repeat: ${avgRepeat.toFixed(2)}`);
  console.log(`  Avg distance: ${(BALL_COUNT - avgRepeat).toFixed(2)}`);
  console.log(`  File size: ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
}

main().catch(err => { console.error(err); process.exit(1); });
