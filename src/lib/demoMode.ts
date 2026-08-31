/* ──────────────────────────────────────────────────────────────
   SpydeyVerse Demo Mode
   Complete self-contained AI simulation — no external APIs needed.
   All features work fully: chatbot replies, image analysis, reports.
   ────────────────────────────────────────────────────────────── */

export type PersonaId = 'quantum' | 'code' | 'research' | 'business';

interface WasteResult {
  name: string;
  material: string;
  recyclable: boolean;
  impact: 'low' | 'medium' | 'high';
  carbon: number;
  confidence: number;
}

const WASTE_ITEMS: WasteResult[] = [
  { name: 'Plastic Bottle', material: 'PET Plastic', recyclable: true, impact: 'medium', carbon: 0.082, confidence: 94 },
  { name: 'Cardboard Box', material: 'Cardboard', recyclable: true, impact: 'low', carbon: 0.045, confidence: 91 },
  { name: 'Styrofoam Cup', material: 'Polystyrene', recyclable: false, impact: 'high', carbon: 0.18, confidence: 88 },
  { name: 'Glass Bottle', material: 'Glass', recyclable: true, impact: 'low', carbon: 0.031, confidence: 96 },
  { name: 'Aluminum Can', material: 'Aluminum', recyclable: true, impact: 'low', carbon: 0.067, confidence: 95 },
  { name: 'Steel Can', material: 'Steel', recyclable: true, impact: 'low', carbon: 0.054, confidence: 92 },
  { name: 'Paper Bag', material: 'Paper', recyclable: true, impact: 'low', carbon: 0.028, confidence: 90 },
  { name: 'Food Waste', material: 'Organic', recyclable: true, impact: 'medium', carbon: 0.15, confidence: 85 },
  { name: 'E-Waste', material: 'Mixed Electronics', recyclable: false, impact: 'high', carbon: 1.2, confidence: 87 },
  { name: 'Textile Waste', material: 'Cotton/Polyester', recyclable: true, impact: 'medium', carbon: 0.12, confidence: 83 },
];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function analyzeImageDemo(dataUrl: string): WasteResult {
  const hash = hashString(dataUrl.slice(0, 500));
  const base = pickRandom(WASTE_ITEMS, hash);
  const variation = (hash % 7) - 3;
  const carbonVariation = (variation * 0.005).toFixed(3);
  return {
    ...base,
    carbon: Math.max(0.01, parseFloat(carbonVariation) + base.carbon),
    confidence: Math.min(99, base.confidence + (hash % 5)),
  };
}

export function describeImageDemo(dataUrl: string): string {
  const hash = hashString(dataUrl.slice(-200));
  const descriptions = [
    'A waste item appears in the image, likely a household recyclable material.',
    'The image shows what appears to be a discarded consumer product.',
    'Detected a potential waste item with recyclable components.',
    'Image contains material that may be suitable for recycling or proper disposal.',
  ];
  return descriptions[hash % descriptions.length];
}

const CHAT_RESPONSES: Record<PersonaId, Array<{ keywords: string[]; reply: string }>> = {
  quantum: [
    { keywords: ['superposition', 'qubit'], reply: '**Quantum Superposition** is a core quantum computing principle.\n\nIn classical computing, a bit is either 0 or 1. A **qubit** can exist in a superposition:\n\n|ψ⟩ = α|0⟩ + β|1⟩\n\nWhen measured, it collapses to one state. This enables **quantum parallelism** — the foundation of quantum speedup.\n\n**Key insight:** Quantum computers explore many solutions simultaneously, not sequentially.' },
    { keywords: ['entangle', 'entanglement'], reply: '**Quantum Entanglement** is Einstein\'s "spooky action at a distance."\n\nWhen two qubits are entangled:\n- Measuring one instantly determines the other\'s state\n- No matter the distance between them\n- No information travels faster than light\n\n**Applications:**\n- Quantum teleportation\n- Superdense coding\n- Quantum cryptography (QKD)' },
    { keywords: ['gate', 'hadamard', 'pauli', 'cnn'], reply: '**Quantum Gates** manipulate qubit states.\n\n**Single-qubit gates:**\n- H (Hadamard): creates superposition\n- X: quantum NOT gate\n- Y, Z: phase/rotation gates\n\n**Two-qubit gates:**\n- CNOT: entanglement\n- CZ: controlled phase\n\n**Universal gate set:** Any quantum circuit can be built from H, T, and CNOT gates.' },
    { keywords: ['algorithm', 'shor', 'grover'], reply: '**Quantum Algorithms** leverage quantum mechanics for speedup.\n\n**Shor\'s Algorithm** (1994):\n- Factors integers exponentially faster\n- Threatens RSA encryption\n- Complexity: O((log N)³)\n\n**Grover\'s Algorithm**:\n- Unstructured search: O(√N) vs O(N)\n- Quadratic speedup\n- Database search, optimization' },
    { keywords: ['supremacy', 'advantage'], reply: '**Quantum Supremacy/Advantage** means a quantum computer solves a problem infeasible for classical computers.\n\n**Milestones:**\n- 2019: Google Sycamore (53 qubits) — random circuit sampling\n- 2020+: China Jiuzhang (photonic, 76 photons)\n- 2023+: IBM Osprey (433 qubits), Condor (1121 qubits)\n\n**Current status:** NISQ era — noisy, error-prone, but showing promise.' },
  ],
  code: [
    { keywords: ['dijkstra', 'shortest path'], reply: '**Dijkstra\'s Algorithm** — shortest path in weighted graphs.\n\n**Time Complexity:** O((V + E) log V) with min-heap\n\n```\nfunction dijkstra(graph, start) {\n  const dist = {};\n  const visited = new Set();\n  // ...implementation\n}\n```\n\n**Use cases:** GPS navigation, network routing, supply chain optimization.' },
    { keywords: ['sort', 'algorithm'], reply: '**Sorting Algorithms** comparison:\n\n| Algorithm | Best | Avg | Worst | Space |\n|-----------|------|-----|-------|-------|\n| QuickSort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n| MergeSort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| HeapSort | O(n log n) | O(n log n) | O(n log n) | O(1) |\n\n**Recommendation:** QuickSort for general use, MergeSort for stable sorting.' },
    { keywords: ['dynamic programming', 'dp'], reply: '**Dynamic Programming** solves overlapping subproblems optimally.\n\n**Approaches:**\n1. **Memoization** (top-down) — cache results\n2. **Tabulation** (bottom-up) — iterative table filling\n\n**Classic problems:**\n- Fibonacci: O(n) with memoization\n- Knapsack: O(n × W)\n- LCS: O(m × n)\n- Edit distance: O(m × n)' },
    { keywords: ['react', 'component', 'hook'], reply: '**React Best Practices:**\n\n```tsx\n// Custom hook pattern\nfunction useApi(url: string) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url).then(r => r.json()).then(setData);\n  }, [url]);\n  return data;\n}\n```\n\n**Key principles:**\n- Single responsibility per component\n- Custom hooks for reusable logic\n- Memoization with `useMemo`/`useCallback`' },
  ],
  research: [
    { keywords: ['machine learning', 'ml', 'model'], reply: '**Machine Learning** enables systems to learn from data.\n\n**Types:**\n- **Supervised:** Classification, regression (labeled data)\n- **Unsupervised:** Clustering, dimensionality reduction\n- **Reinforcement:** Reward-based learning\n\n**Key algorithms:**\n- Random Forest, XGBoost (tabular)\n- CNNs, Transformers (images/text)\n- K-Means, PCA (unsupervised)' },
    { keywords: ['neural', 'deep learning', 'network'], reply: '**Deep Learning** uses multi-layer neural networks.\n\n**Architectures:**\n- **CNN:** Images, computer vision\n- **RNN/LSTM:** Sequences, time series\n- **Transformer:** NLP, attention mechanism\n- **GAN:** Generative models\n- **Diffusion:** Image generation\n\n**Training tips:**\n- Batch normalization\n- Dropout regularization\n- Learning rate scheduling' },
    { keywords: ['data', 'analysis', 'statistics'], reply: '**Statistical Analysis** fundamentals:\n\n**Descriptive:**\n- Mean, median, mode, std dev\n- Correlation, covariance\n\n**Inferential:**\n- Hypothesis testing (t-test, chi-square)\n- Confidence intervals\n- P-values\n\n**Experimental design:**\n- Control groups\n- Randomization\n- Sample size calculation' },
  ],
  business: [
    { keywords: ['supply chain', 'optimization', 'logistics'], reply: '**Supply Chain Optimization** with SpydeyVerse:\n\n**Classical Approaches:**\n- Linear Programming for resource allocation\n- Dynamic Programming for lot sizing\n- Graph algorithms for routing\n\n**AI Enhancement:**\n- Demand forecasting (LSTM, XGBoost)\n- Anomaly detection\n- Reinforcement learning for adaptive routing\n\n**Typical results:** 47% processing time reduction, 29% routing distance reduction.' },
    { keywords: ['market', 'strategy', 'competitive'], reply: '**Market Strategy Framework:**\n\n**Porter\'s Five Forces:**\n1. Threat of new entrants\n2. Bargaining power of suppliers\n3. Bargaining power of buyers\n4. Threat of substitutes\n5. Industry rivalry\n\n**SWOT Analysis:**\n- Strengths, Weaknesses (internal)\n- Opportunities, Threats (external)\n\n**Action:** Combine quantitative data with qualitative insights for strategic decisions.' },
    { keywords: ['finance', 'cost', 'budget', 'roi'], reply: '**Financial Modeling** essentials:\n\n**Key metrics:**\n- NPV (Net Present Value)\n- IRR (Internal Rate of Return)\n- ROI (Return on Investment)\n- Payback period\n\n**Budget optimization:**\n- Zero-based budgeting\n- Activity-based costing\n- Sensitivity analysis\n\n**Risk management:** Monte Carlo simulation, scenario planning.' },
  ],
};

const FOLLOW_UPS = [
  'Would you like me to elaborate on any specific aspect?',
  'Do you have a follow-up question?',
  'I can also show practical examples if you\'d like.',
  'Want to explore this topic in more depth?',
];

export function getChatReplyDemo(persona: PersonaId, userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  if (msg.length < 3) {
    return 'Could you provide more details? I\'m here to help with quantum computing, programming, research, or business questions.';
  }

  const personaResponses = CHAT_RESPONSES[persona] || CHAT_RESPONSES.quantum;

  for (const entry of personaResponses) {
    if (entry.keywords.some(kw => msg.includes(kw))) {
      const followUp = FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)];
      return entry.reply + '\n\n' + followUp;
    }
  }

  const genericReplies = [
    `That's an interesting question about "${userMessage.slice(0, 50)}". Let me share some insights:\n\nIn the context of SpydeyVerse's quantum-AI platform, this relates to our core modules — Quantum Intelligence, AI Decision Engine, and Optimization modules.\n\n${FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)]}`,
    `Great question! Here's my analysis:\n\nBased on current knowledge in this area, there are several key considerations:\n1. Technical feasibility\n2. Resource requirements\n3. Implementation timeline\n4. Risk factors\n\n${FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)]}`,
    `I'd be happy to help with that. The SpydeyVerse platform integrates quantum computing, AI, and advanced analytics to address complex problems.\n\n**Quick summary:**\n- Quantum algorithms provide exponential speedup for specific problems\n- AI enhances pattern recognition and prediction\n- Combined approach yields best results\n\n${FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)]}`,
  ];

  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

export function getEcoScanDemo(dataUrl: string): {
  result: WasteResult;
  sustainabilityScore: number;
  recommendations: string[];
} {
  const result = analyzeImageDemo(dataUrl);
  const score = Math.max(20, Math.min(95, 100 - (result.impact === 'high' ? 60 : result.impact === 'medium' ? 35 : 15) + Math.floor(Math.random() * 20)));

  const recommendations: Record<string, string[]> = {
    'PET Plastic': ['Recycle in designated plastic bins', 'Consider reusable alternatives', 'Rinse before recycling'],
    'Cardboard': ['Flatten for efficient recycling', 'Reuse for packaging', 'Compost if contaminated with food'],
    'Polystyrene': ['Minimize use — not widely recyclable', 'Consider biodegradable alternatives', 'Check local facility acceptance'],
    'Glass': ['Recycle indefinitely without quality loss', 'Rinse before recycling', 'Separate by color if required'],
    'Aluminum': ['Highly recyclable — 95% energy savings', 'Recycle in metal bins', 'Consider aluminum-free alternatives'],
    'Steel': ['Recycle in metal bins', 'Remove non-metal components', 'Scrap yards accept bulk steel'],
    'Paper': ['Recycle in paper bins', 'Avoid recycling if wet/soiled', 'Consider digital alternatives'],
    'Organic': ['Compost if facilities available', 'Consider anaerobic digestion', 'Reduce food waste at source'],
    'Mixed Electronics': ['Find certified e-waste recycler', 'Remove batteries separately', 'Donate working electronics'],
    'Cotton/Polyester': ['Donate if usable', 'Textile recycling programs available', 'Consider sustainable fashion brands'],
  };

  const recs = recommendations[result.material] || ['Dispose responsibly', 'Check local recycling guidelines', 'Consider reducing consumption'];

  return { result, sustainabilityScore: score, recommendations: recs };
}

export function generateReportDemo(result: WasteResult, qty: number, score: number): string {
  const totalCarbon = (result.carbon * qty).toFixed(3);
  const impactLabel = result.impact === 'low' ? 'Low' : result.impact === 'medium' ? 'Medium' : 'High';
  return `## Environmental Impact Report
**Item:** ${result.name}
**Material:** ${result.material}
**Quantity:** ${qty}
**AI Confidence:** ${result.confidence}%
**Recyclable:** ${result.recyclable ? 'Yes' : 'No'}

### Impact Assessment
- **Impact Level:** ${impactLabel}
- **Carbon Footprint:** ${totalCarbon} kg CO₂e
- **Sustainability Score:** ${score}/100

### Recommendations
1. ${result.recyclable ? 'Recycle through proper channels' : 'Dispose at designated facility'}
2. Consider reusable alternatives
3. Check local recycling guidelines

### Environmental Notes
${result.recyclable
  ? 'This item can be recycled, reducing environmental impact by up to 80% compared to landfill disposal.'
  : 'This item requires special disposal. Improper disposal can cause significant environmental harm.'}

---
*Report generated by SpydeyVerse EcoScanner AI Demo Mode*
*Analysis confidence: ${result.confidence}%*`;
}

export function isDemoModeEnabled(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}
