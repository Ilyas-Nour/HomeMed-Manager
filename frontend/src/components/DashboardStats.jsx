import React from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, Package,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/**
 * DashboardStats — Mobile-First · 2-col on mobile, 4-col on desktop
 */
export default function DashboardStats({ onCardClick, medicaments = [], timeline = [] }) {
  
  const actifsCount       = medicaments.length;
  const totalRappels      = timeline.length;
  const prisCount         = timeline.filter(e => e.pris).length;
  const rappelsProgression = totalRappels > 0 ? Math.round((prisCount / totalRappels) * 100) : 0;
  const alertesCount      = medicaments.filter(m => m.stock_faible || m.quantite <= (m.seuil_alerte || 5)).length;
  const closestExpiration = [...medicaments]
    .filter(m => m.date_expiration)
    .sort((a, b) => new Date(a.date_expiration) - new Date(b.date_expiration))[0];
  const daysToExpiration  = closestExpiration
    ? Math.ceil((new Date(closestExpiration.date_expiration) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const stats = [
    {
      label: 'Traitements',
      value: actifsCount.toString().padStart(2, '0'),
      change: actifsCount > 0 ? `${actifsCount} actif(s)` : 'Aucun',
      isPositive: true,
      icon: <TrendingUp size={16} className="text-brand-blue" />,
      bg: 'bg-brand-blue/5',
      view: 'medicaments',
      filter: 'all'
    },
    {
      label: 'Observance',
      value: `${rappelsProgression}%`,
      change: `${prisCount}/${totalRappels} pris`,
      isPositive: rappelsProgression > 50,
      icon: <Clock size={16} className="text-brand-green" />,
      bg: 'bg-brand-green/5',
      view: 'overview',
      filter: null
    },
    {
      label: 'Alertes Stock',
      value: alertesCount.toString().padStart(2, '0'),
      change: alertesCount > 0 ? 'Action requise' : 'Optimal',
      isPositive: alertesCount === 0,
      icon: <AlertTriangle size={16} className="text-brand-amber" />,
      bg: 'bg-amber-50',
      view: 'medicaments',
      filter: 'stock'
    },
    {
      label: 'Échéance',
      value: daysToExpiration !== null ? `${daysToExpiration}j` : '—',
      change: closestExpiration ? closestExpiration.nom : 'Aucune',
      isPositive: daysToExpiration > 7 || daysToExpiration === null,
      icon: <Package size={16} className="text-slate-400" />,
      bg: 'bg-slate-50',
      view: 'medicaments',
      filter: 'expired'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => (
        <button
          key={idx}
          onClick={() => onCardClick && onCardClick(stat.view, stat.filter)}
          className="group relative bg-white border border-slate-200 p-4 sm:p-5 text-left w-full hover:border-brand-blue/30 transition-all duration-200 overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center ${stat.bg} border border-white shadow-sm`}>
              {stat.icon}
            </div>
            <div className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {stat.change}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">{stat.value}</h3>
          </div>
        </button>
      ))}
    </div>
  );
}
