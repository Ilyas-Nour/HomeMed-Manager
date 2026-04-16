import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, Plus, Search, 
  Trash2, CheckCircle2, ChevronRight,
  TrendingUp, Package, Clock,
  X, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';
import api from '../services/api';

/**
 * AchatsView — Sleek SaaS Design
 */
export default function AchatsView({ showToast, activeProfileId, medicamentsData, refreshData }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAchat, setSelectedAchat] = useState(null);
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['achats', activeProfileId, activeTab],
    queryFn: async () => {
      const res = await api.get(`/achats?statut=${activeTab === 'pending' ? 'pending' : 'completed'}`);
      return res.data;
    },
    enabled: !!activeProfileId,
    staleTime: 5000,
  });

  const medicaments = Array.isArray(medicamentsData) ? medicamentsData : [];

  // New Item Form State
  const [formMode, setFormMode] = useState('existing'); // 'existing' | 'new'
  const [newItem, setNewItem] = useState({
    medicament_id: '',
    medicament_nom_temp: '',
    label: 'Urgent',
    quantite: 1,
    pharmacie: '',
    prix: '',
    date_achat: new Date().toISOString().split('T')[0],
  });

  // Body scroll lock
  useEffect(() => {
    if (isAddModalOpen || selectedAchat) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isAddModalOpen, selectedAchat]);

  const addMutation = useMutation({
    mutationFn: (payload) => api.post('/achats', payload),
    onSuccess: () => {
      showToast && showToast('Ajouté à la liste');
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['achats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_data'] });
    },
    onError: (err) => {
      showToast && showToast(err.response?.data?.message || 'Erreur lors de l\'ajout', 'error');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (item) => {
      const newStatut = item.statut === 'pending' ? 'completed' : 'pending';
      return api.patch(`/achats/${item.id}`, { statut: newStatut });
    },
    onSuccess: (res, item) => {
      const newStatut = item.statut === 'pending' ? 'completed' : 'pending';
      showToast && showToast(newStatut === 'completed' ? 'Marqué comme acheté — Stock mis à jour' : 'Remis dans la liste');
      if (selectedAchat?.id === item.id) setSelectedAchat(null);
      queryClient.invalidateQueries({ queryKey: ['achats', activeProfileId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_data', activeProfileId] });
    },
    onError: () => {
      showToast && showToast('Erreur lors de la mise à jour', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/achats/${id}`),
    onSuccess: (res, id) => {
      showToast && showToast('Supprimé');
      if (selectedAchat?.id === id) setSelectedAchat(null);
      queryClient.invalidateQueries({ queryKey: ['achats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_data'] });
    },
    onError: () => {
      showToast && showToast('Erreur lors de la suppression', 'error');
    }
  });

  const resetForm = () => {
    setNewItem({ 
      medicament_id: '', 
      medicament_nom_temp: '',
      label: 'Urgent', 
      quantite: 1, 
      pharmacie: '', 
      prix: '', 
      date_achat: new Date().toISOString().split('T')[0] 
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (formMode === 'existing' && !newItem.medicament_id) {
      showToast && showToast('Veuillez sélectionner un médicament', 'error');
      return;
    }
    const payload = { ...newItem };
    if (formMode === 'new') payload.medicament_id = '';
    else payload.medicament_nom_temp = '';
    
    addMutation.mutate(payload);
  };

  const handleToggleStatus = (item) => {
    toggleMutation.mutate(item);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-10 animate-fade-up pb-24">
      
      <div className="flex flex-col sm:flex-row items-end justify-between gap-6 px-1">
        <div className="space-y-2 text-left w-full">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Liste d'achats</h1>
          <p className="text-base font-medium text-slate-500">Anticipez vos besoins et gardez votre pharmacie à jour.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-blue text-white h-12 px-8 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={3} /> <span>Nouveau produit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* List Content */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex p-1.5 bg-slate-50/80 rounded-2xl border border-slate-100 max-w-sm">
              {[
                { id: 'pending', label: 'À acheter' },
                { id: 'completed', label: 'Historique' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {tab.label}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="py-20 text-center">
                    <div className="h-10 w-10 border-4 border-indigo-100 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement de la liste...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-white/50 flex flex-col items-center gap-6 group transition-all hover:border-slate-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50 transition-transform duration-700 group-hover:rotate-12">
                        <ShoppingCart size={32} className="text-slate-200" />
                    </div>
                    <div className="max-w-[200px]">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-900">Liste vide</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">Aucun article dans cette catégorie pour le moment.</p>
                    </div>
                </div>
              ) : items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedAchat(item)}
                  className="group bg-white border border-slate-100 rounded-[32px] p-5 flex items-center justify-between relative transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-blue/10 active:scale-[0.99] cursor-pointer"
                >
                   <div className="flex items-center gap-5 min-w-0 relative z-10">
                      <div className={`h-12 w-12 flex flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-500 border border-white shadow-sm transition-transform group-hover:scale-110 ${item.statut === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-brand-blue'}`}>
                         <ShoppingCart size={20} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                         <h4 className={`text-base font-bold tracking-tight transition-all duration-500 ${item.statut === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-brand-blue'}`}>
                           {item.medicament?.nom || item.medicament_nom_temp || 'Médicament Inconnu'}
                         </h4>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="badge-dna bg-slate-50 text-slate-400 border-none">{item.label}</span>
                            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Quantité: {item.quantite}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                         className={`h-10 w-10 rounded-xl shadow-sm border border-white flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${item.statut === 'completed' ? 'bg-slate-100 text-slate-400' : 'bg-brand-blue text-white shadow-brand-blue/20'}`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                         className="h-10 w-10 bg-white text-slate-400 hover:text-rose-600 border border-slate-100 rounded-xl shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-white border border-slate-100 rounded-[32px] space-y-8 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.15em] px-1">Récapitulatif</h3>
              
              <div className="grid grid-cols-1 gap-4">
                 {[
                   { label: 'Stock Bas', count: medicaments.filter(m => m.quantite <= (m.seuil_alerte || 2)).length, icon: <Package size={18} />, color: 'text-brand-blue bg-indigo-50' },
                   { label: 'À commander', val: items.filter(i => i.statut === 'pending').length || '0', icon: <Package size={18} />, color: 'text-brand-blue bg-indigo-50' },
                   { label: 'Total Estimé', val: `${items.reduce((acc, curr) => acc + ((parseFloat(curr.prix) || 0) * (parseInt(curr.quantite) || 1)), 0).toFixed(2)} DH`, icon: <TrendingUp size={18} />, color: 'text-emerald-600 bg-emerald-50' }
                 ].map((s, idx) => (
                   <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-50 shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                         <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${s.color} transition-transform group-hover:rotate-6`}>{s.icon}</div>
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 tracking-tight">{s.val || s.count || '0'}</span>
                   </div>
                 ))}
              </div>
              
              <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-brand-blue/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <ShoppingCart size={40} className="absolute -right-2 -bottom-2 text-brand-blue/10 group-hover:scale-110 transition-transform duration-700" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue relative z-10">Astuce Budget</h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed relative z-10">Comparez vos prix entre pharmacies pour optimiser votre budget santé annuel.</p>
              </div>
           </div>
        </div>

      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 animate-fade-up overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Nouvel Article</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Réapprovisionnez votre stock</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"><X size={22} /></button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="flex p-1 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
                  <button
                     type="button"
                     onClick={() => setFormMode('existing')}
                     className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formMode === 'existing' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' : 'text-slate-400'}`}
                  >
                    Existant
                  </button>
                  <button
                     type="button"
                     onClick={() => setFormMode('new')}
                     className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formMode === 'new' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' : 'text-slate-400'}`}
                  >
                    Nouveau
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {formMode === 'existing' ? 'Choisir un Médicament' : 'Nom du Médicament'}
                  </label>
                  {formMode === 'existing' ? (
                    <div className="relative">
                        <select
                        className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-6 text-sm font-bold text-slate-900 appearance-none focus:bg-white focus:border-brand-blue outline-none transition-all"
                        value={newItem.medicament_id}
                        onChange={e => setNewItem({...newItem, medicament_id: e.target.value})}
                        required
                        >
                        <option value="">Sélectionner...</option>
                        {medicaments.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      autoFocus
                      type="text"
                      className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-6 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all"
                      value={newItem.medicament_nom_temp}
                      onChange={e => setNewItem({...newItem, medicament_nom_temp: e.target.value})}
                      placeholder="Saisir le nom..."
                      required
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantité</label>
                    <input type="number" min="1"
                      className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-6 text-sm font-bold focus:bg-white focus:border-brand-blue outline-none transition-all"
                      value={newItem.quantite}
                      onChange={e => setNewItem({...newItem, quantite: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prix (DH)</label>
                    <input type="number" min="0" step="0.01"
                      className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-6 text-sm font-bold focus:bg-white focus:border-brand-blue outline-none transition-all placeholder:text-slate-300"
                      value={newItem.prix}
                      onChange={e => setNewItem({...newItem, prix: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pharmacie</label>
                  <input type="text"
                    className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-6 text-sm font-bold focus:bg-white focus:border-brand-blue outline-none transition-all placeholder:text-slate-300"
                    value={newItem.pharmacie}
                    onChange={e => setNewItem({...newItem, pharmacie: e.target.value})}
                    placeholder="Ex: Pharmacie du Palais..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={addMutation.isPending}
                  className="w-full h-14 bg-brand-blue text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                   {addMutation.isPending ? (
                     <>
                       <Loader2 className="animate-spin" size={20} />
                       <span>Opération en cours...</span>
                     </>
                   ) : (
                     'Ajouter à la liste'
                   )}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Item Details Modal */}
      {selectedAchat && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedAchat(null)}></div>
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 animate-fade-up overflow-hidden">
            <div className={`h-2.5 ${selectedAchat.statut === 'completed' ? 'bg-emerald-500' : 'bg-brand-blue'} shadow-sm`}></div>
            <div className="p-8 sm:p-10">
              <div className="flex items-start justify-between mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] border border-white shadow-sm ${selectedAchat.statut === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-brand-blue'}`}>
                      {selectedAchat.statut === 'completed' ? 'Acheté' : 'Planifié'}
                    </span>
                    <span className="text-[9px] font-black px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg uppercase tracking-[0.15em]">
                      {selectedAchat.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter text-left">
                    {selectedAchat.medicament?.nom || selectedAchat.medicament_nom_temp}
                  </h3>
                </div>
                <button onClick={() => setSelectedAchat(null)} className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1.5 text-left border-l-2 border-indigo-50 pl-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantité</p>
                    <p className="text-base font-black text-slate-900">{selectedAchat.quantite} Unités</p>
                  </div>
                  <div className="space-y-1.5 text-left border-l-2 border-indigo-50 pl-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Date</p>
                    <p className="text-base font-black text-slate-900">
                      {selectedAchat.date_achat ? new Date(selectedAchat.date_achat).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }) : 'À définir'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-6 space-y-5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Pharmacie</span>
                    <span className="text-sm font-black text-slate-700">{selectedAchat.pharmacie || 'Non spécifiée'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Estimation Prix</span>
                    <span className="text-lg font-black text-brand-blue">{selectedAchat.prix ? `${selectedAchat.prix} DH` : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(selectedAchat); }}
                  disabled={toggleMutation.isPending}
                  className={`h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${selectedAchat.statut === 'completed' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {toggleMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    selectedAchat.statut === 'completed' ? 'Remettre en liste' : 'Confirmer l\'achat'
                  )}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(selectedAchat.id); }}
                  disabled={deleteMutation.isPending}
                  className="h-10 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : null}
                  Supprimer de la liste
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
