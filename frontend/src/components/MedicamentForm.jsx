import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  X, Check, Pill, ClipboardText, Info, 
  CalendarBlank, Flask, WarningCircle, 
  Clock, Plus, Trash, CheckCircle, 
  Pulse, SquareHalf, ShieldCheck,
  CaretDown, CircleNotch
} from '@phosphor-icons/react';
import ConfirmModal from './ConfirmModal';

/**
 * MedicamentForm — Product Precision "Sleek & Clean"
 * Formulaire Professionnel · Compact · Haute Lisibilité.
 * Mise à jour : Standardisation totale des styles et labels français.
 */
export default function MedicamentForm({ isOpen, onClose, profilId, medicamentToEdit, onSuccess, showToast }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nom: '', type: 'comprimé', posologie: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '', date_expiration: '',
    quantite: 0, seuil_alerte: 5, notes: '',
    is_public: false
  });
  
  const [rappels, setRappels] = useState([]);
  const [deletedRappels, setDeletedRappels] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async (data) => {
        const payload = { ...data, rappels }; // Inclure les rappels dans le payload principal
        
        let res;
        if (medicamentToEdit) {
            res = await api.put(`/profils/${profilId}/medicaments/${medicamentToEdit.id}`, payload);
        } else {
            res = await api.post(`/profils/${profilId}/medicaments`, payload);
        }
        return res.data;
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['dashboard_data', profilId] });
        onSuccess(data);
    },
    onError: (err) => {
        console.error(err);
        showToast('Une erreur est survenue lors de l\'enregistrement', 'error');
    }
  });

  const loading = mutation.isPending;

  const typesMed = ['comprimé', 'gélule', 'sirop', 'injection', 'crème', 'pommade', 'gouttes', 'patch', 'suppositoire', 'autre'];
  const moments = ['Matin', 'Midi', 'Soir', 'Coucher', 'Avant repas', 'Après repas'];

  useEffect(() => {
    if (medicamentToEdit) {
      setFormData({ 
        ...medicamentToEdit,
        is_public: !!medicamentToEdit.is_public,
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
        quantite: 0, seuil_alerte: 5, notes: '',
        is_public: false
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
        const res = await api.get(`/master-medicaments?q=${val}`);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateModel()) return;
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh] animate-fade-up border border-white/20">
        {/* Mobile Drag Handle — Minimalist */}
        <div className="flex justify-center pt-4 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>
        
        {/* Header — Glassmorphic & Clean */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20 shrink-0">
           <div className="flex items-center gap-5">
              <div className="h-12 w-12 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-center text-brand-blue shadow-inner">
                 <Pill size={22} weight="bold" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                    {medicamentToEdit ? 'Modifier le Traitement' : 'Nouveau Médicament'}
                 </h2>
                 <p className="text-[10px] font-black text-brand-blue uppercase mt-1.5 tracking-widest">Dossier Clinique Patient</p>
              </div>
           </div>
           <button
             onClick={onClose}
             className="h-10 w-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 group"
           >
              <X size={20} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
           </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-8 no-scrollbar scroll-smooth">
           
           <form onSubmit={handleSubmit} id="med-form" className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Nome e Type */}
                 <div className="space-y-3 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du Médicament</label>
                    <div className="relative group/input">
                      <input
                        type="text" required placeholder="Chercher un médicament..."
                        value={formData.nom} 
                        onChange={e => handleNomChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className={`w-full h-14 pl-6 pr-6 bg-slate-50/50 border ${validationErrors.nom ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'} rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue/30 focus:ring-[8px] focus:ring-brand-blue/5 outline-none transition-all duration-300`}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] z-50 p-2 overflow-hidden animate-fade-up">
                          {suggestions.map(s => (
                            <button key={s.id} type="button" onClick={() => selectSuggestion(s)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-all flex items-center gap-4">
                              <Pill size={16} weight="bold" className="text-slate-300" /> {s.nom}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="space-y-3 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forme Galénique</label>
                    <div className="relative group/input">
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none focus:bg-white focus:border-brand-blue/30 focus:ring-[8px] focus:ring-brand-blue/5 transition-all duration-300"
                      >
                        {typesMed.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <CaretDown size={14} weight="bold" />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Posologie */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posologie & Instructions</label>
                 <textarea
                   required placeholder="Ex: 1 unité après chaque repas principal..."
                   value={formData.posologie} onChange={e => setFormData({ ...formData, posologie: e.target.value })}
                   className="w-full min-h-[100px] py-5 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-brand-blue/30 focus:ring-[8px] focus:ring-brand-blue/5 outline-none transition-all duration-300 resize-none leading-relaxed"
                 />
              </div>

              {/* Traitement Cycle */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle de Traitement</label>
                 <div className="grid grid-cols-2 gap-6 p-1">
                   <div className="relative group/input">
                      <input
                        type="date" required
                        value={formData.date_debut} onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                        className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all"
                      />
                      <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black text-brand-blue uppercase tracking-widest">Départ</div>
                   </div>
                   <div className="relative group/input">
                      <input
                        type="date"
                        value={formData.date_fin || ''} onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                        className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all"
                      />
                      <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest text-opacity-80">Fin Prévue</div>
                   </div>
                 </div>
              </div>

              {/* Stock Details */}
              <div className="bg-slate-50/30 border border-slate-100/50 p-6 sm:p-8 rounded-[32px] grid grid-cols-3 gap-6 relative">
                 <div className="absolute top-0 left-8 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-slate-900/10">Gestion Logs</div>
                 
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Initial</label>
                    <input
                      type="number" min="0" required
                      value={formData.quantite}
                      onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                      className="w-full h-14 bg-white border border-slate-100 rounded-2xl text-center text-lg font-black text-slate-900 focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Seuil</label>
                    <input
                      type="number" min="0"
                      value={formData.seuil_alerte}
                      onChange={e => setFormData({ ...formData, seuil_alerte: parseInt(e.target.value) || 0 })}
                      className="w-full h-14 bg-white border border-slate-100 rounded-2xl text-center text-lg font-black text-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-sm"
                    />
                 </div>
                 <div className="space-y-3 text-center">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Expiration</label>
                    <input
                      type="date"
                      value={formData.date_expiration || ''} onChange={e => setFormData({ ...formData, date_expiration: e.target.value })}
                      className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-2 text-[10px] font-black text-slate-900 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
                    />
                 </div>              {/* Protocoles de Rappel */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Clock size={20} weight="bold" className="text-brand-blue" />
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocoles de Rappel</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddRappel} 
                      className="h-10 px-5 rounded-2xl bg-indigo-50 text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                       <Plus size={16} weight="bold" /> <span>Créer horaire</span>
                    </button>
                 </div>
                 
                 <div className="space-y-4 min-h-[40px]">
                    {rappels.map((rappel, idx) => (
                      <div key={idx} className="flex items-center gap-5 bg-slate-50/50 border border-slate-100/50 p-4 rounded-3xl group hover:bg-white hover:border-brand-blue/20 transition-all duration-300 shadow-sm animate-fade-in">
                         <div className="flex-1 relative">
                            <select 
                              value={rappel.moment}
                              onChange={(e) => {
                                const newR = [...rappels];
                                newR[idx].moment = e.target.value;
                                setRappels(newR);
                              }}
                              className="w-full h-12 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none appearance-none focus:border-brand-blue/30 transition-all"
                            >
                              {moments.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                               <CaretDown size={14} weight="bold" />
                            </div>
                         </div>
                         <div className="w-36">
                            <input 
                              type="time" 
                              required
                              value={rappel.heure}
                              onChange={(e) => {
                                const newR = [...rappels];
                                newR[idx].heure = e.target.value;
                                setRappels(newR);
                              }}
                              className="w-full h-12 px-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-brand-blue/30 transition-all text-center"
                            />
                         </div>
                         <button 
                           type="button" 
                           onClick={() => removeRappel(idx)}
                           className="h-11 w-11 flex items-center justify-center rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all group-hover:opacity-100 opacity-60"
                         >
                            <Trash size={18} weight="bold" />
                         </button>
                      </div>
                    ))}
                    {rappels.length === 0 && (
                       <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/20 flex flex-col items-center justify-center text-center">
                          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-200">
                             <Clock size={28} weight="bold" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun rappel configuré</p>
                       </div>
                    )}
                 </div>
              </div>
           </form>
        </div>

        {/* Footer — Precision Anchored */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
           <button
             type="button"
             onClick={onClose}
             className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
           >
              Fermer
           </button>
           <button
             type="submit"
             form="med-form"
             disabled={loading}
             className="min-w-[220px] h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-brand-blue hover:shadow-brand-blue/20 transition-all duration-500 disabled:opacity-50 active:scale-95 flex items-center justify-center"
           >
               {loading ? (
                  <div className="flex items-center gap-3">
                     <CircleNotch className="animate-spin" size={20} weight="bold" />
                     <span>Traitement...</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-3">
                     <Check size={20} weight="bold" />
                     <span>Enregistrer</span>
                  </div>
               )}
           </button>
        </div>
</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
