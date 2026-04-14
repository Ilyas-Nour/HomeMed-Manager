import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, MinusCircle } from 'lucide-react';
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
        <div className="mb-4 w-[90vw] sm:w-[400px] h-[500px] sm:h-[600px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-blue/20 flex items-center justify-center border border-white/10">
                <Sparkles size={20} className="text-brand-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">HomeMed Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En ligne</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 no-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.role === 'user' 
                  ? 'bg-slate-100 border-slate-200 text-slate-600' 
                  : 'bg-brand-blue border-brand-blue text-white'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className={`max-w-[80%] p-3 text-sm font-medium shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="h-8 w-8 rounded-lg bg-brand-blue border border-brand-blue text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand-blue" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">L'IA réfléchit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer / Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative group">
              <input 
                type="text"
                placeholder="Posez votre question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-5 pr-12 text-sm font-semibold focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all duration-300 placeholder:text-slate-300"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isThinking}
                className="absolute right-2 top-2 h-8 w-8 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-brand-blue transition-all active:scale-90 disabled:opacity-20"
              >
                <Send size={14} className="rotate-45" />
              </button>
            </form>
            <p className="mt-3 text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
              Alimenté par HomeMed AI
            </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
          isOpen 
          ? 'bg-white text-slate-900 border border-slate-200' 
          : 'bg-slate-900 text-white hover:bg-brand-blue hover:-translate-y-1'
        }`}
      >
        {isOpen ? <MinusCircle size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-brand-blue rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
}
