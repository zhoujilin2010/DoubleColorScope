# DoubleColorScope V1 Design Spec

## Overview

双色球组合空间可视化分析平台。将双色球开奖数据从"单号视角"转换为"组合空间视角"，通过多种可视化图表观察历史开奖组合的分布、距离、密度与结构特征。

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Charts**: Apache ECharts (brush/group for cross-chart linking)
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: react-router (4 tabs)
- **Data**: Static JSON (3000 mock draws for demo)
- **PCA**: Pure TypeScript frontend implementation

## Layout

**方案 B**: Two-column layout — main chart area (left, ~75%) + fixed detail panel (right, ~25%).

Top navbar: project title, year filter, theme toggle (dark/light, default dark).

## Pages (4 Tabs)

| Tab | Charts |
|-----|--------|
| Dashboard | Metric cards (6), Rank Trend, Space Histogram, Distance Chart, Repeat Chart, PCA Scatter |
| Combination | Rank details, percentile, repeat detection, adjacent distance |
| Number Stats | Red freq, Blue freq, Heatmap, Sum distribution, Odd/Even, Big/Small, Zone distribution |
| Data Table | Full draw list with search, sort, CSV export |

## V1 Chart List (10 items)

1. Metric cards: total draws, space size, coverage rate, avg repeat, avg distance, unique combos
2. Rank trend: line + scatter, zoom/pan, year filter, blue-ball colored points
3. Space histogram: configurable bins (50/100/200)
4. Distance chart: line/bar, adjacent draw distance
5. Repeat count distribution: bar chart, color-coded by count
6. PCA 2D scatter: 33-dim → 2-dim projection, ~3000 points
7. Red ball heatmap: 1-33 × time periods
8. Sum distribution histogram
9. Odd/Even + Big/Small + Zone distribution (small multiples)
10. Detail panel: shows selected draw info, synced across all charts

## Cross-Chart Linking

- ECharts `group` + `connect()` for automatic tooltip/highlight sync
- React Context for `selectedIssue` state, shared across all chart components
- Click any chart point → detail panel updates + all charts highlight

## Data Model

```ts
interface LotteryDraw {
  issue: string; date: string; reds: number[]; blue: number;
}
interface EnhancedDraw extends LotteryDraw {
  rank: number; percentile: number; sum: number;
  oddEven: [number, number]; bigSmall: [number, number];
  zones: [number, number, number]; repeatWithPrev: number;
  distanceWithPrev: number; vector33: number[]; pcaX?: number; pcaY?: number;
}
```

## Color Scheme (Dark Theme)

Background: #0B1020, Card: #111827, Primary blue: #3B82F6
Red ball: #EF4444, Blue ball: #2563EB, Accent purple: #8B5CF6, Highlight: #FACC15
Text: #E5E7EB, Secondary text: #9CA3AF, Grid: rgba(255,255,255,0.08)

## Performance

- First load < 3s, chart switch < 500ms, filter response < 800ms
- All computation done once at load, cached in React Context
- 3000 data points for demo (real data ~3000 draws)

## Out of Scope (V1)

- Real data auto-update
- t-SNE / UMAP (PCA only)
- User accounts
- Backend API
- Mobile-first design (desktop-first)
