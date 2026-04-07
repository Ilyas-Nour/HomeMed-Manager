import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast — Mobile-first, positioned above mobile bottom nav
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    success: {
      border: 'border-brand-green/20',
      icon: <CheckCircle2 className="text-brand-green" size={20} strokeWidth={2.5} />,
      label: 'Succès'
    },
    error: {
      border: 'border-red-200',
      icon: <AlertCircle className="text-red-500" size={20} strokeWidth={2.5} />,
      label: 'Erreur'
    },
    warning: {
      border: 'border-amber-200',
      icon: <Info className="text-brand-amber" size={20} strokeWidth={2.5} />,
      label: 'Attention'
    },
    info: {
      border: 'border-brand-blue/20',
      icon: <Info className="text-brand-blue" size={20} strokeWidth={2.5} />,
      label: 'Info'
    }
  };

  const v = variants[type] || variants.success;

  return (
    /* On mobile: show above bottom nav (bottom-20). On desktop: top-6 centered */
    <div className="fixed bottom-20 lg:bottom-auto lg:top-6 left-1/2 -translate-x-1/2 z-[300] w-[calc(100%-2rem)] max-w-sm animate-fade-up">
      <div className={`flex items-center gap-4 px-4 py-3.5 bg-white border-2 ${v.border} shadow-xl shadow-slate-900/10 ring-1 ring-black/5 flex items-center`}>
        <div className="shrink-0 h-9 w-9 bg-slate-50 border border-slate-100 flex items-center justify-center">
          {v.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400">{v.label}</p>
          <p className="text-sm font-bold text-slate-800 leading-tight truncate">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-slate-700 hover:bg-slate-50 transition-all shrink-0"
        >
          <X size={15} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
