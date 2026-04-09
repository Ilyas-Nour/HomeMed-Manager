import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, UserCircle, LogOut,
  ChevronDown, Command, Plus,
  Settings, PanelLeft,
  Pill, ArrowRight, MousePointer2, Users, X, AlertTriangle, BellRing
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * DashboardHeader — Hub de Notifications et Recherche
 */
export default function DashboardHeader({
  setSidebarOpen, searchTerm, setSearchTerm,
  isProfileOpen, setIsProfileOpen, setCurrentView, navigateToSettings,
  allMedicaments = [], onSelectMedicament
}) {
  const { user, logout } = useAuth();
  const { 
    notifications: contextNotifications, 
    removeNotification, 
    markAllAsRead,
    markAsRead, 
    clearAll 
  } = useNotifications();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  // 🔔 Logic pour les alertes Contextuelles (Rappels, etc.)
  const allNotifications = (contextNotifications || []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    icon: <BellRing size={12} />,
    color: 'text-brand-blue',
    bg: 'bg-brand-blue/10',
    read: n.read,
    timestamp: n.timestamp
  }));

  // Compter les non-lus
  const unreadCount = allNotifications.filter(n => n.read === false).length;
  const hasUnread = unreadCount > 0;

  return (
    <>
      <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-100 relative z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shrink-0"
          >
            <PanelLeft size={20} />
          </button>
          
          {/* 🔍 Desktop Search Bar */}
          <div className="relative group w-full max-w-md hidden lg:block" ref={searchRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2"><Search size={14} className="text-slate-400" /></div>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un médicament..."
              className="w-full h-10 pl-10 pr-12 bg-slate-50 border border-slate-100 text-sm font-medium focus:bg-white focus:border-brand-blue outline-none transition-all"
            />
            {showSuggestions && (searchTerm.trim() !== '' || quickActions.length > 0) && (
              <SuggestionsDropdown 
                meds={filteredMeds} 
                actions={quickActions} 
                selectedIdx={selectedIndex} 
                handleSelect={handleSelect} 
                setSelectedIndex={setSelectedIndex} 
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🔍 Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="lg:hidden h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all rounded-full hover:bg-slate-50"
          >
            <Search size={18} />
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all relative"
            >
              <Bell size={18} />
              {hasUnread && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded-full border-2 border-white animate-pulse z-10">
                  <span className="text-[7px] font-black leading-none">{unreadCount}</span>
                </div>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fade-up">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {allNotifications.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearAll(); }}
                        className="text-[9px] font-black uppercase tracking-widest text-brand-blue hover:text-slate-900 transition-colors"
                      >
                        Effacer Tout
                      </button>
                    )}
                    <button onClick={() => setIsNotificationsOpen(false)}><X size={14} className="text-slate-300" /></button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {allNotifications.length > 0 ? (
                    allNotifications.map(n => (
                      <div key={n.id} className={`p-5 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.read ? 'bg-brand-blue/5' : ''}`}>
                        <div className={`mt-1 h-7 w-7 flex items-center justify-center rounded-full ${n.bg} ${n.color} shadow-sm border border-white shrink-0`}>{n.icon}</div>
                        <div className="flex-1 pr-8">
                          <div className="flex items-center justify-between mb-0.5">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{n.title}</p>
                             <p className="text-[8px] font-bold text-slate-300">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <p className={`text-sm leading-tight transition-colors ${!n.read ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{n.message}</p>
                        </div>
                        
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {!n.read && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="p-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-full transition-all"
                              title="Marquer comme lu"
                            >
                              <ArrowRight size={12} strokeWidth={3} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                            className="p-1.5 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                            title="Supprimer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-slate-300">
                      <Bell size={32} className="mx-auto opacity-20 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aucune notification aujourd'hui</p>
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
              className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-sm hover:scale-105 transition-all"
            >
              {user?.name?.charAt(0).toUpperCase() || 'H'}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fade-up">
                 <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email}</p>
                 </div>
                 <button onClick={() => navigateToSettings('profile')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3">
                    <UserCircle size={14} /> Mon Compte
                 </button>
                 <button onClick={() => navigateToSettings(null)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3">
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

      {/* 🔍 Mobile Search Overlay */}
      {showMobileSearch && (
        <div 
          className="fixed inset-0 bg-white z-[60] flex flex-col lg:hidden animate-fade-in"
          ref={mobileSearchRef}
        >
          <div className="h-14 sm:h-16 flex items-center px-4 gap-3 border-b border-slate-100 bg-white">
            <button 
              onClick={() => setShowMobileSearch(false)} 
              className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all rounded-full"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
            <div className="flex-1 relative flex items-center">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un médicament..."
                className="w-full h-10 bg-transparent border-none outline-none text-sm font-medium"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-slate-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {(searchTerm.trim() !== '' || quickActions.length > 0) && (
              <div className="py-2">
                <SuggestionsDropdown 
                  meds={filteredMeds} 
                  actions={quickActions} 
                  selectedIdx={selectedIndex} 
                  handleSelect={handleSelect} 
                  setSelectedIndex={setSelectedIndex}
                  isInline={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const SuggestionsDropdown = ({ meds, actions, selectedIdx, handleSelect, setSelectedIndex, isInline = false }) => (
  <div className={`${isInline ? 'bg-transparent' : 'absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl'} overflow-hidden z-[70] animate-fade-up`}>
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
