import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LOTTERY_CONFIGS } from '../types/lottery';
import ChartCard from '../components/ChartCard';
import RepeatCountChart from '../charts/RepeatCountChart';
import DistanceChart from '../charts/DistanceChart';
import PcaScatterChart from '../charts/PcaScatterChart';

export default function CombinationAnalysis() {
  const { filteredData, selectedIssue, setSelectedIssue, lotteryType } = useApp();
  const config = LOTTERY_CONFIGS[lotteryType];
  const hasRank = config.totalMainCombos > 0;

  const repeatCombos = useMemo(() => {
    if (!hasRank) return [];
    const seen = new Map<number, string[]>();
    for (const d of filteredData) {
      const prev = seen.get(d.rank) || [];
      prev.push(d.issue);
      seen.set(d.rank, prev);
    }
    return [...seen.entries()].filter(([, issues]) => issues.length > 1).slice(0, 20);
  }, [filteredData, hasRank]);

  return (
    <div className="space-y-6">
      <ChartCard title="PCA 二维降维组合散点图">
        <PcaScatterChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} lotteryType={lotteryType} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="相邻期距离与重号">
          <DistanceChart data={filteredData} selectedIssue={selectedIssue} onSelect={setSelectedIssue} lotteryType={lotteryType} />
        </ChartCard>
        <ChartCard title="重号数量分布">
          <RepeatCountChart data={filteredData} lotteryType={lotteryType} />
        </ChartCard>
      </div>

      {repeatCombos.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">重复出现的组合</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {repeatCombos.map(([rank, issues]) => (
              <button
                key={rank}
                onClick={() => setSelectedIssue(issues[0])}
                className="flex items-center justify-between bg-bg-primary rounded-lg px-4 py-2 hover:bg-bg-hover transition-colors text-left"
              >
                <span className="text-gray-300 text-sm font-mono">编号 {rank.toLocaleString()}</span>
                <span className="text-yellow-400 text-xs">出现 {issues.length} 次</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
