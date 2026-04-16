import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Trash2, ShieldCheck, UserPlus, X, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';

/**
 * FamilyMode — Sleek SaaS Design
 * Polished layout and refined interactions.
 */
export default function FamilyMode({ onProfileSwitch, setCurrentView }) {
  const { user, fetchUser } = useAuth(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/profils', { nom, relation });
      await fetchUser();
      setIsModalOpen(false);
      setNom('');
      setRelation('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (idx) => {
    setProfileToDelete(idx);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    try {
      await api.delete(`/profils/${profileToDelete}`);
      await fetchUser();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPharmacy = (id) => {
    onProfileSwitch && onProfileSwitch(id);
    setCurrentView && setCurrentView('medicaments');
  };

  return (
    <div className="space-y-10 pb-24 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
            <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Famille & Profils</h1>
               <p className="text-base font-medium text-slate-500">Gérez les dossiers médicaux des membres de votre foyer.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-blue text-white h-11 px-6 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
               <UserPlus size={18} strokeWidth={2.5} />
               <span>Ajouter un profil</span>
            </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {user?.profils?.map(profil => (
                <div key={profil.id} className="group bg-white border border-slate-100 rounded-[32px] p-7 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-blue/10 relative overflow-hidden active:scale-[0.99]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative">
                        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-brand-blue font-bold text-lg shadow-sm border border-white transition-all duration-500 group-hover:rotate-3 group-hover:scale-110">
                           {profil.nom.charAt(0).toUpperCase()}
                        </div>
                        <button
                          onClick={() => confirmDelete(profil.id)}
                          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="space-y-2 mb-10 relative">
                       <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{profil.nom}</h3>
                       <div className="flex items-center gap-3">
                          <span className="badge-dna bg-slate-50 text-slate-400 border-none">{profil.relation}</span>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">SANTÉ ACTIVE</span>
                       </div>
                    </div>

                    <button 
                      onClick={() => handleViewPharmacy(profil.id)}
                      className="w-full h-12 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <span>Ouvrir</span>
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            ))}

            <button 
              onClick={() => setIsModalOpen(true)}
              className="group border-2 border-dashed border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-5 hover:border-brand-blue/30 transition-all duration-500 hover:bg-indigo-50/10 min-h-[260px]"
            >
               <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-brand-blue group-hover:text-white transition-all duration-700 group-hover:rotate-6">
                 <Plus size={28} strokeWidth={3} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand-blue">Ajouter un profil</span>
            </button>
        </div>

        {/* New Profile Modal */}
        {isModalOpen && createPortal(
            <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsModalOpen(false)} />
                <div className="relative w-full sm:max-w-md bg-white shadow-xl border border-slate-100 rounded-t-2xl sm:rounded-2xl animate-fade-up overflow-hidden">
                    <div className="p-8 sm:p-10">
                      <div className="flex items-center justify-between mb-8">
                         <div className="space-y-1">
                             <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Nouveau Profil</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Élargissez votre cercle santé</p>
                         </div>
                         <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                            <X size={24} />
                         </button>
                      </div>

                      <form onSubmit={handleSave} className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom Complet</label>
                              <input
                                autoFocus
                                type="text"
                                required
                                value={nom}
                                onChange={e => setNom(e.target.value)}
                                placeholder="ex: Sarah Connor"
                                className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lien de Parenté</label>
                              <div className="relative">
                                <select
                                  required
                                  value={relation}
                                  onChange={e => setRelation(e.target.value)}
                                  className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 appearance-none focus:bg-white focus:border-brand-blue outline-none transition-all"
                                >
                                    <option value="">Sélectionner une relation</option>
                                    <option value="Moi-même">Moi-même</option>
                                    <option value="Père">Père</option>
                                    <option value="Mère">Mère</option>
                                    <option value="Enfant">Enfant</option>
                                    <option value="Patient">Patient</option>
                                    <option value="Conjoint">Conjoint</option>
                                    <option value="Autre">Autre</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 transition-transform">
                                  <ChevronRight size={16} className="rotate-90" />
                                </div>
                              </div>
                          </div>
                          
                          <div className="pt-4 flex flex-col gap-3">
                              <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full h-12 bg-brand-blue text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95"
                              >
                                 {loading ? 'Création...' : 'Créer le Profil'}
                              </button>
                               <button
                                 type="button"
                                 onClick={() => setIsModalOpen(false)}
                                 className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                               >
                                  Ignorer
                               </button>
                          </div>
                      </form>
                    </div>
                </div>
            </div>,
            document.body
        )}

        {/* Delete Confirmation */}
        <ConfirmModal 
           isOpen={isDeleteModalOpen}
           title="Supprimer ce Profil ?"
           message="Toutes les données associées seront définitivement perdues."
           onConfirm={handleDelete}
           onCancel={() => setIsDeleteModalOpen(false)}
           confirmText="Confirmer la suppression"
        />
    </div>
  );
}

// Helper icon
function ArrowRight({ size, strokeWidth, className }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
