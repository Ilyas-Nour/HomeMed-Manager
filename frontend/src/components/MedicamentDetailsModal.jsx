import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Pill, Clock, CalendarBlank, Warning, 
  ShieldCheck, ArrowRight, Package, PencilSimple, Trash 
} from '@phosphor-icons/react';

/**
 * MedicamentDetailsModal — Product Precision "Sleek & Clean"
 * Transformé en centre de contrôle avec actions de modification et suppression.
 */
export default function MedicamentDetailsModal({ isOpen, onClose, medicament, onEdit, onDelete }) {
  if (!isOpen || !medicament) return null;

  const isExpired  = medicament.date_expiration && new Date(medicament.date_expiration) < new Date();
  const isStockLow = medicament.quantite <= (medicament.seuil_alerte || 5);

  const iconClass = isExpired
    ? 'bg-red-50 text-red-500 border-red-100'
    : isStockLow
    ? 'bg-amber-50 text-amber-500 border-amber-100'
    : 'bg-brand-blue/5 text-brand-blue border-brand-blue/10';

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Premium Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Architecture */}
      <div className="relative w-full sm:max-w-xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] rounded-t-[40px] sm:rounded-[40px] overflow-hidden animate-fade-up flex flex-col max-h-[96vh] sm:max-h-[90vh] border border-white/20">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-4 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>

        {/* Header — Integrated Actions */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-5 min-w-0">
            <div className={`h-14 w-14 flex items-center justify-center rounded-2xl border border-white shadow-inner shrink-0 transition-transform duration-500 hover:rotate-3 ${iconClass}`}>
              <Pill size={26} weight="bold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none truncate">{medicament.nom}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full shadow-sm ${isExpired ? 'bg-rose-500 glow-rose' : isStockLow ? 'bg-amber-500 glow-amber' : 'bg-emerald-500 glow-emerald'}`} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{medicament.type}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onEdit(medicament); onClose(); }}
              className="h-10 w-10 flex items-center justify-center text-brand-blue bg-indigo-50 hover:bg-brand-blue hover:text-white rounded-xl transition-all duration-300 shadow-sm"
              title="Modifier le traitement"
            >
              <PencilSimple size={18} weight="bold" />
            </button>
            <button
              onClick={() => { onDelete(medicament.id); onClose(); }}
              className="h-10 w-10 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
              title="Supprimer définitivement"
            >
              <Trash size={18} weight="bold" />
            </button>
            <div className="w-px h-10 bg-slate-100 mx-2 hidden sm:block" />
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all group"
            >
              <X size={20} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 no-scrollbar scroll-smooth">

          {/* Posologie Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocole d'Administration</h4>
            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] text-base text-slate-700 leading-relaxed font-bold italic shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue/30" />
              "{medicament.posologie || 'Aucune instruction consignée dans le dossier.'}"
            </div>
          </div>

          {/* Metrics Duo */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 rounded-bl-full translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 group-hover:text-brand-blue transition-colors relative z-10">
                <Package size={14} weight="bold" /> Inventaire
              </p>
              <div className="flex items-baseline gap-2 relative z-10">
                 <span className={`text-4xl font-black tracking-tighter ${isStockLow ? 'text-rose-500' : 'text-slate-900'}`}>
                   {medicament.quantite}
                 </span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">unités</span>
              </div>
              {isStockLow && (
                <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-widest animate-pulse relative z-10">
                  <Warning size={12} weight="bold" /> Critique
                </div>
              )}
            </div>

            <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 rounded-bl-full translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 group-hover:text-brand-blue transition-colors relative z-10">
                <CalendarBlank size={14} weight="bold" /> Validité
              </p>
              <span className={`text-sm font-black tracking-widest uppercase block relative z-10 ${isExpired ? 'text-rose-500' : 'text-slate-900'}`}>
                {medicament.date_expiration
                  ? new Date(medicament.date_expiration).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Illimitée'}
              </span>
              {isExpired && (
                <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-widest animate-pulse relative z-10">
                  <Warning size={12} weight="bold" /> Expiré
                </div>
              )}
            </div>
          </div>

          {/* Rappels Protocol Grid */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-3">
                <Clock size={16} weight="bold" className="text-brand-blue" /> Alertes Configurées
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {medicament.rappels && medicament.rappels.length > 0 ? (
                   medicament.rappels.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100/50 rounded-2xl group hover:bg-white transition-all duration-300">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.moment}</span>
                         <span className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                           <div className="h-1.5 w-1.5 bg-brand-blue rounded-full group-hover:scale-110 transition-transform" />
                           {r.heure}
                         </span>
                      </div>
                   ))
                ) : (
                   <div className="col-span-full py-8 text-center bg-slate-50/20 border-2 border-dashed border-slate-100 rounded-[32px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun rappel actif</p>
                   </div>
                )}
             </div>
          </div>

          {/* Timeline View */}
          {(medicament.date_debut || medicament.date_fin) && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Timeline du Traitement</h4>
              <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-[32px] border border-slate-100/50">
                <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 text-center shadow-sm">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Date Début</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    {medicament.date_debut ? new Date(medicament.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
                <div className="h-10 w-10 bg-indigo-50 text-brand-blue flex items-center justify-center rounded-full shrink-0 animate-pulse-slow">
                   <ArrowRight size={18} weight="bold" />
                </div>
                <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 text-center shadow-sm">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Fin Estimée</p>
                   <p className="text-sm font-black text-slate-900 tracking-tight">
                    {medicament.date_fin ? new Date(medicament.date_fin).toLocaleDateString('fr-FR') : 'Continue'}
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* Observations Summary */}
          {medicament.notes && (
            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Notes Cliniques</h4>
              <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-inner relative">
                <div className="absolute top-6 left-0 w-1 h-12 bg-indigo-100 group-hover:bg-brand-blue transition-colors" />
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic pr-4">{medicament.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Precision Anchored */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-brand-blue hover:shadow-brand-blue/20 transition-all duration-500 active:scale-95 flex items-center justify-center gap-4"
          >
            <ShieldCheck size={20} weight="bold" />
            <span>Clôturer le Dossier</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
