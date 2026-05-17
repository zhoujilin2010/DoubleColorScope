import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
}

export function OddEvenChart({ data }: Props) {
  const option = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const d of data) {
      const key = `${d.oddCount}奇${d.evenCount}偶`;
      dist[key] = (dist[key] || 0) + 1;
    }
    const entries = Object.entries(dist).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: entries.map(e => e[0]), axisLabel: { color: '#9CA3AF', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: entries.map(e => ({ value: e[1], itemStyle: { color: '#3B82F6', borderRadius: [3, 3, 0, 0] } })),
        label: { show: true, position: 'top', color: '#9CA3AF', fontSize: 10 },
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: 220 }} />;
}

export function BigSmallChart({ data }: Props) {
  const option = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const d of data) {
      const key = `${d.bigCount}大${d.smallCount}小`;
      dist[key] = (dist[key] || 0) + 1;
    }
    const entries = Object.entries(dist).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: entries.map(e => e[0]), axisLabel: { color: '#9CA3AF', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: entries.map(e => ({ value: e[1], itemStyle: { color: '#8B5CF6', borderRadius: [3, 3, 0, 0] } })),
        label: { show: true, position: 'top', color: '#9CA3AF', fontSize: 10 },
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: 220 }} />;
}

export function ZoneChart({ data }: Props) {
  const option = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const d of data) {
      const key = d.zoneCounts.join('-');
      dist[key] = (dist[key] || 0) + 1;
    }
    const entries = Object.entries(dist).sort((a, b) => {
      const sa = a[0].split('-').reduce((s, x) => s + parseInt(x), 0);
      const sb = b[0].split('-').reduce((s, x) => s + parseInt(x), 0);
      return sa - sb || a[0].localeCompare(b[0]);
    });

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: entries.map(e => e[0]), axisLabel: { color: '#9CA3AF', fontSize: 10, rotate: 45 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: entries.map(e => ({ value: e[1], itemStyle: { color: '#F59E0B', borderRadius: [3, 3, 0, 0] } })),
        label: { show: true, position: 'top', color: '#9CA3AF', fontSize: 10 },
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: 260 }} />;
}
