import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal — Mobile-first bottom-sheet on mobile
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Supprimer', loading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onCancel} />

      <div className="relative w-full sm:max-w-sm sm:mx-4 bg-white shadow-2xl overflow-hidden animate-fade-up">
        {/* Danger accent */}
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-500 w-full" />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-slate-200" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="h-11 w-11 sm:h-12 sm:w-12 bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
            <button
              onClick={onCancel}
              className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2 mb-7">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="med-btn-secondary flex-1 h-12 sm:h-11 text-sm font-bold"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-12 sm:h-11 bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-red-200/50 disabled:opacity-50 flex items-center justify-center"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin" />
                : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
