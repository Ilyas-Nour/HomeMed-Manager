import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardStats from '../components/DashboardStats';
import Inventory from '../components/Inventory';
import MedicamentForm from '../components/MedicamentForm';
import FamilyMode from '../components/FamilyMode';
import GroupsView from '../components/GroupsView';
import SettingsView from '../components/SettingsView';
import ReportsView from '../components/ReportsView';
import PlanningView from '../components/PlanningView';
import AchatsView from '../components/AchatsView';
import MobileBottomNav from '../components/MobileBottomNav';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MedicamentDetailsModal from '../components/MedicamentDetailsModal';
import {
  Plus, Calendar, AlertTriangle,
  LayoutDashboard, Pill,
  Users, Settings, X, TrendingUp
} from 'lucide-react';

/**
 * Dashboard — Product Precision
 * The central hub of the HomeMed Manager ecosystem.
 */
export default function Dashboard() {
  const { user, profilActif, changerProfil } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [settingsPanel, setSettingsPanel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medicamentToEdit, setMedicamentToEdit] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [medToDeleteId, setMedToDeleteId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [medToDetail, setMedToDetail] = useState(null);
  const [showReminder, setShowReminder] = useState(() => {
    return localStorage.getItem('hide_system_reminder') !== 'true';
  });

  const handleDismissReminder = () => {
    setShowReminder(false);
    localStorage.setItem('hide_system_reminder', 'true');
  };

  const navigateToSettings = (panel = null) => {
    setSettingsPanel(panel);
    setCurrentView('settings');
    setIsProfileOpen(false);
  };

  const [allMedicaments, setAllMedicaments] = useState([]);
  const [adherenceData, setAdherenceData] = useState({ percentage: 0, stats: { taken: 0, total: 0 } });
  const [planningData, setPlanningData] = useState({});
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = `dashboard_data_${profilActif?.id}`;

  useEffect(() => {
    if (profilActif?.id) {
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilActif?.id]);

  const refreshData = async (silent = false) => {
    try {
      // Stale-While-Revalidate: show cached data instantly, refresh in background
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached && !silent) {
        const parsed = JSON.parse(cached);
        setAllMedicaments(parsed.inventory?.items || []);
        setAdherenceData(parsed.planning || { percentage: 0, stats: { taken: 0, total: 0 } });
        setPlanningData(parsed.planning?.schedule || {});
        setLoading(false);
        // Then silently refresh in background
        refreshData(true);
        return;
      }

      if (!silent) setLoading(true);
      const res = await api.get('/dashboard/summary');
      const data = res.data;

      // Cache the result for instant next load
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));

      setAllMedicaments(data.inventory.items || []);
      setAdherenceData(data.planning);
      setPlanningData(data.planning.schedule || {});
      
    } catch (err) {
      console.error('Erreur Refresh Data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleEdit = (med) => {
    setMedicamentToEdit(med);
    setIsFormOpen(true);
  };

  const handleShowDetails = (med) => {
    setMedToDetail(med);
    setIsDetailsOpen(true);
  };

  const openDeleteConfirm = (medId) => {
    setMedToDeleteId(medId);
    setIsConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!medToDeleteId) return;
    try {
      await api.delete(`/profils/${profilActif.id}/medicaments/${medToDeleteId}`);
      showToast('Médicament supprimé');
      setIsConfirmDeleteOpen(false);
      setMedToDeleteId(null);
      // Invalidate cache so next load is fresh
      sessionStorage.removeItem(`dashboard_data_${profilActif.id}`);
      refreshData();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade-up">
            {/* Adherence & Stats Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                       <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bonjour, {user?.name.split(' ')[0]}</h1>
                       <p className="text-sm font-medium text-slate-500">Voici l'état de santé de {profilActif?.nom} aujourd'hui.</p>
                    </div>
                    <button 
                      onClick={() => { setMedicamentToEdit(null); setIsFormOpen(true); }}
                      className="bg-brand-blue text-white h-11 px-6 text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                       <Plus size={18} /> Nouveau Médicament
                    </button>
                 </div>
                  <DashboardStats 
                    medicaments={allMedicaments} 
                    adherence={adherenceData}
                    onCardClick={(v, f) => { if (v) setCurrentView(v); if (f) setInventoryFilter(f); }} 
                  />
              </div>
              
              {/* Radial Adherence Chart */}
              {/* Radial Adherence Chart */}
              <div className="bg-white border border-slate-100 p-8 flex flex-col items-center justify-center shadow-tiny group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative">Observance</h3>
                 <div className="relative h-28 w-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                       {/* Background Track with safe margins */}
                       <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-50" />
                       {/* Adherence Path - No more clipping */}
                       <circle 
                         cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" 
                         strokeDasharray="314.16" 
                         strokeDashoffset={314.16 - (314.16 * adherenceData.percentage) / 100} 
                         className="text-brand-blue transition-all duration-1000 ease-out" 
                         strokeLinecap="round"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-slate-900 tracking-tighter">{adherenceData.percentage}%</span>
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                    {adherenceData.stats.taken}/{adherenceData.stats.total} Prises
                 </p>
              </div>
            </div>

            {/* Main Grid: Planning + Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                     <h2 className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Planning du jour</h2>
                     <button onClick={() => setCurrentView('planning')} className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:underline">Voir tout le planning</button>
                  </div>
                  <PlanningView 
                    showToast={showToast} 
                    activeProfileId={profilActif?.id} 
                    initialData={adherenceData} 
                  />
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-4">
                     <h2 className="text-[11px] font-black uppercase text-slate-900 tracking-widest px-1">Alertes Stock</h2>
                     <Inventory 
                       isCompact={true} 
                       limit={3} 
                       filter="low" 
                       medicamentsData={allMedicaments} 
                       onDetails={handleShowDetails} 
                       showToast={showToast} 
                     />
                  </div>
                   {showReminder && (
                      <div className="p-6 bg-slate-900 text-white space-y-4 shadow-xl relative group animate-fade-in">
                         <button 
                            onClick={handleDismissReminder}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                         >
                            <X size={16} />
                         </button>
                         <div className="flex items-center gap-2 text-brand-blue">
                            <AlertTriangle size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Conseil de Gestion</span>
                         </div>
                         <p className="text-xs font-medium text-slate-300 leading-relaxed pr-6">Pensez à vérifier vos dates d'expiration avant de synchroniser vos stocks pour garantir la sécurité de votre famille.</p>
                      </div>
                   )}
               </div>
            </div>
          </div>
        );

      case 'medicaments':
        return (
          <div className="animate-fade-up">
            <Inventory
              showToast={showToast}
              searchTerm={searchTerm}
              setIsFormOpen={setIsFormOpen}
              onEdit={handleEdit}
              onDelete={openDeleteConfirm}
              onDetails={handleShowDetails}
              filter={inventoryFilter}
              setFilter={setInventoryFilter}
              medicamentsData={allMedicaments}
            />
          </div>
        );

      case 'planning':
        return (
          <div className="animate-fade-up">
            <PlanningView 
              showToast={showToast} 
              activeProfileId={profilActif?.id} 
              initialData={adherenceData} 
            />
          </div>
        );

      case 'family':
        return (
          <div className="animate-fade-up">
            <FamilyMode onProfileSwitch={changerProfil} setCurrentView={setCurrentView} />
          </div>
        );

      case 'groups':
        return (
          <div className="animate-fade-up">
            <GroupsView onProfileSwitch={changerProfil} setCurrentView={setCurrentView} />
          </div>
        );

      case 'shopping':
        return (
          <div className="animate-fade-up">
            <AchatsView 
              showToast={showToast} 
              activeProfileId={profilActif?.id} 
              medicamentsData={allMedicaments}
              refreshData={refreshData}
            />
          </div>
        );

      case 'settings':
        return (
          <SettingsView 
            showToast={showToast} 
            setCurrentView={setCurrentView} 
            settingsPanel={settingsPanel}
            setSettingsPanel={setSettingsPanel}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-slate-900 z-50 fixed lg:static inset-y-0 left-0 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300`}>
          <DashboardSidebar
            currentView={currentView}
            setCurrentView={(v) => { setCurrentView(v); setSidebarOpen(false); }}
            navigateToSettings={navigateToSettings}
            sidebarCollapsed={false}
            setSidebarOpen={setSidebarOpen}
            user={user}
            activeProfileId={profilActif?.id}
            onProfileSwitch={changerProfil}
          />
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-slate-50">
          <DashboardHeader
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            setCurrentView={setCurrentView}
            navigateToSettings={navigateToSettings}
            allMedicaments={allMedicaments}
            onSelectMedicament={handleShowDetails}
            activeProfileId={profilActif?.id}
            onProfileSwitch={changerProfil}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-32 lg:pb-10">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} user={user} />

      {/* Modals */}
      <MedicamentForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setMedicamentToEdit(null); }}
        onSuccess={() => {
          setIsFormOpen(false);
          setMedicamentToEdit(null);
          showToast(medicamentToEdit ? 'Mis à jour' : 'Ajouté');
          // Invalidate cache so next refresh is fresh
          sessionStorage.removeItem(`dashboard_data_${profilActif?.id}`);
          refreshData();
        }}
        showToast={showToast}
        profilId={profilActif?.id}
        medicamentToEdit={medicamentToEdit}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Suppression"
        message="Voulez-vous supprimer ce médicament ?"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <MedicamentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        medicament={medToDetail}
        onEdit={handleEdit}
        onDelete={openDeleteConfirm}
      />
    </div>
  );
}
