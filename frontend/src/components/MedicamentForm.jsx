import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

const MedicamentForm = ({ isOpen, onClose, profilId, medicamentToEdit, onSuccess }) => {
    const [formData, setFormData] = useState({
        nom: '',
        type: 'comprimé',
        posologie: '',
        date_debut: '',
        date_fin: '',
        date_expiration: '',
        quantite: 0,
        seuil_alerte: 5,
        notes: ''
    });
    
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (medicamentToEdit) {
            setFormData({
                nom: medicamentToEdit.nom || '',
                type: medicamentToEdit.type || 'comprimé',
                posologie: medicamentToEdit.posologie || '',
                date_debut: medicamentToEdit.date_debut || '',
                date_fin: medicamentToEdit.date_fin || '',
                date_expiration: medicamentToEdit.date_expiration || '',
                quantite: medicamentToEdit.quantite || 0,
                seuil_alerte: medicamentToEdit.seuil_alerte || 5,
                notes: medicamentToEdit.notes || ''
            });
        } else {
            setFormData({
                nom: '', type: 'comprimé', posologie: '',
                date_debut: new Date().toISOString().split('T')[0],
                date_fin: '', date_expiration: '', quantite: 0, seuil_alerte: 5, notes: ''
            });
        }
        setErrors(null);
        setSuccess(null);
    }, [medicamentToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setSuccess(null);

        // Nettoyer les champs vides pour ne pas envoyer de chaînes vides aux dates
        const dataToSend = { ...formData };
        if (!dataToSend.date_fin) delete dataToSend.date_fin;
        if (!dataToSend.date_expiration) delete dataToSend.date_expiration;

        try {
            if (medicamentToEdit) {
                await api.patch(`/profils/${profilId}/medicaments/${medicamentToEdit.id}`, dataToSend);
                setSuccess("Le médicament a été mis à jour avec succès !");
            } else {
                await api.post(`/profils/${profilId}/medicaments`, dataToSend);
                setSuccess("Super ! Le nouveau médicament est ajouté à votre armoire.");
            }
            
            onSuccess();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: ["Une petite erreur technique est survenue. Merci de réessayer."] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">
                        {medicamentToEdit ? 'Modifier le médicament' : 'Ajouter un médicament'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {/* Messages de succès ou d'erreur générale */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-green-100 p-1 rounded-full text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="font-medium">{success}</span>
                        </div>
                    )}
                    
                    {errors?.general && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <span className="font-medium">{errors.general[0]}</span>
                        </div>
                    )}

                    <form id="medForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du médicament *</label>
                                <input type="text" name="nom" required value={formData.nom} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.nom ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                                />
                                {errors?.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select name="type" required value={formData.type} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.type ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white`}
                                >
                                    <option value="comprimé">Comprimé</option>
                                    <option value="sirop">Sirop</option>
                                    <option value="injection">Injection</option>
                                    <option value="crème">Crème</option>
                                    <option value="gouttes">Gouttes</option>
                                    <option value="patch">Patch</option>
                                    <option value="suppositoire">Suppositoire</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                        </div>

                        {/* Posologie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Posologie *</label>
                            <textarea name="posologie" required rows="2" value={formData.posologie} onChange={handleChange} placeholder="Ex: 1 comprimé matin et soir pendant les repas"
                                className={`w-full rounded-lg border ${errors?.posologie ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                            ></textarea>
                            {errors?.posologie && <p className="text-red-500 text-xs mt-1">{errors.posologie[0]}</p>}
                        </div>

                        {/* Dates grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                                <input type="date" name="date_debut" required value={formData.date_debut} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.date_debut ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 outline-none`}
                                />
                                {errors?.date_debut && <p className="text-red-500 text-xs mt-1">{errors.date_debut[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.date_fin ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 outline-none`}
                                />
                                {errors?.date_fin && <p className="text-red-500 text-xs mt-1">{errors.date_fin[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                                <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.date_expiration ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 outline-none`}
                                />
                                {errors?.date_expiration && <p className="text-red-500 text-xs mt-1">{errors.date_expiration[0]}</p>}
                            </div>
                        </div>

                        {/* Quantités grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock *</label>
                                <input type="number" min="0" name="quantite" required value={formData.quantite} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.quantite ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                                />
                                {errors?.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                                <input type="number" min="0" name="seuil_alerte" required value={formData.seuil_alerte} onChange={handleChange}
                                    className={`w-full rounded-lg border ${errors?.seuil_alerte ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                                    title="Vous serez alerté quand le stock passera sous ce nombre"
                                />
                                {errors?.seuil_alerte && <p className="text-red-500 text-xs mt-1">{errors.seuil_alerte[0]}</p>}
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Annuler
                    </button>
                    <button type="submit" form="medForm" disabled={loading} className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 shadow-sm shadow-blue-200">
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicamentForm;
