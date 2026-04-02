import React, { useState } from 'react';
import { Pill, Clock, Edit3, Trash2, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

/**
 * MedicamentCard — Classic Layout
 */
export default function MedicamentCard({ medicament, profilId, onEdit, onDelete, onViewDetails }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/profils/${profilId}/medicaments/${medicament.id}`);
      onDelete();
    } catch (err) { 
      console.error('Erreur suppression', err); 
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const isExpired = medicament.date_expiration && new Date(medicament.date_expiration) < new Date();
  const isStockLow = medicament.quantite <= (medicament.seuil_alerte || 5);

  return (
    <div className="hm-card p-5 flex flex-col h-full relative overflow-hidden group">
      {/* Barre latérale d'état */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isExpired ? 'bg-red-500' : isStockLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />

      {/* En-tête : Icône, Titre & Boutons d'Action Clairs */}
      <div className="flex items-start justify-between mb-4 pl-1">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-md border ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-900 border-slate-200'}`}>
            <Pill size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950 leading-none mb-1.5">
              {medicament.nom}
            </h3>
            <span className="hm-badge hm-badge-slate text-[10px]">
              {medicament.type}
            </span>
          </div>
        </div>

        {/* Boutons d'édition et de suppression : IMMANQUABLES et côte à côte */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onEdit} 
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" 
            title="Modifier"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)} 
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info Body */}
      <div className="space-y-4 pl-1 mb-5 flex-1">
        <div className="flex items-start gap-3">
          <Clock size={14} className="text-slate-400 mt-0.5" />
          <div>
             <p className="text-xs font-semibold text-slate-500 leading-none mb-1">Posologie</p>
             <p className="text-sm text-slate-700 line-clamp-2 leading-snug">{medicament.posologie}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Stock</p>
            <p className={`text-xl font-bold ${isStockLow ? 'text-amber-600' : 'text-slate-900'}`}>{medicament.quantite}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100 flex flex-col justify-center">
            <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Expiration</p>
            <p className={`text-sm font-semibold ${isExpired ? 'text-red-500' : 'text-slate-900'}`}>
              {medicament.date_expiration ? new Date(medicament.date_expiration).toLocaleDateString('fr-FR', {month:'short', year:'numeric'}) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between pl-1">
        <button 
          onClick={onViewDetails} 
          className="text-sm font-medium text-slate-900 hover:underline underline-offset-4 flex items-center transition-all group-hover:text-emerald-600"
        >
          Détails complets
        </button>

        <div className="flex items-center gap-2">
          {isStockLow && !isExpired && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Alerte</span>
            </div>
          )}
          {isExpired && (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Expiré</span>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Supprimer ce médicament ?"
        message={`Voulez-vous vraiment retirer ${medicament.nom} de votre inventaire ?`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={isDeleting}
      />
    </div>
  );
}
