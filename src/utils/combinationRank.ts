import type { LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';

const CACHE: number[][] = [];

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (!CACHE[n]) CACHE[n] = [];
  if (CACHE[n][k] !== undefined) return CACHE[n][k];
  CACHE[n][k] = comb(n - 1, k - 1) + comb(n - 1, k);
  return CACHE[n][k];
}

export function getCombinationRank(balls: number[], type: LotteryType): number {
  const config = LOTTERY_CONFIGS[type];
  if (config.totalMainCombos === 0) return 0; // K8 - too large
  const sorted = [...balls].sort((a, b) => a - b);
  let rank = 0;
  for (let i = 0; i < config.mainCount; i++) {
    const prev = i === 0 ? 0 : sorted[i - 1];
    for (let j = prev + 1; j < sorted[i]; j++) {
      rank += comb(config.mainRange - j, config.mainCount - i - 1);
    }
  }
  return rank + 1;
}

export function getTotalCombos(type: LotteryType): number {
  return LOTTERY_CONFIGS[type].totalMainCombos;
}
