import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, Pill, Bell, Users, Settings,
  LogOut, Search, Plus, Menu, X, Activity,
  AlertTriangle, ChevronDown, Calendar, Database, Clock
} from 'lucide-react';
import MedicamentCard from '../components/MedicamentCard';
import MedicamentForm from '../components/MedicamentForm';
import MedicamentDetailsModal from '../components/MedicamentDetailsModal';
import Toast from '../components/Toast';
import logo from '/HomeMed-Logo.png';
import logoSmall from '/HomeMed-Logo-Small.png';

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
  
  // Navigation & Filtering
  const [currentView, setCurrentView] = useState('dashboard');
  const [metricFilter, setMetricFilter] = useState('all'); // 'all', 'actifs', 'alertes'
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Notifications logic
  const [notifiedRappels, setNotifiedRappels] = useState(new Set());

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

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/profils/${profilActif.id}/medicaments`);
      setMedicaments(res.data.medicaments ?? []);
    } catch (e) { console.error('Erreur chargement médicaments', e); }
    finally { setLoading(false); }
  };

  const fetchRappels = async () => {
    try {
      const res = await api.get(`/profils/${profilActif.id}/timeline`);
      setRappelsDuJour(res.data);
    } catch (e) { console.error('Erreur chargement timeline', e); }
  };

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

  const stats = useMemo(() => ({
    total:   medicaments.length,
    actifs:  medicaments.length > 0 ? medicaments.length : 0, 
    alertes: medicaments.filter(m => m.stock_faible || m.expire).length,
  }), [medicaments]);

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
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img src={logo} alt="HomeMed" className="h-8 object-contain shrink-0" />
          </div>
          {/* Logo icon representation when collapsed */}
          <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-full opacity-100' : 'w-0 opacity-0 hidden'}`}>
             <img src={logoSmall} alt="HM" className="h-8 object-contain" />
          </div>
        </div>

        <div className={`px-4 pt-6 pb-4 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
          <p className="hm-section-title mb-4">Profils de santé</p>
          <div className="relative group">
            <select
              value={profilActif?.id || ''}
              onChange={e => changerProfil(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 appearance-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              {user.profils?.map(p => (
                <option key={p.id} value={p.id}>{p.nom} ({p.relation})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-600 transition-colors pointer-events-none" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className={`hm-section-title mb-2 px-1 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Menu Principal</p>
          <button onClick={() => setCurrentView('dashboard')} className={`hm-nav ${currentView === 'dashboard' ? 'active' : ''}`} title="Tableau de bord">
            <LayoutDashboard size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Tableau de bord</span>
          </button>
          <button onClick={() => { setCurrentView('dashboard'); setMetricFilter('all'); }} className="hm-nav" title="Traitements">
            <Pill size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Traitements</span>
          </button>
          <button onClick={() => setCurrentView('calendar')} className={`hm-nav ${currentView === 'calendar' ? 'active' : ''}`} title="Calendrier">
            <Calendar size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Calendrier</span>
          </button>
          
          <div className="pt-6">
            <p className={`hm-section-title mb-2 px-1 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Système</p>
            <button onClick={() => setCurrentView('notifications')} className={`hm-nav ${currentView === 'notifications' ? 'active' : ''}`} title="Notifications">
              <Bell size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Notifications</span>
            </button>
            <button onClick={() => setCurrentView('family')} className={`hm-nav ${currentView === 'family' ? 'active' : ''}`} title="Mode Famille">
              <Users size={18} className="shrink-0" /> <span className={`transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Mode Famille</span>
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

          <div className="ml-auto flex items-center gap-4">
            <button className="hidden sm:flex relative p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-all">
              <Bell size={18} />
              {stats.alertes > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
            </button>
            <button className="hm-btn" onClick={() => {setToEdit(null); setIsFormOpen(true);}}>
              <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar animate-fade-in relative z-0">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
            
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Bonjour, {profilActif?.nom} 👋</h1>
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest opacity-80">Votre tableau de bord santé</p>
              </div>
            </div>

            {/* Alert Banner */}
            {stats.alertes > 0 && (
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

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <button className="text-left w-full focus:outline-none" onClick={() => { setCurrentView('dashboard'); setMetricFilter('all'); document.getElementById('inventaire_section')?.scrollIntoView({behavior:'smooth'}) }}>
                 <MetricCard label="Médicaments" value={stats.total} icon={<Database size={20} />} color="navy" active={metricFilter === 'all'} />
              </button>
              <button className="text-left w-full focus:outline-none" onClick={() => { setCurrentView('dashboard'); setMetricFilter('actifs'); document.getElementById('inventaire_section')?.scrollIntoView({behavior:'smooth'}) }}>
                 <MetricCard label="Actifs" value={stats.actifs} icon={<Activity size={20} />} color="emerald" active={metricFilter === 'actifs'} />
              </button>
              <button className="text-left w-full focus:outline-none" onClick={() => { setCurrentView('dashboard'); setMetricFilter('alertes'); document.getElementById('inventaire_section')?.scrollIntoView({behavior:'smooth'}) }}>
                 <MetricCard label="Alertes" value={stats.alertes} icon={<AlertTriangle size={20} />} color="amber" active={metricFilter === 'alertes'} />
              </button>
            </div>
            
            {/* View Switching */}
            {currentView !== 'dashboard' ? (
              <GenericPagePlaceholder view={currentView} />
            ) : (
              <>
                {/* Phase 2: Daily Timeline Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="hm-section-title flex items-center gap-2">
                        <Clock size={14} className="text-emerald-500" />
                        À prendre aujourd'hui
                    </h2>
                    <p className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-tighter">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="h-[1px] flex-1 mx-6 bg-slate-100 hidden sm:block" />
              </div>

              {rappelsDuJour.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {rappelsDuJour.map(rapp => (
                    <div key={rapp.id} className={`p-4 rounded-[28px] border transition-all duration-300 flex items-center gap-4 ${rapp.pris ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100'}`}>
                       <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 border transition-colors ${rapp.pris ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                          {rapp.pris ? <Plus size={20} className="rotate-45" /> : <Clock size={18} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${rapp.pris ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{rapp.nom}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50">{rapp.moment}</span>
                             <span className="text-[10px] font-bold text-slate-300 italic">{rapp.heure.substring(0, 5)}</span>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleTogglePrise(rapp.id, rapp.pris)}
                         className={`h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${rapp.pris ? 'text-slate-400 bg-slate-100 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95'}`}
                       >
                         {rapp.pris ? 'Annuler' : 'Valider'}
                       </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center hm-card flex flex-col items-center border-dashed bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-500">Aucun rappel pour aujourd'hui</p>
                </div>
              )}
            </div>

            {/* Items Grid */}
            <div id="inventaire_section" className="space-y-6 pt-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h2 className="hm-section-title flex items-center gap-2">
                  <Pill size={14} className="text-emerald-500" />
                  Inventaire médical
                </h2>
                <span className="hm-badge hm-badge-slate">
                  {filtered.length} Traitements
                </span>
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
              </>
            )}
            
          </div>
        </main>
      </div>

      <MedicamentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        profilId={profilActif?.id}
        medicamentToEdit={toEdit}
        onSuccess={() => { fetchMeds(); fetchRappels(); }}
        showToast={showToast}
      />

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

/** Sous-composant Carte de Statistique */
function MetricCard({ label, value, icon, color, active }) {
  const colors = {
    navy: "text-[#00416A] bg-slate-50 border-slate-100 group-hover:border-[#00416A] group-hover:shadow-md",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:border-emerald-500 group-hover:shadow-md group-hover:shadow-emerald-500/10",
    amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:border-amber-500 group-hover:shadow-md group-hover:shadow-amber-500/10",
  };

  return (
    <div className={`hm-card p-6 flex flex-col group transition-all duration-300 ${active ? 'ring-2 ring-slate-900 border-transparent shadow-md' : 'hover:-translate-y-1'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-4xl font-bold tracking-tight text-slate-900 group-hover:scale-110 transition-transform duration-500 origin-right">{value}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-current transition-all duration-1000 ease-out" style={{ width: value > 0 ? '40%' : '0%', color: color === 'navy' ? '#00416A' : color === 'emerald' ? '#10b981' : '#f59e0b' }} />
        </div>
      </div>
    </div>
  );
}

/** Placeholder élégant pour les autres vues */
function GenericPagePlaceholder({ view }) {
  const titles = {
    calendar: "Calendrier Thérapeutique",
    notifications: "Centre de Notifications",
    family: "Gestion du Mode Famille",
    settings: "Paramètres de Compte"
  };
  
  const icons = {
    calendar: <Calendar size={40} className="text-slate-300" strokeWidth={1.5} />,
    notifications: <Bell size={40} className="text-slate-300" strokeWidth={1.5} />,
    family: <Users size={40} className="text-slate-300" strokeWidth={1.5} />,
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
