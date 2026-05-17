import type { LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';

interface BallBadgeProps {
  number: number;
  type?: 'main' | 'special';
  lotteryType?: LotteryType;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-lg',
};

const typeColors: Record<LotteryType, { main: string; special: string }> = {
  ssq: { main: 'bg-gradient-to-br from-red-400 to-red-700 shadow-red-500/40', special: 'bg-gradient-to-br from-blue-400 to-blue-700 shadow-blue-500/40' },
  dlt: { main: 'bg-gradient-to-br from-amber-400 to-orange-700 shadow-amber-500/40', special: 'bg-gradient-to-br from-sky-400 to-sky-700 shadow-sky-500/40' },
  k8: { main: 'bg-gradient-to-br from-emerald-400 to-teal-700 shadow-emerald-500/40', special: '' },
};

export default function BallBadge({ number, type = 'main', lotteryType = 'ssq', size = 'md' }: BallBadgeProps) {
  const colors = typeColors[lotteryType];
  const colorStyle = type === 'special' ? colors.special : colors.main;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shadow-lg ${sizeMap[size]} ${colorStyle}`}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
}
