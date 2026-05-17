const CACHE: number[][] = [];

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (!CACHE[n]) CACHE[n] = [];
  if (CACHE[n][k] !== undefined) return CACHE[n][k];
  CACHE[n][k] = comb(n - 1, k - 1) + comb(n - 1, k);
  return CACHE[n][k];
}

export function getCombinationRank(reds: number[]): number {
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

export function getRankFromVector(vec: number[]): number {
  const reds: number[] = [];
  for (let i = 0; i < 33; i++) {
    if (vec[i] === 1) reds.push(i + 1);
  }
  return getCombinationRank(reds);
}

export const TOTAL_RED_COMBOS = 1_107_568;
export const TOTAL_FULL_COMBOS = 17_721_088;
