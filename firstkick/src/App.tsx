/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, Info, MessageCircle, ChevronRight, Loader2, Footprints, Goal, Users } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const COMMON_QUESTIONS = [
  "What is offside?",
  "How many players are on a team?",
  "What is a yellow card vs a red card?",
  "How long is a soccer match?",
  "What does a midfielders do?",
  "How does the VAR work?"
];

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAsk = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: "You are an expert soccer coach who explains things to beginners who know nothing about the sport. Use simple terms, avoiding overly technical jargon without explaining it. Be encouraging and clear. If a question is not about soccer, politely steer the conversation back to soccer basics.",
          temperature: 0.7,
        },
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: response.text || "I'm sorry, I couldn't find an answer for that. Could you try rephrasing your question?"
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "Oops! My connection to the locker room is a bit weak. Please try asking again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051e05] text-[#f0f9f0] font-sans selection:bg-[#00ff00] selection:text-[#051e05]">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] border-b-4 border-x-4 border-white/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] border-t-4 border-x-4 border-white/20" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-[#00ff00] text-[#051e05] rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
            <Trophy size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-black tracking-tighter sm:text-7xl mb-4 text-[#00ff00]">
            KICKOFF
          </h1>
          <p className="text-xl text-emerald-100/70 font-medium max-w-lg mx-auto">
            Your personal guide to the beautiful game. Ask anything about soccer, from rules to strategy.
          </p>
        </motion.header>

        {/* Chat / Content Area */}
        <section className="flex-1 mb-6 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="grid gap-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid sm:grid-cols-3 gap-4"
              >
                {[
                  { icon: <Users size={20} />, title: "Teamwork", desc: "Learn about positions and roles." },
                  { icon: <Footprints size={20} />, title: "Rules", desc: "Simplified offsides and fouls." },
                  { icon: <Goal size={20} />, title: "Strategy", desc: "Understand formations and tactics." }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="text-[#00ff00] mb-3">{item.icon}</div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-emerald-100/50">{item.desc}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-emerald-100/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} /> Suggestions for you
                </h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAsk(q)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium transition-colors hover:border-[#00ff00]/50"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6 flex-1 max-h-[60vh] overflow-y-auto pr-4 subtle-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl font-medium leading-relaxed ${
                      msg.type === 'user' 
                        ? 'bg-[#00ff00] text-[#051e05] rounded-tr-none shadow-lg' 
                        : 'bg-white/10 border border-white/10 backdrop-blur-sm rounded-tl-none text-emerald-50'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start items-center gap-3 text-emerald-100/50 italic px-4"
                  >
                    <Loader2 size={18} className="animate-spin text-[#00ff00]" />
                    <span>The coach is thinking...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* Input area */}
        <section className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-[#051e05] via-[#051e05] to-transparent">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
            className="relative group"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the beautiful game..."
              className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-5 px-6 pr-16 focus:outline-none focus:border-[#00ff00] transition-all placeholder:text-emerald-100/30 text-lg font-medium backdrop-blur-md shadow-2xl group-focus-within:bg-white/15"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#00ff00] text-[#051e05] rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(0,255,0,0.2)]"
            >
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-emerald-100/20 font-bold tracking-widest uppercase">
            Powered by Gemini AI • Beginner Friendly Verified
          </p>
        </section>
      </main>

      {/* Info Modal Trigger (Floating) */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-emerald-100/50 hover:bg-white/10 transition-colors backdrop-blur-sm md:flex hidden">
        <MessageCircle size={20} />
      </button>

      <style>{`
        .subtle-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .subtle-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
