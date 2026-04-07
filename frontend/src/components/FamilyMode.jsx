import React, { useState } from 'react';
import { Users, Plus, Trash2, ShieldCheck, UserPlus, X, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';

/**
 * FamilyMode — Product Precision "Sleek & Clean"
 * Gestion des Profils Familiaux · Localisation Française Complète.
 */
export default function FamilyMode({ onProfileSwitch, setCurrentView }) {
  const { user, fetchUser } = useAuth(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États pour la suppression
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
    <div className="space-y-6 pb-24">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
               <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="h-9 w-9 sm:h-10 sm:w-10 bg-white border border-slate-200 flex items-center justify-center text-brand-blue shadow-sm shrink-0">
                   <Users size={18} />
                 </div>
                 Profils Familiaux
               </h1>
               <p className="text-sm font-medium text-slate-400 mt-1 ml-12 sm:ml-0">Gérez les dossiers médicaux de toute votre famille.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="med-btn-primary self-start sm:self-auto h-10 px-5 flex items-center gap-2"
            >
               <Plus size={16} />
               <span className="font-semibold text-sm">Ajouter un Membre</span>
            </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {user?.profils?.map(profil => (
                <div key={profil.id} className="group relative bg-white border border-slate-200 p-4 sm:p-5 hover:border-brand-blue/20 transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-all duration-200 font-bold text-sm">
                           {profil.nom.charAt(0).toUpperCase()}
                        </div>
                        <button
                          onClick={() => confirmDelete(profil.id)}
                          className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="space-y-1 mb-4">
                       <h3 className="text-sm font-semibold text-slate-900 truncate">{profil.nom}</h3>
                       <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-500">{profil.relation}</span>
                          <div className="h-1 w-1 bg-slate-300" />
                          <span className="text-xs font-medium text-brand-green">Actif</span>
                       </div>
                    </div>

                    <button
                      onClick={() => handleViewPharmacy(profil.id)}
                      className="w-full h-9 border border-slate-200 text-xs font-medium text-slate-600 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    >
                       Pharmacie <ChevronRight size={14} />
                    </button>
                </div>
            ))}

            {(!user?.profils || user.profils.length === 0) && (
               <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 space-y-4">
                  <div className="h-14 w-14 bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                    <Users size={28} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Aucun membre enregistré.</p>
               </div>
            )}
        </div>

        {/* Form Modal — bottom-sheet on mobile */}
        {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
                <div className="relative w-full sm:max-w-sm bg-white shadow-2xl animate-fade-up">
                    {/* Mobile drag handle */}
                    <div className="flex justify-center pt-3 sm:hidden">
                      <div className="w-10 h-1 bg-slate-200" />
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-lg font-bold text-slate-900">Nouveau Profil Familial</h3>
                         <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                            <X size={18} />
                         </button>
                      </div>

                      <form onSubmit={handleSave} className="space-y-4">
                          <div className="med-form-field">
                              <label className="med-form-label">Nom Complet</label>
                              <input
                                type="text"
                                required
                                value={nom}
                                onChange={e => setNom(e.target.value)}
                                placeholder="ex: Jean Dupont"
                                className="med-input h-12"
                              />
                          </div>
                          <div className="med-form-field">
                              <label className="med-form-label">Relation</label>
                              <div className="relative">
                                <select
                                  required
                                  value={relation}
                                  onChange={e => setRelation(e.target.value)}
                                  className="med-input h-12 appearance-none"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Moi-même">Moi-même</option>
                                    <option value="Père">Père</option>
                                    <option value="Mère">Mère</option>
                                    <option value="Enfant">Enfant</option>
                                    <option value="Patient">Patient</option>
                                    <option value="Conjoint">Conjoint</option>
                                    <option value="Autre">Autre</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <ChevronRight size={14} className="rotate-90" />
                                </div>
                              </div>
                          </div>
                          <div className="flex flex-col gap-3 pt-2">
                              <button type="submit" disabled={loading} className="med-btn-primary w-full h-10 text-sm font-semibold">
                                 {loading ? 'Création...' : 'Enregistrer le Profil'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                 Annuler
                              </button>
                          </div>
                      </form>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmModal 
           isOpen={isDeleteModalOpen}
           title="Supprimer ce Profil ?"
           message="Toutes les données associées à ce membre de la famille seront définitivement effacées."
           onConfirm={handleDelete}
           onCancel={() => setIsDeleteModalOpen(false)}
           confirmText="Confirmer la suppression"
        />
    </div>
  );
}
