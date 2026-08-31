import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Atom, Brain, Route, Shield, ScanFace,
  Link2, Leaf, MessageSquare, BarChart3, FileText, Settings,
  ChevronLeft, ChevronRight, LogOut, User, FlaskConical
} from 'lucide-react';
import SpiderLogo from '@/components/ui/SpiderLogo';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'main' },
  { path: '/quantum', icon: Atom, label: 'Quantum Intelligence', group: 'modules' },
  { path: '/ai-engine', icon: Brain, label: 'AI Decision Engine', group: 'modules' },
  { path: '/optimization', icon: Route, label: 'Optimization', group: 'modules' },
  { path: '/threat', icon: Shield, label: 'Threat Detection', group: 'modules' },
  { path: '/deepfake', icon: ScanFace, label: 'Deepfake Detection', group: 'modules' },
  { path: '/factchain', icon: Link2, label: 'FactChain', group: 'modules' },
  { path: '/eco-scanner', icon: Leaf, label: 'Eco-Scanner AI', group: 'modules' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chatbot', group: 'tools' },
  { path: '/analytics', icon: BarChart3, label: 'Data Analytics', group: 'tools' },
  { path: '/reports', icon: FileText, label: 'AI Reports', group: 'tools' },
  { path: '/dataset-lab', icon: FlaskConical, label: 'Dataset Lab', group: 'tools' },
  { path: '/settings', icon: Settings, label: 'Settings', group: 'account' },
];

const groups: Record<string, string> = {
  main: 'Overview',
  modules: 'Modules',
  tools: 'Tools',
  account: 'Account',
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col bg-void-2 border-r border-white/5
        transition-all duration-300 ease-in-out transform w-64 sm:static sm:translate-x-0 sm:h-screen
        ${open ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'sm:w-16' : 'sm:w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center flex-shrink-0">
          <SpiderLogo size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold gradient-text truncate" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>SpydeyVerse</div>
            <div className="text-[10px] text-slate-500 truncate">Quantum Intelligence</div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onClose}
            className="sm:hidden text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Close menu"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {groups[group]}
              </div>
            )}
            <div className="space-y-0.5">
              {items.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-red-400' : ''}`} />
                      {!collapsed && (
                        <span className="truncate">{label}</span>
                      )}
                      {isActive && !collapsed && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-300 truncate">
                {profile?.full_name || profile?.email || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize truncate">{profile?.role || 'student'}</div>
            </div>
            <button
              onClick={signOut}
              className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
