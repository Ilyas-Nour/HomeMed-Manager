import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Activity, Loader2, MinusCircle, Sparkles, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

  const quickActions = [
    { id: 'reminders', text: 'Quels sont mes rappels ?', icon: <Activity size={14} /> },
    { id: 'stock', text: 'Vérifier mon stock', icon: <Bot size={14} /> },
    { id: 'equivalents', text: 'Équivalents (Maroc)', icon: <Sparkles size={14} /> },
    { id: 'advice', text: 'Conseils traitement', icon: <Bot size={14} /> },
  ];

  const handleQuickAction = async (text) => {
    if (isThinking) return;
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    try {
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

  const isInitialState = messages.length <= 1;

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[2000] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[440px] h-auto max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-140px)] bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-up ring-1 ring-black/[0.02]">
          
          {/* Header — Minimalist & Transparent */}
          <div className="px-6 py-5 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-slate-50 relative z-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <h3 className="text-sm font-black tracking-tight text-slate-800">HomeMed AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area / Welcome Screen */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth bg-white">
            {isInitialState ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8 py-10 animate-fade-in">
                {/* The Orb — Pulsing Mesh Gradient */}
                <div className="relative h-32 w-32 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-300 rounded-full blur-2xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity" />
                  <div className="relative h-full w-full rounded-full bg-gradient-to-br from-white/80 via-white/20 to-transparent backdrop-blur-sm border border-white/50 shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-2 bg-gradient-to-tr from-emerald-400/30 via-teal-400/30 to-sky-400/30 rounded-full animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-4 bg-gradient-to-bl from-cyan-400/20 via-blue-400/20 to-indigo-400/20 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
                    <Heart size={32} className="text-emerald-500 fill-emerald-500 relative z-10 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Ask HomeMed AI anything
                  </h2>
                  <p className="text-sm font-medium text-slate-400">
                    Votre assistant santé intelligent, 24/7.
                  </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.text)}
                      className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-left hover:bg-slate-100 transition-all group active:scale-[0.98]"
                    >
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-indigo-600">{action.icon}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 leading-snug">
                        {action.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                      <div className={`max-w-[85%] px-5 py-3.5 text-sm font-semibold leading-relaxed ${
                        isUser 
                        ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none shadow-lg shadow-indigo-600/10' 
                        : 'bg-slate-50 text-slate-800 rounded-[1.5rem] rounded-tl-none border border-slate-100'
                      }`}>
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <ReactMarkdown 
                            components={{
                              ul: ({node, ...props}) => <ul className="list-disc ml-6 space-y-1.5 my-3" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-6 space-y-1.5 my-3" {...props} />,
                              li: ({node, ...props}) => <li className="font-semibold" {...props} />,
                              p: ({node, ...props}) => <p className="whitespace-pre-wrap mb-2 last:mb-0" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                
                {isThinking && (
                  <div className="flex flex-col items-start animate-fade-in pl-1">
                    <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA réfléchit</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer — Floating Pill Input */}
          <div className="p-6 bg-white shrink-0">
            <form onSubmit={handleSend} className="relative group">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  placeholder={isInitialState ? "Message..." : "Votre question..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-full px-7 pr-16 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all duration-300 placeholder:text-slate-300"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="absolute right-2 h-11 w-11 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90 disabled:opacity-20 shadow-lg shadow-black/10"
                >
                  <Send size={18} className="-rotate-90 translate-y-[1px]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] transition-all duration-500 active:scale-90 relative overflow-hidden group ${
          isOpen 
          ? 'bg-slate-900 text-white hover:bg-black' 
          : 'bg-white text-slate-900 border border-slate-100 hover:-translate-y-2'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${isOpen ? 'hidden' : 'block'}`} />
        {isOpen ? <X size={28} /> : (
          <div className="relative">
            <Heart size={28} className="relative z-10 text-emerald-500 fill-emerald-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
}
