import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import type { EnhancedDraw, LotteryType } from '../types/lottery';
import { LOTTERY_CONFIGS } from '../types/lottery';
import { computeAppData } from '../utils/statistics';

interface AppContextType {
  allData: EnhancedDraw[];
  appData: ReturnType<typeof computeAppData>;
  filteredData: EnhancedDraw[];
  selectedIssue: string | null;
  setSelectedIssue: (issue: string | null) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  years: string[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lotteryType: LotteryType;
  setLotteryType: (type: LotteryType) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Cache loaded data per lottery type
const dataCache: Partial<Record<LotteryType, EnhancedDraw[]>> = {};

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<EnhancedDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [lotteryType, setLotteryType] = useState<LotteryType>('ssq');

  const loadData = useCallback(async (type: LotteryType) => {
    if (dataCache[type]) {
      setAllData(dataCache[type]!);
      setLoading(false);
      return;
    }
    setLoading(true);
    const config = LOTTERY_CONFIGS[type];
    try {
      const res = await fetch(config.dataFile);
      const data: EnhancedDraw[] = await res.json();
      dataCache[type] = data;
      setAllData(data);
    } catch (e) {
      console.error(`Failed to load ${type} data:`, e);
      setAllData([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(lotteryType);
  }, [lotteryType, loadData]);

  // Reset filters when lottery type changes
  useEffect(() => {
    setSelectedIssue(null);
    setSelectedYear('all');
  }, [lotteryType]);

  const years = useMemo(() => {
    return [...new Set(allData.map(d => d.date.substring(0, 4)))].sort();
  }, [allData]);

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return allData;
    return allData.filter(d => d.date.startsWith(selectedYear));
  }, [allData, selectedYear]);

  const appData = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalDraws: 0, uniqueCombos: 0, coverage: 0, avgRepeat: 0, avgDistance: 0, totalSpace: 0, fullSpace: 0 };
    }
    return computeAppData(filteredData, lotteryType);
  }, [filteredData, lotteryType]);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        allData, appData, filteredData,
        selectedIssue, setSelectedIssue,
        selectedYear, setSelectedYear,
        darkMode, toggleTheme,
        years, currentTab, setCurrentTab,
        lotteryType, setLotteryType,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
