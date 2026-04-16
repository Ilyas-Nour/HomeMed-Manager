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
    { id: 'overview',    label: 'Accueil',  icon: (w) => <Gauge size={22} weight={w} /> },
    { id: 'medicaments', label: 'Médocs',   icon: (w) => <Pill size={22} weight={w} /> },
    { id: 'collaboration', label: 'Entraide', icon: (w) => <ChatCircle size={22} weight={w} /> },
    { id: 'groups',      label: 'Grouper',  icon: (w) => <Users size={22} weight={w} /> },
    { id: 'settings',    label: 'Réglages', icon: (w) => <Gear size={22} weight={w} /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] animate-fade-up">
      <div className="bg-white/95 backdrop-blur-3xl border-t border-slate-100/50 shadow-[0_-15px_40px_rgba(0,0,0,0.04)] pb-safe pt-3 px-4 h-auto flex items-center justify-between relative overflow-hidden rounded-t-[32px]">
        
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-100/50 rounded-full mt-1" />

        {navItems.map(item => {
          const isActive = currentView === (item.id === 'settings' && user?.role === 'admin' && currentView === 'admin' ? 'admin' : item.id);
          const weight = isActive ? "fill" : "bold";
          
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
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 relative group`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute inset-0 mx-auto w-12 h-12 bg-indigo-50/80 rounded-2xl -translate-y-1 animate-fade-in" />
              )}
              
              <div className={`transition-all duration-500 relative flex flex-col items-center ${
                isActive ? 'text-brand-blue -translate-y-1 scale-110' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <div className="relative">
                    {item.icon(weight)}
                    {item.id === 'collaboration' && collabBadge > 0 && (
                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                    )}
                </div>
                
                <span className={`text-[8px] font-black uppercase tracking-[0.15em] mt-1.5 transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-40'
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Bottom Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
