import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, Pill, Bell, Users, User, Settings,
  LogOut, Search, Plus, Menu, X, Activity, Package,
  AlertTriangle, ChevronDown, ChevronRight, Calendar, Database, Clock, Shield, CheckCircle2,
  Sunrise, Sun, Sunset, Moon, CheckCircle, ShoppingBag, ShieldCheck
} from 'lucide-react';
import MedicamentCard from '../components/MedicamentCard';
import MedicamentDetailsModal from '../components/MedicamentDetailsModal';
import Toast from '../components/Toast';
import logo from '/HomeMed-Logo.png';
import logoSmall from '/HomeMed-Logo-Small.png';

// 🚀 Performance: Lazy Loading high-weight view components
const MedicamentForm = lazy(() => import('../components/MedicamentForm'));
const FamilyMode     = lazy(() => import('../components/FamilyMode'));
const GroupsView      = lazy(() => import('../components/GroupsView'));
const SettingsView    = lazy(() => import('../components/SettingsView'));
const AchatsView      = lazy(() => import('../components/AchatsView'));
const AdminView       = lazy(() => import('../components/AdminView'));

/**
 * Dashboard Premium — Shadcn Execution
 */
export default function Dashboard() {
  const { user, logout, profilActif, changerProfil } = useAuth();
  const [medicaments, setMedicaments] = useState([]);
  const [rappelsDuJour, setRappelsDuJour] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [toEdit, setToEdit]           = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [itemToView, setItemToView]   = useState(null);
  const [toast, setToast]             = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Navigation & Filtering
  const [currentView, setCurrentView] = useState('dashboard');
  const [metricFilter, setMetricFilter] = useState('all'); // 'all', 'actifs', 'alertes'
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Notifications logic
  const [notifiedRappels, setNotifiedRappels] = useState(new Set());
  const [showNotifications, setShowNotifications] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => { 
    if (profilActif) {
        fetchMeds();
        fetchRappels();
    }
  }, [profilActif]);

  // Audio Notification interval checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      rappelsDuJour.forEach(rapp => {
        if (!rapp.pris && rapp.heure.substring(0,5) === currentTimeStr && !notifiedRappels.has(rapp.id)) {
           // Jouer le son
           try {
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Son doux type "Pop"
             audio.play();
           } catch (e) { console.error('Audio play failed', e); }
           
           showToast(`C'est l'heure de prendre : ${rapp.nom}`, 'info');
           setNotifiedRappels(prev => new Set(prev).add(rapp.id));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [rappelsDuJour, notifiedRappels]);

  const fetchMeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/profils/${profilActif.id}/medicaments`);
      setMedicaments(res.data.medicaments ?? []);
    } catch (e) { console.error('Erreur chargement médicaments', e); }
    finally { setLoading(false); }
  }, [profilActif?.id]);

  const fetchRappels = useCallback(async () => {
    try {
      const res = await api.get(`/profils/${profilActif.id}/timeline`);
      setRappelsDuJour(res.data);
    } catch (e) { console.error('Erreur chargement timeline', e); }
  }, [profilActif?.id]);

  const handleTogglePrise = async (rappelId, currentlyPris) => {
    try {
      await api.post(`/rappels/${rappelId}/toggle`, { pris: !currentlyPris });
      // Rafraîchir les deux pour synchroniser le stock et l'état
      fetchRappels();
      fetchMeds();
    } catch (e) { console.error('Erreur toggle prise', e); }
  };

  const filtered = useMemo(() => {
    return medicaments.filter(m => {
      const matchesSearch = m.nom.toLowerCase().includes(searchTerm.toLowerCase()) || m.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isExpired = m.date_expiration && new Date(m.date_expiration) < new Date();
      const isStockLow = m.quantite <= (m.seuil_alerte || 5);
      const isAlerte = isExpired || isStockLow;

      if (metricFilter === 'actifs' && !m) return false; // Basic filter condition placeholder
      if (metricFilter === 'alertes' && !isAlerte) return false;
      
      return matchesSearch;
    });
  }, [medicaments, searchTerm, metricFilter]);

  const stats = useMemo(() => {
    const total = medicaments.length;
    const alertes = medicaments.filter(m => m.stock_faible || m.expire).length;
    
    // Compliance logic: based on today's reminders
    const totalToday = rappelsDuJour.length;
    const takenToday = rappelsDuJour.filter(r => r.pris).length;
    const compliance = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

    return { total, alertes, compliance, totalToday, takenToday };
  }, [medicaments, rappelsDuJour]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR — Ultra Clean ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out lg:relative
        ${sidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[260px]'}
      `}>
        <div className="flex items-center justify-center p-6 h-24 shrink-0 transition-all duration-500">
          <button 
            onClick={() => setCurrentView('dashboard')} 
            className="flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95"
          >
            <img 
              src={sidebarCollapsed ? logoSmall : logo} 
              alt="HomeMed" 
              className={`object-contain transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? 'h-11 w-11' : 'h-14 w-auto'}`} 
            />
          </button>
        </div>

        <div className={`px-4 pt-6 pb-4 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 hidden overflow-hidden' : 'opacity-100'}`}>
          <p className="hm-section-title mb-4">Profil Actif</p>
          <div className="relative z-[60]">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-full h-16 flex items-center justify-between bg-white border border-slate-200/60 rounded-[20px] px-4 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group"
              style={{ zIndex: 61 }}
            >
              <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                  <User size={14} />
                </div>
                <div className="text-left min-w-0">
                    <p className="text-[13px] font-black text-slate-900 truncate leading-tight">{profilActif?.nom}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight uppercase">{profilActif?.relation}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-500 ease-out ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)} />
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-[60] animate-fade-in overflow-hidden">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Changer de profil</p>
                  {user.profils?.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { changerProfil(p.id); setIsProfileDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors ${profilActif?.id === p.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${profilActif?.id === p.id ? 'bg-emerald-500' : 'bg-transparent'}`} />
                      {p.nom} <span className="text-[10px] opacity-40 font-medium lowercase">({p.relation})</span>
                    </button>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                    <button onClick={() => { setCurrentView('settings'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
                       <Settings size={12} /> Réglages compte
                    </button>
                    <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                       <LogOut size={12} /> Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className={`hm-section-title mb-2 px-1 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Menu Principal</p>
          <button onClick={() => setCurrentView('dashboard')} className={`hm-nav ${currentView === 'dashboard' ? 'active' : ''}`} title="Tableau de bord">
            <LayoutDashboard size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Tableau de bord</span>
          </button>
          <button onClick={() => { setCurrentView('traitements'); setMetricFilter('all'); }} className={`hm-nav ${currentView === 'traitements' ? 'active' : ''}`} title="Traitements">
            <Pill size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Traitements</span>
          </button>
          <button onClick={() => setCurrentView('calendar')} className={`hm-nav ${currentView === 'calendar' ? 'active' : ''}`} title="Calendrier">
            <Calendar size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Calendrier</span>
          </button>
          <button onClick={() => setCurrentView('achats')} className={`hm-nav ${currentView === 'achats' ? 'active' : ''}`} title="Achats">
            <ShoppingBag size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Achats</span>
          </button>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => window.open('http://localhost:8000/admin', '_blank')} 
              className="hm-nav group" 
              title="Filament Admin"
            >
              <ShieldCheck size={18} className="shrink-0 text-emerald-500" /> 
              <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                Administration
              </span>
              {!sidebarCollapsed && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          )}
          
          <div className="pt-6">
            <p className={`hm-section-title mb-2 px-1 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Système</p>
            <button onClick={() => setCurrentView('notifications')} className={`hm-nav ${currentView === 'notifications' ? 'active' : ''}`} title="Notifications">
              <Bell size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Notifications</span>
            </button>
            <button onClick={() => setCurrentView('family')} className={`hm-nav ${currentView === 'family' ? 'active' : ''}`} title="Mode Famille">
              <Users size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Mode Famille</span>
            </button>
            <button onClick={() => setCurrentView('groups')} className={`hm-nav ${currentView === 'groups' ? 'active' : ''}`} title="Groupes Collaboratifs">
              <Shield size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Groupes</span>
            </button>
            <button onClick={() => setCurrentView('settings')} className={`hm-nav ${currentView === 'settings' ? 'active' : ''}`} title="Paramètres">
              <Settings size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Paramètres</span>
            </button>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/40">
          <div className={`flex items-center gap-3 p-2 mb-2 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'justify-center border-transparent shadow-none bg-transparent' : ''}`}>
            <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[9px] font-medium text-slate-500 truncate tracking-wide">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="hm-nav !text-red-600 hover:!bg-red-50 hover:!text-red-700 transition-all font-medium" title="Déconnexion">
            <LogOut size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN — Content Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 sticky top-0 z-30 shrink-0">
          
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 mr-2">
            <Menu size={20} />
          </button>

          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-2 rounded-md text-slate-500 hover:bg-slate-100 mr-4">
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-xl group relative">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={e => { setSearchTerm(e.target.value); setCurrentView('dashboard'); }}
                className="w-full pl-10 pr-4 py-1.5 bg-slate-100/50 border border-transparent rounded-md text-sm focus:bg-white focus:border-slate-300 focus:ring-1 focus:ring-slate-300 outline-none transition-all duration-200"
              />
            </div>
            
            {/* Search Autocomplete Suggestions (Command Palette Style) */}
            {showSuggestions && searchTerm.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden z-50 animate-fade-in">
                {filtered.slice(0, 5).map(med => (
                  <button 
                    key={med.id} 
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm grid grid-cols-[auto_1fr] items-center gap-3 transition-colors"
                    onClick={() => {
                        setSearchTerm(med.nom);
                        setCurrentView('traitements');
                        setShowSuggestions(false);
                        const element = document.getElementById(`med-${med.id}`);
                        if(element) element.scrollIntoView({behavior: 'smooth'});
                    }}
                  >
                    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400"><Pill size={14}/></div>
                    <div>
                        <p className="font-medium text-slate-900">{med.nom}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{med.type}</p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <div className="px-4 py-3 text-sm text-slate-500 text-center">Aucun résultat trouvé</div>}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`hidden sm:flex relative p-2 rounded-md transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={18} />
                {stats.alertes > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute top-full right-0 w-80 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                       {stats.alertes > 0 ? (
                         <div className="p-4 space-y-3">
                           <div className="flex gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs font-medium">
                             <AlertTriangle size={14} className="shrink-0" />
                             <p>{stats.alertes} traitement(s) demandent votre attention (Stock bas ou expirés).</p>
                           </div>
                           {medicaments.filter(m => m.stock_actuel <= m.stock_minimum).map(m => (
                             <div key={m.id} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border-l-4 border-amber-500 pl-3">
                                <p className="text-[11px] font-bold text-slate-900">{m.nom}</p>
                                <p className="text-[10px] text-slate-500">Stock critique : {m.stock_actuel} restant{m.stock_actuel > 1 ? 's' : ''}</p>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="py-12 text-center text-slate-400">
                            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-medium">Tout est en ordre pour le moment.</p>
                         </div>
                       )}
                    </div>
                    <div className="p-2 border-t border-slate-100">
                       <button onClick={() => { setCurrentView('notifications'); setShowNotifications(false); }} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors">
                          Voir tout l'historique
                       </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button className="hm-btn" onClick={() => {setToEdit(null); setIsFormOpen(true);}}>
              <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar animate-fade-in relative z-0">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
            
            {/* Page Title */}
            {currentView === 'dashboard' && (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Bonjour, {profilActif?.nom} 👋</h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest opacity-80">Votre tableau de bord santé</p>
                </div>
              </div>
            )}

            {/* Alert Banner */}
            {currentView === 'dashboard' && stats.alertes > 0 && (
              <div className="flex items-center gap-4 p-4 bg-amber-50/50 border border-amber-100/50 rounded-[24px] animate-fade-up">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-tight">Attention requise</h4>
                  <p className="text-[12px] text-amber-700/80 font-medium">{stats.alertes} traitement{stats.alertes > 1 ? 's demandent' : ' demande'} votre attention.</p>
                </div>
              </div>
            )}

            {/* Metrics — Studio Premium Grade */}
            {currentView === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  label="Inventaire" 
                  value={stats.total} 
                  icon={<Package size={20} />} 
                  color="navy"
                  trend={{ label: "Médicaments", value: stats.total }}
                  active={currentView === 'traitements' && metricFilter === 'all'}
                  onClick={() => { setCurrentView('traitements'); setMetricFilter('all'); }}
                />
                
                <MetricCard 
                  label="Observance" 
                  value={`${stats.compliance}%`} 
                  icon={<Activity size={20} />} 
                  color="emerald"
                  trend={{ label: "Doses prises", value: `${stats.takenToday}/${stats.totalToday}` }}
                  isProgress
                  progressValue={stats.compliance}
                />

                <MetricCard 
                  label="Alertes" 
                  value={stats.alertes} 
                  icon={<AlertTriangle size={20} />} 
                  color="amber"
                  trend={{ label: "Stock & Exp.", value: "Intervention" }}
                  active={currentView === 'traitements' && metricFilter === 'alertes'}
                  onClick={() => { setCurrentView('traitements'); setMetricFilter('alertes'); }}
                />

                <MetricCard 
                  label="Achats" 
                  value={medicaments.reduce((acc, m) => acc + (m.quantite < m.seuil_alerte ? 1 : 0), 0)} 
                  icon={<ShoppingBag size={20} />} 
                  color="indigo"
                  trend={{ label: "Stock faible", value: "Achat" }}
                  onClick={() => setCurrentView('achats')}
                />
              </div>
            )}
            
            {/* View Switching */}
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
                <Activity size={48} className="text-emerald-500 mb-6 animate-bounce" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chargement de la vue...</p>
              </div>
            }>
              {currentView !== 'dashboard' && currentView !== 'traitements' ? (
                currentView === 'family' ? <FamilyMode /> : 
                currentView === 'groups' ? <GroupsView /> :
                currentView === 'settings' ? <SettingsView /> :
                currentView === 'achats' ? <AchatsView medicaments={medicaments} onStockUpdate={fetchMeds} /> :
                currentView === 'admin' ? <AdminView /> :
                <GenericPagePlaceholder view={currentView} />
              ) : currentView === 'dashboard' ? (
                /* ... rest of the dashboard UI ... */
                <DashboardMainContent 
                  stats={stats} 
                  rappelsDuJour={rappelsDuJour} 
                  handleTogglePrise={handleTogglePrise} 
                  medicaments={medicaments} 
                  setCurrentView={setCurrentView}
                  setMetricFilter={setMetricFilter}
                />
              ) : (
                  /* currentView === 'traitements' */
                  <InventoryContent 
                    filtered={filtered} 
                    loading={loading} 
                    profilActif={profilActif} 
                    setToEdit={setToEdit} 
                    setIsFormOpen={setIsFormOpen} 
                    setItemToView={setItemToView} 
                    setDetailsOpen={setDetailsOpen} 
                    fetchMeds={fetchMeds} 
                    showToast={showToast} 
                  />
              )}
            </Suspense>
            
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <MedicamentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          profilId={profilActif?.id}
          medicamentToEdit={toEdit}
          onSuccess={() => { fetchMeds(); fetchRappels(); }}
          showToast={showToast}
        />
      </Suspense>

      <MedicamentDetailsModal 
        isOpen={detailsOpen}
        medicament={itemToView}
        onClose={() => setDetailsOpen(false)}
      />
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}


/** Sous-composant Carte de Statistique — Studio Premium Upgrade */
function MetricCard({ label, value, icon, color, active, onClick, trend, isProgress, progressValue }) {
  const colors = {
    navy: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`group relative overflow-hidden text-left bg-white rounded-[32px] border transition-all duration-500 focus:outline-none ${
        active 
          ? 'border-blue-600 shadow-2xl shadow-blue-600/10 scale-[1.02] ring-4 ring-blue-600/5' 
          : 'border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1'
      } ${isProgress ? 'col-span-1' : ''}`}
    >
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            active ? 'bg-blue-600 text-white' : `bg-slate-50 text-slate-400 group-hover:${colors[color]} group-hover:scale-110`
          }`}>
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend?.value || "Stat"}</span>
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">{trend?.label}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-3xl font-[950] text-slate-900 tracking-tighter">{value}</p>
        </div>

        {isProgress && (
          <div className="mt-4 space-y-1.5">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ${progressValue > 80 ? 'bg-emerald-500' : progressValue > 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                 style={{ width: `${progressValue}%` }}
               />
            </div>
          </div>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-500 opacity-[0.02] blur-3xl group-hover:opacity-[0.05] transition-opacity duration-700`} />
    </button>
  );
}

/**
 * ── DASHBOARD MAIN CONTENT ──
 */
function DashboardMainContent({ stats, rappelsDuJour, handleTogglePrise, medicaments, setCurrentView, setMetricFilter }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Phase 2: Daily Timeline Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
              <h2 className="text-xl font-[900] text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock size={22} className="text-emerald-500" strokeWidth={2.5} />
                  À prendre aujourd'hui
              </h2>
              <p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-[0.2em] opacity-80 flex items-center gap-1.5">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  Aujourd'hui
              </p>
          </div>
          
          {/* Section Alertes Critiques */}
          {stats.alertes > 0 && (
            <div className="bg-white/50 backdrop-blur-xl border border-amber-100 rounded-[32px] p-6 shadow-xl shadow-amber-500/5 animate-fade-up">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <AlertTriangle size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intervention Requise</h3>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none mt-1">Stock faible ou produits expirés</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {medicaments.filter(m => m.stock_faible || m.expire).map(m => (
                   <div key={m.id} className="p-4 rounded-2xl bg-white border border-amber-50 flex items-center justify-between group hover:border-amber-200 transition-all cursor-pointer" onClick={() => { setCurrentView('traitements'); setMetricFilter('alertes'); }}>
                      <div className="flex items-center gap-3">
                         <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-[11px] ${m.expire ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                            {m.type.substring(0, 1).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{m.nom}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                               {m.expire ? 'Expiré' : `Stock: ${m.quantite} restants`}
                            </p>
                         </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-all" />
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {rappelsDuJour.length > 0 ? (
          <div className="relative pl-10 sm:pl-12 space-y-4 before:absolute before:left-[19px] sm:before:left-[23px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/80 before:via-emerald-300/50 before:to-transparent">
            {rappelsDuJour.map((rapp) => {
              const getIconInfo = (moment) => {
                const m = moment.toLowerCase();
                if (m.includes('matin')) return { icon: <Sunrise size={18} />, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' };
                if (m.includes('midi') || m.includes('déjeuner')) return { icon: <Sun size={18} />, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' };
                if (m.includes('soir')) return { icon: <Sunset size={18} />, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' };
                if (m.includes('nuit') || m.includes('coucher')) return { icon: <Moon size={18} />, color: 'bg-slate-900 text-white', border: 'border-slate-800' };
                return { icon: <Clock size={18} />, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' };
              };
              const iconInfo = getIconInfo(rapp.moment);

              return (
                <div 
                  key={rapp.id} 
                  className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-[24px] border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    rapp.pris 
                      ? 'bg-slate-50/40 border-slate-100/50 scale-[0.98] opacity-60' 
                      : 'bg-white/70 backdrop-blur-xl border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgb(16,185,129,0.06)] hover:border-emerald-100/50 hover:-translate-y-0.5'
                  }`}
                >
                   {/* Time Dot Indicator */}
                   <div className={`absolute -left-[31px] sm:-left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-[#fafbfc] transition-all duration-500 z-10 ${rapp.pris ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-emerald-400 group-hover:scale-125'}`} />

                   <div className={`h-12 w-12 rounded-[18px] flex items-center justify-center shrink-0 border transition-all duration-700 ${
                     rapp.pris 
                       ? 'bg-emerald-500 border-emerald-500 text-white rotate-12 scale-90' 
                       : `${iconInfo.color} ${iconInfo.border} group-hover:scale-110 group-hover:shadow-lg`
                   }`}>
                      {rapp.pris ? <CheckCircle size={24} strokeWidth={2.5} /> : iconInfo.icon}
                   </div>

                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${rapp.pris ? 'bg-slate-200 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                            {rapp.moment}
                         </div>
                         <span className="text-[10px] font-black text-slate-300 flex items-center gap-1">
                           <Clock size={10} strokeWidth={3} />
                           {rapp.heure.substring(0, 5)}
                         </span>
                      </div>
                      <h4 className={`text-lg font-[900] tracking-tight transition-all duration-500 ${
                        rapp.pris ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-emerald-950'
                      }`}>
                        {rapp.nom}
                      </h4>
                   </div>

                   <div className="flex items-center gap-4 mt-3 sm:mt-0">
                     <button 
                       onClick={() => handleTogglePrise(rapp.id, rapp.pris)}
                       className={`h-10 px-8 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-90 ${
                         rapp.pris 
                           ? 'text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600' 
                           : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
                       }`}
                     >
                       {rapp.pris ? 'Annuler' : 'Valider'}
                     </button>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-white/40 backdrop-blur-md rounded-[32px] border-2 border-dashed border-slate-200/50 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 rotate-3 shadow-lg shadow-emerald-500/5">
               <CheckCircle2 size={32} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Journée complétée</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Tous vos traitements ont été validés.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ── INVENTORY CONTENT ──
 */
function InventoryContent({ filtered, loading, profilActif, setToEdit, setIsFormOpen, setItemToView, setDetailsOpen, fetchMeds, showToast }) {
  return (
    <div id="inventaire_section" className="space-y-6 pt-0 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               <Pill size={24} className="text-emerald-500" />
               Inventaire des Traitements
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Gérez vos médicaments et stocks</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="hm-badge hm-badge-slate">
              {filtered.length} Traitements
            </span>
            <button className="hm-btn" onClick={() => {setToEdit(null); setIsFormOpen(true);}}>
                <Plus size={16} /> Ajouter
            </button>
        </div>
      </div>

      {loading ? (
        <div className="hm-grid-layout animate-pulse opacity-50">
          {[1,2,3,4].map(i => <div key={i} className="h-[220px] bg-slate-200 rounded-[32px]" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="hm-grid-layout">
          {filtered.map(med => (
            <div id={`med-${med.id}`} key={med.id}>
              <MedicamentCard
                medicament={med}
                profilId={profilActif?.id}
                onEdit={() => {setToEdit(med); setIsFormOpen(true);}}
                onViewDetails={() => {setItemToView(med); setDetailsOpen(true);}}
                onDelete={() => { fetchMeds(); showToast('Médicament supprimé avec succès'); }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center hm-card flex flex-col items-center bg-slate-50/30">
          <Pill size={48} className="mx-auto text-slate-300 mb-6" strokeWidth={1.5} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun traitement trouvé</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Commencez par ajouter votre premier traitement médical à votre inventaire.</p>
          <button className="hm-btn" onClick={() => {setToEdit(null); setIsFormOpen(true);}}>
            <Plus size={16} /> Ajouter un traitement
          </button>
        </div>
      )}
    </div>
  );
}

/** Placeholder élégant pour les autres vues */
function GenericPagePlaceholder({ view }) {
  const titles = {
    calendar: "Calendrier Thérapeutique",
    notifications: "Centre de Notifications",
    family: "Gestion du Mode Famille",
    groups: "Groupes Collaboratifs",
    settings: "Paramètres de Compte"
  };
  
  const icons = {
    calendar: <Calendar size={40} className="text-slate-300" strokeWidth={1.5} />,
    notifications: <Bell size={40} className="text-slate-300" strokeWidth={1.5} />,
    family: <Users size={40} className="text-slate-300" strokeWidth={1.5} />,
    groups: <Shield size={40} className="text-slate-300" strokeWidth={1.5} />,
    settings: <Settings size={40} className="text-slate-300" strokeWidth={1.5} />,
  };

  return (
    <div className="hm-card mt-6 p-12 sm:p-20 flex flex-col items-center justify-center text-center animate-fade-in border-dashed">
      <div className="mb-6">{icons[view]}</div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{titles[view]}</h2>
      <p className="text-slate-500 max-w-sm mb-6">Cette page est actuellement en cours de développement pour intégration future.</p>
    </div>
  );
}
