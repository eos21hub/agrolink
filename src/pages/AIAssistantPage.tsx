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
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please check your API key and try again.',
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
        <div className="w-9 h-9 rounded-xl bg-forest-900/40 border border-forest-700/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-forest-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-earth-100">AI Farming Assistant</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
            <span className="text-xs text-forest-500">Online — Powered by GPT-4</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {/* Suggested questions (only at start) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-forest-800/30 text-earth-500 hover:text-earth-200 hover:border-forest-600/40 hover:bg-forest-900/20 transition-all"
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
              msg.role === 'assistant'
                ? 'bg-forest-900/40 border border-forest-700/20'
                : 'bg-earth-800/40 border border-earth-700/20'
            }`}>
              {msg.role === 'assistant'
                ? <Sparkles className="w-3.5 h-3.5 text-forest-400" />
                : <User className="w-3.5 h-3.5 text-earth-400" />
              }
            </div>

            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-night-850/80 border border-forest-900/20 text-earth-200'
                  : 'bg-forest-800/30 border border-forest-700/20 text-earth-100'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
              <span className="text-xs text-earth-700 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-forest-900/40 border border-forest-700/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-forest-400" />
            </div>
            <div className="bg-night-850/80 border border-forest-900/20 rounded-xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
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
          className="btn-primary flex items-center gap-2 px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
