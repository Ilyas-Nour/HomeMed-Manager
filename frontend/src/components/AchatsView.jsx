import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Calendar, Store, CreditCard, 
  Package, ChevronRight, ArrowLeft, Trash2, Loader2,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../services/api';

/**
 * Composant de Gestion des Achats (Requirement 3.6)
 * Design : Studio Premium — Minimaliste, Glassmorphism, Typographie riche.
 */
export default function AchatsView({ medicaments, onStockUpdate }) {
  const [achats, setAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    medicament_id: '',
    pharmacie: '',
    prix: '',
    quantite: '',
    date_achat: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAchats();
  }, []);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      // On récupère tous les achats (le backend filtre par profil via le middleware si besoin,
      // ou on peut filtrer côté front si nécessaire).
      // Pour la V1, on récupère les achats liés aux médicaments chargés par le Dashboard.
      const response = await api.get('/achats');
      setAchats(response.data);
    } catch (e) {
      console.error('Erreur chargement achats', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchat = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post('/achats', formData);
      setAchats([response.data.achat, ...achats]);
      setIsAdding(false);
      setFormData({
        medicament_id: '',
        pharmacie: '',
        prix: '',
        quantite: '',
        date_achat: new Date().toISOString().split('T')[0]
      });
      setMessage({ type: 'success', text: 'Achat enregistré avec succès !' });
      
      // Notifier le Dashboard pour rafraîchir l'inventaire
      if (onStockUpdate) onStockUpdate();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'enregistrement.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet enregistrement ?')) return;
    try {
      await api.delete(`/achats/${id}`);
      setAchats(achats.filter(a => a.id !== id));
    } catch (e) {
      console.error('Erreur suppression', e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header — Style Studio */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-100/50">
            <ShoppingBag size={12} /> Logistique & Stock
          </div>
          <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">Gestion des Achats</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Traçabilité de vos approvisionnements médicaux</p>
        </div>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10"
          >
            <Plus size={18} /> Nouvel Achat
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-slide-in ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Formulaire d'ajout — Glassmorphic Design */}
      {isAdding && (
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/50 p-8 shadow-2xl animate-fade-up relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
          
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Plus size={22} className="text-emerald-500" />
                Enregistrer un achat
             </h2>
             <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-slate-400" />
             </button>
          </div>

          <form onSubmit={handleAddAchat} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Médicament concerné</label>
                <select 
                  required
                  value={formData.medicament_id}
                  onChange={e => setFormData({...formData, medicament_id: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                >
                  <option value="">Sélectionner un médicament...</option>
                  {medicaments.map(m => (
                    <option key={m.id} value={m.id}>{m.nom} ({m.type})</option>
                  ))}
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pharmacie</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="Nom de la pharmacie"
                    value={formData.pharmacie}
                    onChange={e => setFormData({...formData, pharmacie: e.target.value})}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prix (MAD)</label>
                   <div className="relative">
                     <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       required
                       type="number"
                       step="0.01"
                       placeholder="0.00"
                       value={formData.prix}
                       onChange={e => setFormData({...formData, prix: e.target.value})}
                       className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantité (Unités)</label>
                   <div className="relative">
                     <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input 
                       required
                       type="number"
                       placeholder="Ex: 30"
                       value={formData.quantite}
                       onChange={e => setFormData({...formData, quantite: e.target.value})}
                       className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                     />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date d'achat</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="date"
                    value={formData.date_achat}
                    onChange={e => setFormData({...formData, date_achat: e.target.value})}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                  />
                </div>
             </div>

             <div className="md:col-span-2 pt-4">
                <button 
                  disabled={submitting}
                  type="submit"
                  className="w-full h-12 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Valider l'enregistrement <ChevronRight size={16} /></>}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Liste des Achats / Historique */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           Historique des approvisionnements 
           <span className="w-1 h-1 rounded-full bg-slate-300" />
           {achats.length} enregistrements
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
             <Loader2 className="animate-spin text-slate-900 mb-4" size={40} strokeWidth={1} />
             <p className="text-[10px] font-black uppercase tracking-widest">Synchronisation Studio...</p>
          </div>
        ) : achats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {achats.map((achat) => (
              <div 
                key={achat.id}
                className="group relative bg-white border border-slate-100 rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <ShoppingBag size={20} />
                   </div>
                   <button 
                    onClick={() => handleDelete(achat.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>

                <div className="space-y-4">
                   <div>
                      <h4 className="text-sm font-black text-slate-900 mb-0.5 line-clamp-1">{achat.medicament?.nom || 'Médicament'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Store size={10} /> {achat.pharmacie}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Quantité</p>
                         <p className="text-sm font-bold text-slate-700">+{achat.quantite} u.</p>
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Coût</p>
                         <p className="text-sm font-bold text-slate-900">{parseFloat(achat.prix).toFixed(2)} MAD</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 pt-1">
                      <div className="text-[9px] font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-lg flex items-center gap-1.5">
                         <Calendar size={10} /> {new Date(achat.date_achat).toLocaleDateString()}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <ShoppingBag size={32} strokeWidth={1} />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
               Aucun achat enregistré pour le moment
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
