import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap,
} from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Activity, Dot, Download } from 'lucide-react';
import type { DatasetSummary, DataRow } from './types';
import GlowCard from '@/components/ui/GlowCard';

interface Props { summary: DatasetSummary; rows: DataRow[]; headers: string[]; }

const CHART_COLORS = ['#e01515', '#ff3b3b', '#ff4848', '#ff9090', '#be123c', '#9f1239', '#e01515', '#fb7185'];

const TIP = {
  contentStyle: { background: '#070000', border: '1px solid rgba(224,21,21,0.25)', borderRadius: 8, fontSize: 11 },
  labelStyle:   { color: '#94a3b8' },
};

type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'histogram' | 'treemap';

const chartTypes: { id: ChartType; label: string; icon: React.ElementType }[] = [
  { id: 'bar',       label: 'Bar',       icon: BarChart2 },
  { id: 'line',      label: 'Line',      icon: TrendingUp },
  { id: 'area',      label: 'Area',      icon: Activity },
  { id: 'pie',       label: 'Pie',       icon: PieIcon },
  { id: 'scatter',   label: 'Scatter',   icon: Dot },
  { id: 'radar',     label: 'Radar',     icon: Activity },
  { id: 'histogram', label: 'Histogram', icon: BarChart2 },
  { id: 'treemap',   label: 'Treemap',   icon: PieIcon },
];

function buildBarData(rows: DataRow[], xCol: string, yCol: string) {
  const groups: Record<string, number[]> = {};
  rows.forEach(r => {
    const key = String(r[xCol] ?? 'null').slice(0, 20);
    if (!groups[key]) groups[key] = [];
    const v = Number(r[yCol]);
    if (!isNaN(v)) groups[key].push(v);
  });
  return Object.entries(groups)
    .slice(0, 20)
    .map(([name, vals]) => ({ name, value: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) }));
}

function buildHistogram(rows: DataRow[], col: string, bins = 15) {
  const vals = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
  if (!vals.length) return [];
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const step = (mx - mn) / bins || 1;
  const buckets: { bin: string; count: number }[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * step, hi = lo + step;
    buckets.push({ bin: `${lo.toFixed(1)}`, count: vals.filter(v => v >= lo && v < hi).length });
  }
  return buckets;
}

function buildScatter(rows: DataRow[], xCol: string, yCol: string) {
  return rows.slice(0, 200).map(r => ({ x: Number(r[xCol]) || 0, y: Number(r[yCol]) || 0 }));
}

function buildPie(rows: DataRow[], col: string) {
  const freq: Record<string, number> = {};
  rows.forEach(r => { const k = String(r[col] ?? 'null').slice(0, 20); freq[k] = (freq[k] || 0) + 1; });
  return Object.entries(freq).slice(0, 10).map(([name, value]) => ({ name, value }));
}

function buildRadar(summary: DatasetSummary) {
  return summary.columns.slice(0, 8).map(c => ({
    metric: c.name.slice(0, 10),
    completeness: 100 - c.missingPct,
    uniqueness: Math.min(100, (c.unique / Math.max(1, c.count)) * 100),
  }));
}

function buildTreemap(rows: DataRow[], col: string) {
  const freq: Record<string, number> = {};
  rows.forEach(r => { const k = String(r[col] ?? 'null').slice(0, 20); freq[k] = (freq[k] || 0) + 1; });
  return Object.entries(freq).slice(0, 20).map(([name, size]) => ({ name, size }));
}

function downloadChart(id: string) {
  const svg = document.querySelector(`#chart-${id} svg`);
  if (!svg) return;
  const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `chart-${id}.svg`; a.click();
}

export default function Visualizations({ summary, rows, headers }: Props) {
  const [activeChart, setActiveChart] = useState<ChartType>('bar');
  const [xCol, setXCol] = useState(headers[0] || '');
  const [yCol, setYCol] = useState(summary.numericCols[0] || headers[1] || '');

  const numericCols = summary.numericCols;
  const allCols = headers;

  const renderChart = () => {
    switch (activeChart) {
      case 'bar': {
        const data = buildBarData(rows, xCol, yCol);
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TIP} />
            <Bar dataKey="value" name={yCol} radius={[4,4,0,0]}>
              {buildBarData(rows, xCol, yCol).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        );
      }
      case 'line': {
        const data = buildBarData(rows, xCol, yCol);
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TIP} />
            <Line type="monotone" dataKey="value" name={yCol} stroke="#e01515" strokeWidth={2} dot={{ fill: '#e01515', r: 3 }} />
          </LineChart>
        );
      }
      case 'area': {
        const data = buildBarData(rows, xCol, yCol);
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e01515" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TIP} />
            <Area type="monotone" dataKey="value" name={yCol} stroke="#e01515" strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        );
      }
      case 'pie': {
        const data = buildPie(rows, xCol);
        return (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          </PieChart>
        );
      }
      case 'scatter': {
        const data = buildScatter(rows, xCol, yCol);
        return (
          <ScatterChart>
            <CartesianGrid stroke="rgba(224,21,21,0.06)" />
            <XAxis type="number" dataKey="x" name={xCol} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="number" dataKey="y" name={yCol} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TIP} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#e01515" fillOpacity={0.6} />
          </ScatterChart>
        );
      }
      case 'radar': {
        const data = buildRadar(summary);
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(224,21,21,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 9 }} />
            <Radar name="Completeness" dataKey="completeness" stroke="#e01515" fill="#e01515" fillOpacity={0.15} strokeWidth={1.5} />
            <Radar name="Uniqueness" dataKey="uniqueness" stroke="#ff4848" fill="#ff4848" fillOpacity={0.1} strokeWidth={1.5} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          </RadarChart>
        );
      }
      case 'histogram': {
        const col = numericCols[0] || yCol;
        const data = buildHistogram(rows, col);
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
            <XAxis dataKey="bin" tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TIP} />
            <Bar dataKey="count" name="Frequency" fill="#e01515" radius={[2,2,0,0]} />
          </BarChart>
        );
      }
      case 'treemap': {
        const data = buildTreemap(rows, xCol);
        return (
          <Treemap data={data} dataKey="size" nameKey="name" stroke="#000" fill="#e01515">
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Treemap>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Chart type selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveChart(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeChart === id
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'glass border border-white/10 text-slate-400 hover:text-white hover:border-red-500/20'
            }`}
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* Column selectors */}
      <GlowCard className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">X Axis / Category:</span>
            <select value={xCol} onChange={e => setXCol(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500/50">
              {allCols.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          {['bar', 'line', 'area', 'scatter'].includes(activeChart) && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Y Axis / Value:</span>
              <select value={yCol} onChange={e => setYCol(e.target.value)}
                className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-red-500/50">
                {(numericCols.length ? numericCols : allCols).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          )}
          <button
            onClick={() => downloadChart(activeChart)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Download size={12} />SVG
          </button>
        </div>
      </GlowCard>

      {/* Chart */}
      <GlowCard className="p-5" id={`chart-${activeChart}`}>
        <div className="text-xs font-semibold text-white mb-4 capitalize">{activeChart} Chart — {xCol}{yCol && yCol !== xCol ? ` vs ${yCol}` : ''}</div>
        <ResponsiveContainer width="100%" height={340}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      </GlowCard>

      {/* Auto-generated mini charts */}
      {numericCols.length > 1 && (
        <>
          <div className="text-xs font-semibold text-white">Auto-generated Distributions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numericCols.slice(0, 4).map(col => {
              const data = buildHistogram(rows, col, 10);
              return (
                <GlowCard key={col} className="p-4">
                  <div className="text-[11px] text-slate-400 mb-2">Distribution: <span className="text-white">{col}</span></div>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="bin" tick={{ fill: '#475569', fontSize: 7 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 7 }} axisLine={false} tickLine={false} />
                      <Bar dataKey="count" fill="#e01515" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </GlowCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
