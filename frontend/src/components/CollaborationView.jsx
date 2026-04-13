import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, MessageCircle, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Loader2, RefreshCw,
  Inbox, Send, ArrowUpRight, ArrowDownLeft,
  LayoutDashboard, Users, Activity, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import ChatDialog from './ChatDialog';
import { useAuth } from '../hooks/useAuth';



/**
 * CollaborationView — Ultra-Responsive Edition
 * High-fidelity, device-agnostic interface for group collaboration.
 */
export default function CollaborationView({ onChatOpen, showToast }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  const fetchRequests = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await api.get(`/partage/demandes?t=${Date.now()}`);
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Fetch error', err);
      if (showToast) showToast('Erreur lors du chargement des demandes', 'error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // 🔥 Hard-Sync Real-Time Listener
    if (window.Echo && user) {
        const userChannel = `users.${user.id}`;
        
        window.Echo.private(userChannel)
            .listen('.request.updated', (e) => {
                setRequests(prev => {
                    const newRequest = e.medRequest;
                    const exists = prev.some(r => r.id === newRequest.id);
                    if (exists) {
                        return prev.map(r => r.id === newRequest.id ? newRequest : r);
                    } else {
                        return [newRequest, ...prev];
                    }
                });
                if (showToast) showToast(`Mise à jour d'entraide`, 'info');
                fetchRequests(true);
            })
            .listen('.message.sent', (e) => {
                console.log('Incoming message detected for live badge:', e);
                // Si on n'est pas l'envoyeur, on incrémente le badge localement
                if (e.sender_id !== user.id) {
                    setRequests(prev => prev.map(r => 
                        r.id === e.request_id 
                        ? { ...r, unread_messages_count: (r.unread_messages_count || 0) + 1 } 
                        : r
                    ));
                    if (showToast) showToast(`Nouveau message de ${e.sender_name}`, 'info');
                }
            });
            
        const handleLocalUpdate = () => fetchRequests(true);
        window.addEventListener('collaboration-updated', handleLocalUpdate);

        return () => {
            window.removeEventListener('collaboration-updated', handleLocalUpdate);
            if (window.Echo && user) {
                window.Echo.private(userChannel).stopListening('.request.updated');
            }
        };
    }
  }, [user]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'received') {
        return requests.filter(r => r.owner_id === user?.id);
    } else {
        return requests.filter(r => r.requester_id === user?.id);
    }
  }, [requests, activeTab, user?.id]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return { label: 'ACCEPTÉ', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'REFUSÉ', color: 'text-rose-600 bg-rose-50', icon: AlertCircle };
      default:
        return { label: 'EN ATTENTE', color: 'text-amber-600 bg-amber-50', icon: Clock };
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="relative">
            <div className="absolute inset-0 bg-brand-blue/20 blur-2xl rounded-full" />
            <Loader2 className="h-12 w-12 text-brand-blue animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronisation Mirror</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-fade-up pb-24 px-1">
      {/* 🚀 Header — Standard Dashboard Style (Left Aligned) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Entraide Partagée</h1>
           <p className="text-base font-medium text-slate-500">Gérez vos échanges de médicaments avec fluidité et sécurité.</p>
        </div>
        
        <button 
            onClick={() => fetchRequests()}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 transition-all shadow-sm active:scale-95 group"
            title="Actualiser"
        >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            <span>Actualiser</span>
        </button>
      </div>

      {/* 🧪 Tab Switcher — Glassmorphism Edition */}
      <div className="sticky top-2 z-40 px-2 sm:px-0">
        <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-[28px] flex items-center gap-1 w-full max-w-lg mx-auto md:mx-0 shadow-2xl shadow-slate-200/50 border border-white">
            <button 
                onClick={() => setActiveTab('received')}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 rounded-[22px] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    activeTab === 'received' 
                    ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Inbox size={14} className="sm:w-4 sm:h-4" />
                <span>Reçues</span>
                {requests.filter(r => r.owner_id === user?.id && r.status === 'pending').length > 0 && (
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse shadow-sm" />
                )}
            </button>
            <button 
                onClick={() => setActiveTab('sent')}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 rounded-[22px] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    activeTab === 'sent' 
                    ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Send size={14} className="sm:w-4 sm:h-4" />
                <span>Mes Demandes</span>
            </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-[40px] p-12 sm:p-24 text-center space-y-6">
           <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32">
               <div className="absolute inset-0 bg-brand-blue/5 blur-3xl rounded-full" />
               <div className={`relative h-full w-full rounded-[40px] flex items-center justify-center text-slate-100 border-2 border-dashed border-slate-200 transition-all duration-700 ${
                   activeTab === 'received' ? 'text-brand-blue/40' : 'text-indigo-400/40'
               }`}>
                  {activeTab === 'received' ? <Inbox size={64} /> : <Send size={64} />}
               </div>
           </div>
           <div className="space-y-2">
              <p className="text-xl sm:text-2xl font-black text-slate-900">Tout est à jour</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
                  {activeTab === 'received' 
                    ? 'Aucune nouvelle demande de médicament pour le moment.' 
                    : 'Vous n\'avez aucune demande active en cours de suivi.'}
              </p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredRequests.map((request) => {
            const config = getStatusConfig(request.status);
            const isReceived = activeTab === 'received';
            
            return (
                <div 
                  key={request.id} 
                  className={`group bg-white border border-slate-100 rounded-[32px] sm:rounded-[44px] p-5 sm:p-8 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative ${
                      isReceived ? 'hover:border-brand-blue/20' : 'hover:border-indigo-500/20'
                  }`}
                >
                    {/* Background Decorative Element */}
                    <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-[0.02] transition-all duration-1000 group-hover:scale-110 ${
                        isReceived ? 'bg-brand-blue' : 'bg-indigo-600'
                    }`} />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 relative z-10">
                        <div className="flex items-center gap-4 sm:gap-8">
                            <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[28px] sm:rounded-[32px] flex items-center justify-center transition-all duration-700 border border-white shadow-2xl shadow-slate-200/50 flex-shrink-0 ${
                                isReceived 
                                ? 'bg-slate-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white' 
                                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                            }`}>
                                {isReceived ? <Inbox size={32} strokeWidth={1.5} /> : <Send size={32} strokeWidth={1.5} className="-translate-y-0.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{request.medicament?.nom}</h3>
                                    <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 border ${
                                        config.color.includes('emerald') ? 'border-emerald-100' : 
                                        config.color.includes('rose') ? 'border-rose-100' : 'border-amber-100'
                                    } ${config.color}`}>
                                        <config.icon size={10} strokeWidth={3} />
                                        {config.label}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[9px] font-black border ${
                                            isReceived ? 'bg-brand-blue/5 text-brand-blue border-brand-blue/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                            {isReceived ? 'RCV' : 'SNT'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                                {isReceived ? 'Demandeur' : 'Cible'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {isReceived ? request.requester?.name : request.owner?.name}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden sm:block h-6 w-px bg-slate-100" />
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                            <LayoutDashboard size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Groupe</p>
                                            <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{request.groupe?.nom}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onChatOpen(request)}
                                className={`h-14 sm:h-16 px-8 sm:px-12 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl relative group/btn ${
                                    isReceived 
                                    ? 'bg-slate-900 text-white hover:bg-brand-blue shadow-slate-200' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                }`}
                            >
                                {/* Internal Glow Container */}
                                <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
                                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </div>

                                <MessageCircle size={18} strokeWidth={2.5} className="group-hover/btn:rotate-12 transition-transform" />
                                Discussion
                                
                                {request.unread_messages_count > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center bg-rose-500 text-white text-[11px] font-black rounded-full border-2 border-white animate-bounce shadow-2xl z-50">
                                        {request.unread_messages_count}
                                    </span>
                                )}
                                
                                <ArrowUpRight size={14} className="opacity-40 ml-1" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Bottom Status Bar — Tiny Detail */}
                    <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                             <ShieldCheck size={12} className="text-emerald-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Canal Sécurisé</span>
                        </div>
                        <span className="text-[9px] font-medium text-slate-300">ID#REQ-{request.id.toString().padStart(4, '0')}</span>
                    </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
