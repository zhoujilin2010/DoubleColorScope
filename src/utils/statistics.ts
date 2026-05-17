import type { LotteryDraw, EnhancedDraw } from '../types/lottery';
import { getCombinationRank, TOTAL_RED_COMBOS } from './combinationRank';

export function getRepeatCount(a: number[], b: number[]): number {
  const setB = new Set(b);
  return a.filter(x => setB.has(x)).length;
}

export function getRedSum(reds: number[]): number {
  return reds.reduce((s, x) => s + x, 0);
}

export function getOddEvenCount(reds: number[]): { odd: number; even: number } {
  const odd = reds.filter(x => x % 2 === 1).length;
  return { odd, even: 6 - odd };
}

export function getBigSmallCount(reds: number[]): { big: number; small: number } {
  const small = reds.filter(x => x <= 16).length;
  return { big: 6 - small, small };
}

export function getZoneCounts(reds: number[]): [number, number, number] {
  const z1 = reds.filter(x => x >= 1 && x <= 11).length;
  const z2 = reds.filter(x => x >= 12 && x <= 22).length;
  const z3 = reds.filter(x => x >= 23 && x <= 33).length;
  return [z1, z2, z3];
}

export function toVector33(reds: number[]): number[] {
  const vec = new Array(33).fill(0);
  for (const r of reds) vec[r - 1] = 1;
  return vec;
}

export function enhanceDraws(draws: LotteryDraw[]): EnhancedDraw[] {
  const enhanced: EnhancedDraw[] = [];
  for (let i = 0; i < draws.length; i++) {
    const d = draws[i];
    const sorted = [...d.reds].sort((a, b) => a - b);
    const rank = getCombinationRank(sorted);
    const sum = getRedSum(sorted);
    const { odd: oddCount, even: evenCount } = getOddEvenCount(sorted);
    const { big: bigCount, small: smallCount } = getBigSmallCount(sorted);
    const zoneCounts = getZoneCounts(sorted);
    const vector33 = toVector33(sorted);
    const prevReds = i > 0 ? [...draws[i - 1].reds].sort((a, b) => a - b) : sorted;
    const repeatWithPrev = getRepeatCount(sorted, prevReds);
    const distanceWithPrev = 6 - repeatWithPrev;

    enhanced.push({
      ...d,
      reds: sorted,
      rank,
      percentile: rank / TOTAL_RED_COMBOS,
      sum,
      oddCount,
      evenCount,
      bigCount,
      smallCount,
      zoneCounts,
      repeatWithPrev: i === 0 ? 0 : repeatWithPrev,
      distanceWithPrev: i === 0 ? 0 : distanceWithPrev,
      vector33,
    });
  }
  return enhanced;
}

export function computeAppData(draws: EnhancedDraw[]): {
  totalDraws: number;
  uniqueCombos: number;
  coverage: number;
  avgRepeat: number;
  avgDistance: number;
  totalSpace: number;
  fullSpace: number;
} {
  const ranks = new Set(draws.map(d => d.rank));
  const repeats = draws.slice(1).map(d => d.repeatWithPrev);
  return {
    totalDraws: draws.length,
    uniqueCombos: ranks.size,
    coverage: ranks.size / TOTAL_RED_COMBOS,
    avgRepeat: repeats.reduce((s, r) => s + r, 0) / repeats.length,
    avgDistance: 6 - repeats.reduce((s, r) => s + r, 0) / repeats.length,
    totalSpace: TOTAL_RED_COMBOS,
    fullSpace: TOTAL_RED_COMBOS * 16,
  };
}
