import React, { useState, useEffect } from 'react';
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
 * GroupsView — Collaboration Medicale
 * Comprehensive high-fidelity UI for managing shared care.
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
        
        // Nettoyer l'URL
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
      setMessage({ type: 'success', text: 'Invitation envoyée avec succès par e-mail !' });
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
    <div className="space-y-6 animate-fade-up pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <div className="h-9 w-9 sm:h-10 sm:w-10 bg-white border border-slate-200 flex items-center justify-center text-brand-blue shadow-sm shrink-0">
                <Share2 size={18} />
             </div>
             Collaboration Médicale
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1 ml-12 sm:ml-0">Coordination des soins entre membres.</p>
        </div>

        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="bg-brand-blue text-white h-10 px-5 flex items-center gap-2 font-bold text-sm shadow-lg shadow-brand-blue/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} /> Créer un Groupe
        </button>
      </div>

      {message && (
        <div className={`p-4 border flex items-center gap-3 animate-fade-up ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* Grid */}
      {loading && groupes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-40">
           <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
           <p className="text-xs font-bold uppercase tracking-tight">Chargement du réseau...</p>
        </div>
      ) : groupes.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-slate-100 space-y-6">
            <Users size={40} className="mx-auto text-slate-200" />
            <div className="space-y-2">
               <h3 className="text-lg font-bold text-slate-900">Aucune collaboration active</h3>
               <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto">Partagez vos médicaments avec d'autres utilisateurs pour coordonner les soins.</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groupes.map(groupe => (
            <div 
              key={groupe.id} 
              className={`group overflow-hidden border transition-all duration-300 ${
                expandedGroupId === groupe.id ? 'bg-white border-brand-blue shadow-lg' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div 
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                onClick={() => setExpandedGroupId(expandedGroupId === groupe.id ? null : groupe.id)}
              >
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 flex items-center justify-center transition-all ${
                    expandedGroupId === groupe.id ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{groupe.nom}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{groupe.participants?.length || 0} membres</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                   <button 
                    onClick={() => {setActiveGroupId(groupe.id); setIsInviteModalOpen(true);}}
                    className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2"
                   >
                     <UserPlus size={14} /> Inviter
                   </button>
                   <button 
                    onClick={(e) => confirmDeleteGroup(groupe.id, e)}
                    className="h-9 w-9 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {expandedGroupId === groupe.id && (
                <div className="border-t border-slate-100 animate-fade-up bg-slate-50/20">
                   <div className="p-8 space-y-12">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Users2 size={12} /> Membres du Groupe
                         </h4>
                         <div className="flex flex-wrap gap-4">
                            {groupe.participants?.map(m => (
                              <div key={m.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm">
                                 <div className="h-10 w-10 bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs">
                                    {m.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-slate-900">{m.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{m.pivot.role}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>


                       {/* Shared Medications (GAP 4 - Section 3.7) */}
                       {groupe.medicaments_partages && groupe.medicaments_partages.length > 0 && (
                         <div className="space-y-4 pt-6 border-t border-slate-100">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Globe size={12} /> Medicaments Partages
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {groupe.medicaments_partages.map(med => {
                               const isLow = med.quantite <= (med.seuil_alerte || 5);
                               const isExp = med.date_expiration && new Date(med.date_expiration) < new Date();
                               return (
                                 <div key={med.id} className={`p-4 bg-white border flex items-center justify-between gap-4 ${isExp ? 'border-red-100' : isLow ? 'border-amber-100' : 'border-slate-100'}`}>
                                   <div>
                                     <p className="text-sm font-bold text-slate-900">{med.nom}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{med.type} - {med.profil_nom}</p>
                                   </div>
                                   <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wide shrink-0 ${isExp ? 'bg-red-50 text-red-600' : isLow ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                     {isExp ? 'Expire' : isLow ? 'Stock Faible' : (med.quantite + ' u.')}
                                   </span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}

                      {/* Pending Section */}
                      {groupe.invitations?.length > 0 && (
                         <div className="space-y-4 pt-10 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Mail size={12} /> Invitations en cours
                            </h4>
                            <div className="flex flex-wrap gap-4">
                               {groupe.invitations.filter(i => i.statut === 'en_attente').map(inv => (
                                 <div key={inv.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 opacity-60">
                                    <div className="h-10 w-10 bg-white flex items-center justify-center text-slate-200">
                                       <Mail size={16} />
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-slate-500">{inv.email}</p>
                                       <span className="text-[8px] font-bold text-brand-blue uppercase animate-pulse">Email envoyé</span>
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

      {/* Modals placeholders... */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-2xl" onClick={() => setIsInviteModalOpen(false)} />
           <div className="relative w-full max-w-sm bg-white p-8 animate-fade-up">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Inviter un Collaborateur</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">E-mail</label>
                    <input type="email" required placeholder="nom@exemple.com" value={emailInvite} onChange={e => setEmailInvite(e.target.value)} className="w-full h-12 bg-slate-50 border-none px-4 text-sm focus:ring-2 focus:ring-brand-blue" />
                 </div>
                 <button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all">
                    {loading ? 'Envoi...' : "Envoyer l'invitation"}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-2xl" onClick={() => setIsGroupModalOpen(false)} />
           <div className="relative w-full max-w-sm bg-white p-8 animate-fade-up">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Nouveau Groupe</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom du Groupe</label>
                    <input type="text" required placeholder="Coordinateur Famille..." value={nomGroupe} onChange={e => setNomGroupe(e.target.value)} className="w-full h-12 bg-slate-50 border-none px-4 text-sm focus:ring-2 focus:ring-brand-blue" />
                 </div>
                 <button type="submit" disabled={loading} className="w-full h-12 bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-all">
                    {loading ? 'Création...' : "Créer le Groupe"}
                 </button>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        title="Supprimer le groupe ?"
        message="Cette action mettra fin à la collaboration."
        onConfirm={handleDeleteGroup}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        loading={isDeleting}
      />
    </div>
  );
}
