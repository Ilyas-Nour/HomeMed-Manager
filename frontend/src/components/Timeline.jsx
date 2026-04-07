import React from 'react';
import { Clock, CheckCircle2, Pill, ArrowRight } from 'lucide-react';

/**
 * Timeline — Mobile-First · Product Precision
 */
export default function Timeline({ searchTerm = '', events = [], onTogglePrise, onViewAll }) {
  
  const filteredEvents = events.filter(event =>
    event.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {filteredEvents.map((event, idx) => (
          <div
            key={event.id || idx}
            className={`
              group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border transition-all
              ${event.pris
                ? 'bg-emerald-50/50 border-emerald-100'
                : 'bg-white border-slate-200 hover:border-slate-300'}
            `}
          >
            {/* Time badge */}
            <div className={`shrink-0 text-center w-12 sm:w-14 px-1 py-1.5 border border-slate-200 ${event.pris ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <span className={`text-xs sm:text-sm font-semibold ${event.pris ? 'text-emerald-700' : 'text-slate-900'}`}>
                {event.heure?.substring(0, 5) || '--:--'}
              </span>
            </div>

            {/* Pill icon */}
            <div className={`h-9 w-9 shrink-0 flex items-center justify-center border transition-all ${
              event.pris
                ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
                : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:bg-brand-blue/5 group-hover:text-brand-blue group-hover:border-brand-blue/20'
            }`}>
              <Pill size={16} strokeWidth={2} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold truncate ${event.pris ? 'text-emerald-700 line-through decoration-emerald-400/50' : 'text-slate-800'}`}>
                {event.nom}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {event.moment}
                <span className="hidden sm:inline"> &middot; Stock: {event.stock || 0}</span>
              </p>
            </div>

            {/* Action */}
            {event.pris ? (
              <button
                onClick={() => onTogglePrise && onTogglePrise(event.id, false)}
                className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all border border-emerald-200"
              >
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">Pris</span>
              </button>
            ) : (
              <button
                onClick={() => onTogglePrise && onTogglePrise(event.id, true)}
                className="shrink-0 med-btn-primary h-8 px-3 sm:px-4 text-xs shadow-sm bg-brand-blue"
              >
                <span className="hidden sm:inline">Confirmer</span>
                <CheckCircle2 size={14} className="sm:hidden" strokeWidth={2} />
              </button>
            )}
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="py-12 sm:py-16 text-center bg-slate-50/50 border border-dashed border-slate-200">
            <div className="h-10 w-10 bg-white flex items-center justify-center mx-auto mb-3 border border-slate-200 text-slate-400">
              <Clock size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Aucun rappel programmé aujourd'hui.
            </p>
          </div>
        )}
      </div>

      {onViewAll && (
        <button
          onClick={() => onViewAll()}
          className="w-full h-10 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          Planning Complet <ArrowRight size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
