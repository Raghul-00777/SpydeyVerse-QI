import { useState, useMemo } from 'react';
import {
  FlaskConical, Upload, Table, BarChart2, Atom,
  Brain, MessageSquare, Download, Layers, RefreshCw
} from 'lucide-react';
import type { ParsedDataset, DatasetSummary, AIInsight, MLRecommendation, QuantumMetric } from '@/components/dataset/types';
import { buildSummary, generateInsights, generateMLRecommendations, generateQuantumMetrics } from '@/components/dataset/statsUtils';
import UploadZone       from '@/components/dataset/UploadZone';
import DataPreview      from '@/components/dataset/DataPreview';
import DataStats        from '@/components/dataset/DataStats';
import AIAnalysis       from '@/components/dataset/AIAnalysis';
import Visualizations   from '@/components/dataset/Visualizations';
import QuantumAnalytics from '@/components/dataset/QuantumAnalytics';
import AutoML           from '@/components/dataset/AutoML';
import NLQuery          from '@/components/dataset/NLQuery';
import ExportPanel      from '@/components/dataset/ExportPanel';
import GlowCard         from '@/components/ui/GlowCard';

type Tab = 'upload' | 'preview' | 'stats' | 'analysis' | 'visualize' | 'quantum' | 'automl' | 'nlquery' | 'export';

const TABS: { id: Tab; label: string; icon: React.ElementType; requiresData: boolean }[] = [
  { id: 'upload',    label: 'Upload',      icon: Upload,       requiresData: false },
  { id: 'preview',   label: 'Preview',     icon: Table,        requiresData: true  },
  { id: 'stats',     label: 'Statistics',  icon: Layers,       requiresData: true  },
  { id: 'analysis',  label: 'AI Analysis', icon: Brain,        requiresData: true  },
  { id: 'visualize', label: 'Visualize',   icon: BarChart2,    requiresData: true  },
  { id: 'quantum',   label: 'Quantum',     icon: Atom,         requiresData: true  },
  { id: 'automl',    label: 'AutoML',      icon: Brain,        requiresData: true  },
  { id: 'nlquery',   label: 'Ask AI',      icon: MessageSquare,requiresData: true  },
  { id: 'export',    label: 'Export',      icon: Download,     requiresData: true  },
];

export default function DatasetLab() {
  const [tab, setTab]               = useState<Tab>('upload');
  const [dataset, setDataset]       = useState<ParsedDataset | null>(null);
  const [rows, setRows]             = useState<ParsedDataset['rows']>([]);

  // Compute derived data when dataset/rows change
  const summary   = useMemo<DatasetSummary | null>(() => dataset && rows.length ? buildSummary({ ...dataset, rows }) : null, [dataset, rows]);
  const insights  = useMemo<AIInsight[]>(() => summary ? generateInsights(summary) : [], [summary]);
  const mlRecs    = useMemo<MLRecommendation[]>(() => summary ? generateMLRecommendations(summary) : [], [summary]);
  const quantum   = useMemo<QuantumMetric[]>(() => summary ? generateQuantumMetrics(summary) : [], [summary]);

  function handleDataset(d: ParsedDataset) {
    setDataset(d);
    setRows(d.rows);
    setTab('preview');
  }

  function handleCleaned(cleanedRows: ParsedDataset['rows']) {
    setRows(cleanedRows);
  }

  function reset() {
    setDataset(null);
    setRows([]);
    setTab('upload');
  }

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center">
            <FlaskConical size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Quantum AI Dataset Lab
            </h2>
            <p className="text-xs text-slate-500">Upload · Analyse · Visualise · Train · Export</p>
          </div>
        </div>
        {dataset && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-white/5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {dataset.name}
              <span className="text-slate-600">·</span>
              <span className="text-white">{rows.length.toLocaleString()} rows</span>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border border-white/10 text-xs text-slate-400 hover:text-rose-400 transition-colors">
              <RefreshCw size={11} />New Dataset
            </button>
          </div>
        )}
      </div>

      {/* Dashboard cards (when data loaded) */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { label: 'Rows',         value: rows.length.toLocaleString(),   color: 'text-white' },
            { label: 'Columns',      value: summary.totalCols,              color: 'text-white' },
            { label: 'Missing',      value: summary.missingTotal,           color: summary.missingTotal > 0 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'Duplicates',   value: summary.duplicateRows,          color: summary.duplicateRows > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { label: 'Numeric',      value: summary.numericCols.length,     color: 'text-red-400' },
            { label: 'Health',       value: `${summary.healthScore}%`,      color: summary.healthScore >= 80 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'AI Score',     value: `${summary.aiScore}%`,          color: 'text-red-400' },
            { label: 'Memory',       value: `${summary.memoryMB}MB`,        color: 'text-slate-400' },
          ].map(({ label, value, color }) => (
            <GlowCard key={label} className="p-3 text-center">
              <div className={`text-base font-bold font-mono ${color}`}>{value}</div>
              <div className="text-[9px] text-slate-600 mt-0.5">{label}</div>
            </GlowCard>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-white/3 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon, requiresData }) => {
          const disabled = requiresData && !dataset;
          return (
            <button
              key={id}
              onClick={() => !disabled && setTab(id)}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === id
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-glow-sm'
                  : disabled
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={12} />{label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'upload' && (
          <UploadZone onDataset={handleDataset} />
        )}

        {tab === 'preview' && dataset && summary && (
          <DataPreview rows={rows} headers={dataset.headers} />
        )}

        {tab === 'stats' && dataset && summary && (
          <DataStats
            summary={summary}
            rows={rows}
            headers={dataset.headers}
            onCleaned={handleCleaned}
          />
        )}

        {tab === 'analysis' && summary && (
          <AIAnalysis
            summary={summary}
            insights={insights}
            recommendations={mlRecs}
          />
        )}

        {tab === 'visualize' && dataset && summary && (
          <Visualizations
            summary={summary}
            rows={rows}
            headers={dataset.headers}
          />
        )}

        {tab === 'quantum' && summary && (
          <QuantumAnalytics metrics={quantum} summary={summary} />
        )}

        {tab === 'automl' && summary && (
          <AutoML summary={summary} />
        )}

        {tab === 'nlquery' && summary && (
          <NLQuery summary={summary} rows={rows} />
        )}

        {tab === 'export' && dataset && summary && (
          <ExportPanel
            rows={rows}
            headers={dataset.headers}
            summary={summary}
            insights={insights}
            recommendations={mlRecs}
            datasetName={dataset.name}
          />
        )}
      </div>
    </div>
  );
}
