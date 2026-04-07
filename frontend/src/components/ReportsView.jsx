import React from 'react';
import { 
  FileText, TrendingUp, Calendar, 
  ArrowRight, Download, Share2, 
  CheckCircle2, Pill, Activity
} from 'lucide-react';

/**
 * ReportsView — Product Precision "Sleek & Clean"
 */
export default function ReportsView() {
  const reports = [
    { title: 'Observance du Traitement', date: 'Avril 2026', status: 'Terminé', score: '98%' },
    { title: 'Dépenses de Pharmacie', date: 'T1 2026', status: 'Brouillon', score: '450€' },
    { title: 'Résumé de Santé Familial', date: 'Mars 2026', status: 'Terminé', score: 'N/A' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-up pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rapports</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Résumés détaillés de vos tendances de santé et de l'utilisation de vos médicaments.</p>
        </div>
        <button className="med-btn-primary min-w-[180px]">
           <FileText size={18} className="mr-2" /> Générer un Rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Observance Hebdo.', value: '94%', icon: <TrendingUp size={20} className="text-emerald-500" /> },
          { label: 'Renouvellements', value: '3', icon: <Pill size={20} className="text-brand-amber" /> },
          { label: 'Traitements Actifs', value: '12', icon: <Activity size={20} className="text-brand-blue" /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 shadow-sm space-y-2">
             <div className="flex items-center gap-2">
                {stat.icon}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</span>
             </div>
             <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-tight mb-4 flex items-center gap-2">
           <Calendar size={14} /> Historique des Documents
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 flex items-center justify-between group hover:border-slate-300 transition-all hover:shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-all">
                       <FileText size={22} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">{report.title}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{report.date}</span>
                           <div className="h-1 w-1 bg-slate-200" />
                           <span className={`text-[9px] font-bold uppercase px-2 py-0.5 ${
                             report.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                           }`}>{report.status}</span>
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
                   <button className="h-10 px-4 flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline uppercase tracking-tight">
                      Consulter <ArrowRight size={14} />
                   </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
