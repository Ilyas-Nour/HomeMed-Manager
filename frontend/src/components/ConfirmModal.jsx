import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal — Luxe deletion confirmation (Portal to prevent CSS wrapping)
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Supprimer", loading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="hm-modal-backdrop !z-[210]">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onCancel} />
      
      <div className="hm-modal-content max-w-sm animate-fade-up relative z-10 w-full mx-4">
        <div className="h-1.5 bg-red-500" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-10 w-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100/50">
              <AlertTriangle size={20} />
            </div>
            <button onClick={onCancel} className="hm-btn-ghost"><X size={18} /></button>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
            <button 
              onClick={onCancel}
              disabled={loading}
              className="hm-btn-secondary"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-slate-50 hover:bg-red-600/90 h-9 px-4 py-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
