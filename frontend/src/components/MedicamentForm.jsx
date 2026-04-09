import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { 
  X, Save, Pill, ClipboardList, Info, 
  Calendar, FlaskConical, AlertCircle, 
  Clock, Plus, Trash2, CheckCircle2, 
  Activity, ActivitySquare, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

/**
 * MedicamentForm — Product Precision "Sleek & Clean"
 * Formulaire Professionnel · Compact · Haute Lisibilité.
 * Mise à jour : Standardisation totale des styles et labels français.
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const typesMed = ['comprimé', 'gélule', 'sirop', 'injection', 'crème', 'pommade', 'gouttes', 'patch', 'suppositoire', 'autre'];
  const moments = ['Matin', 'Midi', 'Soir', 'Coucher', 'Avant repas', 'Après repas'];

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
    setValidationErrors({});
  }, [medicamentToEdit, isOpen]);

  const handleNomChange = async (val) => {
    setFormData({ ...formData, nom: val });
    if (val.length > 2) {
      try {
        const res = await api.get(`/medicaments/search?q=${val}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (e) { console.error(e); }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s) => {
    setFormData({ ...formData, nom: s.nom, type: s.type || formData.type });
    setShowSuggestions(false);
  };

  const handleAddRappel = () => {
    setRappels([...rappels, { moment: 'Matin', heure: '08:00' }]);
  };

  const removeRappel = (idx) => {
    const rToRemove = rappels[idx];
    if (rToRemove.id) {
       setDeletedRappels([...deletedRappels, rToRemove.id]);
    }
    setRappels(rappels.filter((_, i) => i !== idx));
  };

  const validateModel = () => {
     const errors = {};
     if (!formData.nom) errors.nom = "Le nom est requis";
     if (!formData.posologie) errors.posologie = "La posologie est requise";
     setValidationErrors(errors);
     return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateModel()) return;

    setLoading(true);
    try {
      let res;
      if (medicamentToEdit) {
        res = await api.put(`/profils/${profilId}/medicaments/${medicamentToEdit.id}`, formData);
        
        for (const rID of deletedRappels) {
           await api.delete(`/medicaments/${medicamentToEdit.id}/rappels/${rID}`);
        }
        for (const rappel of rappels) {
           if (rappel.id) {
             await api.put(`/medicaments/${medicamentToEdit.id}/rappels/${rappel.id}`, rappel);
           } else {
             await api.post(`/medicaments/${medicamentToEdit.id}/rappels`, rappel);
           }
        }
      } else {
        res = await api.post(`/profils/${profilId}/medicaments`, formData);
        const newMed = res.data;
        for (const rappel of rappels) {
          await api.post(`/medicaments/${newMed.id}/rappels`, rappel);
        }
      }
      onSuccess(res.data);
    } catch (err) {
      console.error(err);
      showToast('Une erreur est survenue lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-xl bg-white shadow-2xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-fade-up">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-200" />
        </div>
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
           <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-blue">
                 <Pill size={17} strokeWidth={2.5} />
              </div>
              <div>
                 <h2 className="text-sm font-bold text-slate-900 leading-none">
                    {medicamentToEdit ? 'Modifier le Traitement' : 'Nouveau Médicament'}
                 </h2>
                 <p className="text-xs font-medium text-slate-500 mt-0.5">Dossier Clinique</p>
              </div>
           </div>
           <button
             onClick={onClose}
             className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
           >
              <X size={17} />
           </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
           
           <form onSubmit={handleSubmit} id="med-form" className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Nome e Type */}
                 <div className="med-form-field relative">
                    <label className="med-form-label">Nom du Médicament</label>
                    <input
                      type="text" required placeholder="Chercher un médicament..."
                      value={formData.nom} 
                      onChange={e => handleNomChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className={`med-input ${validationErrors.nom ? 'border-red-500' : ''}`}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-xl z-50 p-1 overflow-hidden animate-fade-up">
                        {suggestions.map(s => (
                          <button key={s.id} type="button" onClick={() => selectSuggestion(s)} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-all flex items-center gap-3">
                            <Pill size={14} /> {s.nom}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
                 
                 <div className="med-form-field relative">
                    <label className="med-form-label">Forme Galénique</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="med-input appearance-none px-4 bg-slate-50 border border-slate-200 focus:bg-white transition-all text-xs font-semibold"
                      >
                        {typesMed.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Posologie */}
              <div className="med-form-field">
                 <label className="med-form-label">Posologie et Instructions Appliquées</label>
                 <textarea
                   required placeholder="Ex: 1 unité après chaque repas principal..."
                   value={formData.posologie} onChange={e => setFormData({ ...formData, posologie: e.target.value })}
                   className="med-input min-h-[64px] py-3 px-4 bg-slate-50/50 focus:bg-white resize-none leading-relaxed text-sm font-medium border border-slate-100 rounded-xl transition-all"
                 />
              </div>

              {/* Cycle de Traitement */}
              <div className="pt-2">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="med-form-field">
                      <label className="med-form-label">Date Début</label>
                      <input
                        type="date" required
                        value={formData.date_debut} onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                        className="med-input border-slate-100 bg-slate-50/50 rounded-xl"
                      />
                   </div>
                   <div className="med-form-field">
                      <label className="med-form-label">Fin Estimée</label>
                      <input
                        type="date"
                        value={formData.date_fin || ''} onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                        className="med-input border-slate-100 bg-slate-50/50 rounded-xl"
                      />
                   </div>
                 </div>
              </div>

              {/* Stock et Expiration */}
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl grid grid-cols-3 gap-4">
                 <div className="med-form-field">
                    <label className="med-form-label">Stock Initial</label>
                    <input
                      type="number" min="0" required
                      value={formData.quantite}
                      onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                      className="med-input text-center font-bold border-slate-200 rounded-xl"
                    />
                 </div>
                 <div className="med-form-field">
                    <label className="med-form-label">Seuil Critique</label>
                    <input
                      type="number" min="0"
                      value={formData.seuil_alerte}
                      onChange={e => setFormData({ ...formData, seuil_alerte: parseInt(e.target.value) || 0 })}
                      className="med-input text-center font-bold text-brand-amber border-slate-200 rounded-xl"
                    />
                 </div>
                 <div className="med-form-field">
                    <label className="med-form-label">Expiration</label>
                    <input
                      type="date"
                      value={formData.date_expiration || ''} onChange={e => setFormData({ ...formData, date_expiration: e.target.value })}
                      className="med-input text-[11px] font-bold border-slate-200 bg-white rounded-xl"
                    />
                 </div>
              </div>

              {/* Rappels */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-brand-blue" />
                       <h3 className="text-sm font-semibold text-slate-800">Protocoles de Rappel</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddRappel} 
                      className="text-[10px] font-bold text-brand-blue hover:text-blue-800 bg-brand-blue/5 hover:bg-brand-blue/10 px-3 py-1.5 transition-all flex items-center gap-2 uppercase tracking-tight"
                    >
                       <Plus size={16} strokeWidth={2} /> Créer un horaire
                    </button>
                 </div>
                 
                 <div className="space-y-3 min-h-[40px]">
                    {rappels.map((rappel, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-3 group hover:border-brand-blue/20 transition-all shadow-sm">
                         <div className="flex-1 relative">
                            <select 
                              value={rappel.moment}
                              onChange={(e) => {
                                const newR = [...rappels];
                                newR[idx].moment = e.target.value;
                                setRappels(newR);
                              }}
                              className="w-full h-10 px-4 bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 outline-none appearance-none"
                            >
                              {moments.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                               <ChevronDown size={14} />
                            </div>
                         </div>
                         <div className="w-32">
                            <input 
                              type="time" 
                              required
                              value={rappel.heure}
                              onChange={(e) => {
                                const newR = [...rappels];
                                newR[idx].heure = e.target.value;
                                setRappels(newR);
                              }}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:border-brand-blue transition-all"
                            />
                         </div>
                         <button 
                           type="button" 
                           onClick={() => removeRappel(idx)}
                           className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all group-hover:opacity-100 opacity-40"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    ))}
                    {rappels.length === 0 && (
                       <div className="text-center py-8 border border-dashed border-slate-200 bg-slate-50/50">
                          <p className="text-xs font-medium text-slate-500">Aucun rappel configuré pour ce traitement.</p>
                       </div>
                    )}
                 </div>
              </div>
           </form>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
           <button
             type="button"
             onClick={onClose}
             className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
           >
              Annuler
           </button>
           <button
             type="submit"
             form="med-form"
             disabled={loading}
             className="med-btn-primary min-w-[160px] sm:min-w-[200px] h-11 sm:h-12 shadow-md shadow-brand-blue/10"
           >
              {loading ? (
                 <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={17} />
                    <span className="font-bold text-xs uppercase tracking-tight">Valider</span>
                 </div>
              )}
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
