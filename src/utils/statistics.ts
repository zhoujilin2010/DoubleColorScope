import type { EnhancedDraw, LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';

export function getRepeatCount(a: number[], b: number[]): number {
  const setB = new Set(b);
  return a.filter(x => setB.has(x)).length;
}

export function getMainSum(balls: number[]): number {
  return balls.reduce((s, x) => s + x, 0);
}

export function getOddEvenCount(balls: number[], total: number): { odd: number; even: number } {
  const odd = balls.filter(x => x % 2 === 1).length;
  return { odd, even: total - odd };
}

export function computeAppData(
  draws: EnhancedDraw[],
  lotteryType: LotteryType
): {
  totalDraws: number;
  uniqueCombos: number;
  coverage: number;
  avgRepeat: number;
  avgDistance: number;
  totalSpace: number;
  fullSpace: number;
} {
  const config = LOTTERY_CONFIGS[lotteryType];
  const ranks = new Set(draws.map(d => d.rank));
  const repeats = draws.slice(1).map(d => d.repeatWithPrev);
  const totalSpace = config.totalMainCombos || 0;
  const fullSpace = config.totalFullCombos || 0;
  return {
    totalDraws: draws.length,
    uniqueCombos: config.totalMainCombos > 0 ? ranks.size : draws.length,
    coverage: config.totalMainCombos > 0 ? ranks.size / config.totalMainCombos : 0,
    avgRepeat: repeats.length > 0 ? repeats.reduce((s, r) => s + r, 0) / repeats.length : 0,
    avgDistance: repeats.length > 0
      ? repeats.reduce((s, r) => s + (config.mainCount - r), 0) / repeats.length
      : 0,
    totalSpace,
    fullSpace,
  };
}
