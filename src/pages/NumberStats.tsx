import { useApp } from '../context/AppContext';
import ChartCard from '../components/ChartCard';
import { RedFreqChart, BlueFreqChart } from '../charts/FreqCharts';
import RedHeatmapChart from '../charts/RedHeatmapChart';
import SumDistributionChart from '../charts/SumDistributionChart';
import { OddEvenChart, BigSmallChart, ZoneChart } from '../charts/RatioCharts';

export default function NumberStats() {
  const { filteredData } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="红球出现频率">
          <RedFreqChart data={filteredData} />
        </ChartCard>
        <ChartCard title="蓝球出现频率">
          <BlueFreqChart data={filteredData} />
        </ChartCard>
      </div>

      <ChartCard title="红球号码热力图（年份 × 号码）">
        <RedHeatmapChart data={filteredData} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="和值分布">
          <SumDistributionChart data={filteredData} />
        </ChartCard>
        <ChartCard title="奇偶比分布">
          <OddEvenChart data={filteredData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="大小比分布">
          <BigSmallChart data={filteredData} />
        </ChartCard>
        <ChartCard title="三区分布">
          <ZoneChart data={filteredData} />
        </ChartCard>
      </div>
    </div>
  );
}
