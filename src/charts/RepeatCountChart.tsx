import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
}

export default function RepeatCountChart({ data }: Props) {
  const option = useMemo(() => {
    const counts = new Array(7).fill(0);
    for (let i = 1; i < data.length; i++) {
      counts[data[i].repeatWithPrev]++;
    }

    const colorMap = [
      'rgba(156,163,175,0.6)',
      '#3B82F6',
      '#3B82F6',
      '#F97316',
      '#EF4444',
      '#EF4444',
      '#EF4444',
    ];

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
          const pct = ((counts[p.dataIndex] / (data.length - 1)) * 100).toFixed(2);
          return `<div>重号 ${p.dataIndex} 个：<span style="font-weight:bold">${counts[p.dataIndex]} 次</span> (${pct}%)</div>`;
        },
      },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['0', '1', '2', '3', '4', '5', '6'],
        name: '重号数量',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      },
      yAxis: {
        type: 'value',
        name: '出现次数',
        axisLabel: { color: '#9CA3AF', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      series: [{
        type: 'bar',
        data: counts.map((c, i) => ({
          value: c,
          itemStyle: { color: colorMap[i], borderRadius: [4, 4, 0, 0] },
        })),
        label: {
          show: true,
          position: 'top',
          color: '#9CA3AF',
          fontSize: 10,
        },
      }],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: 260 }} />;
}
