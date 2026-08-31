import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import type { DatasetSummary, DataRow } from './types';
import { answerNLQuery } from './statsUtils';
import GlowCard from '@/components/ui/GlowCard';

interface Props { summary: DatasetSummary; rows: DataRow[]; }

interface Message { role: 'user' | 'bot'; text: string; ts: string; }

const SUGGESTIONS = [
  'Which columns have missing values?',
  'What is the average of each numeric column?',
  'How many rows and columns are in this dataset?',
  'Which features are most correlated?',
  'What ML algorithm do you recommend?',
  'Are there duplicate rows?',
  'Describe the data distribution',
  'What is the dataset health score?',
];

export default function NLQuery({ summary, rows }: Props) {
  void rows;

  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    text: `Hello! I'm your Quantum AI Data Assistant. I've analysed your dataset (${summary.totalRows.toLocaleString()} rows, ${summary.totalCols} columns). Ask me anything about it!`,
    ts: new Date().toLocaleTimeString(),
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function ask(question: string) {
    if (!question.trim()) return;
    const userMsg: Message = { role: 'user', text: question, ts: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const answer = answerNLQuery(question, summary);
      setMessages(prev => [...prev, { role: 'bot', text: answer, ts: new Date().toLocaleTimeString() }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  }

  return (
    <div className="space-y-4">
      <GlowCard className="flex flex-col overflow-hidden p-0" style={{ height: 480 }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Quantum AI Data Assistant — Online</span>
          <Sparkles size={12} className="ml-auto text-red-400" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${m.role === 'bot' ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-slate-700'}`}>
                {m.role === 'bot' ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
              </div>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'bot'
                  ? 'glass border border-white/5 text-slate-300 rounded-tl-sm'
                  : 'bg-red-600/20 border border-red-500/20 text-white rounded-tr-sm'
              }`}>
                {m.text}
                <div className="text-[9px] text-slate-600 mt-1 text-right">{m.ts}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center">
                <Bot size={13} className="text-white" />
              </div>
              <div className="px-4 py-3 glass border border-white/5 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask(input)}
              placeholder="Ask about your dataset..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all"
            />
            <button
              onClick={() => ask(input)}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </GlowCard>

      {/* Suggestions */}
      <GlowCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={13} className="text-red-400" />
          <span className="text-xs font-semibold text-white">Suggested Questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(q => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="text-[11px] px-3 py-1.5 rounded-lg glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
