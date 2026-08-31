import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Command, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onMenuToggle: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your quantum intelligence platform' },
  '/quantum': { title: 'Quantum Intelligence', subtitle: 'Interactive quantum computing education' },
  '/ai-engine': { title: 'AI Decision Engine', subtitle: 'Intelligent recommendation system' },
  '/optimization': { title: 'Optimization Intelligence', subtitle: 'DSA-powered workflow optimization' },
  '/threat': { title: 'Threat Detection', subtitle: 'Real-time security monitoring' },
  '/deepfake': { title: 'Deepfake Detection', subtitle: 'AI-powered forgery analysis' },
  '/factchain': { title: 'FactChain', subtitle: 'Information credibility tracking' },
  '/eco-scanner': { title: 'Eco-Scanner AI', subtitle: 'Environmental impact analysis' },
  '/chatbot': { title: 'AI Chatbot', subtitle: 'LLM-powered quantum assistant' },
  '/analytics': { title: 'Data Analytics', subtitle: 'Enterprise-grade analytics dashboard' },
  '/reports': { title: 'AI Reports', subtitle: 'Auto-generated intelligence reports' },
  '/settings':     { title: 'Settings',          subtitle: 'Account and platform configuration' },
  '/dataset-lab':  { title: 'Quantum Dataset Lab', subtitle: 'Upload, analyse, visualise and train on your data' },
};

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const page = pageTitles[location.pathname] || { title: 'SpydeyVerse', subtitle: 'Quantum Intelligence Platform' };

  const notifications = [
    { id: 1, text: 'Threat level updated: Medium', time: '2m ago', type: 'warning' },
    { id: 2, text: 'Optimization complete: 94% efficiency', time: '15m ago', type: 'success' },
    { id: 3, text: 'Deepfake scan finished', time: '1h ago', type: 'info' },
  ];

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-void-2/50 backdrop-blur-sm flex-shrink-0">
      {/* Page info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="sm:hidden inline-flex items-center justify-center rounded-lg bg-white/5 p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">{page.title}</h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">{page.subtitle}</p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs"
        >
          <Search size={13} />
          <span className="hidden sm:block">Search...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">
            <Command size={9} /> K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 glass border border-white/10 rounded-xl shadow-glass z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <div className="text-xs font-semibold text-white">Notifications</div>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                  <div className="text-xs text-slate-300">{n.text}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
          {(profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
        </div>
      </div>
    </header>
  );
}
