import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import DetailPanel from './components/DetailPanel';
import HelpModal from './components/HelpModal';
import Dashboard from './pages/Dashboard';
import CombinationAnalysis from './pages/CombinationAnalysis';
import NumberStats from './pages/NumberStats';
import DataTablePage from './pages/DataTable';
import type { LotteryType } from './types/lottery';
import { LOTTERY_CONFIGS } from './types/lottery';

function LoadingScreen({ lotteryType }: { lotteryType: LotteryType }) {
  const config = LOTTERY_CONFIGS[lotteryType];
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${config.colorClass} flex items-center justify-center animate-pulse`}>
          <span className="text-white font-bold text-xs">{config.shortName}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">DoubleColorScope</h2>
        <p className="text-gray-400 text-sm mb-6">{config.name}组合空间可视化分析平台</p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-4">正在加载数据...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const {
    darkMode, toggleTheme,
    selectedYear, setSelectedYear,
    years, currentTab, setCurrentTab,
    filteredData, selectedIssue, setSelectedIssue,
    lotteryType, setLotteryType,
    loading,
  } = useApp();

  const [helpOpen, setHelpOpen] = useState(false);

  if (loading) return <LoadingScreen lotteryType={lotteryType} />;

  const selectedDraw = selectedIssue
    ? filteredData.find(d => d.issue === selectedIssue) || null
    : null;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-bg-primary text-gray-200">
        <Navbar
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          years={years}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onHelp={() => setHelpOpen(true)}
          lotteryType={lotteryType}
          onLotteryTypeChange={setLotteryType}
        />

        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

        <div className="flex">
          <main className="flex-1 p-6 min-w-0">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'combination' && <CombinationAnalysis />}
            {currentTab === 'stats' && <NumberStats />}
            {currentTab === 'table' && <DataTablePage />}
          </main>

          <aside className="w-80 shrink-0 p-6 pl-0 hidden xl:block">
            <div className="sticky top-20">
              <DetailPanel draw={selectedDraw} lotteryType={lotteryType} />
            </div>
          </aside>
        </div>

        {selectedDraw && (
          <div className="xl:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedIssue(null)}>
            <div
              className="absolute right-0 top-0 w-80 h-full overflow-y-auto p-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedIssue(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              >
                ✕
              </button>
              <DetailPanel draw={selectedDraw} lotteryType={lotteryType} />
            </div>
          </div>
        )}

        <footer className="text-center py-6 text-xs text-gray-500 border-t border-white/5">
          本项目仅用于历史开奖数据的可视化展示与随机性观察，不构成任何投注建议。彩票开奖具有随机性，历史数据不能保证未来开奖结果。
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
