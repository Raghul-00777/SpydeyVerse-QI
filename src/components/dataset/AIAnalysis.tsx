import { AlertCircle, TrendingUp, Info, Lightbulb, Brain, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import type { DatasetSummary, AIInsight, MLRecommendation } from './types';
import GlowCard from '@/components/ui/GlowCard';

interface Props { summary: DatasetSummary; insights: AIInsight[]; recommendations: MLRecommendation[]; }

const insightIcon = { info: Info, warning: AlertCircle, success: TrendingUp, tip: Lightbulb };
const insightStyle = {
  info:    'bg-red-600/8  border-red-500/20  text-red-400',
  warning: 'bg-amber-500/8 border-amber-500/20 text-amber-400',
  success: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400',
  tip:     'bg-violet-500/8 border-violet-500/20 text-violet-400',
};

const taskColor: Record<string, string> = {
  Classification: 'from-red-600 to-rose-600',
  Regression:     'from-amber-500 to-orange-500',
  Clustering:     'from-violet-600 to-purple-600',
  Forecasting:    'from-teal-500 to-emerald-500',
  'Anomaly Detection': 'from-rose-700 to-red-800',
};

export default function AIAnalysis({ summary, insights, recommendations }: Props) {
  const { columns, numericCols, correlation } = summary;

  const numStats = columns.filter(c => c.type === 'number').slice(0, 8);
  const meanData = numStats.map(c => ({ name: c.name.slice(0, 12), mean: c.mean ?? 0, std: c.std ?? 0 }));
  const corrData = correlation.slice(0, 15).map(c => ({
    pair: `${c.col1.slice(0, 8)}↔${c.col2.slice(0, 8)}`,
    value: Math.abs(c.value),
    raw: c.value,
  }));

  const tooltipStyle = {
    contentStyle: { background: '#070000', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 },
    labelStyle: { color: '#94a3b8' },
  };

  return (
    <div className="space-y-5">
      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Numeric Features', value: summary.numericCols.length, color: 'text-red-400' },
          { label: 'Categorical Features', value: summary.categoricalCols.length, color: 'text-amber-400' },
          { label: 'Correlations Found', value: correlation.filter(c => Math.abs(c.value) > 0.5).length, color: 'text-rose-400' },
          { label: 'High Skewness Cols', value: columns.filter(c => c.skewness !== undefined && Math.abs(c.skewness) > 1).length, color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <GlowCard key={label} className="p-4">
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </GlowCard>
        ))}
      </div>

      {/* Numeric column statistics */}
      {numStats.length > 0 && (
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-1">Numeric Column Statistics</div>
          <div className="text-[11px] text-slate-500 mb-4">Mean values across numeric columns</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={meanData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="mean" name="Mean" radius={[4, 4, 0, 0]}>
                {meanData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${0 + i * 15}, 70%, ${45 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      )}

      {/* Detailed stats table */}
      {numStats.length > 0 && (
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-4">Detailed Descriptive Statistics</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Column', 'Mean', 'Median', 'Std Dev', 'Variance', 'Min', 'Max', 'Q1', 'Q3', 'Skewness', 'Kurtosis'].map(h => (
                    <th key={h} className="text-left py-2 px-2.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {numStats.map(c => (
                  <tr key={c.name} className="hover:bg-white/3 transition-colors">
                    <td className="py-2 px-2.5 font-medium text-white whitespace-nowrap">{c.name}</td>
                    {[c.mean, c.median, c.std, c.variance, c.min, c.max, c.q1, c.q3, c.skewness, c.kurtosis].map((v, i) => (
                      <td key={i} className="py-2 px-2.5 font-mono text-slate-400 whitespace-nowrap">
                        {v !== undefined ? v.toFixed(3) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      )}

      {/* Correlation heatmap data */}
      {corrData.length > 0 && (
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-4">Feature Correlation Analysis</div>
          <div className="space-y-2">
            {corrData.sort((a, b) => b.value - a.value).map(c => (
              <div key={c.pair} className="flex items-center gap-3">
                <div className="text-[11px] text-slate-400 w-44 truncate font-mono">{c.pair}</div>
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${Math.abs(c.raw) > 0.7 ? 'bg-rose-500' : Math.abs(c.raw) > 0.4 ? 'bg-amber-500' : 'bg-red-700'}`}
                    style={{ width: `${c.value * 100}%` }}
                  />
                </div>
                <div className={`text-[11px] font-mono w-12 text-right ${Math.abs(c.raw) > 0.7 ? 'text-rose-400' : Math.abs(c.raw) > 0.4 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {c.raw.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      {/* AI Insights */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} className="text-red-400" />
          <div className="text-xs font-semibold text-white">AI-Generated Insights</div>
          <span className="ml-auto text-[10px] text-slate-600">{insights.length} insights</span>
        </div>
        <div className="space-y-2.5">
          {insights.map((ins, i) => {
            const Icon = insightIcon[ins.type];
            return (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${insightStyle[ins.type]}`}>
                <Icon size={13} className="mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">{ins.text}</div>
              </div>
            );
          })}
          {insights.length === 0 && (
            <div className="text-center text-slate-600 text-xs py-6">No issues detected — dataset looks healthy!</div>
          )}
        </div>
      </GlowCard>

      {/* ML Recommendations */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-red-400" />
          <div className="text-xs font-semibold text-white">ML Algorithm Recommendations</div>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/5 hover:border-red-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${taskColor[rec.task] || 'from-red-600 to-rose-600'} text-white font-medium`}>
                  {rec.task}
                </div>
                <span className="text-sm font-semibold text-white">{rec.algorithm}</span>
                <span className="ml-auto text-xs text-slate-500">{rec.confidence}% confidence</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-2">{rec.reason}</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${taskColor[rec.task] || 'from-red-600 to-rose-600'}`}
                  style={{ width: `${rec.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
