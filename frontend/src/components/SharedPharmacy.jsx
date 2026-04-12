import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, Share2, Info, Loader2, 
  MessageCircle, Send, Plus, ChevronRight,
  User, Package, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

/**
 * SharedPharmacy — Discovery Layer
 * Browse medications shared by group members with high-fidelity UI.
 */
export default function SharedPharmacy({ groupeId, onChatOpen, showToast }) {
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [requestNote, setRequestNote] = useState('');

  useEffect(() => {
    if (groupeId) {
      fetchSharedMeds();
    }
  }, [groupeId]);

  const fetchSharedMeds = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/groupes/${groupeId}/pharmacie`);
      // L'API renvoie une pagination (cursor), on prend data
      setMedicaments(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement de la pharmacie partagée', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (medId) => {
    try {
      setLoading(true);
      const res = await api.post('/partage/demandes', {
        medicament_id: medId,
        groupe_id: groupeId,
        notes: requestNote
      });
      showToast('Demande envoyée avec succès !');
      setRequestingId(null);
      setRequestNote('');
      // Optionnel : On pourrait ouvrir le chat directement ici
      // onChatOpen(res.data);
    } catch (err) {
      showToast('Erreur lors de l\'envoi de la demande', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && medicaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="animate-spin mb-4 text-brand-blue" />
        <p className="text-[10px] font-black uppercase tracking-widest">Initialisation de la pharmacie commune...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-brand-blue rounded-full" />
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">Pharmacie du Groupe</h3>
         </div>
      </div>

      {medicaments.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-[32px] p-12 text-center space-y-4">
           <div className="h-16 w-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
              <Package size={32} />
           </div>
           <div>
              <p className="text-sm font-bold text-slate-900">Aucun médicament partagé</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 max-w-[200px] mx-auto">Invitez vos membres à marquer certains médicaments comme "Partageables".</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {medicaments.map(med => (
             <div key={med.id} className="bg-white border border-slate-100 rounded-[24px] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                <div className="flex items-start justify-between gap-4 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                         <Share2 size={24} />
                      </div>
                      <div>
                         <h4 className="text-base font-bold text-slate-900 tracking-tight">{med.nom}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <User size={10} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proposé par {med.profil.utilisateur.name}</span>
                         </div>
                      </div>
                   </div>
                   <div className="badge-dna bg-brand-blue/5 text-brand-blue border-none">
                      {med.quantite} {med.type || 'unités'}
                   </div>
                </div>

                <div className="mt-6 flex items-center gap-3 relative z-10">
                   {requestingId === med.id ? (
                      <div className="w-full space-y-3 animate-fade-up">
                         <textarea
                           autoFocus
                           placeholder="Ajoutez une note pour la demande..."
                           value={requestNote}
                           onChange={e => setRequestNote(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-medium focus:bg-white focus:border-brand-blue outline-none transition-all resize-none h-16"
                         />
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleSendRequest(med.id)}
                              className="flex-1 h-9 bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                            >
                               <Send size={12} /> Envoyer la demande
                            </button>
                            <button 
                              onClick={() => setRequestingId(null)}
                              className="px-4 h-9 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                               Annuler
                            </button>
                         </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => setRequestingId(med.id)}
                        className="w-full h-11 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-blue transition-all active:scale-[0.98]"
                      >
                         <Plus size={14} strokeWidth={3} />
                         Demander
                      </button>
                   )}
                </div>

                {/* Glassy detail row */}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                   <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span>SÉCURISÉ</span>
                   </div>
                   <span className="opacity-50 tracking-tighter uppercase">ID: MED-{med.id}</span>
                </div>
                
                {/* Background Decor */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-slate-50 rounded-full opacity-20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
