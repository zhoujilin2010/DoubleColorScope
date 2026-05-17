import { useApp } from '../context/AppContext';
import { LOTTERY_CONFIGS } from '../types/lottery';
import ChartCard from '../components/ChartCard';
import { MainFreqChart, SpecialFreqChart } from '../charts/FreqCharts';
import MainHeatmapChart from '../charts/RedHeatmapChart';
import SumDistributionChart from '../charts/SumDistributionChart';
import { OddEvenChart, BigSmallChart, ZoneChart } from '../charts/RatioCharts';

export default function NumberStats() {
  const { filteredData, lotteryType } = useApp();
  const config = LOTTERY_CONFIGS[lotteryType];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={`${config.mainLabel}出现频率`}>
          <MainFreqChart data={filteredData} lotteryType={lotteryType} />
        </ChartCard>
        {config.specialCount > 0 ? (
          <ChartCard title={`${config.specialLabel}出现频率（按位置分开）`}>
            <SpecialFreqChart data={filteredData} lotteryType={lotteryType} />
          </ChartCard>
        ) : (
          <ChartCard title="奇偶比分布">
            <OddEvenChart data={filteredData} />
          </ChartCard>
        )}
      </div>

      <ChartCard title={`${config.mainLabel}号码热力图（年份 × 号码）`}>
        <MainHeatmapChart data={filteredData} lotteryType={lotteryType} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="和值分布">
          <SumDistributionChart data={filteredData} />
        </ChartCard>
        {config.specialCount > 0 && (
          <ChartCard title="奇偶比分布">
            <OddEvenChart data={filteredData} />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="大小比分布">
          <BigSmallChart data={filteredData} />
        </ChartCard>
        <ChartCard title={config.zones.length <= 4 ? '分区分布' : '八区分布'}>
          <ZoneChart data={filteredData} />
        </ChartCard>
      </div>
    </div>
  );
}
