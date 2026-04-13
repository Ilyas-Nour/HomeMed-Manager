import {
  LayoutDashboard, Pill, 
  Calendar, ShoppingCart, 
  Settings, Users, ShieldCheck, MessageCircle
} from 'lucide-react';

/**
 * MobileBottomNav — Product Precision
 * Minimalist glassmorphism design for modern mobile UX.
 */
export default function MobileBottomNav({ currentView, setCurrentView, user, collabBadge = 0 }) {
  const navItems = [
    { id: 'overview',    label: 'Accueil',  icon: <LayoutDashboard size={20} /> },
    { id: 'medicaments', label: 'Médocs',   icon: <Pill size={20} /> },
    { id: 'collaboration', label: 'Entraide', icon: <MessageCircle size={20} /> },
    { id: 'groups',      label: 'Grouper',  icon: <Users size={20} /> },
    { id: 'settings',    label: 'Paramètres', icon: <Settings size={20} /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] h-16 flex items-center justify-around px-2 relative overflow-hidden">
        
        {/* Subtle top indicator/accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-50" />

        {navItems.map(item => {
          const isActive = currentView === (item.id === 'settings' && user?.role === 'admin' && currentView === 'admin' ? 'admin' : item.id);
          // Special case for 'Settings/Admin' toggle on mobile
          const handleClick = () => {
            if (item.id === 'settings' && user?.role === 'admin') {
               // On toggle between settings and admin if possible, or just go to settings
               setCurrentView('settings');
            } else {
               setCurrentView(item.id);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`transition-transform duration-300 relative ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {item.icon}
                {item.id === 'collaboration' && collabBadge > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-brand-blue rounded-full border-2 border-white shadow-sm" />
                )}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-brand-blue rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
