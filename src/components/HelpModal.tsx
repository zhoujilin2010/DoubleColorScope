import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: '数据总览指标',
    items: [
      { term: '总开奖期数', desc: '数据集中包含的历史开奖总期数。' },
      { term: '已覆盖组合', desc: '历史上出现过的不同主号码组合数量（快乐8不适用，组合空间过大）。每种彩票的组合空间都极为庞大，已出现的组合数远小于总数。' },
      { term: '覆盖率', desc: '已出现组合数 ÷ 全部可能组合数。由于组合空间极大，即使数千期开奖也只能覆盖极小比例。' },
      { term: '平均重号', desc: '相邻两期之间重复主号码的平均数。数字越低说明相邻期变化越大。' },
      { term: '平均距离', desc: '相邻两期组合之间的平均距离。距离 = 主号码数 − 重号数，数字越大说明相邻两期差异越大。' },
    ],
  },
  {
    title: '核心图表说明',
    items: [
      { term: '走势图', desc: '双色球/大乐透中，每期主号码组合映射为唯一编号；快乐8显示和值走势。横轴为期号，纵轴为编号或和值。颜色按特殊号码或首号变化。可以观察开奖组合在空间中的跳跃轨迹。' },
      { term: '和值分布直方图', desc: '将和值范围切分为若干区间（桶），统计每期开奖落入各区间的次数。理想情况下应大致呈正态分布。' },
      { term: '相邻期组合距离图', desc: '展示相邻两期主号码的"距离"。橙/红色柱表示距离大（变化大），绿色柱表示距离小（相似度高）。叠加的紫色曲线是重号数变化。' },
      { term: '重号数量分布', desc: '统计相邻两期 0~N 个重号各出现多少次。0 重号（浅色）表示两期完全不同，多重号（红/橙色）较为罕见。' },
      { term: 'PCA 二维降维散点图', desc: '使用主成分分析（PCA）将高维向量降至 2 维，每个点代表一期开奖。距离近的点表示组合特征相似，可以观察是否有聚集模式。' },
    ],
  },
  {
    title: '号码统计图表',
    items: [
      { term: '主号码/特殊号码频率', desc: '统计每个号码在历史数据中出现的总次数。蓝色柱表示偏低，红色柱表示偏高，灰色表示接近期望值。大乐透后区按位置（后1、后2）分开统计。' },
      { term: '热力图', desc: '横轴为号码，纵轴为年份，颜色深浅表示出现频次高低。可以观察不同年份各号码的冷热变化趋势。' },
      { term: '和值分布', desc: '每期主号码之和的分布。中间区域出现概率最大，呈钟形曲线。' },
      { term: '奇偶比', desc: '每期奇数与偶数号码的比例分布。理论上应趋向均匀分布。' },
      { term: '大小比', desc: '小号与大号的比例分布。分界点因彩票类型而异。' },
      { term: '分区分布', desc: '各分区的号码数量分布。双色球/大乐透为三区，快乐8为八区。均匀分布最为常见。' },
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
              <li>顶部可切换彩票类型：双色球 / 大乐透 / 快乐8</li>
              <li>可切换年份筛选，所有图表会同步更新</li>
              <li>点击任意图表中的数据点，右侧面板显示该期详情</li>
              <li>走势图和散点图支持鼠标滚轮缩放和拖拽平移</li>
              <li>右上角可切换深色/浅色主题</li>
              <li>数据表页面支持搜索、排序和导出 CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
