import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingCart, Plus, Search, 
  Trash2, CheckCircle2, ChevronRight,
  TrendingDown, TrendingUp, Package, Clock,
  X, AlertCircle
} from 'lucide-react';
import api from '../services/api';

/**
 * AchatsView — Product Precision "Sleek & Clean"
 * Fully functional shopping list integrated with backend.
 */
export default function AchatsView({ showToast, activeProfileId, medicamentsData, refreshData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAchat, setSelectedAchat] = useState(null);
  const [medicaments, setMedicaments] = useState(medicamentsData || []);
  
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

  useEffect(() => {
    fetchItems();
  }, [activeTab, activeProfileId]);

  useEffect(() => {
    if (medicamentsData) {
      setMedicaments(medicamentsData);
    }
  }, [medicamentsData]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/achats?statut=${activeTab === 'pending' ? 'pending' : 'completed'}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
      showToast && showToast('Erreur lors du chargement de la liste', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (formMode === 'existing' && !newItem.medicament_id) {
      showToast && showToast('Veuillez sélectionner un médicament', 'error');
      return;
    }
    if (formMode === 'new' && !newItem.medicament_nom_temp) {
      showToast && showToast('Veuillez saisir le nom du médicament', 'error');
      return;
    }

    try {
      const payload = { ...newItem };
      if (formMode === 'new') payload.medicament_id = '';
      else payload.medicament_nom_temp = '';

      await api.post('/achats', payload);
      showToast && showToast('Ajouté à la liste');
      setIsAddModalOpen(false);
      setNewItem({ 
        medicament_id: '', 
        medicament_nom_temp: '',
        label: 'Urgent', 
        quantite: 1, 
        pharmacie: '', 
        prix: '', 
        date_achat: new Date().toISOString().split('T')[0] 
      });
      fetchItems();
      // On rafraîchit aussi le dashboard (stats/inventaire)
      refreshData && refreshData();
    } catch (err) {
      console.error('Erreur API Achats:', err.response?.data || err.message);
      showToast && showToast(err.response?.data?.message || 'Erreur lors de l\'ajout', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatut = item.statut === 'pending' ? 'completed' : 'pending';
      await api.patch(`/achats/${item.id}`, { statut: newStatut });
      showToast && showToast(newStatut === 'completed' ? 'Marqué comme acheté — Stock mis à jour' : 'Remis dans la liste');
      if (selectedAchat?.id === item.id) setSelectedAchat(null);
      fetchItems();
      // Crucial: Rafraîchir l'inventaire global pour voir le nouveau stock/médicament
      refreshData && refreshData();
    } catch (err) {
      console.error('Erreur Toggle:', err.response?.data || err.message);
      showToast && showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/achats/${id}`);
      showToast && showToast('Supprimé');
      if (selectedAchat?.id === id) setSelectedAchat(null);
      fetchItems();
      refreshData && refreshData();
    } catch (err) {
      console.error('Erreur Delete:', err.response?.data || err.message);
      showToast && showToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <ShoppingCart size={32} className="text-brand-blue" /> Liste d'Achats
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2">Gestion proactive des commandes de réapprovisionnement.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-blue text-white h-11 px-8 text-sm font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all hover:-translate-y-0.5"
        >
          Nouveau Produit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* List Content */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-4 bg-slate-50/50 p-1.5 border border-slate-100 mb-2">
              {[
                { id: 'pending', label: 'à acheter' },
                { id: 'completed', label: 'achetés' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {tab.label}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs animate-pulse font-bold uppercase tracking-widest">Chargement...</div>
              ) : items.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center gap-4 opacity-40">
                    <AlertCircle size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Liste vide.</p>
                </div>
              ) : items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedAchat(item)}
                  className="p-4 bg-white border border-slate-100 flex items-center justify-between group hover:border-brand-blue hover:shadow-xl transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-10 w-10 flex flex-shrink-0 items-center justify-center transition-colors ${item.statut === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                         <ShoppingCart size={18} />
                      </div>
                      <div className="min-w-0 text-left">
                         <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight text-left">
                           {item.medicament?.nom || item.medicament_nom_temp || 'Médicament Inconnu'}
                         </h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.label} • Qté: {item.quantite}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                         title={item.statut === 'pending' ? 'Marquer comme acheté' : 'Remettre en liste'}
                         className={`h-8 w-8 ${item.statut === 'completed' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                         title="Supprimer"
                         className="h-8 w-8 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-95 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Info Content */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-6 bg-white border border-slate-100 space-y-6 shadow-tiny">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Résumé du Stock</h3>
              
              <div className="space-y-3">
                 {[
                   { label: 'Articles à prévoir', val: items.filter(i => i.statut === 'pending').length || '0', icon: <Package size={14} /> },
                   { label: 'Dépenses enregistrées', val: `${items.filter(i => i.statut === 'completed').reduce((acc, curr) => acc + (parseFloat(curr.prix) || 0), 0).toFixed(2)}€`, icon: <TrendingUp size={14} /> }
                 ].map((s, idx) => (
                   <div key={idx} className="bg-slate-50/50 p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="text-brand-blue">{s.icon}</div>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900 tracking-tight">{s.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>

      {/* Add Item Modal (Portalled) */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-slate-200 p-8 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Nouvel Article</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-none mb-2">
                <button
                   type="button"
                   onClick={() => setFormMode('existing')}
                   className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${formMode === 'existing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Existant
                </button>
                <button
                   type="button"
                   onClick={() => setFormMode('new')}
                   className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${formMode === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Nouveau
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formMode === 'existing' ? 'Choisir Medicament' : 'Nom du Medicament'}
                </label>
                {formMode === 'existing' ? (
                  <select
                    className="w-full h-12 bg-white border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.medicament_id}
                    onChange={e => setNewItem({...newItem, medicament_id: e.target.value})}
                    required
                  >
                    <option value="">Selectionner...</option>
                    {medicaments.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full h-12 bg-white border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.medicament_nom_temp}
                    onChange={e => setNewItem({...newItem, medicament_nom_temp: e.target.value})}
                    placeholder="Saisir le nom..."
                    required
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantite</label>
                  <input type="number" min="1"
                    className="w-full h-12 bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.quantite}
                    onChange={e => setNewItem({...newItem, quantite: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix (DH)</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full h-12 bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.prix}
                    onChange={e => setNewItem({...newItem, prix: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pharmacie</label>
                <input type="text"
                  className="w-full h-12 bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                  value={newItem.pharmacie}
                  onChange={e => setNewItem({...newItem, pharmacie: e.target.value})}
                  placeholder="Ex: Pharmacie du Centre..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Achat</label>
                  <input type="date"
                    className="w-full h-12 bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.date_achat}
                    onChange={e => setNewItem({...newItem, date_achat: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label</label>
                  <select
                    className="w-full h-12 bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none"
                    value={newItem.label}
                    onChange={e => setNewItem({...newItem, label: e.target.value})}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Stock">Stock</option>
                    <option value="Hiver">Hiver</option>
                    <option value="Voyage">Voyage</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full h-12 bg-brand-blue text-white font-bold text-sm tracking-widest uppercase hover:shadow-lg transition-all active:scale-[0.98]">
                Ajouter a la liste
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Item Details Modal (Portalled) */}
      {selectedAchat && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setSelectedAchat(null)}></div>
          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl animate-fade-up overflow-hidden">
            <div className={`h-2 ${selectedAchat.statut === 'completed' ? 'bg-emerald-500' : 'bg-brand-blue'}`}></div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight text-left">
                    {selectedAchat.medicament?.nom || selectedAchat.medicament_nom_temp}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest ${selectedAchat.statut === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {selectedAchat.statut === 'completed' ? 'Acheté' : 'À acheter'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 uppercase tracking-widest">
                      {selectedAchat.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedAchat(null)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Quantité</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAchat.quantite} Unités</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-left">Date</p>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedAchat.date_achat ? new Date(selectedAchat.date_achat).toLocaleDateString('fr-FR') : 'Non définie'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pharmacie</span>
                    <span className="text-sm font-medium text-slate-900">{selectedAchat.pharmacie || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prix Estimation</span>
                    <span className="text-sm font-bold text-brand-blue">{selectedAchat.prix ? `${selectedAchat.prix}€` : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(selectedAchat); }}
                  className={`h-11 font-bold text-[11px] uppercase tracking-widest transition-all ${selectedAchat.statut === 'completed' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {selectedAchat.statut === 'completed' ? 'Remettre en liste' : 'Marquer acheté'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(selectedAchat.id); }}
                  className="h-11 bg-red-50 text-red-600 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Supprimer
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
