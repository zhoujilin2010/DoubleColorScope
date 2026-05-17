import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  selectedIssue: string | null;
  onSelect: (issue: string) => void;
}

export default function RankHistogramChart({ data, selectedIssue, onSelect }: Props) {
  const [bins, setBins] = useState(50);

  const option = useMemo(() => {
    const sums = data.map(d => d.sum);
    const min = Math.min(...sums);
    const max = Math.max(...sums);
    const binSize = Math.ceil((max - min) / bins) || 1;
    const binData: { start: number; end: number; count: number }[] = [];

    for (let i = 0; i < bins; i++) {
      binData.push({
        start: min + i * binSize,
        end: min + (i + 1) * binSize - 1,
        count: 0,
      });
    }
    for (const s of sums) {
      const idx = Math.min(Math.floor((s - min) / binSize), bins - 1);
      binData[idx].count++;
    }

    const xData = binData.map(b => `${b.start}`);
    const yData = binData.map(b => b.count);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#E5E7EB', fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          if (!p) return '';
          const b = binData[p.dataIndex];
          return `
            <div style="font-weight:bold">和值区间 ${b.start} – ${b.end}</div>
            <div>落入数量：<span style="color:#3B82F6;font-weight:bold">${b.count}</span></div>
            <div>占比：${((b.count / data.length) * 100).toFixed(2)}%</div>
          `;
        },
      },
      grid: { left: 50, right: 20, top: 10, bottom: 40 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { color: '#9CA3AF', fontSize: 9, rotate: 45, interval: Math.floor(bins / 10) },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      },
      yAxis: {
        type: 'value',
        name: '期数',
        axisLabel: { color: '#9CA3AF', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      series: [{
        type: 'bar',
        data: yData,
        itemStyle: {
          color: '#3B82F6',
          borderRadius: [2, 2, 0, 0],
        },
        emphasis: {
          itemStyle: { color: '#60A5FA' },
        },
      }],
    };
  }, [data, bins]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        {[30, 50, 100].map(b => (
          <button
            key={b}
            onClick={() => setBins(b)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              bins === b ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {b} 桶
          </button>
        ))}
      </div>
      <ReactECharts option={option} style={{ height: 280 }} />
    </div>
  );
}
