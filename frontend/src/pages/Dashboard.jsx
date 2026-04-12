import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import CollaborationView from '../components/CollaborationView';
import MobileBottomNav from '../components/MobileBottomNav';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MedicamentDetailsModal from '../components/MedicamentDetailsModal';
import ChatDialog from '../components/ChatDialog';
import echo from '../services/echo';
window.Echo = echo;
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
  const [activeRequest, setActiveRequest] = useState(null);
  const [collabUnreadCount, setCollabUnreadCount] = useState(0);
  const [showReminder, setShowReminder] = useState(() => {
    return localStorage.getItem('hide_system_reminder') !== 'true';
  });

  const mainContentRef = useRef(null);

  // Scroll to top when view changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentView, settingsPanel]);

  const handleDismissReminder = () => {
    setShowReminder(false);
    localStorage.setItem('hide_system_reminder', 'true');
  };

  const navigateToSettings = (panel = null) => {
    setSettingsPanel(panel);
    setCurrentView('settings');
    setIsProfileOpen(false);
  };

  const queryClient = useQueryClient();

  const { 
    data: dashboardData, 
    isLoading, 
    isFetching, 
    error 
  } = useQuery({
    queryKey: ['dashboard_data', profilActif?.id],
    queryFn: async () => {
      if (!profilActif?.id) return null;
      const res = await api.get('/dashboard/summary');
      return res.data;
    },
    enabled: !!profilActif?.id,
    staleTime: 60000, // 1 minute of "freshness"
  });

  const currentUser = dashboardData?.user || user;
  const allMedicaments = dashboardData?.inventory?.items || [];
  const adherenceData = dashboardData?.planning || { percentage: 0, stats: { taken: 0, total: 0 } };
  const recentNotifications = dashboardData?.notifications || [];

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard_data', profilActif?.id] });
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/collaboration/count');
      setCollabUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dashboardData?.collaboration_unread_count !== undefined) {
      setCollabUnreadCount(dashboardData.collaboration_unread_count);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (window.Echo && user) {
      // Écouter les notifications globales de collaboration pour l'utilisateur
      window.Echo.private(`users.${user.id}`)
        .listen('.request.updated', (e) => {
            setCollabUnreadCount(prev => prev + 1);
            // On ne rafraîchit pas tout le dashboard ici pour éviter les lenteurs
        })
        .listen('.message.sent', (e) => {
            // Uniquement si on n'est pas déjà dans le chat en question 
            // (La gestion fine peut se faire ici ou dans le composant ChatDialog)
            if (activeRequest?.id !== e.request_id) {
                setCollabUnreadCount(prev => prev + 1);
                showToast(`Nouveau message de ${e.sender_name}`, 'info');
            }
        });
    }
    return () => {
      if (window.Echo && user) {
        window.Echo.leave(`users.${user.id}`);
      }
    };
  }, [user, activeRequest?.id]);

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

  const deleteMutation = useMutation({
    mutationFn: (medId) => api.delete(`/profils/${profilActif.id}/medicaments/${medId}`),
    onSuccess: () => {
      showToast('Médicament supprimé');
      setIsConfirmDeleteOpen(false);
      setMedToDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['dashboard_data', profilActif.id] });
    },
    onError: () => {
      showToast('Erreur lors de la suppression', 'error');
    }
  });

  const handleDelete = () => {
    if (!medToDeleteId) return;
    deleteMutation.mutate(medToDeleteId);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-12 animate-fade-up relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bonjour, {currentUser?.name?.split(' ')[0] || 'Utilisateur'}</h1>
                   <p className="text-base font-medium text-slate-500">Voici l'état de santé de <span className="text-brand-blue font-bold">{profilActif?.nom}</span> pour aujourd'hui.</p>
                </div>
                <button 
                  onClick={() => { setMedicamentToEdit(null); setIsFormOpen(true); }}
                  className="bg-brand-blue text-white h-12 px-8 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                   <Plus size={20} strokeWidth={3} /> Nouveau Médicament
                </button>
            </div>

            <DashboardStats 
              medicaments={allMedicaments} 
              adherence={adherenceData}
              onCardClick={(v, f) => { if (v) setCurrentView(v); if (f) setInventoryFilter(f); }} 
            />

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
               {/* 1. TOP LEFT: Observance (Desktop: Sidebar Top, Mobile: Always Top) */}
               <div className="w-full lg:col-span-4 order-1">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50 flex flex-col items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Observance Quotidienne</h3>
                    
                    <div className="relative h-44 w-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                           <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-50" />
                           <circle 
                             cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" 
                             strokeDasharray="314.16" 
                             strokeDashoffset={314.16 - (314.16 * adherenceData.percentage) / 100} 
                             className="text-brand-blue transition-all duration-1000 ease-out" 
                             strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black text-slate-900 tracking-tighter">{adherenceData.percentage}%</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{adherenceData.stats.taken}/{adherenceData.stats.total} PRISES</span>
                        </div>
                    </div>
                  </div>
               </div>

               {/* 2. MAIN: Planning (Desktop: Right Side, Mobile: Under Observance) */}
               <div className="w-full lg:col-span-8 lg:row-span-12 order-2 flex flex-col gap-6">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-brand-blue rounded-full"></div>
                        <h2 className="text-sm font-black uppercase text-slate-900 tracking-widest">Planning du jour</h2>
                     </div>
                     <button onClick={() => setCurrentView('planning')} className="text-xs font-bold text-brand-blue hover:text-slate-900 transition-colors uppercase tracking-widest">Voir le planning complet</button>
                  </div>
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/50">
                    <PlanningView 
                      showToast={showToast} 
                      activeProfileId={profilActif?.id} 
                      initialData={adherenceData} 
                    />
                  </div>
               </div>

               {/* 3. BOTTOM LEFT: Secondary Sidebar items (Reminders + Alerts) */}
               <div className="w-full lg:col-span-4 order-3 space-y-10">
                  {showReminder && (
                    <div className="p-8 bg-slate-950 rounded-3xl text-white space-y-5 shadow-2xl relative group overflow-hidden">
                       <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                          <AlertTriangle size={100} />
                       </div>
                       <button 
                          onClick={handleDismissReminder}
                          className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors"
                       >
                          <X size={20} />
                       </button>
                       <div className="flex items-center gap-3 text-brand-blue">
                          <TrendingUp size={20} strokeWidth={3} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Astuce Santé</span>
                       </div>
                       <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10 pr-4">Optimisez votre gestion : vérifiez vos dates d'expiration avant de synchroniser vos stocks pour une sécurité maximale.</p>
                    </div>
                  )}

                  <div className="space-y-6">
                     <div className="flex items-center gap-3 px-2">
                        <div className="w-1 h-6 bg-brand-amber rounded-full"></div>
                        <h2 className="text-sm font-black uppercase text-slate-900 tracking-widest">Alertes Stock</h2>
                     </div>
                     {/* For Dashboard alerts, we use an empty searchTerm to match everything in Stock Alert state regardless of header search */}
                     <Inventory 
                       isCompact={true} 
                       limit={3} 
                       filter="stock" 
                       searchTerm=""
                       medicamentsData={allMedicaments} 
                       onDetails={handleShowDetails} 
                       showToast={showToast} 
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
            <GroupsView 
              onProfileSwitch={changerProfil} 
              setCurrentView={setCurrentView} 
              onChatOpen={setActiveRequest}
              showToast={showToast}
            />
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

      case 'collaboration':
        return (
          <div className="animate-fade-up">
            <CollaborationView 
               onChatOpen={setActiveRequest}
               showToast={showToast}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex h-screen overflow-hidden">
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
            collabBadge={collabUnreadCount}
          />
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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

          <div ref={mainContentRef} className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-4 sm:p-6 lg:pt-10 lg:px-10 max-w-7xl mx-auto pb-32 lg:pb-10">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} user={user} collabBadge={collabUnreadCount} />

      <MedicamentForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setMedicamentToEdit(null); }}
        onSuccess={() => {
          setIsFormOpen(false);
          setMedicamentToEdit(null);
          showToast(medicamentToEdit ? 'Mis à jour' : 'Ajouté');
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

      {activeRequest && (
        <ChatDialog 
          medRequest={activeRequest}
          onClose={() => setActiveRequest(null)}
          showToast={showToast}
          onRead={fetchUnreadCount}
        />
      )}
    </div>
  );
}
