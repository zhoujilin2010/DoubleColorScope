import { useApp } from '../context/AppContext';
import { LOTTERY_CONFIGS } from '../types/lottery';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import RankTrendChart from '../charts/RankTrendChart';
import RankHistogramChart from '../charts/RankHistogramChart';
import DistanceChart from '../charts/DistanceChart';
import RepeatCountChart from '../charts/RepeatCountChart';
import PcaScatterChart from '../charts/PcaScatterChart';

export default function Dashboard() {
  const { appData, filteredData, selectedIssue, setSelectedIssue, lotteryType } = useApp();
  const config = LOTTERY_CONFIGS[lotteryType];
  const hasRank = config.totalMainCombos > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="总开奖期数" value={appData.totalDraws.toLocaleString()} color="blue" />
        {hasRank ? (
          <>
            <MetricCard label="已覆盖组合" value={appData.uniqueCombos.toLocaleString()} color="purple" />
            <MetricCard label="覆盖率" value={`${(appData.coverage * 100).toFixed(4)}%`} color="yellow" />
          </>
        ) : (
          <>
            <MetricCard label="号码范围" value={`1-${config.mainRange}`} color="purple" />
            <MetricCard label="每期号码数" value={`${config.mainCount} 个`} color="yellow" />
          </>
        )}
        <MetricCard label="平均重号" value={appData.avgRepeat.toFixed(2)} color="red" />
        <MetricCard label="平均距离" value={appData.avgDistance.toFixed(2)} color="blue" />
        <MetricCard
          label="组合空间"
          value={hasRank ? (appData.totalSpace / 1_000_000).toFixed(1) + 'M' : 'N/A'}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={hasRank ? '组合编号走势图' : '和值走势图'}>
          <RankTrendChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} lotteryType={lotteryType} />
        </ChartCard>
        <ChartCard title={hasRank ? '组合空间分布直方图' : '和值分布图'}>
          <RankHistogramChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="相邻期组合距离图">
          <DistanceChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} lotteryType={lotteryType} />
        </ChartCard>
        <ChartCard title="重号数量分布">
          <RepeatCountChart data={filteredData} lotteryType={lotteryType} />
        </ChartCard>
      </div>

      <ChartCard title="PCA 二维降维散点图">
        <PcaScatterChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} lotteryType={lotteryType} />
      </ChartCard>
    </div>
  );
}
