import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MedicamentCard from '../components/MedicamentCard';
import MedicamentForm from '../components/MedicamentForm';
import { LogOut, Plus, Users, LayoutDashboard, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, profilActif, changerProfil, logout } = useAuth();
    const [medicaments, setMedicaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [medicamentToEdit, setMedicamentToEdit] = useState(null);

    const navigate = useNavigate();

    const fetchMedicaments = async () => {
        if (!profilActif) return;
        setLoading(true);
        try {
            const response = await api.get(`/profils/${profilActif.id}/medicaments`);
            setMedicaments(response.data.medicaments);
        } catch (error) {
            console.error("Erreur de récupération des médicaments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicaments();
    }, [profilActif]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleEdit = (medicament) => {
        setMedicamentToEdit(medicament);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setMedicamentToEdit(null);
        setIsFormOpen(true);
    };

    const handleRemoveLocally = (id) => {
        setMedicaments(prev => prev.filter(m => m.id !== id));
    };

    const filteredMedicaments = medicaments.filter(m => 
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const medicamentsActifs = medicaments.filter(m => m.traitement_actif && !m.expire).length;
    const alertesIssues = medicaments.filter(m => m.expire || m.stock_faible).length;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            
            {/* Sidebar pour Desktop (Top navbar en mobile) */}
            <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-800">HomeMed</h1>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <Users size={14} /> Profil Actif
                    </p>
                    <select 
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 cursor-pointer"
                        value={profilActif?.id || ''}
                        onChange={(e) => changerProfil(e.target.value)}
                    >
                        {user.profils?.map(profil => (
                            <option key={profil.id} value={profil.id}>
                                {profil.nom} ({profil.relation})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-auto p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-colors font-medium text-sm"
                    >
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Header Mobile & Top bar Desktop */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex md:hidden items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <LayoutDashboard size={18} className="text-white" />
                            </div>
                            <h1 className="text-lg font-bold text-gray-800">HomeMed</h1>
                        </div>
                        <select 
                            className="p-1.5 text-sm rounded-lg border border-gray-300 bg-white"
                            value={profilActif?.id || ''}
                            onChange={(e) => changerProfil(e.target.value)}
                        >
                            {user.profils?.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                        <button onClick={handleLogout} className="text-gray-500 p-1"><LogOut size={18}/></button>
                    </div>

                    <div className="w-full sm:w-auto flex-1 max-w-md hidden sm:block">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Rechercher un médicament..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleAddNew}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200 whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Nouveau médicament</span><span className="sm:hidden">Ajouter</span>
                    </button>
                    
                    {/* Mobile Search - visible only on small screens */}
                    <div className="w-full sm:hidden relative mt-2">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Médicaments</p>
                                <p className="text-2xl font-bold text-gray-800">{medicaments.length}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hidden sm:flex">
                                <LayoutDashboard size={20} />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Traitements Actifs</p>
                                <p className="text-2xl font-bold text-gray-800">{medicamentsActifs}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 hidden sm:flex">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between col-span-2 md:col-span-1">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Alertes / Expirés</p>
                                <p className="text-2xl font-bold text-gray-800">{alertesIssues}</p>
                            </div>
                            <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 hidden sm:flex">
                                <Bell size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Titre section */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Armoire à pharmacie de {profilActif?.nom}
                        </h2>
                    </div>

                    {/* Liste */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {filteredMedicaments.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                    <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
                                        <Plus size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun médicament trouvé</h3>
                                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                        {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par ajouter votre premier médicament pour réaliser un suivi de votre traitement."}
                                    </p>
                                    {!searchTerm && (
                                        <button 
                                            onClick={handleAddNew}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
                                        >
                                            Ajouter un médicament
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredMedicaments.map(medicament => (
                                        <MedicamentCard 
                                            key={medicament.id} 
                                            medicament={medicament} 
                                            profilId={profilActif.id}
                                            onEdit={handleEdit}
                                            onDelete={handleRemoveLocally}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modal du Formulaire */}
            <MedicamentForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                profilId={profilActif?.id}
                medicamentToEdit={medicamentToEdit}
                onSuccess={fetchMedicaments}
            />
        </div>
    );
};

export default Dashboard;
