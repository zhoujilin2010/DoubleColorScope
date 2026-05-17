import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LOTTERY_CONFIGS } from '../types/lottery';
import BallBadge from '../components/BallBadge';
import { Download } from 'lucide-react';

export default function DataTablePage() {
  const { filteredData, setSelectedIssue, lotteryType } = useApp();
  const config = LOTTERY_CONFIGS[lotteryType];
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('issue');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    let list = [...filteredData];
    if (search) {
      list = list.filter(d => d.issue.includes(search) || d.date.includes(search));
    }
    list.sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return list;
  }, [filteredData, search, sortKey, sortAsc]);

  const columns = useMemo(() => {
    const cols = ['期号', '日期', config.mainLabel, '和值', '奇偶', '大小', '分区'];
    if (config.specialCount > 0) cols.splice(3, 0, config.specialLabel);
    if (config.totalMainCombos > 0) cols.splice(config.specialCount > 0 ? 4 : 3, 0, '组合编号');
    return cols;
  }, [config]);

  const exportCSV = () => {
    const parts = ['期号', '日期'];
    for (let i = 0; i < config.mainCount; i++) parts.push(`${config.mainLabel}${i + 1}`);
    if (config.specialCount > 0) {
      for (let i = 0; i < config.specialCount; i++) parts.push(`${config.specialLabel}${i + 1}`);
    }
    parts.push('和值', '奇偶比', '大小比', '分区');
    const header = parts.join(',');

    const rows = sorted.map(d => {
      const row = [d.issue, d.date, ...d.mainBalls];
      if (config.specialCount > 0) row.push(...d.specialBalls);
      row.push(d.sum, `${d.oddCount}:${d.evenCount}`, `${d.bigCount}:${d.smallCount}`, d.zoneCounts.join('-'));
      return row.join(',');
    });
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.key}-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="搜索期号或日期..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-bg-card border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-64"
        />
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
        >
          <Download size={14} />
          导出 CSV
        </button>
        <span className="text-gray-400 text-xs ml-auto">{sorted.length} 条记录</span>
      </div>

      <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {columns.map(col => (
                  <th
                    key={col}
                    onClick={() => {
                      if (sortKey === col) setSortAsc(!sortAsc);
                      else { setSortKey(col); setSortAsc(false); }
                    }}
                    className="px-4 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                  >
                    {col} {sortKey === col && (sortAsc ? '↑' : '↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(d => (
                <tr
                  key={d.issue}
                  onClick={() => setSelectedIssue(d.issue)}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-200 font-mono">{d.issue}</td>
                  <td className="px-4 py-3 text-gray-400">{d.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {d.mainBalls.map((n, i) => (
                        <BallBadge key={i} number={n} type="main" lotteryType={lotteryType} size="sm" />
                      ))}
                    </div>
                  </td>
                  {config.specialCount > 0 && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {d.specialBalls.map((n, i) => (
                          <BallBadge key={i} number={n} type="special" lotteryType={lotteryType} size="sm" />
                        ))}
                      </div>
                    </td>
                  )}
                  {config.totalMainCombos > 0 && (
                    <td className="px-4 py-3 text-gray-300 font-mono">{d.rank.toLocaleString()}</td>
                  )}
                  <td className="px-4 py-3 text-gray-300">{d.sum}</td>
                  <td className="px-4 py-3 text-gray-400">{d.oddCount}:{d.evenCount}</td>
                  <td className="px-4 py-3 text-gray-400">{d.bigCount}:{d.smallCount}</td>
                  <td className="px-4 py-3 text-gray-400">{d.zoneCounts.join('-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
