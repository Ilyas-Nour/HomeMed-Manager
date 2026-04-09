import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Clock, 
  Sun, Sunrise, Sunset, Moon, Coffee,
  AlertCircle, ChevronRight, TrendingUp
} from 'lucide-react';
import api from '../services/api';

/**
 * PlanningView — Sleek SaaS Design
 * Displays today's medication schedule with organic layouts and refined states.
 */
export default function PlanningView({ showToast, activeProfileId, initialData = null }) {
  const [schedule, setSchedule] = useState({});
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(!initialData);
  const [stats, setStats] = useState({ total: 0, taken: 0 });

  useEffect(() => {
    if (initialData) {
      setSchedule(initialData.schedule || {});
      setPercentage(initialData.percentage || 0);
      setStats(initialData.stats || { total: 0, taken: 0 });
      setLoading(false);
    } else {
      fetchPlanning();
    }
  }, [activeProfileId, initialData]);

  const fetchPlanning = async () => {
    try {
      if (!initialData) setLoading(true);
      const res = await api.get('/planning');
      setSchedule(res.data.schedule);
      setPercentage(res.data.percentage);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      showToast && showToast('Erreur lors du chargement du planning', 'error');
    } finally {
      if (!initialData) setLoading(false);
    }
  };

  const handleToggle = async (item) => {
    const newStatus = !item.pris;
    const today = new Date().toISOString().split('T')[0];

    // Optimistic Update
    setSchedule(prev => {
      const updated = { ...prev };
      for (const moment in updated) {
        updated[moment] = updated[moment].map(i =>
          i.id === item.id ? { ...i, pris: newStatus } : i
        );
      }
      return updated;
    });
    
    setStats(prev => {
        const newTaken = newStatus ? prev.taken + 1 : Math.max(0, prev.taken - 1);
        setPercentage(prev.total > 0 ? Math.round((newTaken / prev.total) * 100) : 0);
        return { ...prev, taken: newTaken };
    });

    try {
      await api.post('/prises/toggle', {
        rappel_id: item.id,
        date_prise: today,
        pris: newStatus
      });
      showToast && showToast(newStatus ? '✓ Prise enregistrée' : 'Prise annulée');
    } catch (err) {
      console.error(err);
      // Revert on failure
      fetchPlanning();
      showToast && showToast('Erreur — historique non mis à jour', 'error');
    }
  };

  const moments = [
    { id: 'matin', label: 'Matin', icon: <Sunrise size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'midi', label: 'Midi', icon: <Sun size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'apres-midi', label: 'Après-midi', icon: <Coffee size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'soir', label: 'Soir', icon: <Sunset size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'coucher', label: 'Coucher', icon: <Moon size={20} />, color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'libre', label: 'Libre', icon: <Calendar size={20} />, color: 'text-slate-400', bg: 'bg-white' }
  ];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronisation du planning...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-14">
         {moments.map(moment => {
            const items = schedule[moment.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={moment.id} className="space-y-6">
                 <div className="flex items-center gap-4 px-2">
                    <div className={`h-11 w-11 flex items-center justify-center rounded-xl ${moment.bg} ${moment.color} shadow-sm border border-white`}>
                       {moment.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">{moment.label}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{items.length} dose(s) prévue(s)</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => {
                       const now = new Date();
                       const [h, m] = item.heure.substring(0,5).split(":").map(Number);
                       const scheduledTime = new Date();
                       scheduledTime.setHours(h, m, 0, 0);
                       const isMissed = !item.pris && now > scheduledTime;
                       
                       return (
                        <button 
                          key={item.id}
                          onClick={() => handleToggle(item)}
                          className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between text-left relative overflow-hidden active:scale-[0.98] ${
                            item.pris 
                              ? 'bg-slate-50 border-slate-100 opacity-70' 
                              : isMissed 
                                ? 'bg-rose-50/50 border-rose-100 hover:border-rose-300' 
                                : 'bg-white border-slate-100 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-slate-200/50'
                          }`}
                        >
                           <div className="flex items-center gap-4 relative z-10">
                              <div className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-500 ${
                                item.pris 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : isMissed 
                                    ? 'bg-rose-100 text-rose-600 animate-pulse' 
                                    : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-brand-blue'
                                }`}>
                                 {item.pris ? <CheckCircle2 size={24} /> : isMissed ? <AlertCircle size={24} /> : <Circle size={24} />}
                              </div>
                              <div className="space-y-1">
                                 <h4 className={`text-base font-black tracking-tight transition-all duration-500 ${
                                   item.pris ? "text-slate-400 line-through" : isMissed ? "text-rose-900" : "text-slate-900"
                                 }`}>
                                    {item.medicament}
                                 </h4>
                                 <div className="flex items-center gap-2">
                                    <Clock size={12} className={isMissed ? "text-rose-300" : "text-slate-300"} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isMissed ? "text-rose-400" : "text-slate-400"}`}>
                                      {isMissed ? "Dose oubliée — " : item.pris ? "Pris à " : "Prévu à "}{item.heure.substring(0,5)}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className={`transition-all duration-500 ${item.pris ? "opacity-0" : "opacity-100 translate-x-4 group-hover:translate-x-0"}`}>
                             <ChevronRight size={18} className={isMissed ? "text-rose-300" : "text-brand-blue"} />
                           </div>
                        </button>
                       );
                    })}
                 </div>
              </div>
            );
         })}

         {/* Empty State */}
         {stats.total === 0 && (
           <div className="py-32 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 transition-colors hover:border-slate-200 group">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-700 group-hover:rotate-12">
                 <Calendar size={32} className="text-slate-200" />
              </div>
              <div className="text-center">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Journée libre</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest max-w-[200px] leading-relaxed mx-auto">Aucun traitement planifié pour le moment. Reposez-vous !</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
