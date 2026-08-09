import { useState } from 'react';
import { FileText, Download, Zap, Shield, Leaf, ScanFace, Atom, BarChart3, Brain, CheckCircle, Clock } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

const reportTypes = [
  { id: 'executive', icon: BarChart3, label: 'Executive Summary', desc: 'High-level overview of all modules', color: 'from-red-600 to-rose-600', time: '~30s' },
  { id: 'optimization', icon: Zap, label: 'Optimization Report', desc: 'Algorithm performance & improvements', color: 'from-emerald-500 to-teal-500', time: '~45s' },
  { id: 'threat', icon: Shield, label: 'Threat Report', desc: 'Security analysis & recommendations', color: 'from-rose-500 to-orange-500', time: '~40s' },
  { id: 'eco', icon: Leaf, label: 'Eco Report', desc: 'Environmental impact assessment', color: 'from-green-500 to-emerald-500', time: '~35s' },
  { id: 'deepfake', icon: ScanFace, label: 'Deepfake Report', desc: 'Media authenticity audit', color: 'from-amber-500 to-yellow-500', time: '~25s' },
  { id: 'quantum', icon: Atom, label: 'Learning Report', desc: 'Quantum education progress', color: 'from-rose-700 to-red-700', time: '~20s' },
  { id: 'ai', icon: Brain, label: 'AI Insights Report', desc: 'Decision engine recommendations', color: 'from-rose-600 to-red-700', time: '~35s' },
  { id: 'business', icon: BarChart3, label: 'Business Report', desc: 'ROI & performance analytics', color: 'from-indigo-500 to-violet-500', time: '~50s' },
];

interface GeneratedReport {
  type: string;
  title: string;
  content: string;
  generatedAt: string;
}

function generateReport(type: string, typeLabel: string): GeneratedReport {
  const sections: Record<string, string> = {
    executive: `## Executive Summary — SpydeyVerse Platform

**Period:** August 2024 | **Generated:** ${new Date().toLocaleDateString()}

### Platform Performance Overview
The SpydeyVerse Quantum Intelligence Platform demonstrated strong performance across all 8 operational modules during the reporting period.

**Key Metrics:**
- Platform Uptime: 99.97%
- Total AI Queries Processed: 18,642
- Threats Detected & Blocked: 2,847
- Average Response Time: 1.24s
- Overall Platform Score: 91.4/100

### Module Status
| Module | Status | Score |
|--------|--------|-------|
| Quantum Intelligence | Operational | 94% |
| AI Decision Engine | Operational | 88% |
| Optimization | Operational | 96% |
| Threat Detection | Alert | 72% |
| Deepfake Detection | Operational | 99% |

### AI Recommendations
1. Increase threat monitoring sensitivity — 3 unresolved alerts
2. Consider upgrading eco-scanner camera resolution
3. Schedule quantum circuit database update

### Conclusion
Platform performance exceeds industry benchmarks. The integration of classical AI with quantum-inspired algorithms continues to deliver measurable value across all business domains.`,

    threat: `## Threat Detection Intelligence Report

**Period:** August 2024 | **Classification:** Confidential

### Executive Threat Summary
Current threat level: **MEDIUM** | Active alerts: **3**

### Detected Threats (Last 24h)
1. **SQL Injection Attempt** — BLOCKED — 10.0.0.28
   - Malicious payload detected in POST /api/users
   - Confidence: 99.8% | Action: IP banned for 24h

2. **Brute Force Attack** — BLOCKED — 192.168.1.105
   - 47 failed login attempts over 3 minutes
   - Confidence: 99.9% | Action: Account locked, IP flagged

3. **DDoS Pattern** — MITIGATED — Multiple IPs
   - 12,000 req/sec from 340 coordinated IPs
   - Confidence: 94.2% | Action: Rate limiting applied

### Risk Analysis
- Network Security Score: 72/100 (DOWN 8pts)
- Authentication Security: 88/100 (Stable)
- Data Protection Score: 91/100 (UP 3pts)

### Recommendations
1. Implement geo-blocking for high-risk regions
2. Enable 2FA enforcement for all admin accounts
3. Update WAF rules for new SQL injection vectors
4. Review anomalous device (Unknown Linux — 87% risk score)`,

    eco: `## Eco-Scanner Environmental Impact Report

**Period:** August 2024 | **Sustainability Focus Report**

### Environmental Assessment Summary
**Overall Eco Score: 78/100** | Carbon Budget Status: On Track

### Waste Analysis
- Total items scanned: 1,247
- Recyclable items detected: 934 (74.9%)
- Non-recyclable items: 313 (25.1%)
- Estimated total carbon: 2.3t CO₂e

### Material Classification Breakdown
- Plastic (PET): 42% → Recommend reduction program
- Cardboard: 28% → 100% recyclable, good performance
- Glass: 15% → 100% recyclable, low impact
- Polystyrene: 10% → CRITICAL — phase out immediately
- Other: 5%

### Carbon Footprint Analysis
- Daily average: 7.5kg CO₂e
- Weekly trend: -3.2% (improving)
- Annual projection: 2.74t CO₂e

### AI Recommendations
1. Launch styrofoam elimination program (highest impact)
2. Implement refillable container incentive scheme
3. Partner with certified recyclers for PET bottles
4. Set quarterly carbon reduction targets: -10% per quarter

### Sustainability Score Projection
With recommended actions: 78 → 91 (target Q2 2025)`,
  };

  return {
    type,
    title: typeLabel,
    content: sections[type] || sections.executive.replace('Executive Summary', typeLabel),
    generatedAt: new Date().toISOString(),
  };
}

const recentReports = [
  { title: 'Monthly Executive Summary', date: '2024-08-01', size: '2.4 MB', type: 'executive' },
  { title: 'Q2 Threat Analysis Report', date: '2024-07-15', size: '1.8 MB', type: 'threat' },
  { title: 'Carbon Impact Assessment', date: '2024-07-10', size: '1.2 MB', type: 'eco' },
  { title: 'AI Performance Review', date: '2024-07-01', size: '3.1 MB', type: 'ai' },
];

export default function AIReports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);

  function generateReportHandler(type: string, label: string) {
    setGenerating(type);
    setReport(null);
    setTimeout(() => {
      setReport(generateReport(type, label));
      setGenerating(null);
    }, 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 to-red-700 flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">AI Reports</h2>
          <p className="text-xs text-slate-500">Auto-generated intelligence reports with AI insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report types */}
        <div className="space-y-4">
          <GlowCard className="p-4">
            <div className="text-xs font-semibold text-white mb-3">Generate New Report</div>
            <div className="space-y-2">
              {reportTypes.map(({ id, icon: Icon, label, desc, color, time }) => (
                <button
                  key={id}
                  onClick={() => generateReportHandler(id, label)}
                  disabled={!!generating}
                  className="w-full flex items-center gap-3 p-3 rounded-xl glass border border-white/5 hover:border-white/10 transition-all group text-left"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {generating === id ? <span className="w-3 h-3 spinner" /> : <Icon size={14} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{label}</div>
                    <div className="text-[10px] text-slate-600">{desc}</div>
                  </div>
                  <div className="text-[10px] text-slate-600 flex-shrink-0">{time}</div>
                </button>
              ))}
            </div>
          </GlowCard>

          {/* Recent reports */}
          <GlowCard className="p-4">
            <div className="text-xs font-semibold text-white mb-3">Recent Reports</div>
            <div className="space-y-2">
              {recentReports.map(r => (
                <div key={r.title} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-300 truncate">{r.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <Clock size={9} />{r.date} · {r.size}
                    </div>
                  </div>
                  <button className="text-slate-600 hover:text-red-400 transition-colors">
                    <Download size={12} />
                  </button>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Report preview */}
        <GlowCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          {/* Preview header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="text-xs font-semibold text-white">
              {report ? report.title : 'Report Preview'}
            </div>
            {report && (
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-slate-600">
                  Generated: {new Date(report.generatedAt).toLocaleTimeString()}
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-medium hover:opacity-90 transition-all">
                  <Download size={11} />Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Zap size={20} className="text-violet-400 animate-pulse" />
                </div>
                <div className="text-sm font-medium text-slate-300">Generating Report...</div>
                <div className="text-xs text-slate-600">AI is analyzing platform data and compiling insights</div>
                <div className="w-48 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-rose-700 to-red-700 animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            ) : report ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {report.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-white mt-4 mb-2">{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-semibold text-red-400 mt-3 mb-1">{line.slice(4)}</h3>;
                    if (line.startsWith('**')) return <p key={i} className="text-xs font-semibold text-white mb-1">{line.replace(/\*\*/g, '')}</p>;
                    if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-2 mb-1"><span className="text-red-400 mt-0.5">•</span><span className="text-xs text-slate-400">{line.slice(2)}</span></div>;
                    if (line.match(/^\d+\./)) return <div key={i} className="text-xs text-slate-400 mb-1 pl-2">{line}</div>;
                    if (line.startsWith('|')) return <div key={i} className="text-[10px] font-mono text-slate-500 mb-0.5">{line}</div>;
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    return <p key={i} className="text-xs text-slate-400 mb-1 leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <FileText size={28} className="text-slate-700" />
                <div className="text-sm text-slate-500">Select a report type to generate</div>
                <div className="text-xs text-slate-600 max-w-xs">AI will analyze your platform data and generate comprehensive insights with recommendations</div>
              </div>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
