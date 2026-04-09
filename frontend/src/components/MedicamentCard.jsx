import React from 'react';
import { 
  Pill, Edit2, Trash2, ArrowRight,
  Package, Clock
} from 'lucide-react';

/**
 * MedicamentCard — Mobile-First · Product Precision
 */
export default function MedicamentCard({ medicament, isCompact, onEdit, onDelete, onDetails }) {
  if (!medicament) return null;

  const isExpired     = medicament.date_expiration && new Date(medicament.date_expiration) < new Date();
  const isOutOfStock  = medicament.quantite === 0;
  const isStockLow    = !isOutOfStock && medicament.quantite <= (medicament.seuil_alerte || 5);

  // Near-expiry: within 30 days but not yet expired
  const daysToExpiry  = medicament.date_expiration
    ? Math.ceil((new Date(medicament.date_expiration) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isNearExpiry  = !isExpired && daysToExpiry !== null && daysToExpiry <= 30;

  const statusColor = isExpired || isOutOfStock
    ? 'bg-red-50 text-red-600 border-red-100'
    : isStockLow || isNearExpiry
    ? 'bg-amber-50 text-amber-600 border-amber-100'
    : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue/30';

  const dotColor = isExpired || isOutOfStock ? 'bg-red-500' : (isStockLow || isNearExpiry) ? 'bg-amber-500' : medicament.is_incomplet ? 'bg-indigo-500' : 'bg-brand-green';
  const statusLabel = isExpired ? 'Expiré' : isOutOfStock ? 'Stock Épuisé' : isStockLow ? 'Stock Faible' : isNearExpiry ? `Expire dans ${daysToExpiry}j` : medicament.is_incomplet ? 'À compléter' : 'Optimal';

  return (
    <div className={`
      group relative bg-white border border-slate-200
      transition-colors duration-200 hover:border-brand-blue/30 overflow-hidden
      ${isCompact ? 'p-4' : 'p-5 flex flex-col h-full'}
    `}>
      {/* Alert strip */}
      {(isExpired || isStockLow || medicament.is_incomplet) && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${isExpired ? 'bg-red-400' : medicament.is_incomplet ? 'bg-indigo-400' : 'bg-amber-400'}`} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-10 w-10 flex-shrink-0 flex items-center justify-center border shadow-sm transition-all ${medicament.is_incomplet ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : statusColor}`}>
            <Pill size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-blue transition-colors">
              {medicament.nom}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`h-1.5 w-1.5 ${dotColor}`} />
              <span className="text-xs font-medium text-slate-500">{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0">
          <button
            onClick={() => onEdit && onEdit(medicament)}
            className="p-2 text-slate-300 hover:text-brand-blue hover:bg-blue-50 transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete && onDelete(medicament.id)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="p-3 bg-slate-50 border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block mb-1">Stock</span>
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-slate-400 shrink-0" />
            <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600' : isStockLow ? 'text-amber-600' : 'text-slate-900'}`}>
              {isOutOfStock ? 'Épuisé' : `${medicament.quantite} unités`}
            </span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block mb-1">Expiration</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span className={`text-sm font-semibold ${isExpired ? 'text-red-600' : isNearExpiry ? 'text-amber-600' : 'text-slate-900'}`}>
              {medicament.date_expiration
                ? new Date(medicament.date_expiration).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium">
          {medicament.type}
        </span>
        <button
          onClick={() => onDetails && onDetails(medicament)}
          className="flex items-center gap-1 text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors group/btn"
        >
          Détails <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
