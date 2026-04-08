import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Clock, 
  Sun, Sunrise, Sunset, Moon, Coffee,
  AlertCircle, ChevronRight, TrendingUp
} from 'lucide-react';
import api from '../services/api';

/**
 * PlanningView — HomeMed Daily Adherence
 * Displays today's medication schedule grouped by moment.
 */
export default function PlanningView({ showToast, activeProfileId }) {
  const [schedule, setSchedule] = useState({});
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, taken: 0 });

  useEffect(() => {
    fetchPlanning();
  }, [activeProfileId]);

  const fetchPlanning = async () => {
    try {
      setLoading(true);
      const res = await api.get('/planning');
      setSchedule(res.data.schedule);
      setPercentage(res.data.percentage);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      showToast && showToast('Erreur lors du chargement du planning', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const newStatus = !item.pris;
      await api.post('/prises/toggle', {
        rappel_id: item.id,
        date_prise: new Date().toISOString().split('T')[0],
        pris: newStatus
      });
      
      showToast && showToast(newStatus ? 'Prise enregistrée' : 'Prise annulée');
      fetchPlanning(); // Refresh stats and UI
    } catch (err) {
      console.error(err);
      showToast && showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const moments = [
    { id: 'matin', label: 'Matin', icon: <Sunrise size={18} />, color: 'text-orange-500' },
    { id: 'midi', label: 'Midi', icon: <Sun size={18} />, color: 'text-yellow-500' },
    { id: 'apres-midi', label: 'Après-midi', icon: <Coffee size={18} />, color: 'text-amber-600' },
    { id: 'soir', label: 'Soir', icon: <Sunset size={18} />, color: 'text-indigo-500' },
    { id: 'coucher', label: 'Coucher', icon: <Moon size={18} />, color: 'text-slate-500' },
    { id: 'libre', label: 'Libre', icon: <Calendar size={18} />, color: 'text-slate-400' }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Préparation de votre journée...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      

      {/* Daily Timeline */}
      <div className="grid grid-cols-1 gap-12">
         {moments.map(moment => {
            const items = schedule[moment.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={moment.id} className="space-y-4">
                 <div className="flex items-center gap-3 px-1 border-b border-slate-50 pb-2">
                    <div className={`${moment.color} opacity-80`}>{moment.icon}</div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">{moment.label}</h3>
                    <span className="text-[10px] font-bold text-slate-300 ml-auto">{items.length} médicament(s)</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => (
                       <button 
                         key={item.id}
                         onClick={() => handleToggle(item)}
                         className={`p-5 border transition-all flex items-center justify-between text-left group
                           ${item.pris 
                             ? 'bg-slate-50 border-slate-100 opacity-60' 
                             : 'bg-white border-slate-100 hover:border-brand-blue hover:shadow-lg'
                           }`}
                       >
                          <div className="flex items-center gap-4">
                             <div className={`h-10 w-10 flex items-center justify-center transition-all
                               ${item.pris ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue'}
                             `}>
                                {item.pris ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                             </div>
                             <div className="space-y-0.5">
                                <h4 className={`text-sm font-bold tracking-tight ${item.pris ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                   {item.medicament}
                                </h4>
                                <div className="flex items-center gap-2">
                                   <Clock size={10} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Prévu à {item.heure.substring(0,5)}</span>
                                </div>
                             </div>
                          </div>
                          
                          <ChevronRight size={14} className={`transition-transform duration-300 ${item.pris ? 'text-slate-200' : 'text-slate-300 group-hover:translate-x-1 group-hover:text-brand-blue'}`} />
                       </button>
                    ))}
                 </div>
              </div>
            );
         })}

         {/* Empty State */}
         {stats.total === 0 && (
           <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 opacity-50 space-y-4">
              <AlertCircle size={40} className="text-slate-200" />
              <div className="text-center">
                 <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Aucun traitement aujourd'hui</p>
                 <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Ajoutez des médicaments et des rappels pour commencer.</p>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}
