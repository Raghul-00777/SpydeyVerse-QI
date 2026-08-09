import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import SpiderLogo from '@/components/ui/SpiderLogo';
import { useAuth } from '@/contexts/AuthContext';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error, hasSession } = await signUp(email, password, fullName);
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already')) {
          setError('An account with this email already exists. Try signing in.');
        } else if (msg.includes('database')) {
          setError('Account created! Please sign in now.');
          setMode('signin');
        } else {
          setError(error.message);
        }
      } else if (hasSession) {
        setSuccess('Account created! Signing you in...');
      } else {
        setSuccess('Account created! Please check your email for confirmation before signing in.');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(error.message);
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <SpiderWebBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Card */}
        <div className="glass rounded-2xl border border-white/8 p-8 shadow-glass">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
              <SpiderLogo size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>SpydeyVerse</div>
              <div className="text-xs text-slate-500">Quantum Intelligence Platform</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1 gap-1">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-glow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required={mode === 'signup'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <CheckCircle size={13} /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-glow shadow-glow-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 spinner" /> Processing...
                </span>
              ) : mode === 'signin' ? 'Sign In to Platform' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
