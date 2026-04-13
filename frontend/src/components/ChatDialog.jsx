import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * ChatDialog — Real-time Messaging for Sharing Requests
 * High-fidelity, smooth animations, and robust scalability.
 */
export default function ChatDialog({ medRequest, onClose, showToast, onRead }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // L'API renvoie une pagination (cursor), on prend data
      setMessages(res.data.data);
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
          // On n'ajoute que si ce n'est pas nous (déjà géré par l'optimistic UI)
          if (e.sender_id !== user.id) {
              setMessages(prev => {
                  // Éviter les doublons si l'événement arrive plusieurs fois
                  if (prev.find(m => m.id === e.id)) return prev;
                  return [...prev, e];
              });
              handleMarkAsRead();
          }
        })
        .listen('.request.updated', (e) => {
           // On pourrait recharger les détails de la requête ici
           showToast(`Statut mis à jour : ${e.medRequest.status}`, 'info');
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
    
    // 🚀 Optimistic UI : Ajout immédiat pour supprimer les 2-3s de délai
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
      
      // Remplacer le message optimiste par la réalité du serveur
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
    } catch (err) {
      // Annuler l'optimisme en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageContent); // Restaurer le texte
      showToast('Erreur lors de l\'envoi', 'error');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/partage/demandes/${medRequest.id}`, { status: newStatus });
      showToast('Statut mis à jour');
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  if (!medRequest) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-lg bg-white h-[85vh] sm:h-[600px] flex flex-col rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30 overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${medRequest.medicament.nom}&background=0F172A&color=fff`} alt="" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold tracking-tight">{medRequest.medicament.nom}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partage • {medRequest.groupe.nom}</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
           </div>

           <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                medRequest.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                medRequest.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                medRequest.status === 'completed' ? 'bg-brand-blue/20 text-brand-blue-lite' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {medRequest.status}
              </span>
              <div className="h-1 w-1 bg-white/20 rounded-full" />
              <p className="text-[10px] font-medium text-slate-400">
                Demandé par {medRequest.requester.name}
              </p>
           </div>
        </div>

        {/* Content / Messages */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50 no-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
               <Loader2 className="animate-spin text-brand-blue" />
               <p className="text-[10px] font-black uppercase tracking-widest">Récupération du chat...</p>
             </div>
           ) : messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                   <Clock size={32} />
                </div>
                <div className="max-w-[200px]">
                   <p className="text-xs font-bold text-slate-900">Pas encore de message</p>
                   <p className="text-[10px] font-medium text-slate-400 mt-1">Commencez la discussion pour organiser la remise.</p>
                </div>
             </div>
           ) : (
             messages.map((msg, idx) => (
               <div key={msg.id} className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.sender_id === user?.id 
                    ? 'bg-brand-blue text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-1`}>
                    {msg.sender?.name || 'Utilisateur'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
               </div>
             ))
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Actions Bar (if user is owner and status is pending) */}
        {user?.id === medRequest.owner_id && medRequest.status === 'pending' && (
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center gap-3">
               <button 
                onClick={() => updateStatus('accepted')}
                className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={14} /> Accepter
               </button>
               <button 
                onClick={() => updateStatus('rejected')}
                className="flex-1 h-10 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <AlertCircle size={14} /> Refuser
               </button>
            </div>
        )}

        {/* Footer / Input */}
        <div className="p-6 sm:p-8 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
             <input 
               type="text"
               placeholder="Votre message..."
               value={newMessage}
               onChange={e => setNewMessage(e.target.value)}
               className="flex-1 h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-medium focus:bg-white focus:border-brand-blue outline-none transition-all pr-14"
             />
             <button 
               type="submit"
               disabled={sending || !newMessage.trim()}
               className="h-10 w-10 bg-brand-blue text-white rounded-xl absolute right-2 flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:shadow-brand-blue/40 disabled:opacity-50 transition-all active:scale-90"
             >
               {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
