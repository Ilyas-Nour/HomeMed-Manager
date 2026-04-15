import React from 'react';
import { Pill, Clock, Package, CaretRight, PencilSimple, Trash, ArrowRight } from '@phosphor-icons/react';

/**
 * MedicamentCard — Sleek SaaS Design
 */
export default function MedicamentCard({ medicament, onEdit, onDelete, onDetails }) {
  const stock = medicament.quantite || 0;
  const status = medicament.statut || 'Optimal';

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'bas':
      case 'alerte':
        return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
      case 'épuisé':
      case 'out':
        return { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
      case 'attention':
        return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
      default:
        return { bg: 'bg-indigo-50/50', text: 'text-brand-blue', dot: 'bg-brand-blue' };
    }
  };

  const statusColors = getStatusStyles(status);
  const isStockLow = stock <= (medicament.seuil_alerte || 5);
  const isOutOfStock = stock === 0;

  return (
    <div className="group bg-white border border-slate-100/80 rounded-[40px] p-5 sm:p-6 flex flex-col h-full relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:border-brand-blue/20 overflow-hidden">
      {/* Premium Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-blue/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${statusColors.bg} ${statusColors.text} shadow-sm border border-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-brand-blue/10`}>
          <Pill size={28} weight="bold" />
        </div>
        <div className="flex flex-col items-end gap-2">
          {isStockLow && (
            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 animate-pulse">
              Critique
            </span>
          )}
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white shadow-sm ${statusColors.bg} ${statusColors.text}`}>
            {status}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 relative z-10">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors truncate tracking-tight leading-tight">
          {medicament.nom}
        </h3>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded-md">
             {medicament.forme}
           </span>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
             {medicament.dosage}
           </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-slate-50/60 p-3 rounded-2xl border border-white shadow-sm transition-colors group-hover:bg-white group-hover:border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock Actuel</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isStockLow ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
            <p className={`text-sm font-black ${isStockLow ? 'text-rose-600' : 'text-slate-900'}`}>{stock} <span className="text-[10px] text-slate-400 font-bold uppercase">{medicament.unite || 'unité'}</span></p>
          </div>
        </div>
        <div className="bg-slate-50/60 p-3 rounded-2xl border border-white shadow-sm transition-colors group-hover:bg-white group-hover:border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cycle</p>
          <div className="flex items-center gap-2">
             <Clock size={16} weight="bold" className="text-brand-blue/40" />
             <p className="text-sm font-black text-slate-900">{medicament.frequence || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 relative z-20">
        <button 
          onClick={() => onDetails(medicament)}
          className="flex-1 h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-blue hover:shadow-xl hover:shadow-brand-blue/20 transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer group/btn"
        >
          <span>Détails</span>
          <ArrowRight size={16} weight="bold" className="transition-transform group-hover/btn:translate-x-1" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(medicament);
          }}
          className="h-12 w-12 flex items-center justify-center bg-white text-slate-400 hover:text-brand-blue border border-slate-100 rounded-2xl transition-all shadow-sm hover:shadow-md hover:border-brand-blue/20 active:scale-90 cursor-pointer relative z-30 group/edit"
        >
          <PencilSimple size={20} weight="bold" className="transition-transform group-hover/edit:rotate-12" />
        </button>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className={`absolute inset-x-0 bottom-0 h-1 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100 ${isStockLow ? 'bg-rose-500' : 'bg-brand-blue'}`} />
    </div>
    </div>
  );
}
