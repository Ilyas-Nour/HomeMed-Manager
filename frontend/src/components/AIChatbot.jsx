import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Activity, Loader2, MinusCircle } from 'lucide-react';
import aiService from '../services/aiService';

/**
 * AIChatbot — Premium Medical Assistant Interface
 * A floating, AI-powered chatbot that provides intelligent assistance using OpenRouter.
 */
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis HomeMed Assistant. Comment puis-je vous aider avec vos médicaments aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Build conversation history for context
      const history = messages.concat(userMessage);
      const botResponse = await aiService.sendMessage(history);
      
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur technique. Veuillez réessayer plus tard." 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[420px] h-[550px] sm:h-[650px] bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-fade-up ring-1 ring-black/5">
          
          {/* Header — Sophisticated & Deep */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse group-hover:bg-indigo-500/20 transition-all" />
                <Activity size={22} className="text-indigo-400 relative z-10" />
              </div>
              <div>
                <h3 className="text-[15px] font-black tracking-tight leading-tight text-indigo-400">HomeMed AI</h3>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90 border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area — Spacious & Clean */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/10 no-scrollbar">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Compact Avatar */}
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                      isUser 
                      ? 'bg-white border-slate-200 text-slate-400' 
                      : 'bg-indigo-600 border-indigo-500 text-white'
                    }`}>
                      {isUser ? <User size={14} className="opacity-50" /> : <Bot size={14} />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`relative px-4 py-3 text-[13px] font-semibold leading-relaxed transition-all ${
                      isUser 
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-[1.25rem] rounded-tr-none shadow-lg shadow-indigo-600/20' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-[1.25rem] rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                  
                  {/* Subtle Timestamp */}
                  <span className={`text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1.5 ${isUser ? 'mr-11' : 'ml-11'}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            
            {isThinking && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-[1.25rem] rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="h-1 w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1 w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1 w-1 bg-indigo-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Analyse en cours</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer — Integrated & Floating Input */}
          <div className="p-6 bg-white/50 backdrop-blur-md border-t border-slate-100/50 relative z-30 mb-2">
            <form onSubmit={handleSend} className="relative group">
              <input 
                type="text"
                placeholder="Votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-14 bg-white border border-slate-200 rounded-[1.25rem] px-6 pr-14 text-[13px] font-bold text-slate-800 focus:bg-white focus:border-indigo-600/30 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all duration-300 placeholder:text-slate-300 shadow-sm group-hover:shadow-md"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isThinking}
                className="absolute right-2 top-2 h-10 w-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90 disabled:opacity-20 shadow-lg shadow-slate-900/10"
              >
                <Send size={16} className="rotate-45" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-1.5 mt-4 opacity-40 group hover:opacity-100 transition-opacity">
               <Activity size={10} className="text-indigo-600" />
               <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                 HomeMed Intelligent Engine
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button — Balanced & Sharp */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-[0_15px_35px_-5px_rgba(0,0,0,0.2)] transition-all duration-500 active:scale-90 relative group ${
          isOpen 
          ? 'bg-white text-slate-900 border border-slate-100 hover:rotate-90' 
          : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-2'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative">
            <MessageSquare size={28} className="relative z-10" />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-indigo-500 rounded-full border-2 border-slate-900 animate-pulse group-hover:scale-125 transition-transform" />
          </div>
        )}
      </button>
    </div>
  );
}
