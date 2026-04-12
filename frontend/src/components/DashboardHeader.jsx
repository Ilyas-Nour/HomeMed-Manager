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
 * DashboardHeader — Sleek SaaS Design
 * Elevated navigation, precision search, and refined notifications.
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
    clearAll,
    pendingIds
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
    { id: 'family', label: 'Ma Famille', icon: <Users size={14} />, view: 'family' },
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

  // 🔔 Logic pour les alertes Contextuelles
  const allNotifications = (contextNotifications || []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    icon: <BellRing size={16} />,
    color: 'text-brand-blue',
    bg: 'bg-indigo-50',
    read: n.read,
    timestamp: n.timestamp
  }));

  const unreadCount = allNotifications.filter(n => n.read === false).length;
  const hasUnread = unreadCount > 0;

  return (
    <>
      <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-100 relative z-30">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden h-11 w-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-xl shrink-0"
          >
            <PanelLeft size={22} />
          </button>
          
          {/* 🔍 Desktop Search Bar */}
          <div className="relative group w-full max-w-md hidden lg:block" ref={searchRef}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher..."
              className="w-full h-11 pl-12 pr-12 bg-slate-50/50 border border-slate-100/80 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none opacity-40">
                <Command size={14} />
                <span className="text-xs font-black tracking-widest">K</span>
            </div>
            
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

        <div className="flex items-center gap-3">
          {/* 🔍 Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50"
          >
            <Search size={20} />
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-indigo-50 text-brand-blue' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Bell size={20} />
              {hasUnread && (
                <div className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-brand-blue text-white rounded-lg border-2 border-white shadow-[0_0_12px_rgba(79,70,229,0.4)] z-10">
                  <span className="text-[8px] font-black leading-none">{unreadCount}</span>
                </div>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 w-full sm:w-[360px] h-[100dvh] sm:h-auto bg-white sm:border sm:border-slate-100 sm:rounded-3xl sm:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] overflow-hidden z-[100] animate-fade-up">
                {/* Header du menu */}
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 sticky top-0 z-10 backdrop-blur-sm">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">Notifications</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{unreadCount} non lues</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {allNotifications.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearAll(); }}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-slate-900 transition-colors"
                      >
                        Effacer
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotificationsOpen(false)} 
                      className="h-10 w-10 sm:h-8 sm:w-8 flex items-center justify-center rounded-xl sm:rounded-full bg-white sm:bg-transparent border border-slate-100 sm:border-none shadow-sm sm:shadow-none transition-all"
                    >
                      <X size={20} className="text-slate-400 sm:text-slate-300" />
                    </button>
                  </div>
                </div>

                {/* Liste des notifications */}
                <div className="h-[calc(100dvh-80px)] sm:max-h-[440px] overflow-y-auto no-scrollbar py-2 pb-24 sm:pb-2">
                  {allNotifications.length > 0 ? (
                    allNotifications.map(n => (
                      <div key={n.id} className={`mx-2 my-1 p-4 rounded-2xl flex items-start gap-4 hover:bg-indigo-50/30 transition-all cursor-pointer group relative ${!n.read ? 'bg-indigo-50/20' : 'opacity-80'}`}>
                        <div className={`mt-0.5 h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0 ${!n.read ? 'text-brand-blue' : 'text-slate-400'}`}>
                           {n.icon}
                        </div>
                        <div className="flex-1 pr-10">
                          <div className="flex items-center justify-between mb-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.title}</p>
                             <p className="text-[9px] font-bold text-slate-300">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <p className={`text-sm leading-snug tracking-tight transition-colors ${!n.read ? 'font-black text-slate-900' : 'font-medium text-slate-500'}`}>{n.message}</p>
                        </div>
                        
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2 sm:gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
                          {!n.read && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              disabled={pendingIds.has(n.id)}
                              className={`h-9 w-9 sm:h-8 sm:w-8 bg-brand-blue text-white rounded-xl sm:rounded-lg shadow-lg shadow-brand-blue/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pendingIds.has(n.id) ? 'opacity-50 cursor-not-allowed scale-90' : ''}`}
                              title="Lu"
                            >
                              <ArrowRight size={16} strokeWidth={3} className="sm:size-14" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                            disabled={pendingIds.has(n.id)}
                            className={`h-9 w-9 sm:h-8 sm:w-8 bg-white text-slate-400 hover:text-rose-600 border border-slate-100 rounded-xl sm:rounded-lg shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pendingIds.has(n.id) ? 'opacity-50 cursor-not-allowed scale-90' : ''}`}
                            title="Supprimer"
                          >
                            <X size={16} className="sm:size-14" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 sm:py-20 text-center">
                      <div className="h-20 w-20 sm:h-16 sm:w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <BellRing size={32} className="text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Tout est à jour</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block" />

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 rounded-2xl border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all pr-3"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-900/10">
                {user?.name?.charAt(0).toUpperCase() || 'H'}
              </div>
              <div className="hidden lg:block text-left">
                 <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[100px]">{user?.name.split(' ')[0]}</p>
                 <ChevronDown size={12} className={`text-slate-400 mt-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-4 w-60 bg-white border border-slate-100 rounded-3xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] py-2 z-50 animate-fade-up">
                 <div className="px-5 py-4 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black text-slate-900 truncate tracking-tight">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email}</p>
                 </div>
                 <div className="p-1.5 space-y-0.5">
                    <button onClick={() => navigateToSettings('profile')} className="w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-indigo-50/50 hover:text-brand-blue flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                           <UserCircle size={16} /> Compte
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                    <button onClick={() => navigateToSettings(null)} className="w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-indigo-50/50 hover:text-brand-blue flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                            <Settings size={16} /> Réglages
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                 </div>
                 <div className="h-px bg-slate-50 my-1 mx-4" />
                 <div className="p-1.5">
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-all">
                      <LogOut size={16} /> Déconnexion
                    </button>
                 </div>
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
          <div className="h-16 flex items-center px-4 gap-4 border-b border-slate-100 bg-white">
            <button 
              onClick={() => setShowMobileSearch(false)} 
              className="h-11 w-11 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all rounded-xl"
            >
              <X size={24} />
            </button>
            <div className="flex-1 relative flex items-center">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                className="w-full h-11 bg-transparent border-none outline-none text-base font-bold text-slate-900"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-slate-500 rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {(searchTerm.trim() !== '' || quickActions.length > 0) && (
              <div className="py-4 px-4">
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
  <div className={`${isInline ? 'bg-transparent' : 'absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] p-2'} overflow-hidden z-[70] animate-fade-up`}>
    <div className="space-y-1">
      {meds.map((med, idx) => (
        <button key={med.id} onClick={() => handleSelect(med)} onMouseEnter={() => setSelectedIndex(idx)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${selectedIdx === idx ? 'bg-indigo-50 text-brand-blue' : 'hover:bg-slate-50 text-slate-700'}`}>
          <div className="h-10 w-10 bg-white flex items-center justify-center rounded-lg border border-slate-100 shadow-sm"><Pill size={18} className="text-slate-400" /></div>
          <div className="text-left">
            <p className="text-sm font-black tracking-tight">{med.nom}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.dosage}</p>
          </div>
        </button>
      ))}
      {meds.length > 0 && actions.length > 0 && <div className="h-px bg-slate-50 my-2 mx-2" />}
      {actions.map((action, idx) => (
        <button key={action.id} onClick={() => handleSelect(action)} onMouseEnter={() => setSelectedIndex(idx + meds.length)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${selectedIdx === (idx + meds.length) ? 'bg-indigo-50 text-brand-blue' : 'hover:bg-slate-50 text-slate-700'}`}>
          <div className="h-10 w-10 bg-white flex items-center justify-center rounded-lg border border-slate-100 shadow-sm transition-colors text-slate-400 group-hover:text-brand-blue">{action.icon}</div>
          <span className="text-sm font-black uppercase tracking-widest text-[11px]">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);
