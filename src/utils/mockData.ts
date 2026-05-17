import type { EnhancedDraw } from '../types/lottery';
import { getCombinationRank } from './combinationRank';
import { getMainSum, getRepeatCount } from './statistics';
import { applyPcaToDraws } from './pca';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMainBalls(count: number, range: number): number[] {
  const nums: number[] = [];
  while (nums.length < count) {
    const n = randInt(1, range);
    if (!nums.includes(n)) nums.push(n);
  }
  return nums.sort((a, b) => a - b);
}

function formatIssue(year: number, idx: number): string {
  return `${year}${String(idx + 1).padStart(3, '0')}`;
}

function formatDate(year: number, idx: number): string {
  const base = new Date(year, 0, 2);
  const d = new Date(base.getTime() + idx * 3 * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

export function generateEnhancedMockData(totalDraws = 3000): EnhancedDraw[] {
  const drawsPerYear = Math.ceil(totalDraws / 20);
  const enhanced: EnhancedDraw[] = [];
  let idx = 0;

  for (let year = 2005; year < 2025 && enhanced.length < totalDraws; year++) {
    const count = Math.min(drawsPerYear, totalDraws - enhanced.length);
    for (let i = 0; i < count; i++) {
      const mainBalls = generateMainBalls(6, 33);
      const specialBalls = [randInt(1, 16)];
      const sorted = [...mainBalls].sort((a, b) => a - b);
      const rank = getCombinationRank(sorted, 'ssq');
      const sum = getMainSum(sorted);
      const odd = sorted.filter(x => x % 2 === 1).length;
      const small = sorted.filter(x => x <= 16).length;
      const zones = [
        sorted.filter(x => x >= 1 && x <= 11).length,
        sorted.filter(x => x >= 12 && x <= 22).length,
        sorted.filter(x => x >= 23 && x <= 33).length,
      ];
      const vector = new Array(33).fill(0);
      for (const r of sorted) vector[r - 1] = 1;

      const prevMain = idx > 0 ? enhanced[idx - 1].mainBalls : sorted;
      const repeatWithPrev = idx === 0 ? 0 : getRepeatCount(sorted, prevMain);

      enhanced.push({
        issue: formatIssue(year, i),
        date: formatDate(year, i),
        mainBalls: sorted,
        specialBalls,
        mainCount: 6,
        specialCount: 1,
        rank,
        percentile: rank / 1_107_568,
        sum,
        oddCount: odd,
        evenCount: 6 - odd,
        bigCount: 6 - small,
        smallCount: small,
        zoneCounts: zones,
        repeatWithPrev,
        distanceWithPrev: idx === 0 ? 0 : 6 - repeatWithPrev,
        vector,
      });
      idx++;
    }
  }

  const vectors = enhanced.map(d => d.vector);
  const pcaResults = applyPcaToDraws(vectors);
  for (let i = 0; i < enhanced.length; i++) {
    enhanced[i].pcaX = pcaResults[i].x;
    enhanced[i].pcaY = pcaResults[i].y;
  }
  return enhanced;
}
