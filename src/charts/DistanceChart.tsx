import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  selectedIssue: string | null;
  onSelect: (issue: string) => void;
}

export default function DistanceChart({ data, selectedIssue, onSelect }: Props) {
  const option = useMemo(() => {
    const filtered = data.slice(1);
    const xData = filtered.map(d => d.issue);
    const distData = filtered.map(d => d.distanceWithPrev);
    const repeatData = filtered.map(d => d.repeatWithPrev);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#E5E7EB', fontSize: 12 },
      },
      legend: {
        data: ['距离', '重号数'],
        textStyle: { color: '#9CA3AF', fontSize: 11 },
        top: 0,
      },
      grid: { left: 50, right: 20, top: 35, bottom: 40 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { color: '#9CA3AF', fontSize: 10, interval: Math.floor(xData.length / 10), rotate: 45 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '距离',
          min: 0,
          max: 6,
          axisLabel: { color: '#9CA3AF', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(17,24,39,0.8)' },
      ],
      series: [
        {
          name: '距离',
          type: 'bar',
          data: distData,
          itemStyle: {
            color: (p: any) => {
              const v = distData[p.dataIndex];
              if (v <= 2) return '#34D399';
              if (v <= 4) return '#FBBF24';
              return '#EF4444';
            },
            borderRadius: [2, 2, 0, 0],
          },
        },
        {
          name: '重号数',
          type: 'line',
          data: repeatData,
          lineStyle: { color: '#8B5CF6', width: 2 },
          symbol: 'none',
          smooth: true,
        },
      ],
    };
  }, [data]);

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      if (params.dataIndex !== undefined && data[params.dataIndex + 1]) {
        onSelect(data[params.dataIndex + 1].issue);
      }
    },
  }), [data, onSelect]);

  return <ReactECharts option={option} style={{ height: 300 }} onEvents={onEvents} />;
}
