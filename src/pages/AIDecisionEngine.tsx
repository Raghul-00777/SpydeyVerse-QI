import { useState, useEffect, useMemo } from 'react';
import { Brain, Zap, Cpu, Atom, ArrowRight, CheckCircle, Clock, BarChart2, Download, History, Trash2, Star, AlertTriangle, TrendingUp, Shield, Globe } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

interface Recommendation {
  id: string;
  type: 'classical' | 'ai' | 'quantum-inspired' | 'future-quantum';
  title: string;
  confidence: number;
  reason: string;
  algorithm?: string;
  complexity?: string;
  pros: string[];
  cons: string[];
  difficulty: 'Low' | 'Medium' | 'High' | 'Very High';
  estimatedCost: string;
  timeToImplement: string;
}

interface AnalysisHistory {
  id: string;
  query: string;
  timestamp: Date;
  recommendations: Recommendation[];
  bestMatch: Recommendation;
  category: string;
}

const scenarios = [
  { label: 'Route optimization for delivery fleet', category: 'Optimization', icon: Globe },
  { label: 'Traveling salesman problem solver', category: 'Optimization', icon: Globe },
  { label: 'Image classification for medical diagnosis', category: 'AI/ML', icon: Brain },
  { label: 'Portfolio risk analysis', category: 'Finance', icon: TrendingUp },
  { label: 'Supply chain scheduling', category: 'Logistics', icon: Globe },
  { label: 'Protein folding simulation', category: 'Science', icon: Atom },
  { label: 'Fraud detection in transactions', category: 'Security', icon: Shield },
  { label: 'Traffic signal optimization', category: 'Infrastructure', icon: Globe },
  { label: 'Drug interaction prediction', category: 'Healthcare', icon: Brain },
  { label: 'Warehouse inventory optimization', category: 'Optimization', icon: Globe },
  { label: 'Job scheduling on machines', category: 'Optimization', icon: Globe },
  { label: 'Network flow optimization', category: 'Optimization', icon: Globe },
];

const typeConfig = {
  classical: { label: 'Classical', color: 'from-slate-500 to-slate-600', icon: Cpu, badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  ai: { label: 'AI Solution', color: 'from-red-600 to-rose-600', icon: Brain, badge: 'bg-red-600/10 text-red-400 border-red-500/20' },
  'quantum-inspired': { label: 'Quantum-Inspired', color: 'from-rose-700 to-red-700', icon: Zap, badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'future-quantum': { label: 'Future Quantum', color: 'from-rose-500 to-red-800', icon: Atom, badge: 'bg-rose-600/10 text-red-400 border-rose-500/20' },
};

const solutionDatabase: Record<string, Omit<Recommendation, 'id'>[]> = {
  route: [
    {
      type: 'ai',
      title: 'AI-Powered Route Optimization',
      confidence: 94,
      reason: 'Graph neural networks with reinforcement learning predict optimal routes in real-time by learning from historical traffic patterns and adapting to live conditions.',
      algorithm: 'GNN + DQN / PPO',
      complexity: 'O(E log V) per inference',
      pros: ['Adapts to real-time traffic', 'Learns from historical patterns', 'Handles dynamic constraints', 'Scales to thousands of nodes'],
      cons: ['Requires significant training data', 'Model interpretability challenges', 'Initial setup cost'],
      difficulty: 'High',
      estimatedCost: '$80K-$300K',
      timeToImplement: '4-8 months',
    },
    {
      type: 'quantum-inspired',
      title: 'Quantum-Inspired Combinatorial Optimization',
      confidence: 91,
      reason: 'Quantum-inspired algorithms like QAOA and quantum annealing heuristics excel at large-scale routing problems with hundreds of constraints.',
      algorithm: 'QAOA + Quantum Annealing Heuristic',
      complexity: 'O(n√n) theoretical',
      pros: ['Excellent for large-scale problems', 'Can escape local optima', 'Parallel exploration of solution space'],
      cons: ['Requires problem encoding', 'Parameter tuning needed', 'Still maturing'],
      difficulty: 'High',
      estimatedCost: '$40K-$150K',
      timeToImplement: '3-6 months',
    },
    {
      type: 'classical',
      title: 'Classical Graph Algorithms',
      confidence: 85,
      reason: 'Proven algorithms like Dijkstra, A*, and Bellman-Ford provide optimal or near-optimal solutions for well-defined routing problems.',
      algorithm: "Dijkstra + A* Hybrid + Contraction Hierarchies",
      complexity: 'O((V + E) log V)',
      pros: ['Guaranteed optimality', 'Well-understood', 'Fast implementation', 'Deterministic results'],
      cons: ['Struggles with very large graphs', 'Static optimization only', 'Cannot handle dynamic changes well'],
      difficulty: 'Low',
      estimatedCost: '$15K-$60K',
      timeToImplement: '1-3 months',
    },
    {
      type: 'ai',
      title: 'Ant Colony Optimization (ACO)',
      confidence: 88,
      reason: 'Swarm intelligence algorithm inspired by ant behavior. Excellent for traveling salesman and vehicle routing problems with multiple constraints.',
      algorithm: 'Ant Colony System (ACS) + Local Search',
      complexity: 'O(n² × iterations)',
      pros: ['Distributed optimization', 'Good for dynamic problems', 'Multiple solutions in one run'],
      cons: ['Parameter sensitive', 'Convergence can be slow', 'Requires tuning'],
      difficulty: 'Medium',
      estimatedCost: '$30K-$100K',
      timeToImplement: '2-4 months',
    },
  ],
  scheduling: [
    {
      type: 'ai',
      title: 'Reinforcement Learning Scheduler',
      confidence: 92,
      reason: 'RL agents learn optimal scheduling policies by interacting with the environment, handling complex constraints and uncertainties.',
      algorithm: 'PPO / SAC with Graph Encoding',
      complexity: 'O(n × actions) per step',
      pros: ['Handles uncertainty', 'Learns from experience', 'Adapts to new constraints'],
      cons: ['Training time', 'Reward design challenges', 'Black box decisions'],
      difficulty: 'High',
      estimatedCost: '$60K-$200K',
      timeToImplement: '3-6 months',
    },
    {
      type: 'quantum-inspired',
      title: 'Quantum Annealing for Scheduling',
      confidence: 86,
      reason: 'Quantum annealing naturally solves combinatorial scheduling problems by finding low-energy states in the solution landscape.',
      algorithm: 'Quantum Annealing / QAOA',
      complexity: 'O(√N) theoretical',
      pros: ['Excellent for NP-hard scheduling', 'Can find global optima', 'Handles many constraints'],
      cons: ['Requires quantum hardware or simulator', 'Embedding overhead'],
      difficulty: 'High',
      estimatedCost: '$50K-$180K',
      timeToImplement: '3-5 months',
    },
    {
      type: 'classical',
      title: 'Constraint Programming + ILP',
      confidence: 90,
      reason: 'Mathematical optimization using integer linear programming and constraint programming guarantees optimal schedules for medium-sized problems.',
      algorithm: 'CP-SAT / ILP Solver',
      complexity: 'NP-hard (exact)',
      pros: ['Guaranteed optimality', 'Handles complex constraints', 'Mature solvers available'],
      cons: ['Scales poorly', 'Requires problem formalization'],
      difficulty: 'Medium',
      estimatedCost: '$20K-$80K',
      timeToImplement: '1-3 months',
    },
    {
      type: 'ai',
      title: 'Genetic Algorithm Scheduler',
      confidence: 83,
      reason: 'Evolutionary algorithm that evolves populations of schedules through selection, crossover, and mutation operators.',
      algorithm: 'NSGA-II / MOEA',
      complexity: 'O(population × generations × n)',
      pros: ['Multi-objective optimization', 'Handles non-linear constraints', 'Parallelizable'],
      cons: ['No optimality guarantee', 'Parameter tuning required', 'Can be slow to converge'],
      difficulty: 'Medium',
      estimatedCost: '$25K-$90K',
      timeToImplement: '2-4 months',
    },
  ],
  logistics: [
    {
      type: 'ai',
      title: 'Supply Chain RL Optimizer',
      confidence: 93,
      reason: 'Multi-agent RL systems optimize inventory, routing, and scheduling simultaneously across the entire supply chain.',
      algorithm: 'Multi-Agent PPO + GNN',
      complexity: 'O(Agents × Nodes × Actions)',
      pros: ['End-to-end optimization', 'Adapts to disruptions', 'Scalable architecture'],
      cons: ['Complex training', 'Requires simulation environment', 'High compute cost'],
      difficulty: 'Very High',
      estimatedCost: '$100K-$400K',
      timeToImplement: '6-12 months',
    },
    {
      type: 'quantum-inspired',
      title: 'Quantum-Inspired Logistics Network',
      confidence: 84,
      reason: 'Quantum-inspired algorithms optimize warehouse placement, inventory distribution, and last-mile delivery simultaneously.',
      algorithm: 'Quantum Annealing + MILP',
      complexity: 'O(n³) classical, O(√n) quantum',
      pros: ['Global optimization', 'Handles stochastic demand', 'Reduces logistics costs'],
      cons: ['Requires data integration', 'Long training cycles'],
      difficulty: 'High',
      estimatedCost: '$70K-$250K',
      timeToImplement: '4-7 months',
    },
    {
      type: 'classical',
      title: 'Mixed-Integer Linear Programming',
      confidence: 88,
      reason: 'MILP models optimize supply chain networks with linear constraints and integer decision variables for facility location and distribution.',
      algorithm: 'MILP with Benders Decomposition',
      complexity: 'NP-hard',
      pros: ['Exact optimal solutions', 'Well-studied theory', 'Commercial solvers available'],
      cons: ['Scales poorly', 'Requires linear approximations'],
      difficulty: 'Medium',
      estimatedCost: '$30K-$120K',
      timeToImplement: '2-4 months',
    },
  ],
  network: [
    {
      type: 'classical',
      title: 'Max-Flow Min-Cut Algorithms',
      confidence: 95,
      reason: 'Edmonds-Karp and Dinics algorithms solve maximum flow problems optimally, fundamental for network optimization.',
      algorithm: 'Dinic\'s Algorithm + Push-Relabel',
      complexity: 'O(V²E)',
      pros: ['Guaranteed optimality', 'Polynomial time', 'Widely applicable'],
      cons: ['Assumes static networks', 'Single objective only'],
      difficulty: 'Low',
      estimatedCost: '$10K-$40K',
      timeToImplement: '1-2 months',
    },
    {
      type: 'ai',
      title: 'Neural Network Routing',
      confidence: 87,
      reason: 'Deep learning models learn routing policies directly from network topology and traffic patterns.',
      algorithm: 'GNN + Attention Mechanism',
      complexity: 'O(E log V) per inference',
      pros: ['Learns from data', 'Handles complex topologies', 'Fast inference'],
      cons: ['Training data required', 'Generalization challenges'],
      difficulty: 'High',
      estimatedCost: '$50K-$180K',
      timeToImplement: '3-5 months',
    },
  ],
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function analyzeWithGroq(query: string): Promise<{ recommendations: Omit<Recommendation, 'id'>[]; category: string; categoryLabel: string }> {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

  const prompt = `You are an AI decision engine specializing in optimization and algorithms. Analyze this query and recommend the best computing approaches.

User query: "${query}"

Respond ONLY with valid JSON:
{
  "category": "Optimization|AI/ML|Finance|Science|Security|Logistics|Healthcare|Infrastructure|Energy|Robotics|NLP|General",
  "recommendations": [
    {
      "type": "classical|ai|quantum-inspired|future-quantum",
      "title": "specific solution name",
      "confidence": 0-100,
      "reason": "detailed explanation of why this approach works",
      "algorithm": "exact algorithm name",
      "complexity": "big-O notation",
      "pros": ["specific advantage 1", "specific advantage 2", "specific advantage 3"],
      "cons": ["specific limitation 1", "specific limitation 2"],
      "difficulty": "Low|Medium|High|Very High",
      "estimatedCost": "$XXK-$XXK",
      "timeToImplement": "X-Y months"
    }
  ]
}

Rules:
1. Provide exactly 4 recommendations
2. Mix classical, AI, and quantum-inspired approaches
3. Make recommendations specific to the query domain
4. Use real algorithm names and realistic complexity estimates
5. Confidence scores should reflect real-world effectiveness`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse Groq response');
  const parsed = JSON.parse(jsonMatch[0]);

  const typeMap: Record<string, Recommendation['type']> = {
    'classical': 'classical',
    'ai': 'ai',
    'quantum-inspired': 'quantum-inspired',
    'future quantum': 'future-quantum',
    'future-quantum': 'future-quantum',
  };

  const recommendations = (parsed.recommendations || []).map((r: Record<string, unknown>) => {
    const type = typeof r.type === 'string' && typeMap[r.type] ? typeMap[r.type] : 'ai';
    const confidence = typeof r.confidence === 'number' ? r.confidence : parseInt(String(r.confidence)) || 75;
    const pros = Array.isArray(r.pros) ? r.pros : [String(r.pros ?? 'Effective solution')];
    const cons = Array.isArray(r.cons) ? r.cons : [String(r.cons ?? 'Requires setup')];
    const difficulty = typeof r.difficulty === 'string' && ['Low', 'Medium', 'High', 'Very High'].includes(r.difficulty) ? r.difficulty : 'Medium';
    return { ...r, type, confidence, pros, cons, difficulty };
  });

  return {
    recommendations,
    category: parsed.category || 'General',
    categoryLabel: parsed.category || 'General',
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function analyzeQuery(query: string): { recommendations: Recommendation[]; category: string; categoryLabel: string } {
  const q = query.toLowerCase();
  let categoryKey = 'route';
  let categoryLabel = 'General';

  if (q.includes('route') || q.includes('path') || q.includes('delivery') || q.includes('traffic') || q.includes('logistics') || q.includes('supply') || q.includes('fleet') || q.includes('traveling salesman') || q.includes('tsp') || q.includes('vehicle routing') || q.includes('vrp')) {
    categoryKey = 'route';
    categoryLabel = 'Optimization';
  } else if (q.includes('image') || q.includes('classify') || q.includes('detect') || q.includes('vision') || q.includes('medical') || q.includes('drug') || q.includes('diagnosis')) {
    categoryKey = 'image';
    categoryLabel = 'AI/ML';
  } else if (q.includes('portfolio') || q.includes('finance') || q.includes('risk') || q.includes('trading') || q.includes('stock') || q.includes('investment')) {
    categoryKey = 'portfolio';
    categoryLabel = 'Finance';
  } else if (q.includes('protein') || q.includes('molecule') || q.includes('drug') || q.includes('healthcare') || q.includes('pharma') || q.includes('biology')) {
    categoryKey = 'protein';
    categoryLabel = 'Science';
  } else if (q.includes('fraud') || q.includes('security') || q.includes('anomaly') || q.includes('transaction') || q.includes('cyber') || q.includes('threat')) {
    categoryKey = 'fraud';
    categoryLabel = 'Security';
  } else if (q.includes('signal') || q.includes('infrastructure') || q.includes('city') || q.includes('transport')) {
    categoryKey = 'route';
    categoryLabel = 'Infrastructure';
  } else if (q.includes('energy') || q.includes('climate') || q.includes('weather') || q.includes('environment')) {
    categoryKey = 'route';
    categoryLabel = 'Energy/Climate';
  } else if (q.includes('game') || q.includes('robot') || q.includes('autonomous') || q.includes('control')) {
    categoryKey = 'image';
    categoryLabel = 'Robotics/AI';
  } else if (q.includes('chat') || q.includes('nlp') || q.includes('language') || q.includes('text') || q.includes('llm') || q.includes('summarize') || q.includes('translation')) {
    categoryKey = 'image';
    categoryLabel = 'NLP/AI';
  } else if (q.includes('schedule') || q.includes('job') || q.includes('machine') || q.includes('timetable') || q.includes('planning')) {
    categoryKey = 'scheduling';
    categoryLabel = 'Scheduling';
  } else if (q.includes('warehouse') || q.includes('inventory') || q.includes('stock') || q.includes('storage')) {
    categoryKey = 'logistics';
    categoryLabel = 'Logistics';
  } else if (q.includes('network') || q.includes('flow') || q.includes('bandwidth') || q.includes('throughput') || q.includes('packet') || q.includes('routing')) {
    categoryKey = 'network';
    categoryLabel = 'Network Optimization';
  }

  const solutions = solutionDatabase[categoryKey] || solutionDatabase['route'];
  const recommendations = solutions.map(s => ({ ...s, id: generateId() }));

  return { recommendations, category: categoryKey, categoryLabel };
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AIDecisionEngine() {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [category, setCategory] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_engine_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: AnalysisHistory) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('ai_engine_history', JSON.stringify(history));
    }
  }, [history]);

  async function analyze() {
    if (!query.trim()) return;
    setAnalyzing(true);
    setAnalyzed(false);
    setSelectedForCompare([]);
    setShowComparison(false);
    setAnalysisError(null);

    try {
      let recs: Recommendation[];
      let catLabel: string;

      if (GROQ_API_KEY) {
        try {
          const groqResult = await analyzeWithGroq(query);
          recs = groqResult.recommendations.map(s => ({ ...s, id: generateId() }));
          catLabel = groqResult.categoryLabel;
        } catch (groqError) {
          console.warn('Groq analysis failed, using fallback:', groqError);
          const fallback = analyzeQuery(query);
          recs = fallback.recommendations;
          catLabel = fallback.categoryLabel;
        }
      } else {
        const fallback = analyzeQuery(query);
        recs = fallback.recommendations;
        catLabel = fallback.categoryLabel;
      }

      const bestMatch = recs[0];
      setRecommendations(recs);
      setCategory(catLabel);
      setAnalyzing(false);
      setAnalyzed(true);

      const newHistory: AnalysisHistory = {
        id: generateId(),
        query,
        timestamp: new Date(),
        recommendations: recs,
        bestMatch,
        category: catLabel,
      };
      setHistory(prev => [newHistory, ...prev.slice(0, 19)]);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setAnalyzing(false);
    }
  }

  function toggleCompare(id: string) {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function compareSelected() {
    if (selectedForCompare.length >= 2) {
      setShowComparison(true);
    }
  }

  function doExport(format: 'json' | 'csv' | 'md') {
    if (!recommendations.length) return;
    const base = query.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

    if (format === 'json') {
      const payload = {
        query,
        category,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.map(r => ({
          type: r.type,
          title: r.title,
          confidence: r.confidence,
          algorithm: r.algorithm,
          complexity: r.complexity,
          difficulty: r.difficulty,
          estimatedCost: r.estimatedCost,
          timeToImplement: r.timeToImplement,
          reason: r.reason,
          pros: r.pros,
          cons: r.cons,
        })),
      };
      downloadBlob(JSON.stringify(payload, null, 2), `${base}_analysis_${timestamp}.json`, 'application/json');
    } else if (format === 'csv') {
      const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const headers = ['Type', 'Title', 'Confidence', 'Algorithm', 'Complexity', 'Difficulty', 'Cost', 'Time', 'Reason'];
      const rows = recommendations.map(r => [
        r.type, r.title, `${r.confidence}%`, r.algorithm || '', r.complexity || '', r.difficulty, r.estimatedCost, r.timeToImplement, r.reason,
      ].map(escape).join(','));
      const csv = `${headers.join(',')}\n${rows.join('\n')}`;
      downloadBlob(csv, `${base}_analysis_${timestamp}.csv`, 'text/csv');
    } else if (format === 'md') {
      const md = `# AI Decision Engine Analysis

**Query:** ${query}
**Category:** ${category}
**Generated:** ${new Date().toLocaleString()}

## Recommendations

${recommendations.map((r, i) => `### ${i + 1}. ${r.title}
- **Type:** ${r.type}
- **Confidence:** ${r.confidence}%
- **Algorithm:** ${r.algorithm || 'N/A'}
- **Complexity:** ${r.complexity || 'N/A'}
- **Difficulty:** ${r.difficulty}
- **Cost:** ${r.estimatedCost}
- **Time:** ${r.timeToImplement}

**Reasoning:** ${r.reason}

**Pros:**
${r.pros.map(p => `- ${p}`).join('\n')}

**Cons:**
${r.cons.map(c => `- ${c}`).join('\n')}

`).join('\n---\n')}

---
*Generated by SpydeyVerse AI Decision Engine*
`;
      downloadBlob(md, `${base}_analysis_${timestamp}.md`, 'text/markdown');
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem('ai_engine_history');
  }

  const compareRecs = useMemo(() => {
    return recommendations.filter(r => selectedForCompare.includes(r.id));
  }, [recommendations, selectedForCompare]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 to-red-700 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Decision Engine</h2>
            <p className="text-xs text-slate-500">Analyzes your problem and recommends the best computing approach</p>
          </div>
        </div>
        {analyzed && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {recommendations.length} solutions found
            </span>
          </div>
        )}
      </div>

      {analysisError && (
        <GlowCard className="p-4 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-400" />
            <div className="text-xs text-rose-400">{analysisError}</div>
          </div>
        </GlowCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlowCard className="p-5">
            <div className="text-xs font-semibold text-white mb-3">Describe Your Problem</div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Describe your problem or use case (e.g. 'optimize delivery routes for 500 vehicles across the city')..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-2">
                {scenarios.slice(0, 4).map(s => (
                  <button
                    key={s.label}
                    onClick={() => setQuery(s.label)}
                    className="text-[11px] px-2.5 py-1 rounded-lg glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={analyze}
                disabled={!query.trim() || analyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow ml-3 flex-shrink-0"
              >
                {analyzing ? (
                  <><span className="w-3 h-3 spinner" />Analyzing...</>
                ) : (
                  <><Brain size={13} />Analyze</>
                )}
              </button>
            </div>
          </GlowCard>

          {analyzed && recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Found <span className="text-white font-medium">{recommendations.length}</span> recommendations for "{query}"
                  {category && <span className="ml-2 text-slate-600">· Category: {category}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all">
                      <Download size={11} /> Export
                    </button>
                    <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block glass rounded-lg border border-white/10 p-1 min-w-[120px]">
                      {(['json', 'csv', 'md'] as const).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => doExport(fmt)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedForCompare.length >= 2 && (
                    <button
                      onClick={compareSelected}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-all"
                    >
                      <BarChart2 size={11} /> Compare ({selectedForCompare.length})
                    </button>
                  )}
                </div>
              </div>

              {showComparison && compareRecs.length >= 2 && (
                <GlowCard className="p-5 border-violet-500/20">
                  <div className="text-xs font-semibold text-white mb-4">Side-by-Side Comparison</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-2 px-3 text-slate-500 font-medium">Feature</th>
                          {compareRecs.map(r => (
                            <th key={r.id} className="text-left py-2 px-3 text-slate-400 font-medium min-w-[150px]">{r.title}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          ['Type', ...compareRecs.map(r => r.type)],
                          ['Confidence', ...compareRecs.map(r => `${r.confidence}%`)],
                          ['Difficulty', ...compareRecs.map(r => r.difficulty)],
                          ['Cost', ...compareRecs.map(r => r.estimatedCost)],
                          ['Time', ...compareRecs.map(r => r.timeToImplement)],
                          ['Algorithm', ...compareRecs.map(r => r.algorithm || 'N/A')],
                        ].map(([label, ...vals]) => (
                          <tr key={label} className="hover:bg-white/3">
                            <td className="py-2 px-3 text-slate-500 font-medium whitespace-nowrap">{label}</td>
                            {vals.map((v, i) => (
                              <td key={i} className="py-2 px-3 text-slate-300">{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlowCard>
              )}

              {recommendations.map((rec, i) => {
                const config = typeConfig[rec.type];
                const Icon = config.icon;
                const isComparing = selectedForCompare.includes(rec.id);
                return (
                  <GlowCard key={rec.id} className={`p-5 transition-all ${i === 0 ? 'border-emerald-500/20' : ''}`} glow={i === 0 ? 'blue' : 'none'}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {i === 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><Star size={10} /> Best Match</span>}
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${config.badge}`}>{config.label}</span>
                          <button
                            onClick={() => toggleCompare(rec.id)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-all ${isComparing ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'glass border-white/10 text-slate-500 hover:text-white'}`}
                          >
                            {isComparing ? 'Comparing' : 'Compare'}
                          </button>
                          <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                            <BarChart2 size={11} />
                            <span className="font-medium text-white">{rec.confidence}%</span> confidence
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">{rec.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.reason}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div className="glass rounded-lg p-3 border border-emerald-500/10 bg-emerald-500/5">
                            <div className="text-[10px] text-emerald-400 font-medium mb-1.5">Advantages</div>
                            {rec.pros.map((pro, pi) => (
                              <div key={pi} className="flex items-start gap-1.5 text-[11px] text-slate-400 mb-1">
                                <CheckCircle size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                {pro}
                              </div>
                            ))}
                          </div>
                          <div className="glass rounded-lg p-3 border border-rose-500/10 bg-rose-500/5">
                            <div className="text-[10px] text-rose-400 font-medium mb-1.5">Considerations</div>
                            {rec.cons.map((con, ci) => (
                              <div key={ci} className="flex items-start gap-1.5 text-[11px] text-slate-400 mb-1">
                                <AlertTriangle size={10} className="text-rose-400 mt-0.5 flex-shrink-0" />
                                {con}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-[11px] mb-3">
                          {rec.algorithm && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Cpu size={10} className="text-slate-600" />
                              Algorithm: <span className="text-slate-300">{rec.algorithm}</span>
                            </div>
                          )}
                          {rec.complexity && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock size={10} className="text-slate-600" />
                              Complexity: <span className="text-slate-300 font-mono">{rec.complexity}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-500">
                            <TrendingUp size={10} className="text-slate-600" />
                            Difficulty: <span className="text-slate-300">{rec.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            Cost: <span className="text-slate-300">{rec.estimatedCost}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            Timeline: <span className="text-slate-300">{rec.timeToImplement}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                              style={{ width: `${rec.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <GlowCard className="p-4">
            <div className="text-xs font-semibold text-white mb-3">Solution Types</div>
            <div className="space-y-3">
              {Object.entries(typeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={12} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-300">{config.label}</div>
                      <div className="text-[10px] text-slate-600">
                        {type === 'classical' ? 'Standard algorithms' :
                         type === 'ai' ? 'ML/DL powered' :
                         type === 'quantum-inspired' ? 'Quantum heuristics' :
                         'Future hardware'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="text-xs font-semibold text-white mb-3">More Scenarios</div>
            <div className="space-y-1">
              {scenarios.slice(4).map(s => (
                <button
                  key={s.label}
                  onClick={() => setQuery(s.label)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-left transition-colors group"
                >
                  <div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">{s.label}</div>
                    <div className="text-[10px] text-slate-600">{s.category}</div>
                  </div>
                  <ArrowRight size={11} className="text-slate-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-white">Recent Analyses</div>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1">
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-[11px] text-slate-600 text-center py-4">No analyses yet. Try describing a problem above.</div>
              ) : (
                history.map(h => (
                  <div
                    key={h.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => { setQuery(h.query); }}
                  >
                    <History size={12} className="text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-slate-400 truncate">{h.query}</div>
                      <div className="text-[10px] text-slate-600">
                        {h.timestamp.toLocaleTimeString()} · {h.category}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex-shrink-0">
                      {Math.round(h.bestMatch.confidence)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
