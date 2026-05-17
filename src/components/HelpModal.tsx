import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: '数据总览指标',
    items: [
      { term: '总开奖期数', desc: '数据集中包含的历史开奖总期数。当前共收录 1009 期真实开奖数据。' },
      { term: '已覆盖组合', desc: '历史上出现过的不同红球组合数量。红球共有 1,107,568 种可能组合，已出现的组合数远小于总数，说明组合空间极为稀疏。' },
      { term: '覆盖率', desc: '已出现组合数 ÷ 全部可能组合数。由于双色球组合空间极大（110万+），即使数千期开奖也只能覆盖不到 0.1%。' },
      { term: '平均重号', desc: '相邻两期之间重复红球的平均数。理论上随机情况下期望值约为 1.09 个。' },
      { term: '平均距离', desc: '相邻两期组合之间的平均距离。距离 = 6 − 重号数，数字越大说明相邻两期差异越大。' },
    ],
  },
  {
    title: '核心图表说明',
    items: [
      { term: '组合编号走势图', desc: '每期红球组合映射为 1~1,107,568 之间的唯一编号。横轴为期号/日期，纵轴为组合编号。颜色按蓝球号码变化。可以观察开奖组合在组合空间中的跳跃轨迹。' },
      { term: '组合空间分布直方图', desc: '将组合空间切分为若干区间（桶），统计每期开奖落入各区间的次数。理想情况下应大致均匀分布，如果某个区间异常集中可能反映某种偏差。' },
      { term: '相邻期组合距离图', desc: '展示相邻两期红球组合的"距离"。橙色/红色柱表示距离大（变化大），绿色柱表示距离小（相似度高）。叠加的紫色曲线是重号数变化。' },
      { term: '重号数量分布', desc: '统计相邻两期 0~6 个重号各出现多少次。0 重号（浅色）表示两期完全不同，3+ 重号（红/橙色）较为罕见。' },
      { term: 'PCA 二维降维散点图', desc: '使用主成分分析（PCA）将 33 维的红球向量降至 2 维，每个点代表一期开奖。距离近的点表示组合特征相似，可以观察是否有聚集模式。颜色按蓝球号码变化。' },
    ],
  },
  {
    title: '号码统计图表',
    items: [
      { term: '红球/蓝球频率', desc: '统计每个号码在历史数据中出现的总次数。蓝色柱表示偏低，红色柱表示偏高，灰色表示接近期望值。' },
      { term: '热力图', desc: '横轴为 1~33 号红球，纵轴为年份，颜色深浅表示出现频次高低。可以观察不同年份各号码的冷热变化趋势。' },
      { term: '和值分布', desc: '每期 6 个红球之和的分布。和值范围通常在 21~183 之间，中间区域（80~120）出现概率最大。' },
      { term: '奇偶比', desc: '每期奇数红球与偶数红球的比例分布。理论期望为 3:3，实际数据可能有所波动。' },
      { term: '大小比', desc: '小号（1~16）与大号（17~33）的比例分布。理论期望也是 3:3。' },
      { term: '三区分布', desc: '一区（1~11）、二区（12~22）、三区（23~33）的红球数量分布。2-2-2 是最均匀的分布模式。' },
    ],
  },
];

export default function HelpModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70" />
      <div
        className="relative bg-bg-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-bg-card border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">图表功能说明</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-semibold text-blue-400 mb-3">{section.title}</h3>
              <dl className="space-y-3">
                {section.items.map((item, j) => (
                  <div key={j}>
                    <dt className="text-sm font-medium text-gray-200">{item.term}</dt>
                    <dd className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="bg-bg-primary rounded-xl p-4 border border-white/5">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">使用提示</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 顶部可切换年份筛选，所有图表会同步更新</li>
              <li>• 点击任意图表中的数据点，右侧面板显示该期详情</li>
              <li>• 走势图和散点图支持鼠标滚轮缩放和拖拽平移</li>
              <li>• 右上角可切换深色/浅色主题</li>
              <li>• 数据表页面支持搜索、排序和导出 CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
