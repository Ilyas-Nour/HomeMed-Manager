import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * ChatDialog — High-Fidelity Messaging Edition
 * Ultra-responsive, smooth animations, and premium chat aesthetics.
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
              handleMarkAsRead();
          }
        })
        .listen('.request.updated', (e) => {
           if (e.medRequest?.status) {
               setStatus(e.medRequest.status);
               showToast(`Statut mis à jour : ${e.medRequest.status}`, 'info');
           }
        });
    }
  };

  const handleMarkAsRead = async () => {
    try {
        await api.post(`/partage/demandes/${medRequest.id}/read`);
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
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* Dialog Container */}
      <div className="relative w-full sm:max-w-xl bg-white h-[92vh] sm:h-[700px] flex flex-col rounded-t-[40px] sm:rounded-[44px] shadow-2xl overflow-hidden animate-fade-up border border-white/20">
        
        {/* Mobile Handle */}
        <div className="sm:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-20" />

        {/* Header — Ultra Premium */}
        <div className="bg-slate-900 p-6 sm:p-10 text-white relative overflow-hidden">
           {/* Abstract Header Blur */}
           <div className="absolute -top-24 -right-24 h-48 w-48 bg-brand-blue/20 blur-3xl rounded-full" />
           <div className="absolute top-10 left-10 h-24 w-24 bg-brand-blue-lite/10 blur-2xl rounded-full" />

           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                 <div className="h-14 w-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center p-1 backdrop-blur-sm shadow-inner group">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${medRequest.medicament.nom}&background=0F172A&color=fff&bold=true`} 
                        alt="" 
                        className="rounded-[16px] w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                 </div>
                 <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-2">{medRequest.medicament.nom}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status === 'accepted' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {status} • {medRequest.groupe.nom}
                        </p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/5"
              >
                <X size={24} />
              </button>
           </div>
        </div>

        {/* Chat / Messages Area — Clean & Spatial */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50/30 no-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
               <div className="relative">
                   <div className="absolute inset-0 bg-brand-blue/10 blur-xl rounded-full" />
                   <Loader2 className="animate-spin text-brand-blue relative z-10" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Crypter la connexion...</p>
             </div>
           ) : messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 bg-white rounded-[32px] flex items-center justify-center text-slate-100 border border-slate-100 shadow-xl relative group">
                   <div className="absolute inset-0 bg-brand-blue/5 scale-125 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   <MessageSquare size={48} className="relative z-10" />
                </div>
                <div className="space-y-2">
                   <p className="text-lg font-black text-slate-900">Commencer l'échange</p>
                   <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                       Dites bonjour et organisez la remise du médicament en toute sécurité.
                   </p>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const prevMsg = messages[idx - 1];
                    const isSameSender = prevMsg?.sender_id === msg.sender_id;
                    
                    return (
                       <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameSender ? '-mt-4' : 'mt-2'}`}>
                          <div className={`relative group max-w-[85%] sm:max-w-[75%] px-5 py-4 text-sm sm:text-base font-medium shadow-sm transition-all animate-fade-in ${
                            isMe 
                            ? 'bg-slate-900 text-white rounded-[24px] rounded-tr-none shadow-slate-200' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-[24px] rounded-tl-none'
                          }`}>
                            {msg.content}
                            
                            {/* Time Hover Detail */}
                            <div className={`hidden group-hover:block absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded-md font-black whitespace-nowrap z-20 ${
                                isMe ? 'right-full mr-3' : 'left-full ml-3'
                            }`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          
                          {!isSameSender && (
                            <span className={`text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 px-1`}>
                                {isMe ? 'MOI' : msg.sender?.name}
                            </span>
                          )}
                       </div>
                    );
                })}
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Footer — Bottom Actions & Input */}
        <div className="p-6 sm:p-10 bg-white border-t border-slate-100 space-y-6">
           
           {/* Admin Controls Area */}
           {user?.id === medRequest.owner_id && status === 'pending' && (
              <div className="flex items-center gap-4 animate-fade-up">
                 <button 
                  onClick={() => updateStatus('accepted')}
                  className="flex-1 h-14 bg-emerald-500 text-white rounded-[22px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 group/btn"
                 >
                   <CheckCircle2 size={18} className="group-hover:rotate-12 transition-transform" /> Accepter
                 </button>
                 <button 
                  onClick={() => updateStatus('rejected')}
                  className="flex-1 h-14 bg-rose-50 text-rose-500 rounded-[22px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 border border-rose-100 group/btn"
                 >
                   <AlertCircle size={18} className="group-hover:-rotate-12 transition-transform" /> Refuser
                 </button>
              </div>
           )}

           {/* Modern Input Bar */}
           <form onSubmit={handleSend} className="relative flex items-center gap-3">
              <div className="flex-1 relative group">
                <input 
                    type="text"
                    placeholder="Votre message ici..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[26px] px-8 text-sm sm:text-base font-semibold focus:bg-white focus:border-slate-900/10 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all pr-14 placeholder:text-slate-300"
                />
                <button 
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="h-11 w-11 bg-slate-900 text-white rounded-2xl absolute right-2.5 top-2.5 flex items-center justify-center shadow-2xl transition-all active:scale-90 disabled:opacity-20 group-hover:scale-105"
                >
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="rotate-45 -translate-x-0.5" />}
                </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
