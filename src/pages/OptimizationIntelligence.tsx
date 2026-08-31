import { useState } from 'react';
import { Route, Play, RotateCcw, TrendingUp, Cpu } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

const algorithms = [
  { id: 'dijkstra', name: "Dijkstra's", category: 'Shortest Path', complexity: 'O((V+E) log V)', desc: 'Finds shortest path in weighted graphs with non-negative edges' },
  { id: 'astar', name: 'A* Search', category: 'Shortest Path', complexity: 'O(b^d)', desc: 'Heuristic-guided pathfinding, faster than Dijkstra for single targets' },
  { id: 'bfs', name: 'BFS', category: 'Graph Traversal', complexity: 'O(V+E)', desc: 'Breadth-First Search — unweighted shortest path' },
  { id: 'dp', name: 'Dynamic Programming', category: 'Optimization', complexity: 'O(n²)', desc: 'Breaks complex problems into overlapping subproblems' },
  { id: 'greedy', name: 'Greedy Algorithm', category: 'Optimization', complexity: 'O(n log n)', desc: 'Makes locally optimal choices at each step' },
  { id: 'pq', name: 'Priority Queue', category: 'Data Structure', complexity: 'O(log n)', desc: 'Efficient ordering of tasks by priority' },
];

const useCases = [
  { title: 'Warehouse Optimization', icon: '🏭', current: '4.2h', optimized: '2.1h', improvement: 50, algo: 'Dijkstra + Greedy' },
  { title: 'Delivery Route', icon: '🚚', current: '180km', optimized: '127km', improvement: 29, algo: 'A* + TSP heuristic' },
  { title: 'Supply Chain', icon: '⛓️', current: '72hrs', optimized: '38hrs', improvement: 47, algo: 'Dynamic Programming' },
  { title: 'Campus Allocation', icon: '🏫', current: '340 conflicts', optimized: '12 conflicts', improvement: 96, algo: 'Backtracking + CSP' },
  { title: 'Factory Scheduling', icon: '🔧', current: '94% utilization', optimized: '99% utilization', improvement: 5, algo: 'Priority Queue' },
  { title: 'Inventory Mgmt', icon: '📦', current: '$42K excess', optimized: '$8K excess', improvement: 81, algo: 'DP + Forecasting' },
];

// Simple grid pathfinding visualization
function PathfindingViz() {
  const ROWS = 10, COLS = 16;
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill('empty'))
  );
  const [mode, setMode] = useState<'wall' | 'start' | 'end'>('wall');
  const [start, setStart] = useState<[number, number] | null>([2, 2]);
  const [end, setEnd] = useState<[number, number] | null>([7, 13]);
  const [path, setPath] = useState<[number, number][]>([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<{ nodes: number; length: number; time: number } | null>(null);

  // Simple BFS pathfinding
  function findPath() {
    if (!start || !end) return;
    setRunning(true);
    const t0 = performance.now();
    
    const visited = new Set<string>();
    const queue: [[number, number], [number, number][]][] = [[start, [start]]];
    const walls = new Set<string>(
      grid.flatMap((row, r) => row.map((cell, c) => cell === 'wall' ? `${r},${c}` : '').filter(Boolean))
    );

    let found: [number, number][] | null = null;
    let nodesVisited = 0;

    while (queue.length > 0) {
      const [current, currentPath] = queue.shift()!;
      const key = `${current[0]},${current[1]}`;
      if (visited.has(key)) continue;
      visited.add(key);
      nodesVisited++;

      if (current[0] === end[0] && current[1] === end[1]) {
        found = currentPath;
        break;
      }

      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      for (const [dr, dc] of dirs) {
        const nr = current[0] + dr, nc = current[1] + dc;
        const nk = `${nr},${nc}`;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(nk) && !walls.has(nk)) {
          queue.push([[nr, nc], [...currentPath, [nr, nc]]]);
        }
      }
    }

    const t1 = performance.now();
    setTimeout(() => {
      setPath(found || []);
      setStats({ nodes: nodesVisited, length: found?.length || 0, time: Math.round((t1 - t0) * 100) / 100 });
      setRunning(false);
    }, 600);
  }

  function handleCellClick(r: number, c: number) {
    if (mode === 'start') {
      setStart([r, c]);
      setPath([]);
    } else if (mode === 'end') {
      setEnd([r, c]);
      setPath([]);
    } else {
      const next = grid.map(row => [...row]);
      next[r][c] = next[r][c] === 'wall' ? 'empty' : 'wall';
      setGrid(next);
      setPath([]);
    }
  }

  function reset() {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('empty')));
    setPath([]);
    setStats(null);
  }

  function getCellColor(r: number, c: number) {
    if (start && r === start[0] && c === start[1]) return 'bg-emerald-500';
    if (end && r === end[0] && c === end[1]) return 'bg-rose-500';
    if (grid[r][c] === 'wall') return 'bg-slate-600';
    if (path.some(([pr, pc]) => pr === r && pc === c)) return 'bg-red-500';
    return 'bg-slate-800/60';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['wall', 'start', 'end'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${mode === m ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'glass border border-white/10 text-slate-400 hover:text-white'}`}>
            {m === 'wall' ? 'Draw Walls' : m === 'start' ? 'Set Start' : 'Set End'}
          </button>
        ))}
        <button onClick={findPath} disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all">
          <Play size={11} />{running ? 'Finding...' : 'Find Path (BFS)'}
        </button>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-slate-400 hover:text-white text-xs transition-colors">
          <RotateCcw size={11} />Reset
        </button>
      </div>
      
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {grid.map((row, r) =>
          row.map((_, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`w-6 h-6 rounded-sm cursor-pointer transition-all hover:opacity-80 ${getCellColor(r, c)}`}
            />
          ))
        )}
      </div>

      <div className="flex gap-3 text-[11px] flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" />Start</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" />End</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-600" />Wall</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" />Path</span>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-lg p-2.5 border border-white/5 text-center">
            <div className="text-base font-bold text-red-400">{stats.length}</div>
            <div className="text-[10px] text-slate-600">Path Length</div>
          </div>
          <div className="glass rounded-lg p-2.5 border border-white/5 text-center">
            <div className="text-base font-bold text-red-400">{stats.nodes}</div>
            <div className="text-[10px] text-slate-600">Nodes Visited</div>
          </div>
          <div className="glass rounded-lg p-2.5 border border-white/5 text-center">
            <div className="text-base font-bold text-emerald-400">{stats.time}ms</div>
            <div className="text-[10px] text-slate-600">Time</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OptimizationIntelligence() {
  const [activeAlgo, setActiveAlgo] = useState(0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Route size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Optimization Intelligence</h2>
          <p className="text-xs text-slate-500">DSA-powered real-world workflow optimization</p>
        </div>
      </div>

      {/* Interactive Pathfinding */}
      <GlowCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white">Interactive Pathfinding Visualizer</h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BFS Algorithm</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Click cells to add/remove walls. Set start and end points, then find the shortest path.</p>
        <PathfindingViz />
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Algorithm library */}
        <GlowCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Algorithm Library</h3>
          <div className="space-y-1 mb-4">
            {algorithms.map((algo, i) => (
              <button
                key={algo.id}
                onClick={() => setActiveAlgo(i)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  activeAlgo === i
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'glass border border-white/5 hover:border-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-white">{algo.name}</div>
                  <div className="text-[10px] text-slate-500">{algo.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-emerald-400">{algo.complexity}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="glass rounded-xl p-4 border border-emerald-500/10 bg-emerald-500/5">
            <div className="text-xs font-semibold text-emerald-400 mb-1">{algorithms[activeAlgo].name}</div>
            <div className="text-xs text-slate-400">{algorithms[activeAlgo].desc}</div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <Cpu size={10} className="text-slate-600" />
              <span className="text-slate-600">Time:</span>
              <span className="font-mono text-emerald-300">{algorithms[activeAlgo].complexity}</span>
            </div>
          </div>
        </GlowCard>

        {/* Real-world use cases */}
        <GlowCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Real-World Impact</h3>
          <div className="space-y-2">
            {useCases.map(({ title, icon, current, optimized, improvement, algo }) => (
              <div key={title} className="glass rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div>
                      <div className="text-xs font-medium text-white">{title}</div>
                      <div className="text-[10px] text-slate-600">{algo}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <TrendingUp size={11} />
                    {improvement}%
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-slate-600">Before: <span className="text-slate-400">{current}</span></div>
                  <div className="text-slate-600">→</div>
                  <div className="text-slate-600">After: <span className="text-emerald-400 font-medium">{optimized}</span></div>
                </div>
                <div className="mt-2 w-full bg-white/5 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{ width: `${improvement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
