import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { BellRing, X, CheckCircle2, AlarmClock } from 'lucide-react';

export default function SoundToast() {
  const { activePopup, dismissPopup, markPris } = useNotifications();

  useEffect(() => {
    if (activePopup) {
      const timer = setTimeout(() => {
        dismissPopup();
      }, 30000); // 30 secondes pour laisser le temps d'agir
      return () => clearTimeout(timer);
    }
  }, [activePopup, dismissPopup]);

  if (!activePopup) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4 sm:px-0 animate-fade-down">
      <div className="relative bg-white/80 backdrop-blur-xl border border-white shadow-2xl overflow-hidden group">
        {/* Animated top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue/20">
          <div className="h-full bg-brand-blue animate-progress" style={{ animationDuration: '30s', animationTimingFunction: 'linear' }}></div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-5">
            <div className="mt-1 h-12 w-12 bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-brand-blue/20 shrink-0">
              <AlarmClock size={24} className="animate-bounce-slow" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Alerte Médicale</h4>
                <button 
                  onClick={dismissPopup}
                  className="p-1 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-base font-bold text-slate-900 leading-tight">
                Il est l'heure : <span className="text-brand-blue">{activePopup.medicament}</span>
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                 <div className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   Planifié à {activePopup.heure.substring(0, 5)}
                 </div>
                 <div className="px-2 py-0.5 bg-brand-blue/5 text-[9px] font-black text-brand-blue uppercase tracking-widest">
                   Maintenant
                 </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button 
              onClick={() => markPris(activePopup)}
              className="flex-[2] bg-brand-blue text-white hover:bg-slate-900 transition-all h-11 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/10 active:scale-95"
            >
              <CheckCircle2 size={16} /> J'ai pris ma dose
            </button>
            <button 
              onClick={dismissPopup}
              className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all h-11 flex items-center justify-center font-bold text-xs uppercase tracking-widest active:scale-95"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress {
          animation-name: progress;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </div>
  );
}
