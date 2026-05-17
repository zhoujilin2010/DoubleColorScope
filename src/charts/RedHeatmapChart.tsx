import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
}

export default function RedHeatmapChart({ data }: Props) {
  const option = useMemo(() => {
    const years = [...new Set(data.map(d => d.date.substring(0, 4)))].sort();
    const heatData: [number, number, number][] = [];

    for (const year of years) {
      const yearData = data.filter(d => d.date.startsWith(year));
      const freq: number[] = new Array(33).fill(0);
      for (const d of yearData) {
        for (const r of d.reds) freq[r - 1]++;
      }
      for (let num = 0; num < 33; num++) {
        heatData.push([num, years.indexOf(year), freq[num]]);
      }
    }

    const maxVal = Math.max(...heatData.map(d => d[2]));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#E5E7EB', fontSize: 12 },
        formatter: (params: any) => {
          const [num, yearIdx, count] = params.data;
          return `
            <div style="font-weight:bold">号码 ${String(num + 1).padStart(2, '0')}</div>
            <div>年份：${years[yearIdx]}</div>
            <div>出现：<span style="color:#FACC15;font-weight:bold">${count} 次</span></div>
          `;
        },
      },
      grid: { left: 60, right: 30, top: 10, bottom: 40 },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 33 }, (_, i) => String(i + 1).padStart(2, '0')),
        name: '红球号码',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: 9 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
        splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] } },
      },
      yAxis: {
        type: 'category',
        data: years,
        name: '年份',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        textStyle: { color: '#9CA3AF', fontSize: 10 },
        inRange: { color: ['#0B1020', '#1E3A5F', '#2563EB', '#60A5FA', '#93C5FD'] },
      },
      series: [{
        type: 'heatmap',
        data: heatData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.5)' },
        },
      }],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: 340 }} />;
}
