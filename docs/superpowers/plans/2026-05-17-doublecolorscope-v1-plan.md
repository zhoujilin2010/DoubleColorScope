# DoubleColorScope V1 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline task-by-task.

**Goal:** Build a dual-color ball lottery visualization dashboard with 10 chart types, cross-chart linking, deep tech theme.

**Architecture:** Single-page React app with 4 tab routes. ECharts for all visualizations with group/connect for cross-linking. Frontend PCA for 2D scatter. Mock data (~3000 draws).

**Tech Stack:** React 18 + TypeScript + Vite + ECharts + Tailwind CSS + shadcn/ui + react-router

---

### Task 1: Project Scaffolding

- Create Vite + React + TypeScript project
- Install dependencies: echarts, echarts-for-react, tailwindcss, @tailwindcss/vite, react-router-dom, lucide-react, shadcn/ui, class-variance-authority
- Configure Tailwind + shadcn/ui

### Task 2: Types, Utilities & Mock Data

- `src/types/lottery.ts` — all type definitions
- `src/utils/combinationRank.ts` — combinatorial ranking algorithm
- `src/utils/statistics.ts` — repeat, distance, sum, odd/even, big/small, zones
- `src/utils/pca.ts` — PCA dimensionality reduction
- `src/utils/mockData.ts` — generate 3000 mock draws + compute all derived fields

### Task 3: Core UI Components

- `BallBadge.tsx` — red/blue gradient ball badges
- `MetricCard.tsx` — metric display card
- `ChartCard.tsx` — wrapper card for charts
- `DetailPanel.tsx` — right sidebar detail panel
- `Navbar.tsx` — top navigation with theme toggle + year filter

### Task 4: Chart Components (Part 1)

- `RankTrendChart.tsx` — combination rank trend (line + scatter)
- `RankHistogramChart.tsx` — space distribution histogram
- `DistanceChart.tsx` — adjacent draw distance
- `RepeatCountChart.tsx` — repeat count distribution bar

### Task 5: Chart Components (Part 2)

- `PcaScatterChart.tsx` — PCA 2D scatter plot
- `RedHeatmapChart.tsx` — red ball frequency heatmap
- `SumDistributionChart.tsx` — sum distribution histogram
- `OddEvenChart.tsx` — odd/even ratio chart
- `BigSmallChart.tsx` — big/small ratio chart
- `ZoneChart.tsx` — three-zone distribution

### Task 6: Pages & Routing

- `Dashboard.tsx` — main dashboard with metric cards + primary charts
- `CombinationAnalysis.tsx` — combination detail analysis
- `NumberStats.tsx` — number statistics page
- `DataTable.tsx` — raw data table with search/sort/export

### Task 7: App Shell & State Management

- `AppContext.tsx` — global state (selectedIssue, yearFilter, theme, all data)
- `App.tsx` — layout shell with navbar + tabs + detail panel
- `main.tsx` — entry point
- `index.css` — global styles + Tailwind

### Task 8: Polish & Cross-Chart Linking

- Wire up ECharts group/connect for cross-chart tooltip sync
- Wire up chart click → detail panel update
- Year filter applied to all charts
- Dark/light theme toggle
- Responsive adjustments

### Task 9: Build & Verify

- Run `npm run build` — ensure zero errors
- Run `npm run dev` — verify all pages and charts render
- Verify cross-chart linking works
