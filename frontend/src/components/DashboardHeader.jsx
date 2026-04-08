import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, UserCircle, LogOut,
  ChevronDown, Command, Plus,
  Settings, PanelLeft,
  Pill, ArrowRight, MousePointer2, Users, X, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * DashboardHeader — Hub de Notifications et Recherche
 */
export default function DashboardHeader({
  setSidebarOpen, searchTerm, setSearchTerm,
  isProfileOpen, setIsProfileOpen, setCurrentView,
  allMedicaments = [], onSelectMedicament
}) {
  const { user, logout } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const notifRef = useRef(null);

  const safeMeds = Array.isArray(allMedicaments) ? allMedicaments : [];

  const filteredMeds = searchTerm.trim() === '' ? [] : safeMeds.filter(med =>
    med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const quickActions = [
    { id: 'family', label: 'Voir ma famille', icon: <Users size={14} />, view: 'family' },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={14} />, view: 'settings' },
  ].filter(action => searchTerm.trim() === '' || action.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const suggestions = [...filteredMeds, ...quickActions];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowMobileSearch(false);
    }
  };

  const handleSelect = (item) => {
    if (item.nom) {
      onSelectMedicament(item);
      setSearchTerm(item.nom);
    } else if (item.view) {
      setCurrentView(item.view);
    }
    setShowSuggestions(false);
    setShowMobileSearch(false);
    setSelectedIndex(-1);
  };

  // Logic pour les alertes réelles
  const notifications = safeMeds.reduce((acc, med) => {
    if (med.quantite < 5) {
      acc.push({
        id: `stock-${med.id}`,
        title: 'Stock Critique',
        message: `Plus que ${med.quantite} unité(s) de ${med.nom}.`,
        icon: <AlertTriangle size={12} />,
        color: 'text-red-500',
        bg: 'bg-red-50'
      });
    }
    if (med.date_expiration) {
      const diff = Math.ceil((new Date(med.date_expiration) - new Date()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 30) {
        acc.push({
          id: `exp-${med.id}`,
          title: 'Peremption Proche',
          message: `${med.nom} expire dans ${diff} jours.`,
          icon: <Pill size={12} />,
          color: 'text-amber-500',
          bg: 'bg-amber-50'
        });
      }
    }
    return acc;
  }, []);

  const hasUnread = notifications.length > 0 && !notificationsRead;

  return (
    <>
      <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-100 relative z-[60]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 transition-all"><PanelLeft size={20} /></button>
          
          <div className="relative group w-full max-w-md hidden sm:block" ref={searchRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2"><Search size={14} className="text-slate-400" /></div>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher..."
              className="w-full h-9 pl-10 pr-12 bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-blue outline-none transition-all"
            />
            {showSuggestions && (searchTerm.trim() !== '' || quickActions.length > 0) && (
              <SuggestionsDropdown meds={filteredMeds} actions={quickActions} selectedIdx={selectedIndex} handleSelect={handleSelect} setSelectedIndex={setSelectedIndex} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all relative"
            >
              <Bell size={18} />
              {hasUnread && <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fade-up">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Alertes Médicales</h3>
                  <button onClick={() => setIsNotificationsOpen(false)}><X size={14} className="text-slate-300" /></button>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-5 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className={`mt-1 h-7 w-7 flex items-center justify-center rounded-full ${n.bg} ${n.color} shadow-sm border border-white`}>{n.icon}</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{n.title}</p>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue leading-tight transition-colors">{n.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-slate-300">
                      <Bell size={32} className="mx-auto opacity-20 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Tout est sous contrôle</p>
                      <p className="text-[9px] font-bold opacity-60 mt-1">Aucune alerte de stock ou péremption.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-sm hover:scale-105 transition-all"
            >
              {user?.name?.charAt(0).toUpperCase() || 'H'}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fade-up">
                 <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email}</p>
                 </div>
                 <button onClick={() => { setCurrentView('settings'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3">
                    <UserCircle size={14} /> Mon Compte
                 </button>
                 <button onClick={() => { setCurrentView('settings'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3">
                    <Settings size={14} /> Paramètres
                 </button>
                 <div className="h-px bg-slate-50 my-1" />
                 <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3">
                   <LogOut size={14} /> Déconnexion
                 </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const SuggestionsDropdown = ({ meds, actions, selectedIdx, handleSelect, setSelectedIndex }) => (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl overflow-hidden z-[70]">
    <div className="p-2 space-y-1">
      {meds.map((med, idx) => (
        <button key={med.id} onClick={() => handleSelect(med)} onMouseEnter={() => setSelectedIndex(idx)} className={`w-full flex items-center gap-3 p-2 transition-all ${selectedIdx === idx ? 'bg-brand-blue/5 text-brand-blue' : 'hover:bg-slate-50 text-slate-700'}`}>
          <div className="h-7 w-7 bg-slate-50 flex items-center justify-center border border-slate-100"><Pill size={14} className="text-slate-400" /></div>
          <span className="text-xs font-bold">{med.nom}</span>
        </button>
      ))}
      {meds.length > 0 && <div className="h-px bg-slate-50 my-1" />}
      {actions.map((action, idx) => (
        <button key={action.id} onClick={() => handleSelect(action)} onMouseEnter={() => setSelectedIndex(idx + meds.length)} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 text-slate-700">
          <div className="h-7 w-7 bg-slate-50 flex items-center justify-center border border-slate-100">{action.icon}</div>
          <span className="text-xs font-bold">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);
