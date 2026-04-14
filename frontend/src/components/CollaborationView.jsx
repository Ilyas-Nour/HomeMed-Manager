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
 * CollaborationView — Balanced Professional Edition
 * High-fidelity, compact, and highly functional interface for collaboration.
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
                fetchRequests(true);
            })
            .listen('.message.sent', (e) => {
                if (e.sender_id !== user.id) {
                    setRequests(prev => prev.map(r => 
                        r.id === e.request_id 
                        ? { ...r, unread_messages_count: (r.unread_messages_count || 0) + 1 } 
                        : r
                    ));
                    if (showToast) showToast(`Message de ${e.sender_name}`, 'info');
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
        return { label: 'Accepté', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'Refusé', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: AlertCircle };
      default:
        return { label: 'En attente', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock };
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
    return colors[hash % colors.length];
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-up pb-24 px-1">
      {/* 🚀 Header — Compact & Bold */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
           <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Entraide Partagée</h1>
           <p className="text-sm font-medium text-slate-500">Gérez vos échanges de médicaments avec fluidité.</p>
        </div>
        
        <button 
            onClick={() => fetchRequests()}
            className="w-fit flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-all active:scale-95"
        >
            <RefreshCw size={12} />
            <span>Actualiser</span>
        </button>
      </div>

      {/* 🧪 Tab Switcher — Professional Dark Edition */}
      <div className="sticky top-4 z-40">
        <div className="bg-slate-900 p-1.5 rounded-2xl flex items-center gap-1 w-full max-w-sm shadow-xl border border-white/5">
            <button 
                onClick={() => setActiveTab('received')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'received' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Inbox size={14} />
                <span>Reçues</span>
                {requests.filter(r => r.owner_id === user?.id && r.status === 'pending').length > 0 && (
                    <span className="h-1 w-1 bg-rose-500 rounded-full" />
                )}
            </button>
            <button 
                onClick={() => setActiveTab('sent')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'sent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Send size={14} />
                <span>Mes Demandes</span>
            </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-12 text-center space-y-6">
           <div className="relative mx-auto h-32 w-32 opacity-20 filter grayscale">
               <img src="/empty_collaboration_state.png" alt="Vide" className="w-full h-full object-contain" />
           </div>
           <div className="space-y-1">
              <p className="text-lg font-black text-slate-900">Tout est à jour</p>
              <p className="text-sm text-slate-400 max-w-[240px] mx-auto font-medium">Aucune demande active pour le moment.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => {
            const config = getStatusConfig(request.status);
            const isReceived = activeTab === 'received';
            const partnerName = isReceived ? request.requester?.name : request.owner?.name;
            
            return (
                <div 
                  key={request.id} 
                  className="group bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* 1. Med Info + Icon */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border border-white shadow-sm flex-shrink-0 ${
                                isReceived ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                                {isReceived ? <Inbox size={20} /> : <Send size={20} className="-translate-y-0.5" />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{request.medicament?.nom}</h3>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
                                    <config.icon size={10} strokeWidth={3} />
                                    {config.label}
                                </div>
                            </div>
                        </div>

                        {/* 2. Metadata (Desktop Only Separator) */}
                        <div className="hidden lg:flex items-center gap-10 px-8 border-x border-slate-50 min-w-fit">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ${getAvatarColor(partnerName)}`}>
                                    {getInitials(partnerName)}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isReceived ? 'Demandeur' : 'Cible'}</p>
                                    <p className="text-sm font-bold text-slate-700">{partnerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <LayoutDashboard size={14} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Groupe</p>
                                    <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{request.groupe?.nom}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Mobile Metadata */}
                        <div className="lg:hidden flex items-center justify-between py-3 border-y border-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[8px] font-black ${getAvatarColor(partnerName)}`}>
                                    {getInitials(partnerName)}
                                </div>
                                <span className="text-xs font-bold text-slate-600">{partnerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <LayoutDashboard size={12} />
                                <span className="text-xs font-medium truncate max-w-[100px]">{request.groupe?.nom}</span>
                            </div>
                        </div>

                        {/* 4. Action Button */}
                        <div className="flex items-center w-full lg:w-auto">
                            <button 
                                onClick={() => onChatOpen(request)}
                                className={`w-full lg:w-60 h-11 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] relative ${
                                    isReceived ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-brand-blue text-white hover:opacity-90'
                                }`}
                            >
                                <MessageCircle size={16} strokeWidth={2.5} />
                                Discussion
                                {request.unread_messages_count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white">
                                        {request.unread_messages_count}
                                    </span>
                                )}
                                <ArrowUpRight size={14} className="opacity-40" />
                            </button>
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
