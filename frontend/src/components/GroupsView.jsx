import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, MailOpen, Shield, Trash2, 
  ChevronDown, UserPlus, Info, CheckCircle2,
  Users2, ArrowRight, X, Mail, Loader2, AlertCircle,
  Share2, Globe, Clock
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

/**
 * GroupsView — Product Precision "Sleek & Clean"
 */
export default function GroupsView() {
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
     fetchGroupes();
  }, []);

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
  }

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
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/groupes/${activeGroupId}/add-user`, { email: emailInvite });
      await fetchGroupes();
      setIsInviteModalOpen(false);
      setEmailInvite('');
      setMessage({ type: 'success', text: 'Invitation envoyée avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: "Utilisateur non trouvé ou déjà membre." });
      setTimeout(() => setMessage(null), 4000);
    } finally { setLoading(false); }
  }

   const confirmDeleteGroup = (id, e) => {
    e.stopPropagation();
    setGroupToDelete(id);
    setIsDeleteConfirmOpen(true);
  }

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
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du groupe.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setGroupToDelete(null);
    }
  }

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
          <p className="text-sm font-medium text-slate-400 mt-1 ml-12 sm:ml-0">Accès partagés et coordination des soins.</p>
        </div>

        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="med-btn-primary self-start sm:self-auto h-10 px-5 flex items-center gap-2"
        >
          <Plus size={16} /> <span className="font-semibold text-sm">Créer un Groupe</span>
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
           <p className="text-xs font-bold uppercase tracking-tight">Connexion aux serveurs...</p>
        </div>
      ) : groupes.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-slate-100 space-y-6">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-slate-200 mx-auto">
               <Users size={40} />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-bold text-slate-900">Aucune collaboration active</h3>
               <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto">
                 Partagez vos médicaments avec d'autres utilisateurs pour coordonner les soins.
               </p>
            </div>
            <button 
              onClick={() => setIsGroupModalOpen(true)}
              className="med-btn-secondary"
            >
              Démarrer un Groupe
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groupes.map(groupe => (
            <div 
              key={groupe.id} 
              className={`group overflow-hidden border transition-all duration-300 ${
                expandedGroupId === groupe.id 
                  ? 'bg-white border-brand-blue shadow-lg' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Card */}
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                   <button 
                    onClick={() => {setActiveGroupId(groupe.id); setIsInviteModalOpen(true);}}
                    className="h-10 px-5 text-[10px] font-bold uppercase tracking-tight bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2"
                   >
                     <UserPlus size={14} /> Inviter
                   </button>
                   
                   <div className="h-8 w-px bg-slate-100 hidden sm:block mx-1" />

                   <button 
                    onClick={(e) => confirmDeleteGroup(groupe.id, e)}
                    className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all sm:opacity-0 sm:group-hover:opacity-100"
                   >
                     <Trash2 size={16} />
                   </button>

                   <div className={`h-10 w-10 flex items-center justify-center border border-slate-100 text-slate-300 transition-all ${expandedGroupId === groupe.id ? 'rotate-180 bg-slate-50 text-slate-900' : ''}`}>
                      <ChevronDown size={18} />
                   </div>
                </div>
              </div>

              {/* Expansible Content */}
              {expandedGroupId === groupe.id && (
                <div className="border-t border-slate-100 animate-fade-up bg-slate-50/30">
                   <div className="p-8 space-y-12">
                      {/* Members */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Users2 size={12} /> Membres Connectés
                          </h4>
                          <div className="flex flex-wrap gap-4">
                             {groupe.membres?.map(m => (
                               <div key={m.id} className="flex items-center gap-3 p-2 pr-5 bg-white border border-slate-200 group/member hover:border-brand-blue/20 transition-all shadow-sm">
                                  <div className="h-10 w-10 bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                     {m.name.substring(0, 1).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{m.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{m.pivot.role || 'Membre'}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                      </div>

                      {/* Shared Profiles */}
                      {groupe.membres?.some(m => m.profils?.length > 0) && (
                        <div className="space-y-6 pt-10 border-t border-slate-100">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                              <Globe size={12} /> Dossiers Médicaux Partagés
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                               {groupe.membres?.flatMap(m => m.profils || []).map(p => (
                                   <div key={p.id} className="med-card p-6 border border-slate-200 hover:border-brand-blue/30 transition-all bg-white group/profile">
                                       <div className="flex items-center gap-4 mb-6 text-left">
                                           <div className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center group-hover/profile:bg-brand-blue group-hover/profile:text-white transition-all shadow-inner border border-slate-100">
                                               <Users size={18} />
                                           </div>
                                           <div className="min-w-0">
                                               <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{p.nom}</p>
                                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.relation}</span>
                                           </div>
                                       </div>
                                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1">
                                             <Clock size={10} /> Actif
                                           </span>
                                           <button className="text-[10px] font-bold text-brand-blue hover:underline underline-offset-4 flex items-center gap-1 uppercase tracking-tight">
                                             Accéder <ArrowRight size={12} />
                                           </button>
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

      {/* Modals */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsGroupModalOpen(false)} />
          <div className="relative w-full sm:max-w-sm bg-white shadow-2xl animate-fade-up">
            <div className="flex justify-center pt-3 sm:hidden"><div className="w-10 h-1 bg-slate-200" /></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-900">Nouveau Groupe</h3>
                  <button onClick={() => setIsGroupModalOpen(false)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                     <X size={18} />
                  </button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-5">
                  <div className="med-form-field">
                    <label className="med-form-label">Nom du Groupe</label>
                    <input type="text" required placeholder="Ex: Soins Famille Smith..." value={nomGroupe} onChange={e => setNomGroupe(e.target.value)} className="med-input h-12" />
                  </div>
                   <button type="submit" disabled={loading} className="med-btn-primary w-full h-12">
                    {loading ? '...' : "Créer l'Espace"}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative w-full sm:max-w-sm bg-white shadow-2xl animate-fade-up">
            <div className="flex justify-center pt-3 sm:hidden"><div className="w-10 h-1 bg-slate-200" /></div>
            <div className="p-6 sm:p-8 text-center">
              <div className="h-14 w-14 bg-brand-blue/5 text-brand-blue flex items-center justify-center mx-auto mb-4">
                 <MailOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Inviter un Collaborateur</h3>
              <p className="text-xs font-medium text-slate-400 mt-1 mb-6">L'utilisateur recevra un accès partagé instantanément.</p>
              <form onSubmit={handleInvite} className="space-y-4 text-left">
                  <div className="med-form-field">
                    <label className="med-form-label">Email de l'utilisateur</label>
                    <input type="email" required placeholder="nom@exemple.com" value={emailInvite} onChange={e => setEmailInvite(e.target.value)} className="med-input h-12" />
                  </div>
                   <button type="submit" disabled={loading} className="med-btn-primary w-full h-12">
                    {loading ? '...' : "Envoyer l'accès"}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        title="Supprimer la Collaboration ?"
        message="Les membres n'auront plus accès aux profils partagés dans ce groupe."
        onConfirm={handleDeleteGroup}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        confirmText="Confirmer la Suppression"
        loading={isDeleting}
      />
    </div>
  );
}
