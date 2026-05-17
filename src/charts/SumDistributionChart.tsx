import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
}

export default function SumDistributionChart({ data }: Props) {
  const option = useMemo(() => {
    const sums = data.map(d => d.sum);
    const min = Math.min(...sums);
    const max = Math.max(...sums);
    const binCount = 30;
    const binSize = Math.ceil((max - min) / binCount);

    const bins: { label: string; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binSize;
      const hi = lo + binSize;
      bins.push({ label: `${lo}`, count: 0 });
    }
    for (const s of sums) {
      const idx = Math.min(Math.floor((s - min) / binSize), binCount - 1);
      bins[idx].count++;
    }

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
          return `<div>和值区间 ${bins[p.dataIndex].label}：<span style="color:#8B5CF6;font-weight:bold">${bins[p.dataIndex].count} 期</span></div>`;
        },
      },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: bins.map((_, i) => (i % 5 === 0 ? bins[i].label : '')),
        axisLabel: { color: '#9CA3AF', fontSize: 9, rotate: 45 },
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
        data: bins.map(b => ({
          value: b.count,
          itemStyle: {
            color: '#8B5CF6',
            borderRadius: [2, 2, 0, 0],
          },
        })),
      }],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: 260 }} />;
}
