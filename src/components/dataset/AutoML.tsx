import { useState } from 'react';
import { Brain, Play, CheckCircle, TrendingUp, Target } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { DatasetSummary, MLResult } from './types';
import { simulateMLResult } from './statsUtils';
import GlowCard from '@/components/ui/GlowCard';

interface Props { summary: DatasetSummary; }

const ALGORITHMS = ['Random Forest', 'XGBoost', 'Logistic Regression', 'SVM', 'Neural Network'];
const TIP = {
  contentStyle: { background: '#070000', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#94a3b8' },
};

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-mono font-semibold">{pct}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AutoML({ summary }: Props) {
  const [selectedAlgo, setSelectedAlgo] = useState(ALGORITHMS[0]);
  const [splitRatio, setSplitRatio] = useState(80);
  const [crossVal, setCrossVal] = useState(5);
  const [training, setTraining] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<MLResult | null>(null);
  const [allResults, setAllResults] = useState<MLResult[]>([]);

  const COLORS = ['#e01515', '#ff3b3b', '#ff4848', '#ff9090', '#be123c'];

  function train() {
    setTraining(true);
    setStep(0);
    setResult(null);

    const steps = 6;
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setStep(s);
      if (s >= steps) {
        clearInterval(iv);
        const r = simulateMLResult(summary, selectedAlgo);
        setResult(r);
        setAllResults(prev => {
          const next = [...prev.filter(x => x.algorithm !== selectedAlgo), r];
          return next;
        });
        setTraining(false);
      }
    }, 500);
  }

  function autoML() {
    setTraining(true);
    setStep(0);
    setResult(null);

    let done = 0;
    const results: MLResult[] = [];
    ALGORITHMS.forEach((algo, i) => {
      setTimeout(() => {
        const r = simulateMLResult(summary, algo);
        results.push(r);
        setStep(i + 1);
        done++;
        if (done === ALGORITHMS.length) {
          const best = results.sort((a, b) => b.accuracy - a.accuracy)[0];
          setResult(best);
          setAllResults(results);
          setSelectedAlgo(best.algorithm);
          setTraining(false);
        }
      }, i * 800);
    });
  }

  const stepLabels = ['Preprocessing', 'Feature Selection', 'Train/Test Split', 'Model Training', 'Cross Validation', 'Evaluation'];

  return (
    <div className="space-y-5">
      {/* Config */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} className="text-red-400" />
          <div className="text-xs font-semibold text-white">AutoML Configuration</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">Algorithm</label>
            <select
              value={selectedAlgo}
              onChange={e => setSelectedAlgo(e.target.value)}
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-red-500/50"
            >
              {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">Train Split: {splitRatio}%</label>
            <input
              type="range" min={60} max={90} step={5} value={splitRatio}
              onChange={e => setSplitRatio(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">Cross-Val Folds: {crossVal}</label>
            <input
              type="range" min={3} max={10} step={1} value={crossVal}
              onChange={e => setCrossVal(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={train}
            disabled={training || summary.numericCols.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow"
          >
            {training ? <><span className="w-3 h-3 spinner" />Training...</> : <><Play size={12} />Train Model</>}
          </button>
          <button
            onClick={autoML}
            disabled={training}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-600/10 disabled:opacity-50 transition-all"
          >
            <Brain size={12} />Auto-select Best
          </button>
        </div>
      </GlowCard>

      {/* Training progress */}
      {(training || step > 0) && (
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-4">Training Progress</div>
          <div className="space-y-2.5">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${
                  step > i ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
                  step === i ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse' :
                  'bg-white/5 border border-white/10 text-slate-600'
                }`}>
                  {step > i ? '✓' : i + 1}
                </div>
                <div className="text-xs text-slate-400">{label}</div>
                {step === i && <div className="text-[10px] text-red-400 animate-pulse">Running...</div>}
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Accuracy',  value: result.accuracy },
              { label: 'Precision', value: result.precision },
              { label: 'Recall',    value: result.recall },
              { label: 'F1 Score',  value: result.f1 },
            ].map(({ label, value }) => (
              <GlowCard key={label} className="p-4 text-center">
                <div className="text-2xl font-bold font-mono text-white">{(value * 100).toFixed(1)}%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
              </GlowCard>
            ))}
          </div>

          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-4">Detailed Metrics</div>
            <div className="space-y-3">
              <MetricBar label="Accuracy"  value={result.accuracy} />
              <MetricBar label="Precision" value={result.precision} />
              <MetricBar label="Recall"    value={result.recall} />
              <MetricBar label="F1 Score"  value={result.f1} />
            </div>
          </GlowCard>

          {/* Feature importance */}
          {result.featureImportance.length > 0 && (
            <GlowCard className="p-5">
              <div className="text-xs font-semibold text-white mb-4">Feature Importance</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.featureImportance} layout="vertical" margin={{ left: 60, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip {...TIP} />
                  <Bar dataKey="importance" name="Importance" radius={[0,4,4,0]}>
                    {result.featureImportance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlowCard>
          )}

          {/* ROC curve */}
          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-4">ROC Curve</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={result.rocPoints} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
                <XAxis dataKey="fpr" name="FPR" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} label={{ value: 'FPR', position: 'insideBottom', fill: '#475569', fontSize: 9 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip {...TIP} />
                <Line type="monotone" dataKey="tpr" name="TPR" stroke="#e01515" strokeWidth={2} dot={{ fill: '#e01515', r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlowCard>

          {/* Confusion Matrix */}
          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-4">Confusion Matrix</div>
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto 1fr 1fr' }}>
              <div></div>
              <div className="text-[10px] text-slate-500 text-center pb-1">Predicted +</div>
              <div className="text-[10px] text-slate-500 text-center pb-1">Predicted −</div>
              {result.confusionMatrix.map((row, ri) => [
                <div key={`label-${ri}`} className="text-[10px] text-slate-500 pr-2 flex items-center">{ri === 0 ? 'Actual +' : 'Actual −'}</div>,
                ...row.map((v, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`w-20 h-14 rounded-xl flex items-center justify-center text-sm font-bold font-mono ${ri === ci ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}
                  >{v}</div>
                )),
              ])}
            </div>
          </GlowCard>

          {/* Model comparison */}
          {allResults.length > 1 && (
            <GlowCard className="p-5">
              <div className="text-xs font-semibold text-white mb-4">Model Comparison</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={allResults.map(r => ({ name: r.algorithm.split(' ')[0], accuracy: parseFloat((r.accuracy * 100).toFixed(1)), f1: parseFloat((r.f1 * 100).toFixed(1)) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TIP} />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#e01515" radius={[4,4,0,0]} />
                  <Bar dataKey="f1" name="F1 %" fill="#ff4848" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlowCard>
          )}
        </>
      )}
    </div>
  );
}
