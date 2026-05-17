import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { EnhancedDraw } from '../types/lottery';
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
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<EnhancedDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Load pre-computed enhanced data from JSON
  useEffect(() => {
    fetch('/data/ssq-enhanced.json')
      .then(res => res.json())
      .then((data: EnhancedDraw[]) => {
        setAllData(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: try raw data and compute on the fly
        fetch('/data/ssq-history.json')
          .then(res => res.json())
          .then(async (rawData) => {
            const { enhanceDraws } = await import('../utils/statistics');
            const { applyPcaToDraws } = await import('../utils/pca');
            const enhanced = enhanceDraws(rawData);
            const vectors = enhanced.map((d: EnhancedDraw) => d.vector33);
            const pcaResults = applyPcaToDraws(vectors);
            for (let i = 0; i < enhanced.length; i++) {
              enhanced[i].pcaX = pcaResults[i].x;
              enhanced[i].pcaY = pcaResults[i].y;
            }
            setAllData(enhanced);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

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
    return computeAppData(filteredData);
  }, [filteredData]);

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
