interface BallBadgeProps {
  number: number;
  type: 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-lg',
};

export default function BallBadge({ number, type, size = 'md' }: BallBadgeProps) {
  const colorStyle =
    type === 'red'
      ? 'bg-gradient-to-br from-red-400 to-red-700 shadow-red-500/40'
      : 'bg-gradient-to-br from-blue-400 to-blue-700 shadow-blue-500/40';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shadow-lg ${sizeMap[size]} ${colorStyle}`}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
}
