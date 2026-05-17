import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw, LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  lotteryType: LotteryType;
}

const COLOR_MAP = [
  'rgba(156,163,175,0.6)',
  '#3B82F6', '#3B82F6', '#3B82F6',
  '#F97316', '#F97316', '#F97316',
  '#EF4444', '#EF4444', '#EF4444',
  '#EF4444', '#EF4444', '#EF4444',
  '#EF4444', '#EF4444', '#EF4444',
  '#EF4444', '#EF4444', '#EF4444',
  '#EF4444', '#EF4444',
];

export default function RepeatCountChart({ data, lotteryType }: Props) {
  const config = LOTTERY_CONFIGS[lotteryType];

  const option = useMemo(() => {
    const maxRepeats = config.mainCount;
    const counts = new Array(maxRepeats + 1).fill(0);
    for (let i = 1; i < data.length; i++) {
      const r = Math.min(data[i].repeatWithPrev, maxRepeats);
      counts[r]++;
    }

    const xLabels = Array.from({ length: maxRepeats + 1 }, (_, i) => String(i));

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
        data: xLabels,
        name: '重号数量',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: config.mainCount > 10 ? 9 : 11 },
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
          itemStyle: { color: COLOR_MAP[i] || '#EF4444', borderRadius: [4, 4, 0, 0] },
        })),
        label: {
          show: config.mainCount <= 10,
          position: 'top',
          color: '#9CA3AF',
          fontSize: 10,
        },
      }],
    };
  }, [data, config]);

  return <ReactECharts option={option} style={{ height: 260 }} />;
}
