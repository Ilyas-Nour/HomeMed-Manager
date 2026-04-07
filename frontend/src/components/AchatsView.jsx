import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, Search, 
  Trash2, CheckCircle2, ChevronRight,
  TrendingDown, TrendingUp, Package, Clock
} from 'lucide-react';

/**
 * AchatsView — Product Precision "Sleek & Clean"
 */
export default function AchatsView() {
  const [items] = useState([
    { id: 1, nom: 'Doliprane 1000mg', label: 'Urgent', status: 'pending' },
    { id: 2, nom: 'Sirop Toux Enfant', label: 'Hiver', status: 'pending' },
    { id: 3, nom: 'Pansements', label: 'Stock', status: 'bought' },
  ]);

  return (
    <div className="space-y-10 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="studio-h1 flex items-center gap-3">
             <ShoppingCart size={32} className="text-emerald-500" /> Liste d'Achats
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2">Gestion proactive des commandes de réapprovisionnement.</p>
        </div>
        <button className="studio-btn-brand h-11 px-8 text-sm font-bold">Nouveau Produit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* List Content */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-4 bg-slate-50/50 p-1.5 border border-slate-100 mb-2">
              {['à acheter', 'achetés'].map((tab, i) => (
                <button key={i} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tight transition-all ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                   {tab}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 gap-3">
              {items.map(item => (
                <div key={item.id} className="p-4 bg-white border border-slate-100 flex items-center justify-between group hover:border-emerald-500/20 hover:shadow-xl transition-all">
                   <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-10 w-10 flex flex-shrink-0 items-center justify-center ${item.status === 'bought' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                         <ShoppingCart size={18} />
                      </div>
                      <div className="min-w-0">
                         <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight">{item.nom}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="h-8 w-8 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                      <button className="h-8 w-8 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Stats Content */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-6 bg-slate-50/50 border border-slate-100 space-y-6">
              <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Flux Achats</h3>
              
              <div className="space-y-4">
                 {[
                   { label: 'Articles Urgents', val: '02', icon: <Package size={14} /> },
                   { label: 'Date prévue', val: 'Demain', icon: <Clock size={14} /> }
                 ].map(s => (
                   <div key={s.label} className="bg-white p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="text-emerald-500">{s.icon}</div>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900 tracking-tight">{s.val}</span>
                   </div>
                 ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tendance Budget</span>
                    <TrendingDown size={14} className="text-emerald-500" />
                 </div>
                 <p className="text-[12px] font-bold text-slate-900 leading-none">-12% vs mois dernier</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
