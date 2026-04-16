import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const playSound = (type) => {
  try {
    const audio = new Audio(
        type === 'send' ? '/send_message.mp3' : '/in_chat_recieve.mp3'
    );
    audio.play().catch(e => console.log('Audio notification blocked:', e));
  } catch (err) {
    console.error('Audio play error', err);
  }
};

/**
 * ChatDialog — Balanced Professional Edition
 * High-fidelity, compact, and highly functional interface for messaging.
 */
export default function ChatDialog({ medRequest, onClose, showToast, onRead }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(medRequest.status);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (medRequest) {
      fetchMessages();
      setupEcho();
      handleMarkAsRead();
    }
    return () => {
        if (window.Echo) {
            window.Echo.leave(`requests.${medRequest.id}`);
        }
    };
  }, [medRequest?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/partage/demandes/${medRequest.id}/messages`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Impossible de charger les messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setupEcho = () => {
    if (window.Echo) {
      window.Echo.private(`requests.${medRequest.id}`)
        .listen('.message.sent', (e) => {
          if (e.sender_id !== user.id) {
              setMessages(prev => {
                  if (prev.find(m => m.id === e.id)) return prev;
                  return [...prev, e];
              });
              playSound('receive');
              handleMarkAsRead();
          }
        })
        .listen('.request.updated', (e) => {
           if (e.medRequest?.status) {
               setStatus(e.medRequest.status);
           }
        });
    }
  };

  const handleMarkAsRead = async () => {
    try {
        await api.post(`/partage/demandes/${medRequest.id}/read`);
        window.dispatchEvent(new CustomEvent('collaboration-updated', { 
            detail: { requestId: medRequest.id, type: 'read' } 
        }));
        onRead && onRead();
    } catch (err) {
        console.error("Erreur lecture", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage;
    setNewMessage('');
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
        id: tempId,
        content: messageContent,
        sender_id: user.id,
        sender: { id: user.id, name: user.name },
        created_at: new Date().toISOString(),
        is_sending: true
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    playSound('send');

    try {
      setSending(true);
      const res = await api.post(`/partage/demandes/${medRequest.id}/messages`, {
        content: messageContent
      });
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageContent);
      showToast('Erreur lors de l\'envoi', 'error');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const previousStatus = status;
    try {
      setStatus(newStatus);
      await api.patch(`/partage/demandes/${medRequest.id}`, { status: newStatus });
      window.dispatchEvent(new CustomEvent('collaboration-updated', { 
         detail: { requestId: medRequest.id, status: newStatus } 
      }));
      showToast('Statut mis à jour');
    } catch (err) {
      setStatus(previousStatus);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  if (!medRequest) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog Container */}
      <div className="relative w-full sm:max-w-lg bg-white h-[95vh] sm:h-[650px] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fade-up border border-slate-200/50">
        
        {/* Header — Professional & Compact */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 sm:p-6 text-slate-900 relative z-30">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shadow-sm">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${medRequest.medicament.nom}&background=F8FAFC&color=4F46E5&bold=true`} 
                        alt="" 
                        className="rounded-lg w-full h-full object-cover"
                    />
                 </div>
                 <div>
                    <h3 className="text-base font-bold tracking-tight leading-none mb-1.5">{medRequest.medicament.nom}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {status} • {medRequest.groupe.nom}
                        </p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all active:scale-90 border border-slate-100"
              >
                <X size={18} />
              </button>
           </div>
        </div>

        {/* Chat / Messages Area — Spatial & Clean */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/20 no-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
               <Loader2 className="animate-spin text-brand-blue" size={24} />
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Synchronisation...</p>
             </div>
           ) : messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                   <MessageSquare size={32} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Aucun message</p>
                    <p className="text-[11px] font-medium text-slate-400 max-w-[180px] mx-auto leading-normal">
                        Entamez la discussion pour organiser le partage.
                    </p>
                 </div>
             </div>
           ) : (
             <div className="flex flex-col space-y-2">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const prevMsg = messages[idx - 1];
                    const isSameSender = prevMsg?.sender_id === msg.sender_id;
                    
                    return (
                       <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameSender ? 'mt-0.5' : 'mt-4'}`}>
                          {!isSameSender && (
                            <span className={`text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1`}>
                                {isMe ? 'Vous' : msg.sender?.name}
                            </span>
                          )}
                          
                          <div className={`relative group max-w-[85%] sm:max-w-[80%] px-4 py-3 text-sm font-medium transition-all shadow-sm ${
                            isMe 
                            ? 'bg-[#20835b] text-white rounded-2xl rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                          }`}>
                            <div className="flex flex-col gap-1">
                                <span>{msg.content}</span>
                                <span className={`text-[8px] font-bold opacity-30 self-end ${isMe ? 'text-white' : 'text-slate-500'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                          </div>
                       </div>
                    );
                })}
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Footer — Compact Actions & Input */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 space-y-4">
           
           {/* Admin Controls */}
           {user?.id === medRequest.owner_id && status === 'pending' && (
              <div className="flex items-center gap-3 animate-fade-up">
                 <button 
                  onClick={() => updateStatus('accepted')}
                  className="flex-1 h-11 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                 >
                   <CheckCircle2 size={14} /> Accepter
                 </button>
                 <button 
                  onClick={() => updateStatus('rejected')}
                  className="flex-1 h-11 bg-white border border-rose-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <AlertCircle size={14} /> Refuser
                 </button>
              </div>
           )}

           {/* Input Bar — Integrated Design */}
           <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <div className="flex-1 relative group">
                <input 
                    type="text"
                    placeholder="Votre message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:bg-white focus:border-slate-900/20 focus:ring-0 outline-none transition-all pr-12 placeholder:text-slate-300"
                />
                <button 
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="h-8 w-8 bg-[#20835b] text-white rounded-lg absolute right-2 top-2 flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 hover:bg-[#1a6b4a]"
                >
                    {sending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} className="rotate-45 -translate-x-0.5" />}
                </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
