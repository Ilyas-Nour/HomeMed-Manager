import React, { useState, useEffect } from 'react';
import { 
  FileText, TrendingUp, Calendar, 
  ArrowRight, Download, Share2, 
  CheckCircle2, Pill, Activity,
  Loader2, Calculator
} from 'lucide-react';
import api from '../services/api';

/**
 * ReportsView — Dashboard Analytique Réel
 */
export default function ReportsView({ showToast }) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [summRes, histRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/history')
      ]);
      setSummary(summRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement des rapports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-30">
        <Loader2 className="animate-spin text-brand-blue mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Calcul des Tendances de Santé...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Observance Hebdo.', value: summary?.adherence_rate || '0%', icon: <TrendingUp size={20} className="text-emerald-500" /> },
    { label: 'Dépenses Totales', value: summary?.expenditure || '0 €', icon: <Calculator size={20} className="text-brand-amber" /> },
    { label: 'Traitements Actifs', value: summary?.active_treatments || '0', icon: <Activity size={20} className="text-brand-blue" /> }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rapports de Santé</h1>
          <p className="text-sm font-medium text-slate-400">Analyse de l'observance et des coûts sur les {summary?.period || 'derniers jours'}.</p>
        </div>
        <button 
          onClick={() => showToast('Génération du PDF en cours...')}
          className="med-btn-primary min-w-[200px] h-12 shadow-lg shadow-brand-blue/10"
        >
           <FileText size={18} className="mr-2" /> Générer un Rapport PDF
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-8 shadow-tiny space-y-4 group hover:border-brand-blue/20 transition-all">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 group-hover:bg-brand-blue/5 transition-colors">
                   {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
             </div>
             <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-brand-blue" /> Archives des Rapports
           </h3>
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Base de données sécurisée</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {history.map((report, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-6 flex items-center justify-between group hover:border-slate-300 transition-all hover:shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                       <FileText size={22} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-900 tracking-tight">{report.title}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                           <div className="h-1 w-1 rounded-full bg-slate-200" />
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${
                             report.score === 'Réel' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'
                           }`}>{report.score === 'Réel' ? 'Données Réelles' : report.score}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all" title="Télécharger">
                      <Download size={18} />
                   </button>
                   <button className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all" title="Partager">
                      <Share2 size={18} />
                   </button>
                   <div className="h-6 w-px bg-slate-100 mx-2" />
                   <button className="h-10 px-4 flex items-center gap-2 text-xs font-black text-brand-blue hover:underline uppercase tracking-widest">
                      Détails <ArrowRight size={14} />
                   </button>
                </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
