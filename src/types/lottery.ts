export interface LotteryDraw {
  issue: string;
  date: string;
  reds: number[];
  blue: number;
}

export interface EnhancedDraw extends LotteryDraw {
  rank: number;
  percentile: number;
  sum: number;
  oddCount: number;
  evenCount: number;
  bigCount: number;
  smallCount: number;
  zoneCounts: [number, number, number];
  repeatWithPrev: number;
  distanceWithPrev: number;
  vector33: number[];
  pcaX?: number;
  pcaY?: number;
}

export interface AppData {
  draws: EnhancedDraw[];
  totalDraws: number;
  uniqueCombos: number;
  coverage: number;
  avgRepeat: number;
  avgDistance: number;
  totalSpace: number;
  fullSpace: number;
}
