import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal — High-Fidelity "Sleek & Clean" Redesign
 * Featuring: Glassmorphism, Rounded aesthetics (32px), and Premium Gradients.
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Supprimer', loading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
      {/* Enhanced Overlay with deep blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onCancel} 
      />

      <div className="relative w-full sm:max-w-[400px] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[32px] overflow-hidden animate-fade-up border border-slate-100">
        
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between mb-8">
            {/* Premium Icon Container with layered effects */}
            <div className="relative">
                <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full scale-125" />
                <div className="relative h-14 w-14 bg-white border border-red-50 flex items-center justify-center rounded-2xl shadow-[0_8px_20px_-4px_rgba(239,68,68,0.15)]">
                   <div className="h-11 w-11 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                      <AlertTriangle size={24} strokeWidth={2.5} />
                   </div>
                </div>
            </div>
            
            <button
              onClick={onCancel}
              className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 mb-9">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {title}
            </h3>
            <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                {message}
            </p>
          </div>

          <div className="flex flex-col gap-3">
             <button
                onClick={onConfirm}
                disabled={loading}
                className="group relative w-full h-14 bg-[#20835b] hover:bg-[#1a6b4a] text-white rounded-lg overflow-hidden shadow-lg shadow-red-200/20 active:scale-[0.98] transition-all disabled:opacity-50"
             >
                {/* Solid color background fallback for accessibility */}
                <div className="absolute inset-0 bg-red-600" />
                {/* Premium Gradient transition on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-700 transition-opacity group-hover:opacity-90" />
                
                <span className="relative flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                   ) : (
                     confirmText
                   )}
                </span>
             </button>

             <button
                onClick={onCancel}
                disabled={loading}
                className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
             >
                Annuler
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
