import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function FamilyMode() {
  const { user, fetchUser } = useAuth(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (id) => {
      if(!confirm("Supprimer ce profil de famille ?")) return;
      try {
          await api.delete(`/profils/${id}`);
          await fetchUser();
      } catch (err) {
          console.error(err);
      }
  }

  return (
    <div className="space-y-6 pt-4 animate-fade-in">
        <div className="flex items-center justify-between pl-1">
            <div>
               <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <Users size={20} className="text-emerald-500" /> Mode Famille
               </h2>
               <p className="text-sm text-slate-500">Gérez les profils de santé rattachés à votre compte principal.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="hm-btn">
               <Plus size={16} /> Ajouter un membre
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.profils?.map(profil => (
                <div key={profil.id} className="hm-card p-5 group transition-all hover:shadow-md border-transparent hover:border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-md border bg-slate-50 text-slate-900 border-slate-200">
                           <Users size={20} />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(profil.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-950 leading-none mb-1.5">{profil.nom}</h3>
                    <span className="hm-badge hm-badge-slate text-[10px]">{profil.relation}</span>
                </div>
            ))}
        </div>

        {/* Modal simple */}
        {isModalOpen && (
            <div className="hm-modal-backdrop !z-[200]">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                <div className="hm-modal-content p-6 w-full max-w-sm relative z-10 animate-fade-up">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Nouveau membre</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nom / Prénom</label>
                            <input type="text" required value={nom} onChange={e => setNom(e.target.value)} className="w-full hm-input" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Relation</label>
                            <select required value={relation} onChange={e => setRelation(e.target.value)} className="w-full hm-input text-slate-700 bg-white">
                                <option value="">Choisir...</option>
                                <option value="Moi-même">Moi-même</option>
                                <option value="Père">Père</option>
                                <option value="Mère">Mère</option>
                                <option value="Enfant">Enfant</option>
                                <option value="Patient">Patient</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="hm-btn-secondary">Annuler</button>
                            <button type="submit" disabled={loading} className="hm-btn">{loading ? '...' : 'Ajouter'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
