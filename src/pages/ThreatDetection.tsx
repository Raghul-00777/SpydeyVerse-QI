import { useState, useEffect, useMemo } from 'react';
import {
  Shield, AlertTriangle, Activity, Globe, Smartphone, User, Lock, Eye, TrendingUp,
  Search, Download, RefreshCw, X, ChevronDown, ChevronUp, ExternalLink, Ban, FileText
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import GlowCard from '@/components/ui/GlowCard';
import StatusBadge from '@/components/ui/StatusBadge';

interface Threat {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  time: string;
  status: 'blocked' | 'monitoring' | 'mitigated' | 'investigating';
  desc: string;
  expanded?: boolean;
}

interface DeviceRisk {
  device: string;
  risk: number;
  user: string;
  lastSeen: string;
  suspicious: boolean;
  action?: string;
}

const INITIAL_THREATS: Threat[] = [
  { id: 1, type: 'Brute Force', severity: 'high', source: '192.168.1.105', time: '2m ago', status: 'blocked', desc: '47 failed login attempts detected from single IP targeting /admin/auth' },
  { id: 2, type: 'SQL Injection', severity: 'critical', source: '10.0.0.28', time: '8m ago', status: 'blocked', desc: 'Malicious payload in POST /api/users — UNION-based injection attempt' },
  { id: 3, type: 'Port Scan', severity: 'medium', source: '172.16.0.5', time: '15m ago', status: 'monitoring', desc: 'Scanning ports 1-1024 — possible reconnaissance stage' },
  { id: 4, type: 'XSS Attempt', severity: 'medium', source: '192.168.2.8', time: '32m ago', status: 'blocked', desc: 'Script injection in search field parameter sanitized' },
  { id: 5, type: 'DDoS Pattern', severity: 'high', source: 'Multiple', time: '1h ago', status: 'mitigated', desc: '12,000 req/sec from 340 IPs — traffic scrubbed by WAF' },
  { id: 6, type: 'Credential Stuffing', severity: 'high', source: '203.0.113.42', time: '3m ago', status: 'investigating', desc: 'Automated login attempts using leaked credential pairs' },
];

const radarData = [
  { metric: 'Network', score: 72 },
  { metric: 'Auth', score: 88 },
  { metric: 'Data', score: 91 },
  { metric: 'App', score: 65 },
  { metric: 'Config', score: 83 },
  { metric: 'Access', score: 79 },
];

const INITIAL_TIMELINE = [
  { time: '00:00', threats: 3 },
  { time: '04:00', threats: 1 },
  { time: '08:00', threats: 8 },
  { time: '12:00', threats: 12 },
  { time: '16:00', threats: 18 },
  { time: '20:00', threats: 7 },
  { time: '24:00', threats: 4 },
];

const INITIAL_DEVICES: DeviceRisk[] = [
  { device: 'Windows Desktop', risk: 45, user: 'admin@corp.com', lastSeen: '1m ago', suspicious: false },
  { device: 'iPhone 15', risk: 12, user: 'john.doe@corp.com', lastSeen: '5m ago', suspicious: false },
  { device: 'Unknown Linux', risk: 87, user: 'unknown', lastSeen: '8m ago', suspicious: true },
  { device: 'MacBook Pro', risk: 23, user: 'jane.smith@corp.com', lastSeen: '2m ago', suspicious: false },
];

function RiskMeter({ score }: { score: number }) {
  const color = score >= 75 ? '#e01515' : score >= 40 ? '#f59e0b' : '#10b981';
  return (
    <div className="relative w-24 h-12 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-full">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <path
            d="M5,50 A45,45 0 0,1 95,50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 141.4} 141.4`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-bold" style={{ color }}>{score}</div>
    </div>
  );
}

export default function ThreatDetection() {
  const [threats, setThreats] = useState<Threat[]>(INITIAL_THREATS);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [devices, setDevices] = useState<DeviceRisk[]>(INITIAL_DEVICES);
  const [overallRisk, setOverallRisk] = useState(42);
  const [scanning, setScanning] = useState(false);
  const [liveMonitor, setLiveMonitor] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [exported, setExported] = useState<string[]>([]);

  const activeThreats = useMemo(() => threats.filter(t => t.status !== 'blocked' && t.status !== 'mitigated').length, [threats]);
  const blockedCount = useMemo(() => threats.filter(t => t.status === 'blocked' || t.status === 'mitigated').length, [threats]);

  useEffect(() => {
    if (!liveMonitor) return;
    const interval = setInterval(() => {
      setTimeline(prev => prev.map(t => ({
        ...t,
        threats: Math.max(0, t.threats + Math.floor(Math.random() * 3) - 1),
      })));
      setDevices(prev => prev.map(d => ({
        ...d,
        risk: Math.max(0, Math.min(100, d.risk + Math.floor(Math.random() * 5) - 2)),
        lastSeen: d.lastSeen === '1m ago' ? '2m ago' : d.lastSeen === '2m ago' ? '3m ago' : d.lastSeen,
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, [liveMonitor]);

  function runScan() {
    setScanning(true);
    setTimeout(() => {
      setOverallRisk(Math.floor(Math.random() * 30) + 35);
      setTimeline(prev => prev.map(t => ({
        ...t,
        threats: Math.max(0, t.threats + Math.floor(Math.random() * 6) - 2),
      })));
      setThreats(prev => prev.map(t => ({
        ...t,
        time: t.time === '1m ago' ? 'Just now' : t.time === '2m ago' ? '1m ago' : t.time,
      })));
      setScanning(false);
    }, 2000);
  }

  function toggleExpand(id: number) {
    setThreats(prev => prev.map(t => t.id === id ? { ...t, expanded: !t.expanded } : t));
  }

  function handleThreatAction(id: number, action: 'block' | 'investigate' | 'ignore') {
    setThreats(prev => prev.map(t => {
      if (t.id !== id) return t;
      let newStatus: Threat['status'] = t.status;
      if (action === 'block') newStatus = 'blocked';
      else if (action === 'investigate') newStatus = 'investigating';
      else if (action === 'ignore') newStatus = 'mitigated';
      return { ...t, status: newStatus, expanded: false };
    }));
  }

  const filteredThreats = useMemo(() => {
    return threats.filter(t => {
      const matchesSearch = !searchQuery ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || t.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [threats, searchQuery, severityFilter]);

  function doExport(format: 'csv' | 'json') {
    const base = `threat-report-${new Date().toISOString().slice(0, 10)}`;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filteredThreats, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${base}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const headers = ['id', 'type', 'severity', 'source', 'time', 'status', 'desc'];
      const rows = filteredThreats.map(t => headers.map(h => escape(t[h as keyof Threat])).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${base}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    setExported(prev => [...prev, format]);
    setTimeout(() => setExported(prev => prev.filter(x => x !== format)), 3000);
  }

  const severityColor = (severity: string) =>
    severity === 'critical' ? 'text-rose-400' : severity === 'high' ? 'text-orange-400' : severity === 'medium' ? 'text-amber-400' : 'text-emerald-400';

  const severityBg = (severity: string) =>
    severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
    severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
    severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
    'bg-emerald-500/20 text-emerald-400';

  const statusConfig: Record<Threat['status'], { color: 'success' | 'warning' | 'info'; label: string }> = {
    blocked: { color: 'success', label: 'Blocked' },
    monitoring: { color: 'warning', label: 'Monitoring' },
    mitigated: { color: 'info', label: 'Mitigated' },
    investigating: { color: 'warning', label: 'Investigating' },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Threat Detection Intelligence</h2>
            <p className="text-xs text-slate-500">Real-time security monitoring and attack prediction</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveMonitor(m => !m)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
              liveMonitor
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-slate-500 bg-white/5 border-white/10'
            }`}
          >
            <Activity size={11} className={liveMonitor ? 'animate-pulse' : ''} />
            {liveMonitor ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {scanning ? <><span className="w-3 h-3 spinner" />Scanning...</> : <><Eye size={12} />Run Scan</>}
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Threats', value: activeThreats.toString(), icon: AlertTriangle, color: 'text-rose-400', bg: 'from-rose-500 to-orange-500' },
          { label: 'Blocked Today', value: blockedCount.toString(), icon: Shield, color: 'text-emerald-400', bg: 'from-emerald-500 to-teal-500' },
          { label: 'Risk Score', value: `${overallRisk}%`, icon: Activity, color: 'text-amber-400', bg: 'from-amber-500 to-orange-500', meter: true },
          { label: 'Monitored IPs', value: '1,284', icon: Globe, color: 'text-red-400', bg: 'from-red-600 to-rose-600' },
        ].map(({ label, value, icon: Icon, color, bg, meter }) => (
          <GlowCard key={label} className="p-4">
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center`}>
                <Icon size={14} className="text-white" />
              </div>
              {meter && <RiskMeter score={overallRisk} />}
            </div>
            <div className={`text-xl font-bold ${color} mt-2`}>{value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </GlowCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat timeline */}
        <GlowCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-white">Threat Timeline (24h)</div>
              <div className="text-[11px] text-slate-500">Live updates every 4s</div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01515" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="threats" stroke="#e01515" strokeWidth={1.5} fill="url(#threatGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        {/* Security radar */}
        <GlowCard className="p-5">
          <div className="text-xs font-semibold text-white mb-1">Security Posture</div>
          <div className="text-[11px] text-slate-500 mb-3">Multi-vector assessment</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(224,21,21,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#e01515" fill="#e01515" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Active threats table */}
      <GlowCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-xs font-semibold text-white">Active Threats & Events</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search threats..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 w-40"
              />
            </div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none focus:border-red-500/50"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => doExport('csv')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all"
              >
                <FileText size={11} />CSV
              </button>
              <button
                onClick={() => doExport('json')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all"
              >
                <Download size={11} />JSON
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-slate-500 font-medium w-8"></th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Type</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Severity</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Source IP</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Description</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Status</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Time</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredThreats.map(t => (
                <>
                  <tr key={t.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-2.5 px-3">
                      <button onClick={() => toggleExpand(t.id)} className="text-slate-500 hover:text-white transition-colors">
                        {t.expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">{t.type}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${severityBg(t.severity)}`}>{t.severity}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{t.source}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{t.desc}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={statusConfig[t.status]?.color || 'info'} label={statusConfig[t.status]?.label || t.status} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{t.time}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {t.status !== 'blocked' && (
                          <button
                            onClick={() => handleThreatAction(t.id, 'block')}
                            className="p-1 rounded hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-colors"
                            title="Block"
                          >
                            <Ban size={12} />
                          </button>
                        )}
                        {t.status !== 'investigating' && (
                          <button
                            onClick={() => handleThreatAction(t.id, 'investigate')}
                            className="p-1 rounded hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors"
                            title="Investigate"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleThreatAction(t.id, 'ignore')}
                          className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {t.expanded && (
                    <tr key={`${t.id}-detail`}>
                      <td colSpan={8} className="p-0">
                        <div className="px-4 py-3 bg-white/3 border-b border-white/5">
                          <div className="text-xs text-slate-300 mb-2">{t.desc}</div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Lock size={10} /> AES-256 encrypted</span>
                            <span className="flex items-center gap-1"><Globe size={10} /> Geo: {t.source}</span>
                            <span className="flex items-center gap-1"><Activity size={10} /> Confidence: {85 + Math.floor(Math.random() * 14)}%</span>
                            <button className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                              <ExternalLink size={10} /> View full logs
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredThreats.length === 0 && (
            <div className="py-12 text-center text-slate-600 text-sm">No threats match your filters.</div>
          )}
        </div>
      </GlowCard>

      {/* Device analysis */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-white">Device Risk Analysis</div>
          <div className="text-[10px] text-slate-500">{devices.length} devices monitored</div>
        </div>
        <div className="space-y-3">
          {devices.map(d => (
            <div key={d.device} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
              d.suspicious ? 'bg-rose-500/5 border-rose-500/20' : 'glass border-white/5'
            }`}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5">
                <Smartphone size={16} className={d.suspicious ? 'text-rose-400' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{d.device}</span>
                  {d.suspicious && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">Suspicious</span>}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <User size={9} />{d.user} · {d.lastSeen}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-sm font-bold ${d.risk >= 70 ? 'text-rose-400' : d.risk >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{d.risk}%</div>
                  <div className="text-[10px] text-slate-600">risk score</div>
                </div>
                <div className="w-16 bg-white/5 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${d.risk >= 70 ? 'bg-rose-500' : d.risk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${d.risk}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
