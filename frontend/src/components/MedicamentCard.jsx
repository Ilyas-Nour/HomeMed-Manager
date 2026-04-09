import React from 'react';
import { Pill, Clock, Package, ChevronRight, Edit2, Trash2, ArrowRight } from 'lucide-react';

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
    <div className="group bg-white border border-slate-100 rounded-[32px] p-4 sm:p-5 flex flex-col h-full relative shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-blue/10 active:scale-[0.99] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${statusColors.bg} ${statusColors.text} shadow-sm border border-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <Pill size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isStockLow && (
            <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-rose-100 animate-pulse">
              Stock Bas
            </span>
          )}
          <div className={`badge-dna border-white ${statusColors.bg} ${statusColors.text}`}>
            {status}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 relative z-10">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors truncate tracking-tight">
          {medicament.nom}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] truncate">
          {medicament.dosage} • {medicament.forme}
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-50 grid grid-cols-2 gap-4 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stock</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isStockLow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <p className={`text-sm font-bold ${isStockLow ? 'text-rose-600' : 'text-slate-800'}`}>{stock} <span className="text-[10px] text-slate-400 font-bold uppercase">{medicament.unite || 'unités'}</span></p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fréquence</p>
          <div className="flex items-center gap-2">
             <Clock size={14} className="text-slate-300" />
             <p className="text-sm font-bold text-slate-800">{medicament.frequence || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3 relative z-10">
        <button 
          onClick={() => onDetails(medicament)}
          className="flex-1 h-11 px-6 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          Détails
        </button>
        <button 
          onClick={() => onEdit(medicament)}
          className="h-11 w-11 flex items-center justify-center bg-indigo-50 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-brand-blue/20 active:scale-90"
        >
          <Edit2 size={18} />
        </button>
      </div>
      
      {/* Hover Background Accent */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}
