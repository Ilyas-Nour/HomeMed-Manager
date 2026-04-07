import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, UserCircle, LogOut,
  ChevronDown, Command, Plus,
  Settings, PanelLeft,
  Pill, ArrowRight, MousePointer2, Users, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * DashboardHeader — Mobile-First · Product Precision
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
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

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


  return (
    <>
      <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-100 relative z-[60]">

        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 transition-all shrink-0"
          >
            <PanelLeft size={20} />
          </button>

          {/* Desktop search */}
          <div className="relative group w-full max-w-md hidden sm:block" ref={searchRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={14} className={`transition-colors ${showSuggestions ? 'text-brand-blue' : 'text-slate-400'}`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); setSelectedIndex(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher médicament, action..."
              className="w-full h-9 pl-10 pr-12 bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-0 outline-none transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm pointer-events-none">
              <Command size={10} strokeWidth={3} /><span>K</span>
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

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-3">

          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="sm:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          <button className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all relative">
            < Bell size={18} strokeWidth={2} />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-green border border-white" />
          </button>

          <div className="h-4 w-px bg-slate-100 hidden sm:block" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 sm:pr-2 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="h-8 w-8 bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name?.split(' ')[0] || 'Utilisateur'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Membre Famille</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-lg py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setCurrentView('settings'); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-all"
                  >
                    <UserCircle size={16} /><span>Mon Profil</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('settings'); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-all"
                  >
                    <Settings size={16} /><span>Paramètres</span>
                  </button>
                  <div className="h-px bg-slate-50 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all font-medium"
                  >
                    <LogOut size={16} /><span>Déconnexion</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile search overlay ── */}
      {showMobileSearch && (
        <div className="sm:hidden fixed inset-0 z-[80] bg-white flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100" ref={mobileSearchRef}>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un médicament..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-brand-blue/30 text-sm outline-none text-slate-900"
              />
            </div>
            <button
              onClick={() => { setShowMobileSearch(false); setSearchTerm(''); }}
              className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile suggestions list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMeds.length === 0 && searchTerm.trim() === '' && (
              <div className="text-center py-16 text-slate-300">
                <Search size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">Tapez pour rechercher</p>
              </div>
            )}
            {filteredMeds.map((med) => (
              <button
                key={med.id}
                onClick={() => { handleSelect(med); setShowMobileSearch(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white border border-slate-100 shadow-sm hover:border-brand-blue/20 transition-all text-left"
              >
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-blue">
                  <Pill size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{med.nom}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{med.type} · Stock: {med.quantite}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))}
            {filteredMeds.length === 0 && searchTerm.trim() !== '' && (
              <div className="text-center py-12 text-slate-300">
                <p className="text-sm font-medium text-slate-400">Aucun résultat pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const SuggestionsDropdown = ({ meds, actions, selectedIdx, handleSelect, setSelectedIndex }) => (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl overflow-hidden z-[70]">
    <div className="p-2 space-y-1">
      {meds.length > 0 && (
        <div className="px-3 py-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Médicaments</p>
          <div className="mt-2 space-y-1">
            {meds.map((med, idx) => (
              <button
                key={med.id}
                onClick={() => handleSelect(med)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between p-2 transition-all ${selectedIdx === idx ? 'bg-brand-blue/5 text-brand-blue' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 flex items-center justify-center border ${selectedIdx === idx ? 'bg-white border-brand-blue/20' : 'bg-slate-50 border-slate-100'}`}>
                    <Pill size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-none">{med.nom}</p>
                    <p className="text-[10px] font-medium opacity-60 mt-0.5">{med.type}</p>
                  </div>
                </div>
                <ArrowRight size={12} className={`transition-transform ${selectedIdx === idx ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {actions.length > 0 && (
        <div className={`px-3 py-2 ${meds.length > 0 ? 'border-t border-slate-50' : ''}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Actions</p>
          <div className="mt-2 space-y-1">
            {actions.map((action, idx) => {
              const actualIdx = idx + meds.length;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  onMouseEnter={() => setSelectedIndex(actualIdx)}
                  className={`w-full flex items-center gap-3 p-2 transition-all ${selectedIdx === actualIdx ? 'bg-brand-blue/5 text-brand-blue' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className={`h-8 w-8 flex items-center justify-center border ${selectedIdx === actualIdx ? 'bg-white border-brand-blue/20' : 'bg-slate-50 border-slate-100'}`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-bold">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>

    <div className="bg-slate-50 px-4 py-2 flex items-center gap-4 border-t border-slate-100">
      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
        <MousePointer2 size={10} /> Sélectionner
      </span>
      <span className="text-[9px] font-bold text-slate-400 uppercase">
        ESC pour fermer
      </span>
    </div>
  </div>
);
