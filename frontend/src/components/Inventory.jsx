import React, { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import MedicamentCard from './MedicamentCard';

/**
 * Inventory — Mobile-First · Product Precision
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
    { key: 'stock',      label: 'Critique', count: medicaments.filter(m => m.quantite <= (m.seuil_alerte || 5)).length },
    { key: 'incomplete', label: 'Incomplets', count: medicaments.filter(m => m.is_incomplet).length },
    { key: 'expired',    label: 'Expiré', count: medicaments.filter(m => m.date_expiration && new Date(m.date_expiration) < new Date()).length },
  ];

  return (
    <div className="space-y-5">

      {/* Header (full view only) */}
      {!isCompact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Ma Pharmacie</h1>
            <p className="text-sm text-slate-500 font-medium">Suivez votre stock et vos expirations.</p>
          </div>
          <button
            onClick={() => setIsFormOpen && setIsFormOpen(true)}
            className="med-btn-primary h-10 px-5 self-start sm:self-auto flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="font-semibold text-sm">Ajouter</span>
          </button>
        </div>
      )}

      {/* Filter pills (full view only) */}
      {!isCompact && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => activeSetFilter(f.key)}
              className={`shrink-0 flex items-center gap-1.5 h-9 px-4 text-xs font-semibold transition-all ${
                activeFilter === f.key
                  ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs font-semibold ${
                  activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-3 sm:gap-4 ${
        isCompact
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
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
        <div className="py-16 text-center border-2 border-dashed border-slate-100 bg-slate-50/30">
          <div className="flex flex-col items-center gap-3 opacity-40">
            <div className="h-12 w-12 bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <Package size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {searchTerm ? "Aucun résultat pour votre recherche." : "Aucun médicament dans cette liste."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
