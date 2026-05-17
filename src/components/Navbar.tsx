import { Sun, Moon, HelpCircle } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  onHelp: () => void;
}

const tabs = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'combination', label: '组合分析' },
  { key: 'stats', label: '号码统计' },
  { key: 'table', label: '数据表' },
];

export default function Navbar({
  darkMode,
  onToggleTheme,
  selectedYear,
  onYearChange,
  years,
  currentTab,
  onTabChange,
  onHelp,
}: NavbarProps) {
  return (
    <header className="bg-bg-card border-b border-white/5 sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">DoubleColorScope</h1>
            <p className="text-[10px] text-gray-400 leading-tight">双色球组合空间可视化</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentTab === tab.key
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => onYearChange(e.target.value)}
            className="bg-bg-primary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">全部年份</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={onHelp}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
            title="功能说明"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
