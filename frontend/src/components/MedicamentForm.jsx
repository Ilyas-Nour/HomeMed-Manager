import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  X, Save, Pill, ClipboardList, Info, 
  Calendar, FlaskConical, AlertCircle, ToggleLeft, ToggleRight,
  Clock, Plus, Trash2
} from 'lucide-react';

/**
 * MedicamentForm — Modal Premium "Perfect White"
 */
export default function MedicamentForm({ isOpen, onClose, profilId, medicamentToEdit, onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    nom: '', type: 'comprimé', posologie: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '', date_expiration: '',
    quantite: 0, seuil_alerte: 5, notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [rappels, setRappels] = useState([]);
  const [deletedRappels, setDeletedRappels] = useState([]);

  useEffect(() => {
    if (medicamentToEdit) {
      setFormData({ 
        ...medicamentToEdit,
        date_debut: medicamentToEdit.date_debut ? String(medicamentToEdit.date_debut).substring(0, 10) : '',
        date_fin: medicamentToEdit.date_fin ? String(medicamentToEdit.date_fin).substring(0, 10) : '',
        date_expiration: medicamentToEdit.date_expiration ? String(medicamentToEdit.date_expiration).substring(0, 10) : ''
      });
      api.get(`/medicaments/${medicamentToEdit.id}/rappels`)
         .then(res => setRappels(res.data))
         .catch(err => console.error("Erreur rappels", err));
    } else {
      setFormData({
        nom: '', type: 'comprimé', posologie: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '', date_expiration: '',
        quantite: 0, seuil_alerte: 5, notes: ''
      });
      setRappels([]);
    }
    setDeletedRappels([]);
    setLoading(false);
  }, [medicamentToEdit, isOpen]);

  const handleAddRappel = () => {
    setRappels([...rappels, { moment: 'libre', heure: '08:00', isNew: true }]);
  };

  const handleRemoveRappel = (index) => {
    const r = rappels[index];
    if (r.id) setDeletedRappels([...deletedRappels, r.id]);
    setRappels(rappels.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let medId = medicamentToEdit?.id;
      
      if (medicamentToEdit) {
        await api.patch(`/profils/${profilId}/medicaments/${medId}`, formData);
      } else {
        const res = await api.post(`/profils/${profilId}/medicaments`, formData);
        medId = res.data.id;
      }

      // Synchronisation des rappels
      for (const id of deletedRappels) {
        await api.delete(`/rappels/${id}`);
      }
      for (const r of rappels) {
        if (r.isNew) {
          await api.post(`/medicaments/${medId}/rappels`, { moment: r.moment, heure: r.heure });
        }
      }

      if (showToast) {
        showToast(medicamentToEdit ? 'Modifié avec succès' : 'Nouveau traitement ajouté');
      }
      onSuccess();
      onClose();
    } catch (err) { 
      console.error('Erreur sauvegarde', err);
      if (showToast) {
        showToast('Erreur lors de la sauvegarde', 'error');
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const moments = ['matin', 'midi', 'soir', 'apres-midi', 'coucher', 'libre'];
  const typesMed = ['comprimé', 'sirop', 'injection', 'crème', 'gouttes', 'patch', 'suppositoire', 'autre'];

  return (
    <div className="hm-modal-backdrop">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="hm-modal-content max-w-2xl animate-fade-up">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-[#00416A]" />
        
        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                <Pill size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {medicamentToEdit ? 'Éditer le Traitement' : 'Nouveau Médicament'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Détails & Planification</p>
              </div>
            </div>
            <button onClick={onClose} className="hm-btn-ghost hover:scale-110 active:scale-95"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="hm-label">Nom du Médicament</label>
                <input
                  type="text" required placeholder="Ex: Doliprane 1000mg..."
                  value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  className="hm-input h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="hm-label">Type Galénique</label>
                <select
                  value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="hm-input appearance-none cursor-pointer h-10"
                >
                  {typesMed.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="hm-label">Posologie & Fréquence</label>
              <textarea
                required placeholder="Ex: 1 comprimé 3 fois par jour apres les repas..."
                value={formData.posologie} onChange={e => setFormData({ ...formData, posologie: e.target.value })}
                className="hm-input resize-none h-16 py-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="hm-label flex items-center gap-2">Début</label>
                <input
                  type="date" required
                  value={formData.date_debut} onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                  className="hm-input font-medium h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="hm-label flex items-center gap-2">Fin (Optionnel)</label>
                <input
                  type="date"
                  value={formData.date_fin || ''} onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                  className="hm-input font-medium h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="hm-label">Quantité</label>
                <input
                  type="number" min="0" required
                  value={formData.quantite} onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                  className="hm-input text-center h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="hm-label">Alerte Seuil</label>
                <input
                  type="number" min="0"
                  value={formData.seuil_alerte} onChange={e => setFormData({ ...formData, seuil_alerte: parseInt(e.target.value) || 0 })}
                  className="hm-input text-center h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="hm-label">Expiration</label>
                <input
                  type="date"
                  value={formData.date_expiration || ''} onChange={e => setFormData({ ...formData, date_expiration: e.target.value })}
                  className="hm-input font-medium h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="hm-label">Notes</label>
              <textarea
                placeholder="Consignes particulières..."
                value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="hm-input resize-none h-16 py-2"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                    <Clock size={12} className="text-emerald-500" />
                    Rappels de prise
                  </h3>
                <button type="button" onClick={handleAddRappel} className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 hover:bg-emerald-100 transition-colors uppercase flex items-center gap-1">
                  <Plus size={10} /> AJOUTER
                </button>
              </div>

              <div className="space-y-2">
                {rappels.map((rappel, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-fade-up">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <select 
                        value={rappel.moment}
                        onChange={(e) => {
                          const newR = [...rappels];
                          newR[idx].moment = e.target.value;
                          setRappels(newR);
                        }}
                        className="hm-input h-9 text-[11px] font-bold bg-slate-50 border-transparent focus:bg-white"
                      >
                        {moments.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                      </select>
                      <input 
                        type="time"
                        value={rappel.heure.substring(0, 5)}
                        onChange={(e) => {
                          const newR = [...rappels];
                          newR[idx].heure = e.target.value;
                          setRappels(newR);
                        }}
                        className="hm-input h-9 text-[11px] font-bold text-center bg-slate-50 border-transparent focus:bg-white"
                      />
                    </div>
                    <button type="button" onClick={() => handleRemoveRappel(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {rappels.length === 0 && (
                  <div className="py-4 text-center bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aucun rappel programmé</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading}
                className="w-full sm:w-auto hm-btn-secondary h-11 px-8 disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto hm-btn h-11 px-10 group disabled:opacity-80"
              >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{medicamentToEdit ? 'Enregistrement...' : 'Ajout...'}</span>
                    </div>
                ) : (
                    <>
                        <Save size={16} />
                        <span>{medicamentToEdit ? 'Enregistrer' : 'Ajouter'}</span>
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

