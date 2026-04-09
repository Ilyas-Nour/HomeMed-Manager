import React, { useState } from 'react';
import {
  LayoutDashboard, Pill,
  Settings, Users, FolderHeart,
  ChevronRight, ChevronDown, Check, UserPlus, X,
  ShoppingCart, Calendar
} from 'lucide-react';

/**
 * DashboardSidebar — Sleek SaaS Design
 */
export default function DashboardSidebar({
  currentView, setCurrentView, navigateToSettings,
  setSidebarOpen, user, activeProfileId, onProfileSwitch
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeProfile = user?.profils?.find(p => p.id === activeProfileId) || user?.profils?.[0];

  const menuGroups = [
    {
      id: 'main',
      label: 'Santé & Suivi',
      items: [
        { id: 'overview',    label: 'Tableau de Bord', icon: <LayoutDashboard size={18} /> },
        { id: 'medicaments', label: 'Médicaments',     icon: <Pill size={18} /> },
        { id: 'planning',    label: 'Planning',        icon: <Calendar size={18} /> },
        { id: 'shopping',    label: 'Achats & Stocks', icon: <ShoppingCart size={18} /> },
        { id: 'family',      label: 'Famille',         icon: <Users size={18} /> },
        { id: 'groups',      label: 'Groupes',         icon: <FolderHeart size={18} /> },
      ]
    },
    {
      id: 'config',
      label: 'Configuration',
      items: [
        { id: 'settings', label: 'Paramètres', icon: <Settings size={18} /> },
        ...(user?.role === 'admin' ? [
          { id: 'admin', label: 'Panneau Admin', icon: <Settings size={18} className="text-brand-blue" /> }
        ] : []),
      ]
    }
  ];

  const handleNav = (id) => {
    setCurrentView(id);
    setSidebarOpen && setSidebarOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-100 relative z-50">

      {/* ── Top: Logo (Aligned with Header Row) ── */}
      <div className="h-16 sm:h-20 flex items-center px-6 shrink-0">
        <button
          onClick={() => handleNav('overview')}
          className="flex items-center group"
        >
          <div className="h-10 flex items-center px-1">
            <img 
              src="/HomeMed-Logo.png" 
              alt="HomeMed Logo" 
              className="max-w-[140px] h-full object-contain transition-transform group-hover:rotate-1" 
            />
          </div>
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="lg:hidden h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-full shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Nav (Aligned with Page Content Baseline) ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-8 pt-2">
        {menuGroups.map(group => (
          <div key={group.id} className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">
              {group.label}
            </h3>
            {group.items.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'settings') navigateToSettings(null);
                    else if (item.id === 'admin') window.location.href = '/admin';
                    else handleNav(item.id);
                  }}
                  className={`
                    w-full group flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all relative
                    ${isActive
                      ? 'bg-indigo-50/50 text-brand-blue'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  {isActive && (
                     <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-blue rounded-r-full shadow-[2px_0_8px_rgba(79,70,229,0.3)]"></div>
                  )}
                  <div className={`mr-4 transition-colors ${isActive ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-left tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Profile Switcher ── */}
      <div className="p-4 border-t border-slate-50 relative">
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
            isProfileMenuOpen ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50'
          }`}
        >
          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20">
            <span className="font-black text-sm">{activeProfile?.nom?.charAt(0).toUpperCase() || 'P'}</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-black text-slate-900 truncate tracking-tight">{activeProfile?.nom || 'Chargement...'}</p>
            <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-wider">{activeProfile?.relation || 'Membre'}</p>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isProfileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[1px]" onClick={() => setIsProfileMenuOpen(false)} />
            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-50 animate-fade-up overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Changer de Profil</p>
              </div>
              <div className="max-h-52 overflow-y-auto no-scrollbar space-y-1">
                {user?.profils?.map(profil => (
                  <button
                    key={profil.id}
                    onClick={() => { onProfileSwitch(profil.id); setIsProfileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                      activeProfileId === profil.id
                        ? 'bg-indigo-50/50 text-brand-blue'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`h-8 w-8 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all ${
                      activeProfileId === profil.id ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {profil.nom.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold flex-1 truncate">{profil.nom}</span>
                    {activeProfileId === profil.id && <div className="h-1.5 w-1.5 rounded-full bg-brand-blue" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => { handleNav('family'); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all text-left"
                >
                  <div className="h-8 w-8 flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                    <UserPlus size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight">Gérer la Famille</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
