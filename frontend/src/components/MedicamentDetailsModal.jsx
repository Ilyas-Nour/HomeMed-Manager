import React from 'react';
import { X, Pill, Clock, Calendar, AlertTriangle, Info, MapPin } from 'lucide-react';

/**
 * MedicamentDetailsModal — Vue Premium en Lecture Seule
 */
export default function MedicamentDetailsModal({ isOpen, onClose, medicament }) {
  if (!isOpen || !medicament) return null;

  const isExpired = medicament.date_expiration && new Date(medicament.date_expiration) < new Date();
  const isStockLow = medicament.quantite <= (medicament.seuil_alerte || 5);

  return (
    <div className="hm-modal-backdrop !z-[200]">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="hm-modal-content max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-up">
        {/* En-tête du Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${isExpired ? 'bg-red-50 text-red-500 border-red-100' : isStockLow ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <Pill size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                {medicament.nom}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{medicament.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Corps - Défilement Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-50/30">
          
          {/* Section: Posologie & Prises */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock size={12} className="text-emerald-500" /> Posologie & Indications
            </h3>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                "{medicament.posologie || 'Aucune consigne spécifique assignée.'}"
              </p>
            </div>
          </div>

          {/* Section: Stats & Inventaire (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${isStockLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Info size={12}/> Quantité Restante</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-black tracking-tighter ${isStockLow ? 'text-amber-600' : 'text-slate-800'}`}>{medicament.quantite}</p>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">unités</span>
              </div>
              {isStockLow && <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter mt-2 animate-pulse flex items-center gap-1"><AlertTriangle size={12}/> Stock Critique</p>}
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12}/> Expiration</p>
              <p className={`text-xl font-black tracking-tight ${isExpired ? 'text-red-500' : 'text-slate-800'}`}>
                {medicament.date_expiration ? new Date(medicament.date_expiration).toLocaleDateString('fr-FR') : 'Non définie'}
              </p>
              {isExpired && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Expiré !</p>}
            </div>
          </div>

          {/* Section: Timeline Traitement */}
          {(medicament.date_debut || medicament.date_fin) && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Calendar size={12} className="text-emerald-500" /> Période de Traitement
              </h3>
              <div className="bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm flex items-center text-sm font-semibold text-slate-600">
                <div className="flex-1 text-center py-2 px-3 rounded-2xl bg-slate-50/50">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Début</span>
                    {medicament.date_debut ? new Date(medicament.date_debut).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div className="w-8 h-[1px] bg-slate-200" />
                <div className="flex-1 text-center py-2 px-3 rounded-2xl bg-slate-50/50">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fin Prévue</span>
                    {medicament.date_fin ? new Date(medicament.date_fin).toLocaleDateString('fr-FR') : 'Continu'}
                </div>
              </div>
            </div>
          )}

          {/* Section: Notes */}
          {medicament.notes && (
             <div>
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Info size={12} className="text-emerald-500" /> Notes Supplémentaires
               </h3>
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                   {medicament.notes}
                 </p>
               </div>
             </div>
          )}
        </div>

        {/* Pied de Modal */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button 
            onClick={onClose} 
            className="w-full hm-btn h-12 text-sm font-extrabold shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            Fermer les détails
          </button>
        </div>
      </div>
    </div>
  );
}
