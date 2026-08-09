import { useState } from 'react';
import { AlertTriangle, CheckCircle, BarChart2, Layers, Sparkles, Wand2, X } from 'lucide-react';
import type { DatasetSummary, DataRow } from './types';
import GlowCard from '@/components/ui/GlowCard';
import { cleanDataset } from './statsUtils';
import { detectColType } from './statsUtils';

interface Props {
  summary: DatasetSummary;
  rows: DataRow[];
  headers: string[];
  onCleaned: (rows: DataRow[]) => void;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <GlowCard className="p-4">
      <div className={`text-2xl font-bold ${color} mb-0.5 font-mono`}>{value}</div>
      <div className="text-xs font-medium text-slate-300">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </GlowCard>
  );
}

export default function DataStats({ summary, rows, headers, onCleaned }: Props) {
  const [cleaning, setCleaning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cleanedRows, setCleanedRows] = useState<DataRow[] | null>(null);
  const [cleaned, setCleaned] = useState(false);

  const { totalRows, totalCols, missingTotal, duplicateRows, memoryMB, columns, healthScore, aiScore } = summary;

  const colTypes = Object.fromEntries(headers.map(h => [h, detectColType(h, rows)]));

  function handleClean() {
    setCleaning(true);
    setTimeout(() => {
      const result = cleanDataset(rows, headers, colTypes);
      setCleanedRows(result);
      setShowPreview(true);
      setCleaning(false);
    }, 1500);
  }

  function applyClean() {
    if (cleanedRows) { onCleaned(cleanedRows); setCleaned(true); setShowPreview(false); }
  }

  const healthColor = healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-5">
      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Rows"      value={totalRows.toLocaleString()} sub={`${memoryMB} MB`}           color="text-white" />
        <StatCard label="Total Columns"   value={totalCols}                  sub={`${summary.numericCols.length} numeric`} color="text-white" />
        <StatCard label="Missing Values"  value={missingTotal}               sub={`${((missingTotal/(totalRows*totalCols))*100).toFixed(1)}% of cells`} color={missingTotal > 0 ? 'text-amber-400' : 'text-emerald-400'} />
        <StatCard label="Duplicate Rows"  value={duplicateRows}              sub={`${((duplicateRows/totalRows)*100).toFixed(1)}% of dataset`} color={duplicateRows > 0 ? 'text-rose-400' : 'text-emerald-400'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Health Score" value={`${healthScore}/100`} color={healthColor} sub="Data quality" />
        <StatCard label="AI Readiness" value={`${aiScore}/100`}     color="text-red-400" sub="ML readiness" />
        <StatCard label="Numeric Cols" value={summary.numericCols.length}      color="text-white" sub="Available for ML" />
        <StatCard label="Categorical"  value={summary.categoricalCols.length}  color="text-white" sub="Needs encoding" />
      </div>

      {/* Health bar */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-white">Dataset Health Overview</div>
          <div className={`text-sm font-bold ${healthColor}`}>{healthScore}/100</div>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 mb-4">
          <div className={`h-2 rounded-full transition-all duration-700 ${healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${healthScore}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Completeness', val: 100 - (missingTotal/(totalRows*totalCols)*100), color: 'text-emerald-400' },
            { label: 'Uniqueness', val: 100 - (duplicateRows/totalRows*100), color: 'text-red-400' },
            { label: 'Consistency', val: Math.min(100, 70 + summary.numericCols.length * 3), color: 'text-amber-400' },
            { label: 'ML Readiness', val: aiScore, color: 'text-rose-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass rounded-lg p-2.5 border border-white/5">
              <div className={`text-sm font-bold ${color}`}>{val.toFixed(0)}%</div>
              <div className="text-[10px] text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Column details */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-red-400" />
          <div className="text-xs font-semibold text-white">Column Analysis</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Column', 'Type', 'Missing', '% Missing', 'Unique', 'Mean', 'Std', 'Min', 'Max'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {columns.map(c => (
                <tr key={c.name} className="hover:bg-white/3 transition-colors">
                  <td className="py-2 px-3 font-medium text-white whitespace-nowrap max-w-[120px] truncate">{c.name}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${c.type === 'number' ? 'bg-red-600/10 text-red-400' : c.type === 'date' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{c.missing}</td>
                  <td className="py-2 px-3">
                    <span className={c.missingPct > 20 ? 'text-rose-400' : c.missingPct > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {c.missingPct}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{c.unique}</td>
                  <td className="py-2 px-3 text-slate-400 font-mono">{c.mean?.toFixed(2) ?? '—'}</td>
                  <td className="py-2 px-3 text-slate-400 font-mono">{c.std?.toFixed(2) ?? '—'}</td>
                  <td className="py-2 px-3 text-slate-400 font-mono">{c.min?.toFixed(2) ?? '—'}</td>
                  <td className="py-2 px-3 text-slate-400 font-mono">{c.max?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* AI Cleaning */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wand2 size={15} className="text-red-400" />
            <div className="text-xs font-semibold text-white">AI Data Cleaning</div>
          </div>
          {cleaned && <div className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle size={12} />Applied</div>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Remove Duplicates', active: duplicateRows > 0 },
            { label: 'Impute Missing', active: missingTotal > 0 },
            { label: 'Fix Data Types', active: true },
            { label: 'Normalise Values', active: summary.numericCols.length > 0 },
          ].map(({ label, active }) => (
            <div key={label} className={`flex items-center gap-1.5 p-2.5 rounded-lg glass border text-[11px] ${active ? 'border-red-500/20 text-red-400' : 'border-white/5 text-slate-600'}`}>
              {active ? <CheckCircle size={10} className="flex-shrink-0" /> : <X size={10} className="flex-shrink-0" />}
              {label}
            </div>
          ))}
        </div>
        <button
          onClick={handleClean}
          disabled={cleaning || cleaned}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow"
        >
          {cleaning ? <><span className="w-3 h-3 spinner" />Cleaning...</> : cleaned ? <><CheckCircle size={13} />Dataset Cleaned</> : <><Sparkles size={13} />One-Click AI Clean</>}
        </button>

        {showPreview && cleanedRows && (
          <div className="mt-4 glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-emerald-400">Cleaning Preview</div>
              <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-white"><X size={13} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="text-center"><div className="font-bold text-white">{rows.length}</div><div className="text-slate-600">Original rows</div></div>
              <div className="text-center"><div className="font-bold text-emerald-400">{cleanedRows.length}</div><div className="text-slate-600">After cleaning</div></div>
              <div className="text-center"><div className="font-bold text-rose-400">{rows.length - cleanedRows.length}</div><div className="text-slate-600">Removed</div></div>
            </div>
            <button onClick={applyClean} className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-all">
              Apply Cleaning
            </button>
          </div>
        )}
      </GlowCard>
    </div>
  );
}
