import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  selectedIssue: string | null;
  onSelect: (issue: string) => void;
}

export default function RankTrendChart({ data, selectedIssue, onSelect }: Props) {
  const option = useMemo(() => {
    const xData = data.map(d => d.issue);
    const yData = data.map(d => d.rank);
    const colors = data.map(d => {
      const hue = ((d.blue - 1) / 15) * 240;
      return `hsl(${hue}, 70%, 55%)`;
    });

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
          const d = data[p.dataIndex];
          return `
            <div style="font-weight:bold;margin-bottom:4px">${d.issue} | ${d.date}</div>
            <div>红球：${d.reds.join(' ')}</div>
            <div>蓝球：<span style="color:#2563EB;font-weight:bold">${String(d.blue).padStart(2, '0')}</span></div>
            <div>组合编号：<span style="color:#FACC15">${d.rank.toLocaleString()}</span></div>
            <div>百分位：${(d.percentile * 100).toFixed(2)}%</div>
          `;
        },
      },
      grid: { left: 70, right: 20, top: 20, bottom: 50 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
        axisLabel: {
          color: '#9CA3AF',
          fontSize: 10,
          interval: Math.floor(data.length / 12),
          rotate: 45,
        },
        nameTextStyle: { color: '#9CA3AF' },
      },
      yAxis: {
        type: 'value',
        name: '组合编号',
        min: 1,
        max: 1_107_568,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10, formatter: (v: number) => (v / 1_000_000).toFixed(1) + 'M' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(17,24,39,0.8)', dataBackground: { lineStyle: { color: '#3B82F6' }, areaStyle: { color: 'rgba(59,130,246,0.1)' } }, selectedDataBackground: { lineStyle: { color: '#8B5CF6' } } },
      ],
      series: [
        {
          type: 'line',
          data: yData,
          lineStyle: { color: '#3B82F6', width: 1.5 },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: (p: any) => colors[p.dataIndex],
            borderColor: 'rgba(255,255,255,0.4)',
            borderWidth: 0.5,
          },
          emphasis: {
            itemStyle: { borderWidth: 2, borderColor: '#FACC15', shadowBlur: 12, shadowColor: '#FACC15' },
            scale: 2,
          },
          markLine: data.some(d => d.issue === selectedIssue)
            ? {
                silent: true,
                symbol: 'none',
                lineStyle: { color: '#FACC15', type: 'dashed', width: 1 },
                data: [{ xAxis: selectedIssue || '' }],
              }
            : undefined,
        },
      ],
    };
  }, [data, selectedIssue]);

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      if (params.dataIndex !== undefined && data[params.dataIndex]) {
        onSelect(data[params.dataIndex].issue);
      }
    },
  }), [data, onSelect]);

  return <ReactECharts option={option} style={{ height: 360 }} onEvents={onEvents} />;
}
