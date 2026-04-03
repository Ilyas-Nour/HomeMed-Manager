import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, MailOpen, Shield, Trash2, 
  ChevronDown, UserPlus, Info, CheckCircle2,
  Users2, ArrowRight, X, Mail, Loader2
} from 'lucide-react';
import api from '../services/api';

/**
 * Composant de Gestion des Groupes (Requirement 3.7)
 * Design : Studio Collaborative — Premium, Glassmorphism, animations fluides.
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

  useEffect(() => {
     fetchGroupes();
  }, []);

  const fetchGroupes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groupes');
      setGroupes(res.data);
    } catch (e) { 
      console.error('Erreur fetch groupes', e); 
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
      setMessage({ type: 'success', text: 'Groupe collaboratif créé !' });
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
      setMessage({ type: 'success', text: 'Invitation envoyée avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: "L'utilisateur n'existe pas ou est déjà membre." });
      setTimeout(() => setMessage(null), 4000);
    } finally { setLoading(false); }
  }

  const handleDeleteGroup = async (id, e) => {
    e.stopPropagation();
    if(!confirm("Supprimer définitivement ce groupe ?")) return;
    try {
      await api.delete(`/groupes/${id}`);
      await fetchGroupes();
      setMessage({ type: 'success', text: 'Groupe supprimé.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header — Studio Collaboration Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-100/50">
            <Users size={12} /> Espaces Partagés
          </div>
          <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">Groupes Collaboratifs</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Partagez l'accès médical entre aidants et famille</p>
        </div>

        <button 
          onClick={() => setIsGroupModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10"
        >
          <Plus size={18} /> Créer un Groupe
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-slide-in ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading && groupes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 grayscale opacity-40">
           <Loader2 className="animate-spin text-slate-900 mb-4" size={40} strokeWidth={1} />
           <p className="text-[10px] font-black uppercase tracking-widest">Initialisation du réseau...</p>
        </div>
      ) : groupes.length === 0 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
               <Users2 size={40} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Aucune équipe active</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] max-w-sm leading-relaxed mb-8 italic">
              Collaborez avec des soignants ou des membres de votre famille en créant un espace partagé.
            </p>
            <button 
              onClick={() => setIsGroupModalOpen(true)}
              className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Créer mon premier groupe
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groupes.map(groupe => (
            <div 
              key={groupe.id} 
              className={`group overflow-hidden rounded-[32px] border transition-all duration-500 ${
                expandedGroupId === groupe.id 
                  ? 'bg-white border-blue-100 shadow-2xl shadow-blue-500/5' 
                  : 'bg-white/70 backdrop-blur-md border-slate-100/50 hover:bg-white hover:border-blue-50 hover:shadow-xl hover:shadow-slate-200/40'
              }`}
            >
              {/* Header de Carte */}
              <div 
                className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                onClick={() => setExpandedGroupId(expandedGroupId === groupe.id ? null : groupe.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    expandedGroupId === groupe.id ? 'bg-blue-600 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                  }`}>
                    <Shield size={24} strokeWidth={expandedGroupId === groupe.id ? 2.5 : 2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-[900] text-slate-900 tracking-tight">{groupe.nom}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       {groupe.membres?.length} membres actifs
                       <span className="w-1 h-1 rounded-full bg-slate-200" />
                       Équipe de soin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                   <button 
                    onClick={() => {setActiveGroupId(groupe.id); setIsInviteModalOpen(true);}}
                    className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 flex items-center gap-2"
                   >
                     <UserPlus size={14} /> Inviter
                   </button>
                   
                   <button 
                    onClick={(e) => handleDeleteGroup(groupe.id, e)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={16} />
                   </button>

                   <div className={`h-10 w-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 transition-all ${expandedGroupId === groupe.id ? 'rotate-180 text-blue-500 bg-blue-50 border-blue-100' : ''}`}>
                      <ChevronDown size={18} />
                   </div>
                </div>
              </div>

              {/* Contenu Expansible (Membres & Profils Partagés) */}
              {expandedGroupId === groupe.id && (
                <div className="border-t border-slate-50 animate-fade-down overflow-hidden">
                   <div className="p-8 bg-slate-50/40 grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Section Membres */}
                      <div className="lg:col-span-12 space-y-4">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Membres de l'équipe
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {groupe.membres?.map(m => (
                              <div key={m.id} className="inline-flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all group/member">
                                 <div className="h-8 w-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs group-hover/member:bg-blue-600 group-hover/member:text-white transition-all">
                                    {m.name.substring(0, 1)}
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-black text-slate-900 leading-none mb-0.5">{m.name}</p>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{m.pivot.role}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Section Profils Partagés */}
                      <div className="lg:col-span-12 space-y-4 pt-4 border-t border-slate-100/50">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Inventaires & Profils Synchronisés
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {groupe.membres?.flatMap(m => m.profils || []).map(p => (
                                <div key={p.id} className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group/profile">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover/profile:scale-110 transition-transform">
                                            <Users size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{p.nom}</p>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.relation}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 grayscale group-hover/profile:grayscale-0 transition-all">
                                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(p.medicaments || []).length} Actifs</span>
                                        </div>
                                        <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn">
                                          Accéder <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Création Groupe (Studio Style) */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsGroupModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white animate-fade-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <Plus size={24} />
                 </div>
                 <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Groupe</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Créez votre propre équipe collaborative</p>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Identifiant du groupe (Nom)</label>
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      placeholder="Ex: Famille Dupont" 
                      value={nomGroupe} 
                      onChange={e => setNomGroupe(e.target.value)} 
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !nomGroupe}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Initialiser l\'espace'}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Invitation (Studio Style) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white animate-fade-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MailOpen size={24} />
                 </div>
                 <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inviter un membre</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">L'utilisateur recevra un accès partagé</p>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">E-mail de destination</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        required 
                        autoFocus
                        placeholder="nom@exemple.com" 
                        value={emailInvite} 
                        onChange={e => setEmailInvite(e.target.value)} 
                        className="w-full h-14 pl-14 pr-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" 
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3">
                    <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-blue-700/70 leading-relaxed uppercase tracking-wider">
                      L'utilisateur doit déjà posséder un compte HomeMed pour rejoindre votre espace collaboratif.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !emailInvite}
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Accorder l\'accès'}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
