import { useState, useEffect } from 'react';
import { Atom, BookOpen, Cpu, Zap, PlayCircle, RotateCcw, Info, CheckCircle, XCircle, Trophy, History, Sparkles } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

const tabs = ['Bit vs Qubit', 'Superposition', 'Quantum Gates', 'Circuit Sim', 'Applications'];

const gates = [
  { name: 'H (Hadamard)', symbol: 'H', desc: 'Creates superposition from a pure state. Applies equal probability of 0 and 1.', color: 'from-red-600 to-rose-600', effect: 'super' as const },
  { name: 'X (Pauli-X)', symbol: 'X', desc: 'Quantum NOT gate. Flips |0⟩ to |1⟩ and |1⟩ to |0⟩.', color: 'from-rose-700 to-red-700', effect: 'flip' as const },
  { name: 'Z (Pauli-Z)', symbol: 'Z', desc: 'Phase flip gate. Applies a phase of -1 to |1⟩ state.', color: 'from-emerald-500 to-teal-500', effect: 'phase' as const },
  { name: 'CNOT', symbol: 'CX', desc: 'Controlled NOT. Entangles two qubits — the target flips if control is |1⟩.', color: 'from-rose-500 to-orange-500', effect: 'cnot' as const },
  { name: 'T Gate', symbol: 'T', desc: 'π/8 gate. Applies a phase of e^(iπ/4) to |1⟩.', color: 'from-amber-500 to-yellow-500', effect: 'phase' as const },
  { name: 'S Gate', symbol: 'S', desc: 'Phase gate. Square root of Z: applies a phase of i to |1⟩.', color: 'from-red-700 to-rose-700', effect: 'phase' as const },
];

const applications = [
  { title: 'Quantum Cryptography', desc: 'Theoretically unbreakable encryption using quantum key distribution (QKD)', icon: '🔐', status: 'Future' },
  { title: 'Drug Discovery', desc: 'Simulating molecular interactions for pharmaceutical research at quantum speed', icon: '💊', status: 'Research' },
  { title: 'Optimization', desc: 'Solving NP-hard problems exponentially faster via quantum annealing', icon: '⚡', status: 'Near-term' },
  { title: 'Machine Learning', desc: 'Quantum neural networks for pattern recognition beyond classical limits', icon: '🧠', status: 'Research' },
  { title: 'Financial Modeling', desc: 'Monte Carlo simulations and portfolio optimization at quantum scale', icon: '📈', status: 'Near-term' },
  { title: 'Climate Modeling', desc: 'Simulating complex climate systems to predict environmental changes', icon: '🌍', status: 'Future' },
];

const quizQuestions: Record<number, { question: string; options: string[]; correct: number }[]> = {
  0: [
    { question: 'How many states can a classical bit be in?', options: ['1', '2', 'Infinite', '0'], correct: 1 },
    { question: 'What represents the ON state of a classical bit?', options: ['0', '1', 'Both', 'Neither'], correct: 1 },
    { question: 'Which physical device uses classical bits?', options: ['Quantum computer', 'Laptop/CPU', 'Photonic chip', 'Ion trap'], correct: 1 },
  ],
  1: [
    { question: 'What is superposition?', options: ['A definite state', 'Multiple states simultaneously', 'A measurement', 'A classical bit'], correct: 1 },
    { question: 'What happens when a qubit in superposition is measured?', options: ['It stays in superposition', 'It collapses to |0⟩ or |1⟩', 'It disappears', 'It becomes a bit'], correct: 1 },
    { question: 'Which gate creates superposition?', options: ['X gate', 'Z gate', 'H (Hadamard) gate', 'CNOT gate'], correct: 2 },
  ],
  2: [
    { question: 'What does the X gate do?', options: ['Phase flip', 'Creates superposition', 'Flips |0⟩ ↔ |1⟩', 'Does nothing'], correct: 2 },
    { question: 'What does CNOT stand for?', options: ['Controlled NOT', 'Classical NOT', 'Quantum XOR', 'Control Node'], correct: 0 },
    { question: 'Which gate is also called the π/8 gate?', options: ['S gate', 'T gate', 'Z gate', 'H gate'], correct: 1 },
  ],
  3: [
    { question: 'What is the output of an H gate on |0⟩?', options: ['|0⟩', '|1⟩', '|+⟩ superposition', 'Error'], correct: 2 },
    { question: 'What does a quantum circuit measure?', options: ['Voltage', 'Qubit state probabilities', 'Current', 'Temperature'], correct: 1 },
  ],
  4: [
    { question: 'Which field uses quantum key distribution (QKD)?', options: ['Quantum Cryptography', 'Drug Discovery', 'Optimization', 'Climate Modeling'], correct: 0 },
    { question: 'What is an NP-hard problem?', options: ['Easy problem', 'Problem requiring exponential classical time', 'Simple math', 'Linear equation'], correct: 1 },
  ],
};

function QubitSphere({ state, prob0, prob1 }: { state: '0' | '1' | 'super'; prob0: number; prob1: number }) {
  const colors = {
    '0': 'from-slate-500 to-slate-600',
    '1': 'from-red-600 to-rose-600',
    super: 'from-rose-500 to-red-800',
  };
  const labels = { '0': '|0⟩', '1': '|1⟩', super: '|ψ⟩' };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors[state]} flex items-center justify-center shadow-[0_0_24px_rgba(224,21,21,0.4)] ${state === 'super' ? 'animate-pulse-slow' : ''}`}>
        <span className="text-white font-mono text-xl">{labels[state]}</span>
      </div>
      <div className="flex gap-3 w-full max-w-[180px]">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
            <span>|0⟩</span><span>{prob0}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1">
            <div className="h-1 rounded-full bg-slate-400 transition-all duration-500" style={{ width: `${prob0}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
            <span>|1⟩</span><span>{prob1}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1">
            <div className="h-1 rounded-full bg-red-500 transition-all duration-500" style={{ width: `${prob1}%` }} />
          </div>
        </div>
      </div>
      <div className="text-[10px] text-slate-500">
        {state === '0' ? 'Ground state' : state === '1' ? 'Excited state' : 'Superposition — not measured'}
      </div>
    </div>
  );
}

function CircuitSimulator() {
  const [circuit, setCircuit] = useState<string[]>(['H', 'X', '', '', '']);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const gateOptions = ['', 'H', 'X', 'Z', 'T', 'S'];

  function simulateGate(gate: string, state: '0' | '1' | 'super'): { state: '0' | '1' | 'super'; prob0: number; prob1: number; label: string } {
    switch (gate) {
      case 'H':
        return { state: 'super', prob0: 50, prob1: 50, label: '|+⟩ = (|0⟩ + |1⟩)/√2' };
      case 'X':
        if (state === '0') return { state: '1', prob0: 0, prob1: 100, label: '|1⟩' };
        if (state === '1') return { state: '0', prob0: 100, prob1: 0, label: '|0⟩' };
        return { state: 'super', prob0: 50, prob1: 50, label: '|+⟩ (X on superposition)' };
      case 'Z':
        if (state === 'super') return { state: 'super', prob0: 50, prob1: 50, label: '|−⟩ = (|0⟩ − |1⟩)/√2' };
        if (state === '1') return { state: '1', prob0: 0, prob1: 100, label: '−|1⟩ (phase flip)' };
        return { state: '0', prob0: 100, prob1: 0, label: '|0⟩ (unchanged)' };
      case 'T':
        if (state === '1') return { state: '1', prob0: 0, prob1: 100, label: 'e^(iπ/4)|1⟩' };
        if (state === '0') return { state: '0', prob0: 100, prob1: 0, label: '|0⟩ (unchanged)' };
        return { state: 'super', prob0: 50, prob1: 50, label: 'Phase-shifted superposition' };
      case 'S':
        if (state === '1') return { state: '1', prob0: 0, prob1: 100, label: 'i|1⟩' };
        if (state === '0') return { state: '0', prob0: 100, prob1: 0, label: '|0⟩ (unchanged)' };
        return { state: 'super', prob0: 50, prob1: 50, label: 'i-phase superposition' };
      default:
        return { state: state, prob0: state === '0' ? 100 : state === '1' ? 0 : 50, prob1: state === '0' ? 0 : state === '1' ? 100 : 50, label: state === '0' ? '|0⟩' : state === '1' ? '|1⟩' : '|+⟩' };
    }
  }

  function runCircuit() {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const applied = circuit.filter(g => g !== '');
      let currentState: '0' | '1' | 'super' = '0';
      let currentProb0 = 100;
      let currentProb1 = 0;
      const labels = ['|0⟩'];

      applied.forEach(gate => {
        const sim = simulateGate(gate, currentState);
        currentState = sim.state;
        currentProb0 = sim.prob0;
        currentProb1 = sim.prob1;
        labels.push(sim.label);
      });

      let outcomeText = '';
      const cs = String(currentState);
      if (cs === 'super') {
        outcomeText = `Superposition: |0⟩ ${currentProb0}%, |1⟩ ${currentProb1}%`;
      } else if (cs === '0') {
        outcomeText = 'Collapsed to |0⟩ with probability 100%';
      } else {
        outcomeText = 'Collapsed to |1⟩ with probability 100%';
      }
      const outcome = outcomeText;

      const resultText = `Applied ${applied.length} gate(s): ${applied.join(' → ')}. Output: ${outcome}`;
      setResult(resultText);
      setHistory(prev => [resultText, ...prev.slice(0, 4)]);
      setRunning(false);
    }, 1200);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 mb-2">
        Build a quantum circuit by selecting gates for each qubit position. This is an educational simulation.
      </div>

      {/* Circuit builder */}
      <div className="glass rounded-xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs text-slate-400 font-medium w-12">q[0]</div>
          <div className="flex-1 flex items-center gap-1">
            {/* Input state */}
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 border border-white/10 flex items-center justify-center text-xs text-slate-400 font-mono">|0⟩</div>
            <div className="flex-1 border-t border-dashed border-slate-700 relative">
              <div className="absolute inset-y-0 left-0 right-0 flex items-center gap-2 px-2">
                {circuit.map((gate, i) => (
                  <select
                    key={i}
                    value={gate}
                    onChange={e => {
                      const next = [...circuit];
                      next[i] = e.target.value;
                      setCircuit(next);
                    }}
                    className="w-14 h-9 text-xs bg-slate-800 border border-white/10 rounded text-white text-center focus:border-red-500/50 focus:outline-none"
                  >
                    {gateOptions.map(g => <option key={g} value={g}>{g || '—'}</option>)}
                  </select>
                ))}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-xs text-red-400 font-mono">M</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCircuit}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <PlayCircle size={13} /> {running ? 'Simulating...' : 'Run Simulation'}
          </button>
          <button
            onClick={() => { setCircuit(['', '', '', '', '']); setResult(null); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-slate-400 text-xs hover:text-white transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={() => {
              const randomGates = Array.from({ length: 5 }, () => gateOptions[Math.floor(Math.random() * gateOptions.length)]);
              setCircuit(randomGates);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-slate-400 text-xs hover:text-white transition-colors"
          >
            <Sparkles size={12} /> Random
          </button>
        </div>
      </div>

      {result && (
        <div className="glass rounded-xl p-4 border border-rose-500/20 bg-rose-600/5">
          <div className="flex items-start gap-2">
            <Zap size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-red-400 mb-1">Simulation Result</div>
              <div className="text-xs text-slate-300">{result}</div>
              <div className="text-[10px] text-slate-600 mt-2 italic">
                Note: This is an educational simulation, not actual quantum hardware.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <GlowCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <History size={12} className="text-slate-500" />
            <div className="text-xs font-medium text-slate-400">Recent Simulations</div>
          </div>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-[11px] text-slate-500 truncate">{h}</div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}

interface QuizResult {
  question: number;
  correct: boolean;
}

export default function QuantumIntelligence() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [qubitState, setQubitState] = useState<'0' | '1' | 'super'>('0');
  const [qubitProbs, setQubitProbs] = useState({ prob0: 100, prob1: 0 });
  const [progress, setProgress] = useState(35);
  const [completedTabs, setCompletedTabs] = useState<Set<number>>(new Set());
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quantum_progress');
    const savedTabs = localStorage.getItem('quantum_completed_tabs');
    if (saved) setProgress(Number(saved));
    if (savedTabs) setCompletedTabs(new Set(JSON.parse(savedTabs)));
  }, []);

  useEffect(() => {
    localStorage.setItem('quantum_progress', String(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('quantum_completed_tabs', JSON.stringify([...completedTabs]));
  }, [completedTabs]);

  useEffect(() => {
    const newProbs = qubitState === '0' ? { prob0: 100, prob1: 0 }
      : qubitState === '1' ? { prob0: 0, prob1: 100 }
      : { prob0: 50, prob1: 50 };
    setQubitProbs(newProbs);
  }, [qubitState]);

  function handleTabChange(index: number) {
    setActiveTab(index);
    setCompletedTabs(prev => {
      const next = new Set(prev);
      next.add(index);
      const newProgress = Math.min(100, 35 + next.size * 13);
      setProgress(newProgress);
      return next;
    });
    setQuizOpen(false);
    setQuizSubmitted(false);
  }

  function startQuiz() {
    setQuizOpen(true);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizResults([]);
  }

  function submitQuiz() {
    const questions = quizQuestions[activeTab] || [];
    const results: QuizResult[] = questions.map((q, i) => ({
      question: i,
      correct: quizAnswers[i] === q.correct,
    }));
    setQuizResults(results);
    setQuizSubmitted(true);

    const correctCount = results.filter(r => r.correct).length;
    const allCorrect = correctCount === questions.length;
    if (allCorrect) {
      setCompletedTabs(prev => {
        const next = new Set(prev);
        next.add(activeTab + 10);
        setProgress(p => Math.min(100, p + 5));
        return next;
      });
    }
  }

  const currentQuiz = quizQuestions[activeTab] || [];
  const tabCompleted = completedTabs.has(activeTab) || completedTabs.has(activeTab + 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
            <Atom size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Quantum Intelligence</h2>
            <p className="text-xs text-slate-500">Interactive quantum computing education platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-white/5 text-xs text-slate-400">
            <BookOpen size={12} className="text-red-400" />
            Learning Progress: {progress}%
          </div>
          {progress >= 100 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <Trophy size={11} /> Mastered
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <GlowCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-slate-300">Learning Dashboard</div>
          <div className="text-xs text-red-400">{progress}% Complete</div>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 mb-3">
          <div className="h-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((topic, i) => {
            const isCompleted = completedTabs.has(i) || completedTabs.has(i + 10);
            const isCurrent = activeTab === i;
            return (
              <div
                key={topic}
                onClick={() => handleTabChange(i)}
                className={`text-center p-2 rounded-lg text-[10px] cursor-pointer transition-all ${
                  isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : isCurrent ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-white/5 text-slate-600 border border-white/5 hover:text-slate-400'
                }`}
              >
                {isCompleted ? <><CheckCircle size={10} className="inline mr-0.5" />{topic}</>
                  : isCurrent ? <><span className="animate-pulse">▶</span> {topic}</>
                  : <><span className="opacity-50">○</span> {topic}</>}
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => handleTabChange(i)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === i
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quiz Button */}
      <div className="flex justify-end">
        <button
          onClick={startQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold hover:opacity-90 transition-all"
        >
          <Zap size={12} /> Test Knowledge
        </button>
      </div>

      {/* Quiz Modal */}
      {quizOpen && (
        <GlowCard className="p-6 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-white">Knowledge Quiz — {tabs[activeTab]}</div>
            <button onClick={() => setQuizOpen(false)} className="text-slate-500 hover:text-white"><Zap size={14} /></button>
          </div>
          <div className="space-y-4">
            {currentQuiz.map((q, qi) => (
              <div key={qi} className="glass rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-300 mb-2">{qi + 1}. {q.question}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => {
                        if (!quizSubmitted) {
                          setQuizAnswers(prev => {
                            const next = [...prev];
                            next[qi] = oi;
                            return next;
                          });
                        }
                      }}
                      disabled={quizSubmitted}
                      className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        quizSubmitted && oi === q.correct
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : quizSubmitted && oi === quizAnswers[qi] && oi !== q.correct
                            ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                            : quizAnswers[qi] === oi
                              ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                              : 'glass border border-white/5 text-slate-400 hover:text-white'
                      } ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {quizSubmitted && (
                  <div className="mt-2 flex items-center gap-1">
                    {quizResults[qi]?.correct ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
                    <span className="text-[10px] text-slate-500">{quizResults[qi]?.correct ? 'Correct!' : `Incorrect — answer: ${q.options[q.correct]}`}</span>
                  </div>
                )}
              </div>
            ))}
            {!quizSubmitted && (
              <button
                onClick={submitQuiz}
                disabled={quizAnswers.length !== currentQuiz.length}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Submit Answers
              </button>
            )}
            {quizSubmitted && (
              <div className="text-center text-xs text-slate-400">
                Score: {quizResults.filter(r => r.correct).length}/{currentQuiz.length}
                {quizResults.every(r => r.correct) && <span className="text-emerald-400 ml-2">+5% Progress!</span>}
              </div>
            )}
          </div>
        </GlowCard>
      )}

      {/* Tab content */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Classical bit */}
          <GlowCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Classical Bit</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              A classical bit is the fundamental unit of classical computing. It can only exist in one of two definite states at any given time.
            </p>
            <div className="flex gap-4 justify-center mb-5">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-3xl font-mono text-slate-400">0</div>
                <div className="text-[11px] text-slate-600">Laptop OFF</div>
              </div>
              <div className="flex items-center text-slate-600 text-lg font-light">or</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-3xl font-mono text-red-400">1</div>
                <div className="text-[11px] text-slate-600">Laptop ON</div>
              </div>
            </div>
            <div className="glass rounded-lg p-3 border border-white/5 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Key insight:</strong> A bit is always in a definite state — either 0 or 1. Only ONE state exists at any time. All classical computers process information this way.
            </div>
          </GlowCard>

          {/* Qubit */}
          <GlowCard glow="cyan" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Atom size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-white">Quantum Bit (Qubit)</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-rose-600/10 text-red-400 border border-rose-500/20">Educational Sim</span>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              A qubit leverages quantum mechanical principles. Unlike a classical bit, before measurement it can exist in a combination of states.
            </p>
            <div className="flex flex-col items-center mb-5">
              <QubitSphere state={qubitState} prob0={qubitProbs.prob0} prob1={qubitProbs.prob1} />
              <div className="flex gap-2 mt-3">
                {(['0', '1', 'super'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setQubitState(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      qubitState === s
                        ? 'bg-rose-600/20 text-red-400 border border-rose-500/40'
                        : 'glass border border-white/10 text-slate-500 hover:text-white'
                    }`}
                  >
                    {s === '0' ? '|0⟩' : s === '1' ? '|1⟩' : 'Superposition'}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass rounded-lg p-3 border border-rose-500/10 bg-rose-600/5 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-red-400">Superposition:</strong> In this educational visualization, |ψ⟩ represents a qubit that hasn't been measured yet — it holds information about both possible states simultaneously. Upon measurement, it collapses to |0⟩ or |1⟩.
            </div>
          </GlowCard>

          {/* Comparison table */}
          <GlowCard className="lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Comparison: Bit vs Qubit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Property</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Classical Bit</th>
                    <th className="text-left py-2 px-3 text-red-400 font-medium">Qubit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['States', '0 or 1 (definite)', '|0⟩, |1⟩, or superposition (before measurement)'],
                    ['Physical representation', 'Transistor ON/OFF', 'Photon, electron spin, ion trap'],
                    ['Information density', '1 bit per unit', 'Can represent both states simultaneously'],
                    ['Operations', 'Classical logic gates', 'Quantum gates (H, X, Z, CNOT...)'],
                    ['Parallelism', 'Sequential', 'Quantum parallelism via superposition'],
                    ['Error rate', 'Near-zero', 'High (requires error correction)'],
                  ].map(([prop, classical, quantum]) => (
                    <tr key={prop} className="hover:bg-white/3 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{prop}</td>
                      <td className="py-2.5 px-3 text-slate-400">{classical}</td>
                      <td className="py-2.5 px-3 text-red-300">{quantum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          <GlowCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-white">Superposition Visualization</h3>
              {tabCompleted && <CheckCircle size={14} className="text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Superposition is a fundamental quantum principle. A qubit in superposition holds information about multiple states simultaneously until measured.
              This visualization is educational — it simulates the concept, not actual quantum hardware.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { state: '|0⟩', prob0: 100, prob1: 0, desc: 'Pure ground state. Definite 0.', color: 'bg-slate-500' },
                { state: '|+⟩', prob0: 50, prob1: 50, desc: 'After H gate. Equal probability of 0 or 1.', color: 'bg-red-500' },
                { state: '|1⟩', prob0: 0, prob1: 100, desc: 'Pure excited state. Definite 1.', color: 'bg-red-600' },
              ].map(({ state, prob0, prob1, desc, color }) => (
                <div key={state} className="glass rounded-xl p-4 border border-white/5">
                  <div className="text-center text-2xl font-mono text-white mb-3">{state}</div>
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>|0⟩ probability</span><span>{prob0}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${prob0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>|1⟩ probability</span><span>{prob1}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${prob1}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600">{desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 glass rounded-lg p-3 border border-amber-500/20 bg-amber-500/5">
              <Info size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-amber-400">Educational Note:</strong> These visualizations represent quantum state concepts as taught in quantum computing courses. Actual quantum computers require specialized hardware (superconducting qubits, trapped ions, etc.) operating near absolute zero.
              </div>
            </div>
          </GlowCard>
        </div>
      )}

      {activeTab === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gates.map(({ name, symbol, desc, color }) => (
            <GlowCard key={name} className="p-5 group card-hover">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-mono font-bold text-lg mb-3 group-hover:scale-110 transition-transform`}>
                {symbol}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </GlowCard>
          ))}
        </div>
      )}

      {activeTab === 3 && (
        <GlowCard className="p-6">
          <div className="mb-1">
            <h3 className="text-sm font-semibold text-white">Quantum Circuit Simulator</h3>
            <p className="text-xs text-slate-500 mb-4">Build and simulate quantum circuits interactively. Educational visualization only.</p>
          </div>
          <CircuitSimulator />
        </GlowCard>
      )}

      {activeTab === 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map(({ title, desc, icon, status }) => (
            <GlowCard key={title} className="p-5 card-hover">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  status === 'Future' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                  status === 'Near-term' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-600/10 text-red-400 border-red-500/20'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
