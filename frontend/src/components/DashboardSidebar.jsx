import React, { useState } from 'react';
import {
  LayoutDashboard, Pill,
  Settings, Users, FolderHeart, Shield,
  ChevronRight, ChevronDown, Check, UserPlus, X,
  ShoppingCart, Calendar
} from 'lucide-react';

/**
 * DashboardSidebar — Mobile-First · Product Precision
 */
export default function DashboardSidebar({
  currentView, setCurrentView,
  setSidebarOpen, user, activeProfileId, onProfileSwitch
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeProfile = user?.profils?.find(p => p.id === activeProfileId) || user?.profils?.[0];

  const menuGroups = [
    {
      id: 'main',
      label: 'Application Santé',
      items: [
        { id: 'overview',    label: 'Tableau de Bord', icon: <LayoutDashboard size={18} /> },
        { id: 'medicaments', label: 'Médicaments',     icon: <Pill size={18} /> },
        { id: 'planning',    label: 'Planning',        icon: <Calendar size={18} /> },
        { id: 'shopping',    label: 'Achats',          icon: <ShoppingCart size={18} /> },
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
          { id: 'admin', label: 'Console Admin', icon: <Shield size={18} className="text-emerald-500" /> }
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

      {/* ── Top: Logo & Close ── */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-slate-50">
        <button
          onClick={() => handleNav('overview')}
          className="flex items-center group"
        >
          <div className="h-10 flex items-center overflow-hidden">
            <img 
              src="/HomeMed-Logo.png" 
              alt="HomeMed Logo" 
              className="max-w-[140px] h-full object-contain transition-transform group-hover:scale-105" 
            />
          </div>
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="lg:hidden h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-6 pt-5">
        {menuGroups.map(group => (
          <div key={group.id} className="space-y-1">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              {group.label}
            </h3>
            {group.items.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group text-left
                    ${isActive
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-white/40 shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Profile Switcher ── */}
      <div className="p-3 border-t border-slate-100 relative">
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`w-full flex items-center gap-3 p-2.5 transition-all ${
            isProfileMenuOpen ? 'bg-slate-50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full bg-brand-blue text-white font-bold text-sm">
            {activeProfile?.nom?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate leading-none">{activeProfile?.nom || 'Chargement...'}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{activeProfile?.relation || 'Membre'}</p>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isProfileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-up">
              <div className="p-2 border-b border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight px-2 py-1">Changer de Profil</p>
              </div>
              <div className="max-h-52 overflow-y-auto no-scrollbar p-1.5 space-y-0.5">
                {user?.profils?.map(profil => (
                  <button
                    key={profil.id}
                    onClick={() => { onProfileSwitch(profil.id); setIsProfileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-2.5 transition-all text-left ${
                      activeProfileId === profil.id
                        ? 'bg-brand-blue/[0.04] text-brand-blue'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`h-7 w-7 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      activeProfileId === profil.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {profil.nom.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold flex-1 truncate">{profil.nom}</span>
                    {activeProfileId === profil.id && <Check size={13} className="shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-slate-50">
                <button
                  onClick={() => { handleNav('family'); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                >
                  <div className="h-7 w-7 flex items-center justify-center border border-dashed border-slate-200">
                    <UserPlus size={12} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-tight">Gérer la Famille</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
