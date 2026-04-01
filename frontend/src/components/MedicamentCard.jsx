import React from 'react';
import { Pill, Activity, AlertTriangle, Calendar, ArchiveX } from 'lucide-react';
import api from '../services/api';

const MedicamentCard = ({ medicament, onEdit, onDelete, profilId }) => {
    
    const handleDelete = async () => {
        if(window.confirm(`Voulez-vous vraiment supprimer le médicament ${medicament.nom} ?`)) {
            try {
                await api.delete(`/profils/${profilId}/medicaments/${medicament.id}`);
                onDelete(medicament.id);
            } catch (error) {
                console.error("Erreur de suppression", error);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 flex flex-col h-full relative overflow-hidden group">
            
            {/* Status indicators */}
            <div className="absolute top-0 left-0 w-2 h-full" style={{
                backgroundColor: medicament.expire ? '#ef4444' : (medicament.stock_faible ? '#f59e0b' : '#10b981')
            }} />

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 flex items-center justify-center`}>
                        <Pill size={24} className="text-gray-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 leading-tight">{medicament.nom}</h3>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{medicament.type}</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={() => onEdit(medicament)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Modifier">
                        <Activity size={18} />
                    </button>
                    <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Supprimer">
                        <ArchiveX size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 flex-grow">
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    {medicament.posologie}
                </div>
                
                <div className="flex flex-wrap gap-y-2 mt-4 text-sm text-gray-600">
                    <div className="w-1/2 flex items-center gap-1.5" title="Quantité restante">
                        <span className="font-medium text-gray-800">{medicament.quantite}</span> en stock
                    </div>
                    
                    <div className="w-1/2 flex items-center gap-1.5" title="Date de fin">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{medicament.date_fin ? new Date(medicament.date_fin).toLocaleDateString('fr-FR') : 'En cours'}</span>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {medicament.expire && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                        <AlertTriangle size={12} /> Expiré
                    </span>
                )}
                {medicament.stock_faible && !medicament.expire && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertTriangle size={12} /> Stock faible
                    </span>
                )}
                {medicament.traitement_actif && !medicament.expire && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                        En cours
                    </span>
                )}
            </div>
        </div>
    );
};

export default MedicamentCard;
