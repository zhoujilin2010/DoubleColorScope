import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EnhancedDraw, LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';

interface Props {
  data: EnhancedDraw[];
  lotteryType: LotteryType;
}

export function MainFreqChart({ data, lotteryType }: Props) {
  const config = LOTTERY_CONFIGS[lotteryType];

  const option = useMemo(() => {
    const freq: number[] = new Array(config.mainRange).fill(0);
    for (const d of data) for (const r of d.mainBalls) freq[r - 1]++;

    const avg = (data.length * config.mainCount) / config.mainRange;

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: Array.from({ length: config.mainRange }, (_, i) => String(i + 1).padStart(2, '0')), axisLabel: { color: '#9CA3AF', fontSize: config.mainRange > 40 ? 8 : 10, rotate: config.mainRange > 40 ? 45 : 0 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [{
        type: 'bar',
        data: freq.map(v => ({
          value: v,
          itemStyle: {
            color: v > avg * 1.1 ? '#EF4444' : v < avg * 0.9 ? '#3B82F6' : '#6B7280',
            borderRadius: [3, 3, 0, 0],
          },
        })),
      }],
    };
  }, [data, config]);

  return <ReactECharts option={option} style={{ height: config.mainRange > 40 ? 360 : 240 }} />;
}

export function SpecialFreqChart({ data, lotteryType }: Props) {
  const config = LOTTERY_CONFIGS[lotteryType];

  const option = useMemo(() => {
    if (config.specialCount === 0) return null;

    // Build frequency per special ball position
    const series: any[] = [];
    const colors = ['#3B82F6', '#8B5CF6'];
    for (let pos = 0; pos < config.specialCount; pos++) {
      const freq: number[] = new Array(config.specialRange).fill(0);
      for (const d of data) {
        if (pos < d.specialBalls.length) {
          freq[d.specialBalls[pos] - 1]++;
        }
      }
      series.push({
        type: 'bar',
        name: `${config.specialLabel}${pos + 1}`,
        data: freq.map(v => ({
          value: v,
          itemStyle: { color: colors[pos], borderRadius: [3, 3, 0, 0] },
        })),
      });
    }

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#E5E7EB', fontSize: 12 } },
      legend: { data: series.map(s => s.name), textStyle: { color: '#9CA3AF', fontSize: 11 }, top: 0 },
      grid: { left: 50, right: 20, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: Array.from({ length: config.specialRange }, (_, i) => String(i + 1).padStart(2, '0')), axisLabel: { color: '#9CA3AF', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
      yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#9CA3AF', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series,
    };
  }, [data, config]);

  if (!option) return null;
  return <ReactECharts option={option} style={{ height: 240 }} />;
}
