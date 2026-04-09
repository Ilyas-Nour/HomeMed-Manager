import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Plus, MailOpen, Shield, Trash2, 
  ChevronDown, UserPlus, Info, CheckCircle2,
  Users2, ArrowRight, X, Mail, Loader2, AlertCircle,
  Share2, Globe, Clock
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

/**
 * GroupsView — Sleek SaaS Design
 * Coordination of care with a professional, high-fidelity UI.
 */
export default function GroupsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [groupes, setGroupes] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [nomGroupe, setNomGroupe] = useState('');
  const [emailInvite, setEmailInvite] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [message, setMessage] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
     checkInvitation();
     fetchGroupes();
  }, []);

  const checkInvitation = async () => {
    const token = searchParams.get('token');
    if (token) {
      try {
        setLoading(true);
        await api.post('/groupes/accept', { token });
        setMessage({ type: 'success', text: 'Bienvenue dans le groupe !' });
        
        searchParams.delete('token');
        setSearchParams(searchParams);
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: "L'invitation est invalide ou a expiré." });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchGroupes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groupes');
      setGroupes(res.data);
    } catch (e) { 
      console.error('Fetch error', e); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/groupes', { nom: nomGroupe });
      await fetchGroupes();
      setIsGroupModalOpen(false);
      setNomGroupe('');
      setMessage({ type: 'success', text: 'Groupe de collaboration créé !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/groupes/${activeGroupId}/add-user`, { email: emailInvite });
      await fetchGroupes();
      setIsInviteModalOpen(false);
      setEmailInvite('');
      setMessage({ type: 'success', text: 'Invitation envoyée par e-mail !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: "Erreur lors de l'invitation." });
      setTimeout(() => setMessage(null), 4000);
    } finally { setLoading(false); }
  };

  const confirmDeleteGroup = (id, e) => {
    e.stopPropagation();
    setGroupToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/groupes/${groupToDelete}`);
      await fetchGroupes();
      setMessage({ type: 'success', text: 'Groupe supprimé avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) { 
      console.error(e);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setGroupToDelete(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-up pb-24">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Collaboration médicale</h1>
            <p className="text-base font-medium text-slate-500">Coordonnez les soins et partagez l'accès avec vos proches.</p>
        </div>
        <button
            onClick={() => setIsGroupModalOpen(true)}
            className="bg-brand-blue text-white h-11 px-6 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
            <Plus size={18} strokeWidth={2.5} />
            <span>Créer un groupe</span>
        </button>
      </div>

      {message && (
        <div className={`p-5 rounded-2xl border flex items-center justify-between animate-fade-up ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className="flex items-center gap-3">
             {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
             <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X size={14} /></button>
        </div>
      )}

      {/* Grid */}
      {loading && groupes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
           <div className="h-10 w-10 border-4 border-indigo-100 border-t-brand-blue rounded-full animate-spin mb-6"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronisation du réseau...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groupes.map(groupe => (
            <div 
              key={groupe.id} 
              className={`bg-white border rounded-[32px] p-0 relative overflow-hidden transition-all duration-500 shadow-sm ${
                expandedGroupId === groupe.id ? 'border-brand-blue/30 shadow-2xl shadow-indigo-200/40' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-200/50'
              }`}
            >
              <div 
                className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative"
                onClick={() => setExpandedGroupId(expandedGroupId === groupe.id ? null : groupe.id)}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all duration-500 border border-white shadow-sm ${
                    expandedGroupId === groupe.id ? 'bg-brand-blue text-white rotate-3 scale-110' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{groupe.nom}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="badge-dna bg-slate-50 text-slate-400 border-none">{groupe.participants?.length || 0} membres</span>
                       <div className="h-1 w-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Réseau Actif</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10" onClick={e => e.stopPropagation()}>
                   <button 
                    onClick={() => {setActiveGroupId(groupe.id); setIsInviteModalOpen(true);}}
                    className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2 active:scale-95"
                   >
                     <UserPlus size={14} strokeWidth={2.5} /> Inviter
                   </button>
                   <button 
                    onClick={(e) => confirmDeleteGroup(groupe.id, e)}
                    className="btn-ghost"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className={`ml-2 transition-transform duration-500 ${expandedGroupId === groupe.id ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} className="text-slate-300" />
                   </div>
                </div>

                {/* Subtle pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {expandedGroupId === groupe.id && (
                <div className="border-t border-slate-50 animate-fade-up bg-slate-50/20">
                   <div className="p-8 sm:p-10 space-y-12">
                      <div className="space-y-6">
                         <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                           <Users2 size={14} className="text-brand-blue" /> Membres du Groupe
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupe.participants?.map(m => (
                              <div key={m.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-brand-blue/10 transition-all group/member">
                                 <div className="h-11 w-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-50 shadow-inner group-hover/member:bg-brand-blue group-hover/member:text-white transition-all">
                                    {m.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{m.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{m.pivot.role}</p>
                                 </div>
                                 <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-all">
                                    <CheckCircle2 size={12} strokeWidth={3} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                       {/* Shared Medications */}
                       {groupe.medicaments_partages && groupe.medicaments_partages.length > 0 && (
                         <div className="space-y-6 pt-10 border-t border-slate-100">
                           <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                             <Globe size={14} className="text-brand-blue" /> Médicaments Partagés
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {groupe.medicaments_partages.map(med => {
                               const isLow = med.quantite <= (med.seuil_alerte || 5);
                               const isExp = med.date_expiration && new Date(med.date_expiration) < new Date();
                               return (
                                 <div key={med.id} className={`p-4 rounded-2xl bg-white border flex items-center justify-between gap-4 transition-all hover:shadow-md ${isExp ? 'border-rose-100 bg-rose-50/10' : isLow ? 'border-amber-100 bg-amber-50/10' : 'border-slate-100'}`}>
                                   <div className="flex items-center gap-4">
                                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-white border shadow-sm ${isExp ? 'text-rose-500 border-rose-100' : isLow ? 'text-amber-500 border-amber-100' : 'text-emerald-500 border-slate-100'}`}>
                                         <Share2 size={18} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-900 tracking-tight">{med.nom}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">de {med.profil_nom}</p>
                                      </div>
                                   </div>
                                   <span className={`badge-dna ${isExp ? 'bg-rose-50 text-rose-600' : isLow ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                     {isExp ? 'Expiré' : isLow ? 'Critique' : (med.quantite + ' u.')}
                                   </span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}

                      {/* Pending Section */}
                      {groupe.invitations?.length > 0 && (
                         <div className="space-y-6 pt-10 border-t border-slate-100">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                               <Mail size={14} className="text-indigo-400" /> Invitations en cours
                            </h4>
                            <div className="flex flex-wrap gap-4">
                               {groupe.invitations.filter(i => i.statut === 'en_attente').map(inv => (
                                 <div key={inv.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-slate-100 border-dashed transition-all hover:bg-white">
                                    <div className="h-10 w-10 bg-white shadow-sm flex items-center justify-center text-slate-200 rounded-xl">
                                       <MailOpen size={18} />
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-slate-500">{inv.email}</p>
                                       <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest animate-pulse mt-0.5 inline-block">Attente d'acceptation</span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsInviteModalOpen(false)} />
           <div className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] animate-fade-up overflow-hidden shadow-2xl">
              <div className="p-8 sm:p-10">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Inviter</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Partagez vos responsabilités</p>
                    </div>
                    <button onClick={() => setIsInviteModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"><X size={22} /></button>
                 </div>
                 
                 <form onSubmit={handleInvite} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adresse E-mail</label>
                       <input 
                         autoFocus
                         type="email" 
                         required 
                         placeholder="nom@exemple.com" 
                         value={emailInvite} 
                         onChange={e => setEmailInvite(e.target.value)} 
                         className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all" 
                       />
                    </div>
                    <button type="submit" disabled={loading} className="w-full h-14 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-blue/30 hover:shadow-2xl transition-all disabled:opacity-50">
                       {loading ? 'Envoi...' : "Rejoindre le Groupe"}
                    </button>
                    <button type="button" onClick={() => setIsInviteModalOpen(false)} className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Ignorer</button>
                 </form>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* New Group Modal */}
      {isGroupModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsGroupModalOpen(false)} />
           <div className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] animate-fade-up overflow-hidden shadow-2xl">
              <div className="p-8 sm:p-10">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Nouveau Groupe</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Créez votre cercle de confiance</p>
                    </div>
                    <button onClick={() => setIsGroupModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"><X size={22} /></button>
                 </div>

                 <form onSubmit={handleCreateGroup} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom de la Collaboration</label>
                       <input 
                         autoFocus
                         type="text" 
                         required 
                         placeholder="ex: Maison Dupont, Equipe Soins..." 
                         value={nomGroupe} 
                         onChange={e => setNomGroupe(e.target.value)} 
                         className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all" 
                       />
                    </div>
                    <button type="submit" disabled={loading} className="w-full h-14 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95">
                       {loading ? 'Création...' : "Lancer le Groupe"}
                    </button>
                    <button type="button" onClick={() => setIsGroupModalOpen(false)} className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Ignorer</button>
                 </form>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        title="Quitter le groupe ?"
        message="Cette action supprimera votre accès partagé à ces médicaments."
        onConfirm={handleDeleteGroup}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        loading={isDeleting}
        confirmText="Confirmer le départ"
      />
    </div>
  );
}
