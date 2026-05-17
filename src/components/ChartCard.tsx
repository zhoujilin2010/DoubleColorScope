import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, controls, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-bg-card rounded-xl border border-white/5 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        {controls && <div className="flex items-center gap-2">{controls}</div>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
