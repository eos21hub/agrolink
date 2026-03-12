import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiService';
import type { ChatMessage } from '@/types';

const SUGGESTED_QUESTIONS = [
  'What crop should I plant in July in Ghana?',
  'What is the best market for maize in Ashanti?',
  'How do I store cassava after harvest?',
  'When is the best time to sell tomatoes?',
  'What crops grow well during harmattan?',
  'How can I improve my cocoa yield?',
];

export function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your AgroLink AI assistant 🌱 I can help you with farming advice, crop recommendations, market strategies, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiService.chat(messages, text.trim());
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${detail}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_2px_10px_rgba(79,70,229,0.35)]">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-indigo-950">AI Farming Assistant</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Online — Powered by GPT-4</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-slate-500 hover:text-indigo-700 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium bg-white"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
          >
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-blue-100 border border-blue-200'
            }`}>
              {msg.role === 'assistant'
                ? <Sparkles className="w-3.5 h-3.5 text-white" />
                : <User className="w-3.5 h-3.5 text-slate-500" />
              }
            </div>

            <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white border border-blue-100 text-indigo-950 shadow-sm'
                  : 'bg-blue-600 text-white'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
              <span className="text-xs text-slate-300 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <input
          ref={inputRef}
          className="input-field flex-1"
          placeholder="Ask me about crops, markets, weather tips..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="btn-primary px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
