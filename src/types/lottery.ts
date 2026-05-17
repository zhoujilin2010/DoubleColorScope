export interface EnhancedDraw {
  issue: string;
  date: string;
  mainBalls: number[];
  specialBalls: number[];
  mainCount: number;
  specialCount: number;
  rank: number;
  percentile: number;
  sum: number;
  oddCount: number;
  evenCount: number;
  bigCount: number;
  smallCount: number;
  zoneCounts: number[];
  repeatWithPrev: number;
  distanceWithPrev: number;
  vector: number[];
  pcaX?: number;
  pcaY?: number;
}

export interface LotteryConfig {
  key: LotteryType;
  name: string;
  shortName: string;
  mainLabel: string;
  specialLabel: string;
  mainRange: number;
  specialRange: number;
  mainCount: number;
  specialCount: number;
  zones: { name: string; range: [number, number] }[];
  bigSmallMidpoint: number;
  totalMainCombos: number;
  totalFullCombos: number;
  vectorLength: number;
  dataFile: string;
  colorClass: string;
}

export type LotteryType = 'ssq' | 'dlt' | 'k8';

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  ssq: {
    key: 'ssq',
    name: '双色球',
    shortName: 'SSQ',
    mainLabel: '红球',
    specialLabel: '蓝球',
    mainRange: 33,
    specialRange: 16,
    mainCount: 6,
    specialCount: 1,
    zones: [
      { name: '一区 1-11', range: [1, 11] },
      { name: '二区 12-22', range: [12, 22] },
      { name: '三区 23-33', range: [23, 33] },
    ],
    bigSmallMidpoint: 16,
    totalMainCombos: 1_107_568,
    totalFullCombos: 17_721_088,
    vectorLength: 33,
    dataFile: '/data/ssq-enhanced.json',
    colorClass: 'from-red-500 to-blue-600',
  },
  dlt: {
    key: 'dlt',
    name: '大乐透',
    shortName: 'DLT',
    mainLabel: '前区',
    specialLabel: '后区',
    mainRange: 35,
    specialRange: 12,
    mainCount: 5,
    specialCount: 2,
    zones: [
      { name: '一区 1-12', range: [1, 12] },
      { name: '二区 13-24', range: [13, 24] },
      { name: '三区 25-35', range: [25, 35] },
    ],
    bigSmallMidpoint: 17,
    totalMainCombos: 324_632,
    totalFullCombos: 324_632 * 66, // C(12,2) = 66
    vectorLength: 35,
    dataFile: '/data/dlt-enhanced.json',
    colorClass: 'from-amber-500 to-orange-600',
  },
  k8: {
    key: 'k8',
    name: '快乐8',
    shortName: 'K8',
    mainLabel: '号码',
    specialLabel: '',
    mainRange: 80,
    specialRange: 0,
    mainCount: 20,
    specialCount: 0,
    zones: [
      { name: '一区 1-10', range: [1, 10] },
      { name: '二区 11-20', range: [11, 20] },
      { name: '三区 21-30', range: [21, 30] },
      { name: '四区 31-40', range: [31, 40] },
      { name: '五区 41-50', range: [41, 50] },
      { name: '六区 51-60', range: [51, 60] },
      { name: '七区 61-70', range: [61, 70] },
      { name: '八区 71-80', range: [71, 80] },
    ],
    bigSmallMidpoint: 40,
    totalMainCombos: 0, // Too large, N/A
    totalFullCombos: 0,
    vectorLength: 80,
    dataFile: '/data/k8-enhanced.json',
    colorClass: 'from-emerald-500 to-teal-600',
  },
};
