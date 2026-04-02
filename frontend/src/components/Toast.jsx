import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Component — Luxe Top-Center Notification
 * @param {string} message - Text to display
 * @param {string} type - 'success' | 'error' | 'warning'
 * @param {function} onClose - callback to close
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-white border-emerald-100 text-emerald-800 shadow-emerald-500/10',
    error:   'bg-white border-red-100 text-red-800 shadow-red-500/10',
    warning: 'bg-white border-amber-100 text-amber-800 shadow-amber-500/10'
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error:   <AlertCircle className="text-red-500" size={18} />,
    warning: <Info className="text-amber-500" size={18} />
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 animate-fade-up">
      <div className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 ${styles[type]} backdrop-blur-xl bg-white/90`}>
        <div className="shrink-0">{icons[type]}</div>
        <p className="flex-1 text-[13px] font-bold leading-tight tracking-tight uppercase">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
