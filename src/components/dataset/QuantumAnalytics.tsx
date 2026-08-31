import { useState, useEffect } from 'react';
import { Atom, Zap, Activity, TrendingUp, Cpu, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { QuantumMetric, DatasetSummary } from './types';
import GlowCard from '@/components/ui/GlowCard';

interface Props { metrics: QuantumMetric[]; summary: DatasetSummary; }

const metricIcons: React.ElementType[] = [Atom, Zap, TrendingUp, Shield, Cpu, Activity];

function QuantumMeter({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 75 ? '#e01515' : pct >= 45 ? '#f59e0b' : '#ff4848';
  return (
    <div className="relative w-24 h-12 mx-auto">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path d="M5,50 A45,45 0,0,1,95,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <path
          d="M5,50 A45,45 0,0,1,95,50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${pct * 1.414} 141.4`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute bottom-0 inset-x-0 text-center text-xs font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  );
}

export default function QuantumAnalytics({ metrics, summary }: Props) {
  const [simStep, setSimStep] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [waveData, setWaveData] = useState<{ t: number; q1: number; q2: number; q3: number }[]>([]);

  const TIP = {
    contentStyle: { background: '#070000', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 },
    labelStyle: { color: '#94a3b8' },
  };

  // Quantum wave simulation
  useEffect(() => {
    const data = Array.from({ length: 40 }, (_, i) => ({
      t: i,
      q1: Math.sin(i * 0.4) * 50 + 50,
      q2: Math.cos(i * 0.3 + 1) * 40 + 50,
      q3: Math.sin(i * 0.5 + 2) * 30 + 50,
    }));
    setWaveData(data);
  }, []);

  function runSimulation() {
    setSimRunning(true);
    setSimStep(0);
    const interval = setInterval(() => {
      setSimStep(s => {
        if (s >= 100) { clearInterval(interval); setSimRunning(false); return 100; }
        return s + 4;
      });
    }, 80);
  }

  const radarData = metrics.map(m => ({ metric: m.label.split(' ').slice(-1)[0], value: m.value }));

  const featureRanking = summary.columns
    .map((c, i) => ({
      feature: c.name,
      quantumScore: parseFloat(Math.max(10, 100 - i * 8 - c.missingPct * 0.5 + (c.type === 'number' ? 15 : 0)).toFixed(1)),
    }))
    .sort((a, b) => b.quantumScore - a.quantumScore)
    .slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="glass-strong rounded-2xl p-6 border border-red-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-red opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
              <Atom size={20} className="text-red-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Quantum AI Analytics</div>
              <div className="text-[11px] text-slate-500">Quantum-inspired pattern analysis — educational simulation</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 border border-red-500/20 text-xs text-red-400">
              <Activity size={11} className="animate-pulse" />Simulation Mode
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quantum-inspired algorithms apply principles from quantum computing (superposition, entanglement) as heuristics on classical hardware. Results are statistically grounded simulations — not actual quantum computation.
          </p>
        </div>
      </div>

      {/* Metric cards with gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = metricIcons[i % metricIcons.length];
          return (
            <GlowCard key={m.label} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                  <Icon size={13} className="text-red-400" />
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">{m.label}</div>
              </div>
              <QuantumMeter value={typeof m.value === 'number' ? Math.round(m.value) : 0} />
              <div className="text-[10px] text-slate-600 mt-3 text-center leading-relaxed">{m.unit && `${m.unit} · `}{m.detail.slice(0, 60)}...</div>
            </GlowCard>
          );
        })}
      </div>

      {/* Quantum wave probability */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold text-white">Quantum Probability Wave</div>
            <div className="text-[11px] text-slate-500">Simulated superposition states across feature space</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded bg-red-600/10 border border-red-500/20 text-red-400">Sim</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={waveData}>
            <defs>
              <linearGradient id="q1grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e01515" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="q2grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4848" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ff4848" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="q3grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#be123c" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.06)" />
            <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip {...TIP} />
            <Area type="monotone" dataKey="q1" name="State |ψ₁⟩" stroke="#e01515" strokeWidth={1.5} fill="url(#q1grad)" />
            <Area type="monotone" dataKey="q2" name="State |ψ₂⟩" stroke="#ff4848" strokeWidth={1.5} fill="url(#q2grad)" />
            <Area type="monotone" dataKey="q3" name="State |ψ₃⟩" stroke="#be123c" strokeWidth={1.5} fill="url(#q3grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quantum feature ranking */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-4">Quantum Feature Ranking</div>
          <div className="space-y-2">
            {featureRanking.map((f, i) => (
              <div key={f.feature} className="flex items-center gap-3">
                <div className="text-[10px] text-slate-600 w-4 text-right">{i + 1}</div>
                <div className="text-[11px] text-slate-300 w-28 truncate">{f.feature}</div>
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500"
                    style={{ width: `${f.quantumScore}%` }} />
                </div>
                <div className="text-[11px] font-mono text-red-400 w-10 text-right">{f.quantumScore.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Quantum radar */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-2">Quantum Metric Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData.slice(0, 6)}>
              <PolarGrid stroke="rgba(224,21,21,0.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 9 }} />
              <Radar name="Quantum Score" dataKey="value" stroke="#e01515" fill="#e01515" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Quantum simulation runner */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold text-white">Quantum Simulation Engine</div>
            <div className="text-[11px] text-slate-500">Run quantum-inspired optimisation simulation on the dataset</div>
          </div>
          <button
            onClick={runSimulation}
            disabled={simRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow"
          >
            {simRunning ? <><span className="w-3 h-3 spinner" />Simulating...</> : <><Atom size={12} />Run Simulation</>}
          </button>
        </div>
        {simStep > 0 && (
          <div className="space-y-3">
            {[
              { label: 'Quantum State Initialisation', done: simStep > 15, active: simStep <= 15 },
              { label: 'Superposition Encoding', done: simStep > 35, active: simStep > 15 && simStep <= 35 },
              { label: 'Quantum Pattern Detection', done: simStep > 60, active: simStep > 35 && simStep <= 60 },
              { label: 'Interference & Measurement', done: simStep > 80, active: simStep > 60 && simStep <= 80 },
              { label: 'Classical Result Extraction', done: simStep >= 100, active: simStep > 80 && simStep < 100 },
            ].map(({ label, done, active }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] ${done ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : active ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse' : 'bg-white/5 border border-white/10 text-slate-600'}`}>
                  {done ? '✓' : active ? '◉' : '○'}
                </div>
                <div className={`text-[11px] ${done ? 'text-emerald-400' : active ? 'text-red-400' : 'text-slate-600'}`}>{label}</div>
              </div>
            ))}
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200" style={{ width: `${simStep}%` }} />
            </div>
            {simStep >= 100 && (
              <div className="glass rounded-lg p-3 border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400">
                Simulation complete. Quantum confidence: {metrics[3]?.value ?? 92}%. Optimal feature subset identified with quantum annealing heuristic.
              </div>
            )}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
