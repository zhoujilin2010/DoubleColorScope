import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
}

export function RedFreqChart({ data }: Props) {
  const option = useMemo(() => {
    const freq: number[] = new Array(33).fill(0);
    for (const d of data) for (const r of d.reds) freq[r - 1]++;

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: Array.from({ length: 33 }, (_, i) => String(i + 1).padStart(2, '0')), axisLabel: { color: '#9CA3AF', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: freq.map(v => ({ value: v, itemStyle: { color: v > (data.length * 6 / 33) * 1.1 ? '#EF4444' : v < (data.length * 6 / 33) * 0.9 ? '#3B82F6' : '#6B7280', borderRadius: [3, 3, 0, 0] } })),
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: 240 }} />;
}

export function BlueFreqChart({ data }: Props) {
  const option = useMemo(() => {
    const freq: number[] = new Array(16).fill(0);
    for (const d of data) freq[d.blue - 1]++;

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0')), axisLabel: { color: '#9CA3AF', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: freq.map(v => ({ value: v, itemStyle: { color: '#2563EB', borderRadius: [3, 3, 0, 0] } })),
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: 240 }} />;
}
