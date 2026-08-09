import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Atom, Brain, Shield, Leaf, BarChart3, MessageSquare,
  TrendingUp, AlertTriangle, CheckCircle, Activity, Zap,
  Route, ScanFace, Link2, FileText, ArrowRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import GlowCard from '@/components/ui/GlowCard';
import StatusBadge from '@/components/ui/StatusBadge';

const activityData = [
  { time: '00:00', queries: 12, threats: 2, eco: 5 },
  { time: '04:00', queries: 5, threats: 1, eco: 3 },
  { time: '08:00', queries: 28, threats: 4, eco: 12 },
  { time: '12:00', queries: 45, threats: 3, eco: 18 },
  { time: '16:00', queries: 38, threats: 7, eco: 22 },
  { time: '20:00', queries: 30, threats: 5, eco: 15 },
  { time: '24:00', queries: 20, threats: 2, eco: 8 },
];

const pieData = [
  { name: 'AI Queries', value: 35, color: '#e01515' },
  { name: 'Optimization', value: 25, color: '#ff3b3b' },
  { name: 'Security', value: 20, color: '#e01515' },
  { name: 'Eco-Scan', value: 12, color: '#10b981' },
  { name: 'Quantum', value: 8, color: '#8b5cf6' },
];

const modules = [
  { path: '/quantum', icon: Atom, label: 'Quantum Intelligence', status: 'active', score: 94, color: 'from-red-600 to-rose-600', desc: '8 circuits learned' },
  { path: '/ai-engine', icon: Brain, label: 'AI Decision Engine', status: 'active', score: 88, color: 'from-rose-700 to-red-700', desc: '24 recommendations' },
  { path: '/optimization', icon: Route, label: 'Optimization', status: 'active', score: 96, color: 'from-emerald-500 to-teal-500', desc: 'Dijkstra + A* active' },
  { path: '/threat', icon: Shield, label: 'Threat Detection', status: 'warning', score: 72, color: 'from-rose-500 to-orange-500', desc: '3 alerts pending' },
  { path: '/deepfake', icon: ScanFace, label: 'Deepfake Detection', status: 'active', score: 99, color: 'from-amber-500 to-yellow-500', desc: '12 images analyzed' },
  { path: '/factchain', icon: Link2, label: 'FactChain', status: 'active', score: 85, color: 'from-teal-500 to-emerald-500', desc: '47 sources tracked' },
  { path: '/eco-scanner', icon: Leaf, label: 'Eco-Scanner', status: 'active', score: 78, color: 'from-green-500 to-emerald-500', desc: 'Carbon: 2.3t CO₂e' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chatbot', status: 'active', score: 100, color: 'from-red-500 to-rose-500', desc: '156 conversations' },
];

const recentActivity = [
  { icon: Shield, text: 'Threat scan completed: Low risk', time: '2m ago', type: 'success' },
  { icon: Atom, text: 'Quantum circuit simulated: 5 qubits', time: '8m ago', type: 'info' },
  { icon: Leaf, text: 'Eco-scan: Plastic bottle detected', time: '15m ago', type: 'warning' },
  { icon: Brain, text: 'AI recommended: Dijkstra algorithm', time: '23m ago', type: 'info' },
  { icon: ScanFace, text: 'Deepfake scan: 99.2% authentic', time: '45m ago', type: 'success' },
];

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <GlowCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingUp size={11} /> {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-300">{label}</div>
      <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>
    </GlowCard>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'Explorer'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Platform status: <span className="text-emerald-400">All systems operational</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-white/5 text-xs text-slate-400">
          <Activity size={12} className="text-red-400 animate-pulse" />
          Live monitoring
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Platform Score" value="91.4" sub="Above benchmark" icon={Zap} color="from-red-600 to-rose-600" trend="+3.2%" />
        <StatCard label="Threat Level" value="Medium" sub="3 active alerts" icon={Shield} color="from-amber-500 to-orange-500" />
        <StatCard label="Eco Score" value="78/100" sub="Carbon: 2.3t CO₂e" icon={Leaf} color="from-emerald-500 to-teal-500" trend="+5%" />
        <StatCard label="AI Accuracy" value="99.2%" sub="Last 24 hours" icon={Brain} color="from-rose-700 to-red-700" trend="+0.1%" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity chart */}
        <GlowCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Platform Activity</div>
              <div className="text-xs text-slate-500">Last 24 hours</div>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />AI Queries</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400" />Threats</span>
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" />Eco Scans</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01515" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e01515" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e01515" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,21,21,0.08)" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="queries" stroke="#e01515" strokeWidth={1.5} fill="url(#colorQueries)" />
              <Area type="monotone" dataKey="threats" stroke="#e01515" strokeWidth={1.5} fill="url(#colorThreats)" />
              <Area type="monotone" dataKey="eco" stroke="#10b981" strokeWidth={1.5} fill="url(#colorEco)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        {/* Pie chart */}
        <GlowCard className="p-5">
          <div className="text-sm font-semibold text-white mb-1">Module Usage</div>
          <div className="text-xs text-slate-500 mb-4">Distribution today</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(224,21,21,0.2)', borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Modules grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">Intelligence Modules</div>
          <span className="text-xs text-slate-500">8 modules active</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map(({ path, icon: Icon, label, status, score, color, desc }) => (
            <GlowCard
              key={path}
              onClick={() => navigate(path)}
              className="p-4 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={14} className="text-white" />
                </div>
                <StatusBadge status={status as 'active' | 'warning'} label={status === 'active' ? 'Online' : 'Alert'} pulse={status === 'warning'} />
              </div>
              <div className="text-xs font-semibold text-white mb-0.5 leading-tight">{label}</div>
              <div className="text-[10px] text-slate-600 mb-2">{desc}</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${color}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{score}% operational</div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <GlowCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Recent Activity</div>
            <Clock size={13} className="text-slate-600" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'success' ? 'bg-emerald-500/10' :
                  item.type === 'warning' ? 'bg-amber-500/10' : 'bg-red-600/10'
                }`}>
                  <item.icon size={13} className={
                    item.type === 'success' ? 'text-emerald-400' :
                    item.type === 'warning' ? 'text-amber-400' : 'text-red-400'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 leading-relaxed">{item.text}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Quick actions */}
        <GlowCard className="p-5">
          <div className="text-sm font-semibold text-white mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Brain, label: 'Run AI Analysis', path: '/ai-engine', color: 'text-red-400' },
              { icon: Shield, label: 'Security Scan', path: '/threat', color: 'text-rose-400' },
              { icon: Leaf, label: 'Eco Scan', path: '/eco-scanner', color: 'text-emerald-400' },
              { icon: MessageSquare, label: 'Ask AI', path: '/chatbot', color: 'text-red-400' },
              { icon: BarChart3, label: 'View Analytics', path: '/analytics', color: 'text-amber-400' },
              { icon: FileText, label: 'Generate Report', path: '/reports', color: 'text-violet-400' },
            ].map(({ icon: Icon, label, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-2 p-3 rounded-xl glass border border-white/5 hover:border-white/10 text-xs text-slate-400 hover:text-white transition-all group"
              >
                <Icon size={14} className={`${color} flex-shrink-0`} />
                <span className="truncate">{label}</span>
                <ArrowRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
