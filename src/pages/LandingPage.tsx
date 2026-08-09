import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Atom, Brain, Shield, Leaf, BarChart3, ArrowRight,
  ChevronDown, Globe, Lock, Cpu, Star, Users, TrendingUp
} from 'lucide-react';
import SpiderLogo from '@/components/ui/SpiderLogo';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';

const features = [
  { icon: Atom, title: 'Quantum Intelligence', desc: 'Interactive quantum computing education with bit-vs-qubit visualizations', color: 'from-red-600 to-rose-600' },
  { icon: Brain, title: 'AI Decision Engine', desc: 'Intelligent analysis recommending classical AI or quantum-inspired solutions', color: 'from-rose-700 to-red-700' },
  { icon: Shield, title: 'Threat Detection', desc: 'Real-time security monitoring with AI-powered attack prediction', color: 'from-rose-500 to-orange-500' },
  { icon: Leaf, title: 'Eco-Scanner AI', desc: 'Camera-based environmental analysis with ML-powered sustainability scoring', color: 'from-emerald-500 to-teal-500' },
  { icon: BarChart3, title: 'Data Analytics', desc: 'Enterprise-grade analytics with beautiful interactive visualizations', color: 'from-amber-500 to-yellow-500' },
  { icon: Globe, title: 'FactChain', desc: 'Track information credibility and changes across multiple sources', color: 'from-red-700 to-rose-700' },
];

const stats = [
  { label: 'Modules', value: '10+', icon: Cpu },
  { label: 'AI Models', value: '8', icon: Brain },
  { label: 'Users', value: '2.4K', icon: Users },
  { label: 'Accuracy', value: '99.2%', icon: TrendingUp },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = "Tomorrow's Problems. Solved Today.";
  const indexRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setTypedText(fullText.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">
      <SpiderWebBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
            <SpiderLogo size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>SpydeyVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity btn-glow"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="cyber-grid absolute inset-0 opacity-40" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-red-600/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-rose-600/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-red-500/20 text-xs font-medium text-red-400 mb-8">
            <Star size={10} className="fill-red-400" />
            <span>AI + Quantum Intelligence Platform</span>
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className="text-slate-400">Version 1.0</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}>
            <span className="gradient-text">SpydeyVerse</span>
            <br />
            <span className="text-slate-200">Quantum Intelligence</span>
          </h1>

          {/* Typed tagline */}
          <div className="text-xl md:text-2xl text-slate-400 mb-10 font-light h-8 flex items-center justify-center">
            <span className="glow-text-cyan">{typedText}</span>
            <span className="ml-0.5 w-0.5 h-6 bg-rose-500 animate-pulse" />
          </div>

          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            A unified intelligent ecosystem bridging Classical Computing and Quantum Computing.
            Learn, analyze, optimize, predict, detect, and automate — all in one platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm hover:opacity-90 transition-all btn-glow shadow-glow"
            >
              Launch Platform <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl glass neon-border text-red-400 font-semibold text-sm hover:text-white transition-all"
            >
              Sign In <Lock size={14} />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-6 border border-white/5 text-center hover:border-red-500/20 transition-all">
              <Icon size={20} className="text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold gradient-text">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              One Platform. <span className="gradient-text">Infinite Intelligence.</span>
            </h2>
            <p className="text-slate-500 text-base max-w-2xl mx-auto">
              10 integrated modules combining AI, Quantum concepts, security, and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="glass rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all group card-hover"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bit vs Qubit preview */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-2xl border border-white/5 p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-glow-blue opacity-30" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-3">
                From Classical Bits to <span className="gradient-text-cyber">Quantum Qubits</span>
              </h2>
              <p className="text-slate-500 text-sm mb-8 max-w-xl mx-auto">
                SpydeyVerse bridges the gap — interactive visualizations help you understand quantum concepts today.
              </p>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
                {/* Classical bit */}
                <div className="glass rounded-xl p-5 border border-white/5">
                  <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Classical Bit</div>
                  <div className="flex gap-2 justify-center mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 font-mono text-lg">0</div>
                    <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-mono text-lg">1</div>
                  </div>
                  <div className="text-[10px] text-slate-600">Only one state at a time</div>
                </div>
                {/* Qubit */}
                <div className="glass rounded-xl p-5 border border-rose-500/20">
                  <div className="text-xs text-red-400 mb-3 uppercase tracking-wider">Qubit</div>
                  <div className="relative w-10 h-10 mx-auto mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600/30 to-red-800/30 border border-rose-500/50 flex items-center justify-center animate-pulse-slow">
                      <span className="text-red-400 font-mono text-sm">|ψ⟩</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-red-600">Superposition (educational sim)</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm hover:opacity-90 transition-all btn-glow"
              >
                Explore Quantum Learning <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
              <SpiderLogo size={14} className="text-white" />
            </div>
            <span className="text-xs text-slate-600">SpydeyVerse Quantum Intelligence Platform</span>
          </div>
          <div className="text-xs text-slate-700">"Tomorrow's Problems. Solved Today." — Version 1.0</div>
        </div>
      </footer>
    </div>
  );
}
