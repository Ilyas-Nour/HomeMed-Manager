import React, { useState, useEffect } from 'react';
import { 
  Inbox, MessageCircle, Clock, CheckCircle2, 
  XCircle, ArrowRight, Loader2, User, 
  Package, Info, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * CollaborationView — Request Management Hub
 * Track incoming and outgoing sharing requests with real-time status.
 */
export default function CollaborationView({ onChatOpen, showToast }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // On pourrait ajouter un listener Echo ici pour mettre à jour la liste en temps réel
    if (window.Echo && user) {
        window.Echo.private(`users.${user.id}`)
            .listen('RequestUpdated', (e) => {
                fetchRequests();
                showToast(`Mise à jour : Requête ${e.medRequest.status}`, 'info');
            });
    }

    return () => {
        if (window.Echo && user) {
            window.Echo.leave(`users.${user.id}`);
        }
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partage/demandes');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-600', icon: <Clock size={14} /> },
    accepted: { label: 'Accepté', color: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle2 size={14} /> },
    rejected: { label: 'Refusé', color: 'bg-rose-50 text-rose-600', icon: <XCircle size={14} /> },
    completed: { label: 'Terminé', color: 'bg-brand-blue/10 text-brand-blue', icon: <ShieldCheck size={14} /> },
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-50">
        <Loader2 className="animate-spin mb-4 text-brand-blue" />
        <p className="text-[10px] font-black uppercase tracking-widest">Synchronisation des demandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entraide Partagée</h1>
            <p className="text-base font-medium text-slate-500">Suivi des demandes de médicaments au sein de vos groupes.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[40px] p-20 text-center space-y-6">
           <div className="h-20 w-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center text-slate-200 border border-slate-50 shadow-inner">
              <Inbox size={40} />
           </div>
           <div className="max-w-xs mx-auto">
              <p className="text-lg font-bold text-slate-900">Aucune demande active</p>
              <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed">Les demandes de partage apparaîtront ici dès qu'un membre sollicitera votre pharmacie ou vice versa.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {requests.map(req => {
             const isOwner = req.owner_id === user?.id;
             const status = statusMap[req.status] || statusMap.pending;
             
             return (
               <div key={req.id} className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                     <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm border border-slate-50">
                        <Package size={28} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight">{req.medicament.nom}</h3>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.color}`}>
                              {status.icon}
                              {status.label}
                           </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <div className="flex items-center gap-1.5">
                              <User size={12} />
                              <span>{isOwner ? `Demandé par ${req.requester.name}` : `Propriétaire : ${req.owner.name}`}</span>
                           </div>
                           <div className="h-1 w-1 bg-slate-200 rounded-full" />
                           <span>{req.groupe.nom}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button 
                        onClick={() => onChatOpen(req)}
                        className="flex-1 sm:flex-none h-12 px-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-blue transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                     >
                        <MessageCircle size={16} strokeWidth={3} /> Discussion
                     </button>
                     <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-brand-blue transition-colors">
                        <ArrowRight size={20} />
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
