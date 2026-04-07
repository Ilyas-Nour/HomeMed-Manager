import React from 'react';
import { createPortal } from 'react-dom';
import { X, Pill, Clock, Calendar, AlertTriangle, ShieldCheck, ArrowRight, Package } from 'lucide-react';

/**
 * MedicamentDetailsModal — Mobile-First bottom-sheet on mobile, centered modal on desktop
 */
export default function MedicamentDetailsModal({ isOpen, onClose, medicament }) {
  if (!isOpen || !medicament) return null;

  const isExpired  = medicament.date_expiration && new Date(medicament.date_expiration) < new Date();
  const isStockLow = medicament.quantite <= (medicament.seuil_alerte || 5);

  const iconClass = isExpired
    ? 'bg-red-50 text-red-500 border-red-100'
    : isStockLow
    ? 'bg-amber-50 text-amber-500 border-amber-100'
    : 'bg-brand-blue/5 text-brand-blue border-brand-blue/10';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-lg sm:mx-4 bg-white shadow-2xl overflow-hidden animate-fade-up flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center border shadow-sm shrink-0 ${iconClass}`}>
              <Pill size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight truncate">{medicament.nom}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`h-1.5 w-1.5 ${isExpired ? 'bg-red-500' : isStockLow ? 'bg-amber-500' : 'bg-brand-green'}`} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{medicament.type}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 no-scrollbar">

          {/* Posologie */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Posologie</p>
            <div className="p-4 bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium italic shadow-inner">
              "{medicament.posologie || 'Aucune instruction consignée.'}"
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white border border-slate-100 hover:border-brand-blue/20 transition-all group">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mb-3 flex items-center gap-1.5 group-hover:text-brand-blue transition-colors">
                <Package size={12} strokeWidth={2.5} /> Inventaire
              </p>
              <span className={`text-2xl sm:text-3xl font-bold tracking-tighter ${isStockLow ? 'text-amber-500' : 'text-slate-900'}`}>
                {medicament.quantite}
              </span>
              <span className="text-[10px] font-bold text-slate-300 ml-1">unités</span>
              {isStockLow && (
                <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 uppercase tracking-tight">
                  <AlertTriangle size={10} strokeWidth={3} /> Critique
                </div>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-100 hover:border-brand-blue/20 transition-all group">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mb-3 flex items-center gap-1.5 group-hover:text-brand-blue transition-colors">
                <Calendar size={12} strokeWidth={2.5} /> Validité
              </p>
              <span className={`text-sm sm:text-base font-bold tracking-tight uppercase ${isExpired ? 'text-red-500' : 'text-slate-800'}`}>
                {medicament.date_expiration
                  ? new Date(medicament.date_expiration).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
              {isExpired && (
                <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 uppercase tracking-tight">
                  <AlertTriangle size={10} strokeWidth={3} /> Expiré
                </div>
              )}
            </div>
          </div>

          {/* Dates cycle */}
          {(medicament.date_debut || medicament.date_fin) && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Chronologie</p>
              <div className="flex items-center gap-2 bg-slate-50 p-3 border border-slate-100">
                <div className="flex-1 bg-white p-3 border border-slate-100 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight mb-1">Début</p>
                  <p className="text-xs font-bold text-slate-700">
                    {medicament.date_debut ? new Date(medicament.date_debut).toLocaleDateString('fr-FR') : '—'}
                  </p>
                </div>
                <ArrowRight size={14} className="text-brand-blue shrink-0" strokeWidth={2.5} />
                <div className="flex-1 bg-white p-3 border border-slate-100 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight mb-1">Fin</p>
                  <p className="text-xs font-bold text-slate-700">
                    {medicament.date_fin ? new Date(medicament.date_fin).toLocaleDateString('fr-FR') : 'N/D'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {medicament.notes && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Notes Cliniques</p>
              <div className="p-4 bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">{medicament.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="med-btn-primary w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
          >
            <ShieldCheck size={17} strokeWidth={2.5} />
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
