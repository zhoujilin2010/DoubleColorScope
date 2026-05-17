import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  selectedIssue: string | null;
  onSelect: (issue: string) => void;
}

export default function PcaScatterChart({ data, selectedIssue, onSelect }: Props) {
  const option = useMemo(() => {
    const valid = data.filter(d => d.pcaX !== undefined && d.pcaY !== undefined);
    const pData = valid.map(d => {
      const hue = ((d.blue - 1) / 15) * 240;
      return {
        value: [d.pcaX!, d.pcaY!],
        issue: d.issue,
        date: d.date,
        reds: d.reds,
        blue: d.blue,
        rank: d.rank,
        itemStyle: {
          color: `hsl(${hue}, 65%, 55%)`,
          borderColor: selectedIssue === d.issue ? '#FACC15' : 'rgba(255,255,255,0.2)',
          borderWidth: selectedIssue === d.issue ? 2 : 0.3,
          shadowBlur: selectedIssue === d.issue ? 10 : 0,
          shadowColor: '#FACC15',
        },
        symbolSize: selectedIssue === d.issue ? 14 : 6,
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#E5E7EB', fontSize: 12 },
        formatter: (params: any) => {
          const d = valid[params.dataIndex];
          if (!d) return '';
          return `
            <div style="font-weight:bold;margin-bottom:4px">${d.issue} | ${d.date}</div>
            <div>红球：${d.reds.join(' ')}</div>
            <div>蓝球：<span style="color:#2563EB">${String(d.blue).padStart(2, '0')}</span></div>
            <div>PCA：(${d.pcaX!.toFixed(2)}, ${d.pcaY!.toFixed(2)})</div>
            <div>组合编号：${d.rank.toLocaleString()}</div>
          `;
        },
      },
      grid: { left: 60, right: 20, top: 10, bottom: 40 },
      xAxis: {
        type: 'value',
        name: 'PC1',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      yAxis: {
        type: 'value',
        name: 'PC2',
        nameTextStyle: { color: '#9CA3AF', fontSize: 11 },
        axisLabel: { color: '#9CA3AF', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', bottom: 10, height: 20, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(17,24,39,0.8)' },
      ],
      series: [{
        type: 'scatter',
        data: pData,
        emphasis: {
          scale: 2,
          itemStyle: { shadowBlur: 12, shadowColor: '#FACC15', borderColor: '#FACC15', borderWidth: 2 },
        },
      }],
    };
  }, [data, selectedIssue]);

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      const valid = data.filter(d => d.pcaX !== undefined && d.pcaY !== undefined);
      if (params.dataIndex !== undefined && valid[params.dataIndex]) {
        onSelect(valid[params.dataIndex].issue);
      }
    },
  }), [data, onSelect]);

  return <ReactECharts option={option} style={{ height: 380 }} onEvents={onEvents} />;
}
