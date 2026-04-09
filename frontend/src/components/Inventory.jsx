import React, { useState } from 'react';
import { Package, Plus, Search, ChevronRight } from 'lucide-react';
import MedicamentCard from './MedicamentCard';

/**
 * Inventory — Sleek SaaS Design
 * Precision filtering and high-density grid.
 */
export default function Inventory({ isCompact, showToast, searchTerm = '', setIsFormOpen, onEdit, onDelete, onDetails, filter, setFilter, medicamentsData, limit }) {
  const [internalFilter, setInternalFilter] = useState('all');

  const activeFilter    = filter    || internalFilter;
  const activeSetFilter = setFilter || setInternalFilter;

  const medicaments = Array.isArray(medicamentsData) ? medicamentsData : [];

  const filteredMedicaments = medicaments.filter(med => {
    const matchesSearch =
      med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.notes && med.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeFilter === 'expired') {
      return matchesSearch && med.date_expiration && new Date(med.date_expiration) < new Date();
    }
    if (activeFilter === 'stock') {
      return matchesSearch && med.quantite <= (med.seuil_alerte || 5);
    }
    if (activeFilter === 'incomplete') {
      return matchesSearch && med.is_incomplet;
    }
    return matchesSearch;
  });

  const displayedMedicaments = limit ? filteredMedicaments.slice(0, limit) : filteredMedicaments;

  const FILTERS = [
    { key: 'all',        label: 'Tous', count: medicaments.length },
    { key: 'stock',      label: 'Stock Bas', count: medicaments.filter(m => m.quantite <= (m.seuil_alerte || 5)).length },
    { key: 'expired',    label: 'Expirés', count: medicaments.filter(m => m.date_expiration && new Date(m.date_expiration) < new Date()).length },
  ];

  return (
    <div className="space-y-6">

      {/* Header (full view only) */}
      {!isCompact && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-10 px-1">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Ma Pharmacie</h1>
            <p className="text-base font-medium text-slate-500">Suivi de stock et inventaire santé</p>
          </div>
          <button
            onClick={() => setIsFormOpen && setIsFormOpen(true)}
            className="bg-brand-blue text-white h-12 px-8 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-[0.98]"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Nouveau Médicament</span>
          </button>
        </div>
      )}

      {/* Filter pills (full view only) */}
      {!isCompact && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => activeSetFilter(f.key)}
              className={`shrink-0 flex items-center gap-2.5 h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeFilter === f.key
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                  : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm'
              }`}
            >
              <span>{f.label}</span>
              {f.count > 0 && (
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                  activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-4 sm:gap-8 ${
        isCompact
          ? 'grid-cols-1'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {displayedMedicaments.map(med => (
          <MedicamentCard
            key={med.id}
            medicament={med}
            isCompact={isCompact}
            showToast={showToast}
            onEdit={() => onEdit && onEdit(med)}
            onDelete={() => onDelete && onDelete(med.id)}
            onDetails={() => onDetails && onDetails(med)}
          />
        ))}
      </div>

      {/* Empty state */}
      {displayedMedicaments.length === 0 && (
        <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-white/50 backdrop-blur-sm group transition-all hover:border-slate-200">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-50 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
              <Package size={32} className="text-slate-200" />
            </div>
            <div className="max-w-[280px]">
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventaire vide</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                  {searchTerm ? "Aucun médicament ne correspond à votre recherche." : "Ajoutez votre premier médicament pour commencer le suivi."}
                </p>
            </div>
            {!isCompact && (
                <button 
                  onClick={() => setIsFormOpen && setIsFormOpen(true)}
                  className="mt-4 flex items-center gap-2 text-xs font-black text-brand-blue uppercase tracking-widest hover:underline"
                >
                    Ajouter <ChevronRight size={14} />
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
