import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlowCard from '@/components/ui/GlowCard';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
];

const roles = ['student', 'researcher', 'enterprise', 'business', 'administrator'];

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [role, setRole] = useState(profile?.role || 'student');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ threats: true, reports: true, eco: false, updates: true });

  async function saveProfile() {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName, organization, role });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
          <SettingsIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Settings</h2>
          <p className="text-xs text-slate-500">Account and platform configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <GlowCard className="p-3 h-fit">
          <div className="space-y-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all text-left ${
                  activeTab === id
                    ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </GlowCard>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <GlowCard className="p-6">
              <div className="text-sm font-semibold text-white mb-6">Profile Settings</div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white text-xl font-bold">
                  {(fullName?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{profile?.email}</div>
                  <div className="text-xs text-slate-500 capitalize mt-0.5">{role}</div>
                  <button className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">Change avatar</button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-white/3 border border-white/5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Organization</label>
                  <input
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="Your company or institution"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all capitalize"
                  >
                    {roles.map(r => <option key={r} value={r} className="bg-slate-900 capitalize">{r}</option>)}
                  </select>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow"
                >
                  {saving ? <><span className="w-3 h-3 spinner" />Saving...</> :
                   saved ? <><CheckCircle size={14} />Saved!</> :
                   <><Save size={14} />Save Changes</>}
                </button>
              </div>
            </GlowCard>
          )}

          {activeTab === 'notifications' && (
            <GlowCard className="p-6">
              <div className="text-sm font-semibold text-white mb-6">Notification Preferences</div>
              <div className="space-y-4">
                {[
                  { key: 'threats', label: 'Security Threats', desc: 'Get notified when threats are detected' },
                  { key: 'reports', label: 'Report Generation', desc: 'Notification when AI reports are ready' },
                  { key: 'eco', label: 'Eco Updates', desc: 'Weekly environmental impact summaries' },
                  { key: 'updates', label: 'Platform Updates', desc: 'News about new features and improvements' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm text-white">{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifs] }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${notifs[key as keyof typeof notifs] ? 'bg-red-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifs[key as keyof typeof notifs] ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} style={{ left: notifs[key as keyof typeof notifs] ? '21px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}

          {activeTab === 'security' && (
            <GlowCard className="p-6">
              <div className="text-sm font-semibold text-white mb-6">Security Settings</div>
              <div className="space-y-4">
                {[
                  { label: 'Change Password', desc: 'Update your account password', action: 'Update' },
                  { label: 'Two-Factor Authentication', desc: '2FA adds extra security to your account', action: 'Enable' },
                  { label: 'Active Sessions', desc: '1 active session (this device)', action: 'Manage' },
                  { label: 'Audit Logs', desc: 'View all account activity', action: 'View' },
                ].map(({ label, desc, action }) => (
                  <div key={label} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm text-white">{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all">
                      {action}
                    </button>
                  </div>
                ))}
                <div className="p-4 glass rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div className="text-sm text-rose-400 font-medium mb-1">Danger Zone</div>
                  <div className="text-xs text-slate-500 mb-3">These actions are irreversible</div>
                  <button className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/20 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </GlowCard>
          )}

          {activeTab === 'appearance' && (
            <GlowCard className="p-6">
              <div className="text-sm font-semibold text-white mb-6">Appearance Settings</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-3">Color Theme</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Quantum Blue', from: 'from-red-600', to: 'to-rose-600', active: true },
                      { name: 'Crimson', from: 'from-rose-500', to: 'to-orange-500', active: false },
                      { name: 'Emerald', from: 'from-emerald-500', to: 'to-teal-500', active: false },
                    ].map(t => (
                      <button key={t.name} className={`p-3 rounded-xl glass border transition-all ${t.active ? 'border-red-500/40' : 'border-white/5 hover:border-white/10'}`}>
                        <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${t.from} ${t.to} mb-2`} />
                        <div className="text-[10px] text-slate-400">{t.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-3">Sidebar</div>
                  <div className="flex gap-2">
                    {['Expanded', 'Compact'].map(v => (
                      <button key={v} className={`px-3 py-2 rounded-lg text-xs transition-all ${v === 'Expanded' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'glass border border-white/10 text-slate-400 hover:text-white'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-3">Animations</div>
                  <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm text-white">Spider Web Background</div>
                      <div className="text-xs text-slate-500">Animated particle web effect</div>
                    </div>
                    <button className="w-10 h-5 rounded-full bg-red-600 relative">
                      <div className="absolute top-0.5 rounded-full bg-white w-4 h-4" style={{ left: '21px' }} />
                    </button>
                  </div>
                </div>
              </div>
            </GlowCard>
          )}
        </div>
      </div>
    </div>
  );
}
