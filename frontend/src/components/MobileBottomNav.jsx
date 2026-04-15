import {
  Gauge, Pill, 
  ChatCircle, Users, 
  Gear
} from '@phosphor-icons/react';

/**
 * MobileBottomNav — Product Precision
 * Minimalist glassmorphism design for modern mobile UX.
 */
export default function MobileBottomNav({ currentView, setCurrentView, user, collabBadge = 0 }) {
  const navItems = [
    { id: 'overview',    label: 'Accueil',  icon: <Gauge size={20} weight="bold" /> },
    { id: 'medicaments', label: 'Médocs',   icon: <Pill size={20} weight="bold" /> },
    { id: 'collaboration', label: 'Entraide', icon: <ChatCircle size={20} weight="bold" /> },
    { id: 'groups',      label: 'Grouper',  icon: <Users size={20} weight="bold" /> },
    { id: 'settings',    label: 'Paramètres', icon: <Gear size={20} weight="bold" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[100] px-6">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-18 py-3 rounded-[32px] flex items-center justify-around relative overflow-hidden ring-1 ring-white/5">
        
        {navItems.map(item => {
          const isActive = currentView === (item.id === 'settings' && user?.role === 'admin' && currentView === 'admin' ? 'admin' : item.id);
          const handleClick = () => {
            if (item.id === 'settings' && user?.role === 'admin') {
               setCurrentView('settings');
            } else {
               setCurrentView(item.id);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 relative ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`transition-all duration-500 relative ${isActive ? 'scale-125 -translate-y-1' : 'group-hover:scale-110'}`}>
                {item.icon}
                {item.id === 'collaboration' && collabBadge > 0 && (
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                )}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-[0.2em] mt-2 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 scale-90'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute bottom-0 w-5 h-1 bg-brand-blue rounded-full shadow-[0_0_12px_rgba(79,70,229,0.5)] animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
