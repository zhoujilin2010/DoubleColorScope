interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
  green: 'text-green-400',
  default: 'text-gray-200',
};

export default function MetricCard({ label, value, color = 'default' }: MetricCardProps) {
  return (
    <div className="bg-bg-card rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${colorMap[color] || colorMap.default}`}>
        {typeof value === 'number' && !Number.isInteger(value)
          ? value.toFixed(4)
          : value}
      </div>
    </div>
  );
}
