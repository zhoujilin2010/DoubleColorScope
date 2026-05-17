import type { LotteryDraw } from '../types/lottery';
import { enhanceDraws } from './statistics';
import { applyPcaToDraws } from './pca';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateReds(): number[] {
  const nums: number[] = [];
  while (nums.length < 6) {
    const n = randInt(1, 33);
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

export function generateMockData(totalDraws = 3000): LotteryDraw[] {
  const drawsPerYear = Math.ceil(totalDraws / 20);
  const draws: LotteryDraw[] = [];
  let idx = 0;

  for (let year = 2005; year < 2025 && draws.length < totalDraws; year++) {
    const count = Math.min(drawsPerYear, totalDraws - draws.length);
    for (let i = 0; i < count; i++) {
      draws.push({
        issue: formatIssue(year, i),
        date: formatDate(year, i),
        reds: generateReds(),
        blue: randInt(1, 16),
      });
      idx++;
    }
  }

  return draws;
}

export function generateEnhancedMockData(totalDraws = 3000) {
  const raw = generateMockData(totalDraws);
  const enhanced = enhanceDraws(raw);
  const vectors = enhanced.map(d => d.vector33);
  const pcaResults = applyPcaToDraws(vectors);
  for (let i = 0; i < enhanced.length; i++) {
    enhanced[i].pcaX = pcaResults[i].x;
    enhanced[i].pcaY = pcaResults[i].y;
  }
  return enhanced;
}
