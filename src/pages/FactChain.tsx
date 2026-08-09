import { useState } from 'react';
import { Link2, Search, TrendingUp, AlertTriangle, CheckCircle, Globe, Clock, BarChart2 } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

const demoTopics = [
  'Global temperature rise 2024',
  'COVID-19 vaccine effectiveness',
  'Electric vehicle adoption rates',
  'AI job displacement statistics',
];

interface Source {
  name: string;
  url: string;
  credibility: number;
  stance: 'agrees' | 'disagrees' | 'neutral';
  excerpt: string;
  date: string;
}

interface FactResult {
  topic: string;
  consensusScore: number;
  sources: Source[];
  aiSummary: string;
  versionHistory: { date: string; claim: string; source: string }[];
}

function generateFactResult(topic: string): FactResult {
  const t = topic.toLowerCase();
  const isClimate = t.includes('temperature') || t.includes('climate');
  const isVaccine = t.includes('vaccine') || t.includes('covid');
  return {
    topic,
    consensusScore: isClimate ? 94 : isVaccine ? 91 : 72,
    aiSummary: isClimate
      ? 'Strong scientific consensus confirms global temperatures have risen approximately 1.1°C above pre-industrial levels. 97% of climate scientists agree on human causation. Some minor variation exists in projections, but the core finding is consistent across thousands of peer-reviewed studies.'
      : isVaccine
      ? 'Extensive clinical trials and real-world data confirm high effectiveness against severe illness and death. Effectiveness against transmission varies by variant. Some sources present exaggerated claims in both directions; credible scientific sources show consistent 90%+ protection against hospitalization.'
      : `Multiple credible sources provide data on "${topic}". Minor inconsistencies exist in methodology and reporting. The core factual claims show moderate-to-strong consistency across mainstream scientific sources, with some divergence in interpretation.`,
    sources: [
      { name: 'Nature Journal', url: '#', credibility: 97, stance: 'agrees', excerpt: 'Peer-reviewed research confirms the primary claims with strong statistical significance.', date: '2024-08' },
      { name: 'WHO Official Report', url: '#', credibility: 94, stance: 'agrees', excerpt: 'Official international health data supports the mainstream scientific consensus.', date: '2024-07' },
      { name: 'Reuters Fact Check', url: '#', credibility: 88, stance: 'agrees', excerpt: 'Investigation confirms core claims; minor figures vary by 2-3% across databases.', date: '2024-09' },
      { name: 'Alternative News Site', url: '#', credibility: 31, stance: 'disagrees', excerpt: 'Claims data is manipulated; no peer-reviewed citations provided.', date: '2024-09' },
      { name: 'University Research', url: '#', credibility: 91, stance: 'neutral', excerpt: 'Provides additional context and nuance; supports primary findings with caveats.', date: '2024-06' },
    ],
    versionHistory: [
      { date: '2024-09-15', claim: 'Updated figures reflect Q3 data release', source: 'WHO' },
      { date: '2024-07-03', claim: 'Initial claim published with preliminary data', source: 'Reuters' },
      { date: '2024-05-20', claim: 'Early reporting with incomplete dataset', source: 'BBC' },
    ],
  };
}

export default function FactChain() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FactResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function analyze(q?: string) {
    const topic = q || query;
    if (!topic.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(generateFactResult(topic));
      setAnalyzing(false);
    }, 1600);
  }

  const credColor = (score: number) =>
    score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-rose-700 flex items-center justify-center">
          <Link2 size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">FactChain</h2>
          <p className="text-xs text-slate-500">Track information credibility and consistency across sources</p>
        </div>
      </div>

      {/* Search */}
      <GlowCard className="p-5">
        <div className="text-xs font-semibold text-white mb-3">Fact Verification Search</div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="Enter a claim or topic to verify across sources..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all"
          />
          <button
            onClick={() => analyze()}
            disabled={!query.trim() || analyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-700 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {analyzing ? <><span className="w-3 h-3 spinner" />Analyzing</> : <><Search size={13} />Verify</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {demoTopics.map(t => (
            <button key={t} onClick={() => { setQuery(t); analyze(t); }}
              className="text-[11px] px-2.5 py-1 rounded-lg glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all">
              {t}
            </button>
          ))}
        </div>
      </GlowCard>

      {result && (
        <div className="space-y-4">
          {/* Consensus score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GlowCard glow="cyan" className="sm:col-span-1 p-5 text-center">
              <div className="text-xs text-slate-500 mb-2">Consensus Score</div>
              <div className={`text-4xl font-bold mb-1 ${result.consensusScore >= 80 ? 'text-emerald-400' : result.consensusScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {result.consensusScore}%
              </div>
              <div className="text-[11px] text-slate-500">
                {result.consensusScore >= 80 ? 'High consensus' : result.consensusScore >= 60 ? 'Moderate consensus' : 'Low consensus'}
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${result.consensusScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${result.consensusScore}%` }} />
              </div>
            </GlowCard>
            <GlowCard className="sm:col-span-2 p-5">
              <div className="text-xs font-semibold text-white mb-2">AI Summary</div>
              <p className="text-xs text-slate-400 leading-relaxed">{result.aiSummary}</p>
            </GlowCard>
          </div>

          {/* Sources */}
          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-4">Source Comparison ({result.sources.length} sources)</div>
            <div className="space-y-3">
              {result.sources.map(src => (
                <div key={src.name} className="flex items-start gap-3 p-3 rounded-xl glass border border-white/5 hover:border-white/10 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    src.stance === 'agrees' ? 'bg-emerald-500/10' : src.stance === 'disagrees' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                  }`}>
                    {src.stance === 'agrees' ? <CheckCircle size={14} className="text-emerald-400" /> :
                     src.stance === 'disagrees' ? <AlertTriangle size={14} className="text-rose-400" /> :
                     <BarChart2 size={14} className="text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-white">{src.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        src.stance === 'agrees' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        src.stance === 'disagrees' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>{src.stance}</span>
                      <span className="ml-auto text-[11px] text-slate-600">{src.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{src.excerpt}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${credColor(src.credibility)}`}>{src.credibility}</div>
                    <div className="text-[10px] text-slate-600">credibility</div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Version history */}
          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-4">Information Change Timeline</div>
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-teal-500/20" />
              {result.versionHistory.map((v, i) => (
                <div key={i} className="relative pl-4 pb-4 last:pb-0">
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-teal-500 -translate-x-[4.5px] border border-void" />
                  <div className="flex items-center gap-2 mb-0.5">
                    <Clock size={11} className="text-slate-600" />
                    <span className="text-[11px] text-slate-600">{v.date}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{v.source}</span>
                  </div>
                  <div className="text-xs text-slate-400">{v.claim}</div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      )}
    </div>
  );
}
