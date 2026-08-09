import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import GlowCard from '@/components/ui/GlowCard';

const monthlyData = [
  { month: 'Jan', queries: 1200, threats: 45, ecoScore: 72, revenue: 42000 },
  { month: 'Feb', queries: 1450, threats: 38, ecoScore: 74, revenue: 48000 },
  { month: 'Mar', queries: 1680, threats: 52, ecoScore: 76, revenue: 51000 },
  { month: 'Apr', queries: 1920, threats: 41, ecoScore: 73, revenue: 55000 },
  { month: 'May', queries: 2100, threats: 63, ecoScore: 79, revenue: 58000 },
  { month: 'Jun', queries: 2400, threats: 57, ecoScore: 81, revenue: 64000 },
  { month: 'Jul', queries: 2800, threats: 49, ecoScore: 78, revenue: 69000 },
  { month: 'Aug', queries: 3100, threats: 44, ecoScore: 82, revenue: 75000 },
];

const moduleUsage = [
  { name: 'AI Engine', value: 35, color: '#e01515' },
  { name: 'Optimization', value: 22, color: '#ff3b3b' },
  { name: 'Threat Det.', value: 18, color: '#e01515' },
  { name: 'Eco-Scanner', value: 12, color: '#10b981' },
  { name: 'Quantum', value: 8, color: '#8b5cf6' },
  { name: 'FactChain', value: 5, color: '#f59e0b' },
];

const radarMetrics = [
  { metric: 'Performance', score: 91 },
  { metric: 'Security', score: 78 },
  { metric: 'Reliability', score: 95 },
  { metric: 'Scalability', score: 82 },
  { metric: 'Accuracy', score: 96 },
  { metric: 'Speed', score: 88 },
];

const scatterData = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 20 + 5,
}));

const kpis = [
  { label: 'Total Queries', value: '18.6K', change: '+24%', up: true },
  { label: 'Avg Response', value: '1.2s', change: '-18%', up: true },
  { label: 'Accuracy Rate', value: '99.2%', change: '+0.3%', up: true },
  { label: 'Active Users', value: '2,418', change: '+31%', up: true },
];

type ChartView = 'bar' | 'line' | 'area';

export default function DataAnalytics() {
  const [chartView, setChartView] = useState<ChartView>('area');
  const [timeRange, setTimeRange] = useState('8m');

  const tooltipStyle = {
    contentStyle: { background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 },
    labelStyle: { color: '#94a3b8' },
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Data Analytics</h2>
            <p className="text-xs text-slate-500">Enterprise-grade analytics dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['3m', '6m', '8m'] as const).map(t => (
              <button key={t} onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${timeRange === t ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-xs text-slate-400 hover:text-white transition-colors">
            <Download size={12} />Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, change, up }) => (
          <GlowCard key={label} className="p-4">
            <div className="text-xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`flex items-center gap-1 text-[11px] mt-1.5 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp size={10} />{change} vs last period
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Main chart */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-white">Platform Performance</div>
            <div className="text-xs text-slate-500">Monthly trends</div>
          </div>
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['bar', 'line', 'area'] as ChartView[]).map(v => (
              <button key={v} onClick={() => setChartView(v)}
                className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${chartView === v ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {chartView === 'bar' ? (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="queries" name="AI Queries" fill="#e01515" radius={[4,4,0,0]} />
              <Bar dataKey="threats" name="Threats" fill="#e01515" radius={[4,4,0,0]} />
            </BarChart>
          ) : chartView === 'line' ? (
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="queries" name="AI Queries" stroke="#e01515" strokeWidth={2} dot={{ fill: '#e01515', r: 3 }} />
              <Line type="monotone" dataKey="ecoScore" name="Eco Score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          ) : (
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01515" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="queries" name="AI Queries" stroke="#e01515" strokeWidth={1.5} fill="url(#aGrad1)" />
              <Area type="monotone" dataKey="ecoScore" name="Eco Score" stroke="#10b981" strokeWidth={1.5} fill="url(#aGrad2)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </GlowCard>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-1">Module Usage</div>
          <div className="text-[11px] text-slate-500 mb-3">Distribution by module</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={moduleUsage} cx="50%" cy="50%" outerRadius={60} paddingAngle={2} dataKey="value">
                {moduleUsage.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {moduleUsage.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-500 truncate">{d.name}</span>
                <span className="text-slate-400 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Radar */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-1">System Health</div>
          <div className="text-[11px] text-slate-500 mb-2">Multi-dimension analysis</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarMetrics}>
              <PolarGrid stroke="rgba(224,21,21,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>

        {/* Scatter */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-1">Query Distribution</div>
          <div className="text-[11px] text-slate-500 mb-2">Response time vs accuracy</div>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(224,21,21,0.05)" />
              <XAxis type="number" dataKey="x" name="Response Time" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="y" name="Accuracy" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Scatter data={scatterData} fill="#e01515" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>
    </div>
  );
}
