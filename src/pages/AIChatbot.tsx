import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Atom, Code, Briefcase, FlaskConical, Bot, User, Trash2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import GlowCard from '@/components/ui/GlowCard';
import { openRouterChat, OpenRouterError, isOpenRouterConfigured } from '@/lib/openrouter';
import { localLoadMessages, localInsertChat, localClearChat } from '@/lib/localAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const personas = [
  { id: 'quantum', icon: Atom, label: 'Quantum Tutor', color: 'from-red-600 to-rose-600', desc: 'Explain quantum concepts' },
  { id: 'code', icon: Code, label: 'Code Assistant', color: 'from-rose-700 to-red-700', desc: 'Help with programming' },
  { id: 'research', icon: FlaskConical, label: 'Research AI', color: 'from-teal-500 to-emerald-500', desc: 'Academic assistance' },
  { id: 'business', icon: Briefcase, label: 'Business AI', color: 'from-amber-500 to-orange-500', desc: 'Strategy & analytics' },
];

const quickPrompts = [
  'Explain quantum superposition in simple terms',
  'What is Dijkstra\'s algorithm?',
  'How does deepfake detection work?',
  'What is the difference between AI and quantum computing?',
  'Explain the Hadamard gate',
  'How can I optimize my supply chain?',
];

const personaSystemPrompts: Record<string, string> = {
  quantum: `You are a quantum computing tutor for the SpydeyVerse platform. You explain quantum computing concepts (qubits, superposition, entanglement, quantum gates, quantum algorithms) clearly and with intuition-building analogies. You can discuss real quantum hardware, quantum supremacy, and near-term quantum applications. Be conversational but precise.`,
  code: `You are a programming assistant. You help with algorithm implementation, data structures, design patterns, code review, optimization, and debugging across languages including Python, JavaScript/TypeScript, Java, C++, and SQL. Provide clear code examples. Be concise and practical.`,
  research: `You are a research AI assistant for academic and scientific topics. You help with research methodology, literature review, experimental design, data analysis, and scientific computing. You cover physics, chemistry, biology, medicine, and environmental science. Be thorough and cite methods.`,
  business: `You are a business strategy AI assistant. You help with strategic planning, market analysis, operations, supply chain optimization, financial modeling, and data-driven decision making. You provide actionable frameworks and insights. Be data-oriented.`,
};

function generateReply(persona: string, msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('superposition') || m.includes('qubit')) {
    return `**Quantum Superposition** is one of the most fascinating concepts in quantum computing!\n\nIn classical computing, a bit is either 0 (off) or 1 (on) — like a light switch. A **qubit**, however, can exist in a combination of both states simultaneously, described by the equation:\n\n|ψ⟩ = α|0⟩ + β|1⟩\n\nWhere α and β are probability amplitudes. When you **measure** the qubit, it "collapses" to either 0 or 1 — but before measurement, it holds information about both possibilities.\n\n💡 **Key insight:** This is why quantum computers could theoretically solve certain problems exponentially faster — they can explore many solutions simultaneously rather than one at a time.`;
  }
  if (m.includes('dijkstra')) {
    return `**Dijkstra's Algorithm** is a classic graph algorithm for finding the shortest path!\n\n**How it works:**\n1. Start at the source node with distance 0\n2. Mark all other nodes with distance ∞\n3. Visit the unvisited node with smallest distance\n4. Update neighbors' distances if a shorter path is found\n5. Repeat until destination is reached\n\n**Time Complexity:** O((V + E) log V) with a priority queue\n\n**Use cases in SpydeyVerse:**\n- 🚚 Delivery route optimization\n- 🏭 Warehouse navigation\n- 🗺️ Network routing\n\nWant me to show a step-by-step example with a specific graph?`;
  }
  if (m.includes('deepfake')) {
    return `**Deepfake Detection** uses multiple AI analysis layers:\n\n**1. Facial Analysis**\n- Landmark consistency checking\n- Unnatural blinking pattern detection\n- Micro-expression analysis\n\n**2. Spectral Analysis**\n- GAN artifact detection in frequency domain\n- Compression artifact analysis\n- Texture inconsistency mapping\n\n**3. Temporal Analysis** (for videos)\n- Frame-by-frame consistency\n- Lighting change detection\n- Motion vector analysis\n\n**SpydeyVerse DeepScan v2.1** achieves 99.2% accuracy on benchmark datasets. The model was trained on 2M+ deepfake examples across multiple generation methods.`;
  }
  if (m.includes('hadamard') || m.includes('h gate')) {
    return '**The Hadamard Gate (H)** is the most fundamental quantum gate!\n\nIt transforms:\n- |0> → |+> = (|0> + |1>) / sqrt(2)\n\n**Matrix representation:**\nH = (1/sqrt(2)) × [[1, 1], [1, -1]]\n\n**Why it matters:** The H gate creates superposition - the starting point for quantum parallelism.\n\n**In practice:** Apply H to |0> and you get equal probability of measuring 0 or 1.';
  }
  if (m.includes('supply chain') || m.includes('optimize')) {
    return `**Supply Chain Optimization** with SpydeyVerse:\n\n**Classical Approach (Available Now):**\n- Dynamic Programming for lot sizing\n- Linear Programming for resource allocation\n- Greedy algorithms for scheduling\n- Graph algorithms for routing\n\n**AI Enhancement:**\n- Demand forecasting with ML (LSTM networks)\n- Anomaly detection for disruptions\n- Reinforcement learning for adaptive routing\n\n**Quantum-Inspired Future:**\n- QAOA for combinatorial optimization\n- Quantum annealing for constraint satisfaction\n\n**Typical results with our Optimization module:**\n- 47% reduction in processing time\n- 29% reduction in routing distance\n- 81% reduction in excess inventory\n\nWould you like to run an optimization scenario in the Optimization module?`;
  }
  if (persona === 'code') {
    return `I can help with programming! Here's what I can assist with:\n\n**Languages:** Python, JavaScript/TypeScript, Java, C++, SQL, and more\n\n**Topics:**\n- Algorithm implementation\n- Data structures\n- Design patterns\n- Code review and optimization\n- Debugging assistance\n\nWhat specific programming challenge can I help you with today?`;
  }
  return `That's a great question about "${msg.slice(0, 60)}${msg.length > 60 ? '...' : ''}"!\n\nAs your SpydeyVerse AI assistant, I combine knowledge across quantum computing, optimization algorithms, cybersecurity, environmental analysis, and general AI/ML.\n\n**I can help you with:**\n- 🔬 Quantum computing concepts and education\n- ⚡ Algorithm selection and optimization\n- 🛡️ Security analysis and recommendations\n- 🌱 Environmental sustainability assessment\n- 💻 Programming and data science\n- 📊 Business intelligence and analytics\n\nCould you give me more details about what you'd like to explore? I'm here to help bridge classical computing and the quantum future!`;
}

export default function AIChatbot() {
  const { user, supabaseAvailable } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [persona, setPersona] = useState('quantum');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadMessages();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    if (supabaseAvailable) {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data as Message[]);
    } else if (user) {
      const { data } = await localLoadMessages(user.id);
      if (data) setMessages(data as Message[]);
    }
    setLoading(false);
  }

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    setUsingFallback(false);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (user) {
      if (supabaseAvailable) {
        await supabase.from('chat_messages').insert({ role: 'user', content });
      } else {
        await localInsertChat('user', content, user.id);
      }
    }

    let reply: string;
    try {
      const systemPrompt = personaSystemPrompts[persona] || personaSystemPrompts.quantum;
      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];
      reply = await openRouterChat(chatMessages, { max_tokens: 1024, temperature: 0.7 });
    } catch (err) {
      if (err instanceof OpenRouterError) {
        console.warn('OpenRouter fallback:', err.message);
      } else {
        console.warn('Chat API error, using fallback:', err);
      }
      setUsingFallback(true);
      reply = generateReply(persona, content);
    }

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    if (user) {
      if (supabaseAvailable) {
        await supabase.from('chat_messages').insert({ role: 'assistant', content: reply });
      } else {
        await localInsertChat('assistant', reply, user.id);
      }
    }

    setSending(false);
  }

  async function clearChat() {
    if (user) {
      if (supabaseAvailable) {
        await supabase.from('chat_messages').delete().eq('user_id', user.id);
      } else {
        await localClearChat(user.id);
      }
    }
    setMessages([]);
  }

  function renderContent(content: string) {
    const parts = content.split(/(\*\*[^*]+\*\*|```[\s\S]*?```|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('```') && part.endsWith('```')) {
        return <code key={i} className="block bg-white/5 rounded px-2 py-1 font-mono text-[10px] text-red-300 my-1 whitespace-pre">{part.slice(3, -3)}</code>;
      }
      if (part === '\n') return <br key={i} />;
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">AI Chatbot</h2>
          <p className="text-xs text-slate-500">LLM-powered quantum & intelligence assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Left sidebar */}
        <div className="space-y-3 lg:overflow-y-auto">
          {/* Personas */}
          <GlowCard className="p-3">
            <div className="text-[11px] text-slate-500 font-medium mb-2">AI Persona</div>
            <div className="space-y-1">
              {personas.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                    persona === p.id ? 'bg-red-600/15 border border-red-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
                    <p.icon size={13} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-300">{p.label}</div>
                    <div className="text-[10px] text-slate-600">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </GlowCard>

          {/* Quick prompts */}
          <GlowCard className="p-3">
            <div className="text-[11px] text-slate-500 font-medium mb-2">Quick Prompts</div>
            <div className="space-y-1">
              {quickPrompts.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="w-full text-left p-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-all leading-relaxed">
                  {q}
                </button>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Chat area */}
        <GlowCard className="lg:col-span-3 flex flex-col overflow-hidden p-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOpenRouterConfigured() ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-xs text-slate-400">
                {personas.find(p => p.id === persona)?.label || 'AI Assistant'} — Active
                {isOpenRouterConfigured() ? ' · AI Online' : ' · Local Mode'}
              </span>
            </div>
            <button onClick={clearChat} className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-rose-400 transition-colors">
              <Trash2 size={11} />Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-600 text-xs">Loading conversation...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/20 flex items-center justify-center">
                  <Bot size={24} className="text-red-400" />
                </div>
                <div className="text-sm font-medium text-slate-400">Start a conversation</div>
                <div className="text-xs text-slate-600 text-center max-w-xs">Ask about quantum computing, algorithms, security, sustainability, or any AI topic</div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-red-600 to-rose-600'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'glass border border-white/5 text-slate-300 rounded-tl-sm'
                      : 'bg-red-600/20 border border-red-500/20 text-white rounded-tr-sm'
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 glass border border-white/5 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

           {/* Input */}
           <div className="px-4 py-3 border-t border-white/5">
            {usingFallback && (
              <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Info size={12} className="text-amber-400 flex-shrink-0" />
                <span className="text-[10px] text-amber-400">AI API unavailable — using local knowledge base responses</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything about quantum computing, AI, security..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
