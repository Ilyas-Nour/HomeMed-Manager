import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardStats from '../components/DashboardStats';
import Timeline from '../components/Timeline';
import Inventory from '../components/Inventory';
import MedicamentForm from '../components/MedicamentForm';
import FamilyMode from '../components/FamilyMode';
import GroupsView from '../components/GroupsView';
import SettingsView from '../components/SettingsView';
import ReportsView from '../components/ReportsView';
import PlanningView from '../components/PlanningView';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MedicamentDetailsModal from '../components/MedicamentDetailsModal';
import {
  Plus, Calendar, AlertTriangle,
  LayoutDashboard, Pill,
  Users, Settings
} from 'lucide-react';

/**
 * Dashboard — Mobile-First · Product Precision
 */
export default function Dashboard() {
  const { user, profilActif, changerProfil } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
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

  const [allMedicaments, setAllMedicaments] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    if (profilActif?.id) {
      api.get(`/profils/${profilActif.id}/medicaments`)
        .then(res => {
          const data = res.data.medicaments || res.data || [];
          setAllMedicaments(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error('Erreur meds', err));

      api.get(`/profils/${profilActif.id}/timeline`)
        .then(res => setTimelineEvents(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error('Erreur timeline', err));
    }
    return () => {
      setAllMedicaments([]);
      setTimelineEvents([]);
    };
  }, [profilActif?.id]);

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
      setAllMedicaments(prev => prev.filter(m => m.id !== medToDeleteId));
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleTogglePrise = async (rappelId, isPris) => {
    try {
      const res = await api.post(`/rappels/${rappelId}/toggle`, { pris: isPris });
      showToast(isPris ? 'Prise confirmée' : 'Prise annulée');
      setTimelineEvents(prev => prev.map(e => e.id === rappelId ? { ...e, pris: res.data.pris } : e));
      setAllMedicaments(prev => prev.map(m => {
        const medName = timelineEvents.find(te => te.id === rappelId)?.nom;
        if (m.nom === medName) return { ...m, quantite: res.data.quantite };
        return m;
      }));
    } catch {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const refreshMeds = () => {
    if (profilActif?.id) {
      api.get(`/profils/${profilActif.id}/medicaments`)
        .then(res => {
          const data = res.data.medicaments || res.data || [];
          setAllMedicaments(Array.isArray(data) ? data : []);
        })
        .catch(e => console.error(e));
    }
  };

  // Mobile bottom nav items
  const mobileNavItems = [
    { id: 'overview',    label: 'Accueil',    icon: <LayoutDashboard size={20} /> },
    { id: 'medicaments', label: 'Pharmacie',  icon: <Pill size={20} /> },
    { id: 'family',      label: 'Gérer',      icon: <Users size={20} /> },
    { id: 'profiles',    label: 'Profils',    icon: (
      <div className="relative">
        <div className="h-6 w-6 bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] border border-slate-200">
          {user?.profils?.find(p => p.id === profilActif?.id)?.nom?.charAt(0).toUpperCase() || 'M'}
        </div>
      </div>
    ) },
    { id: 'settings',    label: 'Réglages',   icon: <Settings size={20} /> },
  ];

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Tableau de Bord</h1>
                <p className="text-sm text-slate-500 font-medium">Gestion intelligente de vos traitements.</p>
              </div>
              <button
                onClick={() => { setMedicamentToEdit(null); setIsFormOpen(true); }}
                className="med-btn-primary h-10 px-5 flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="text-sm font-semibold">Nouveau Médicament</span>
              </button>
            </div>

            {/* Stats */}
            <DashboardStats
              medicaments={allMedicaments}
              timeline={timelineEvents}
              onCardClick={(view, filter) => {
                if (view) setCurrentView(view);
                if (filter) setInventoryFilter(filter);
              }}
            />

            {/* Grid: Timeline + Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Planning */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Calendar size={17} className="text-brand-blue" />
                    <h2 className="text-base font-bold">Planning du Jour</h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                    {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-tiny">
                  <Timeline
                    showToast={showToast}
                    searchTerm={searchTerm}
                    events={timelineEvents}
                    onTogglePrise={handleTogglePrise}
                    onViewAll={() => setCurrentView('planning')}
                  />
                </div>
              </div>

              {/* Pharmacie */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-slate-900">
                    <AlertTriangle size={17} className="text-brand-amber" />
                    <h2 className="text-base font-bold">Pharmacie</h2>
                  </div>
                  <button onClick={() => setCurrentView('medicaments')} className="text-[10px] font-bold text-brand-blue hover:underline uppercase tracking-wider">
                    Voir Tout
                  </button>
                </div>
                <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-tiny">
                  <Inventory
                    isCompact={true}
                    showToast={showToast}
                    searchTerm={searchTerm}
                    onEdit={handleEdit}
                    onDelete={openDeleteConfirm}
                    onDetails={handleShowDetails}
                    filter={inventoryFilter}
                    setFilter={setInventoryFilter}
                    medicamentsData={allMedicaments}
                  />
                </div>
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

      case 'planning':
        return (
          <div className="animate-fade-up">
            <PlanningView
              events={timelineEvents}
              onTogglePrise={handleTogglePrise}
              setCurrentView={setCurrentView}
              showToast={showToast}
            />
          </div>
        );

      case 'settings':
        return (
          <SettingsView showToast={showToast} setCurrentView={setCurrentView} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar (desktop only) ── */}
        <aside className={`
          bg-slate-900 transition-all duration-300 ease-in-out z-50 fixed lg:static inset-y-0 left-0
          w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <DashboardSidebar
            currentView={currentView}
            setCurrentView={(v) => { setCurrentView(v); setSidebarOpen(false); }}
            sidebarCollapsed={false}
            setSidebarCollapsed={() => {}}
            setSidebarOpen={setSidebarOpen}
            user={user}
            activeProfileId={profilActif?.id}
            onProfileSwitch={changerProfil}
          />
        </aside>

        {/* ── Sidebar mobile backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-slate-50">

          {/* Header */}
          <DashboardHeader
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            setCurrentView={setCurrentView}
            allMedicaments={allMedicaments}
            onSelectMedicament={(med) => handleShowDetails(med)}
            activeProfileId={profilActif?.id}
            onProfileSwitch={changerProfil}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Bottom padding accounts for mobile nav bar */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-10">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] safe-bottom bg-white border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map(item => {
            const isActive = currentView === item.id || (item.id === 'profiles' && isProfileSheetOpen);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profiles') {
                    setIsProfileSheetOpen(true);
                  } else {
                    setCurrentView(item.id);
                    setIsProfileSheetOpen(false);
                  }
                }}
                className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                  isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile Profile Switcher Sheet ── */}
      {isProfileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-[150] flex items-end">
          <div 
            className="absolute inset-0 bg-slate-900/60 transition-opacity animate-fade-in" 
            onClick={() => setIsProfileSheetOpen(false)} 
          />
          <div className="relative w-full bg-white border-t border-slate-200 p-6 pb-12 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Changer de Profil</h3>
              <button 
                onClick={() => setIsProfileSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {user?.profils?.map(profil => (
                <button
                  key={profil.id}
                  onClick={() => {
                    changerProfil(profil.id);
                    setIsProfileSheetOpen(false);
                    showToast(`Profil : ${profil.nom}`);
                  }}
                  className={`w-full flex items-center gap-4 p-4 border transition-all ${
                    profilActif?.id === profil.id 
                      ? 'bg-brand-blue/[0.03] border-brand-blue text-brand-blue' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <div className={`h-10 w-10 flex items-center justify-center font-bold border ${
                    profilActif?.id === profil.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    {profil.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold leading-none">{profil.nom}</p>
                    <p className="text-[10px] mt-1 opacity-70 uppercase tracking-wider font-semibold">{profil.relation}</p>
                  </div>
                  {profilActif?.id === profil.id && (
                    <div className="h-2 w-2 bg-brand-blue" />
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  setCurrentView('family');
                  setIsProfileSheetOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 border border-dashed border-slate-200 text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue transition-all"
              >
                <div className="h-10 w-10 flex items-center justify-center border border-dashed border-slate-200">
                  <Plus size={18} />
                </div>
                <span className="text-sm font-bold">Gérer les profils</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MedicamentForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setMedicamentToEdit(null); }}
        onSuccess={() => {
          setIsFormOpen(false);
          setMedicamentToEdit(null);
          showToast(medicamentToEdit ? 'Médicament mis à jour' : 'Médicament ajouté');
          refreshMeds();
        }}
        showToast={showToast}
        profilId={profilActif?.id}
        medicamentToEdit={medicamentToEdit}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Suppression"
        message="Voulez-vous vraiment supprimer ce médicament ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <MedicamentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        medicament={medToDetail}
      />
    </div>
  );
}
