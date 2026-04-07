import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Filter, ArrowLeft } from 'lucide-react';
import Timeline from './Timeline'; // We reuse the Timeline component to display events

export default function PlanningView({ 
  events = [], 
  onTogglePrise, 
  setCurrentView,
  showToast 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(addDays(currentDate, -1));

  // Generate some mock events for other dates, or fallback to the current events 
  // In a real app we would have an API call fetching this per-date
  const isToday = currentDate.toDateString() === new Date().toDateString();
  const activeEvents = isToday ? events : (
    // Mock events for other days to show it "working"
    events.map(e => ({ ...e, id: e.id + Math.random(), pris: false }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-up">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('overview')}
            className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Planning Complet</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Gérez vos prises médicamenteuses sur la durée.</p>
          </div>
        </div>
        
        <button 
          onClick={() => showToast('Filtrage bientôt disponible', 'info')}
          className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-bold"
        >
          <Filter size={16} /> <span className="hidden sm:inline">Filtrer</span>
        </button>
      </div>

      {/* Calendar Strip / Date Selector */}
      <div className="bg-white border border-slate-200 flex items-center justify-between px-4 py-3 shadow-sm">
        <button onClick={prevDay} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all">
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-brand-blue mb-1">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Sélectionnée</span>
          </div>
          <span className="text-base font-bold text-slate-900">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <button onClick={nextDay} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-tiny">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-brand-blue" />
              Récapitulatif de la journée
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeEvents.length} prise(s) prévue(s), {activeEvents.filter(e => e.pris).length} effectuée(s)
            </p>
          </div>
          <button 
            onClick={() => showToast('Ajout rapide en cours de développement')}
            className="flex items-center gap-2 py-1.5 px-3 bg-brand-blue/10 text-brand-blue text-xs font-bold hover:bg-brand-blue/20 transition-colors"
          >
            <Plus size={14} /> Ajouter une prise
          </button>
        </div>

        <Timeline
          events={activeEvents}
          onTogglePrise={isToday ? onTogglePrise : undefined} 
          // Don't pass onViewAll so the button doesn't render!
        />
      </div>
    </div>
  );
}
