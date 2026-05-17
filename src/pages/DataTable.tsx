import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import BallBadge from '../components/BallBadge';
import { Download } from 'lucide-react';

export default function DataTablePage() {
  const { filteredData, setSelectedIssue } = useApp();
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

  const exportCSV = () => {
    const header = '期号,日期,红1,红2,红3,红4,红5,红6,蓝球,组合编号,和值,奇偶比,大小比,三区';
    const rows = sorted.map(d =>
      [d.issue, d.date, ...d.reds, d.blue, d.rank, d.sum, `${d.oddCount}:${d.evenCount}`, `${d.bigCount}:${d.smallCount}`, d.zoneCounts.join('-')].join(',')
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'double-color-scope-data.csv';
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
                {['期号', '日期', '红球', '蓝球', '组合编号', '和值', '奇偶', '大小', '三区'].map(col => (
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
                    <div className="flex gap-1">
                      {d.reds.map((n, i) => (
                        <BallBadge key={i} number={n} type="red" size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><BallBadge number={d.blue} type="blue" size="sm" /></td>
                  <td className="px-4 py-3 text-gray-300 font-mono">{d.rank.toLocaleString()}</td>
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
