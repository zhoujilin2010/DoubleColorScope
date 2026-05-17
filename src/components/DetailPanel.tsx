import type { EnhancedDraw } from '../types/lottery';
import BallBadge from './BallBadge';

interface DetailPanelProps {
  draw: EnhancedDraw | null;
}

export default function DetailPanel({ draw }: DetailPanelProps) {
  if (!draw) {
    return (
      <div className="bg-bg-card rounded-xl border border-white/5 p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm text-center">
          点击图表中的任意数据点
          <br />
          查看该期详细信息
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl border border-white/5 p-5 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">开奖详情</h3>

      <div className="text-xs text-gray-400 mb-1">期号</div>
      <div className="text-lg font-bold text-white mb-3">{draw.issue}</div>

      <div className="text-xs text-gray-400 mb-1">开奖日期</div>
      <div className="text-sm text-gray-200 mb-4">{draw.date}</div>

      <div className="text-xs text-gray-400 mb-2">红球</div>
      <div className="flex gap-2 mb-4">
        {draw.reds.map((n, i) => (
          <BallBadge key={i} number={n} type="red" size="sm" />
        ))}
      </div>

      <div className="text-xs text-gray-400 mb-2">蓝球</div>
      <div className="mb-4">
        <BallBadge number={draw.blue} type="blue" size="sm" />
      </div>

      <div className="border-t border-white/5 pt-4 space-y-2">
        <Row label="组合编号" value={draw.rank.toLocaleString()} />
        <Row label="空间百分位" value={`${(draw.percentile * 100).toFixed(4)}%`} />
        <Row label="和值" value={draw.sum.toString()} />
        <Row label="奇偶比" value={`${draw.oddCount}:${draw.evenCount}`} />
        <Row label="大小比" value={`${draw.bigCount}:${draw.smallCount}`} />
        <Row label="三区分布" value={draw.zoneCounts.join('-')} />
        <Row label="与上期重号" value={`${draw.repeatWithPrev} 个`} />
        <Row label="与上期距离" value={`${draw.distanceWithPrev}`} />
        {draw.pcaX !== undefined && (
          <Row
            label="PCA 坐标"
            value={`(${draw.pcaX.toFixed(2)}, ${draw.pcaY!.toFixed(2)})`}
          />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 font-mono">{value}</span>
    </div>
  );
}
