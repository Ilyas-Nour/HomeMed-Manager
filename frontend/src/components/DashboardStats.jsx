import React from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, Package,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/**
 * DashboardStats — Mobile-First · 2-col on mobile, 4-col on desktop
 */
export default function DashboardStats({ onCardClick, medicaments = [], adherence = { percentage: 0, stats: { taken: 0, total: 0 } } }) {
  
  const actifsCount       = medicaments.length;
  
  // Observance logic from real API data
  const rappelsProgression = adherence.percentage || 0;
  const prisCount         = adherence.stats.taken || 0;
  const totalRappels      = adherence.stats.total || 0;

  // Stock Alerts logic
  const alertesCount      = medicaments.filter(m => m.stock_faible || m.quantite <= (m.seuil_alerte || 5)).length;
  
  // Smart Expiration logic
  const closestExpiration = [...medicaments]
    .filter(m => m.date_expiration)
    .sort((a, b) => new Date(a.date_expiration) - new Date(b.date_expiration))[0];
    
  let expirationStatus = "Aucun";
  let expirationColor = "bg-emerald-50 text-emerald-600";
  let daysToExpiration = null;

  if (closestExpiration) {
    daysToExpiration = Math.ceil((new Date(closestExpiration.date_expiration) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiration < 0) {
      expirationStatus = "Expiré !";
      expirationColor = "bg-red-50 text-red-600";
    } else if (daysToExpiration <= 7) {
      expirationStatus = "Urgent";
      expirationColor = "bg-red-50 text-red-600";
    } else if (daysToExpiration <= 30) {
      expirationStatus = "Bientôt";
      expirationColor = "bg-amber-50 text-amber-600";
    } else {
      expirationStatus = "Sécurisé";
      expirationColor = "bg-emerald-50 text-emerald-600";
    }
  }

  const stats = [
    {
      label: 'Traitements',
      value: actifsCount.toString().padStart(2, '0'),
      change: `${actifsCount} actif(s)`,
      isPositive: true,
      icon: <TrendingUp size={16} className="text-brand-blue" />,
      bg: 'bg-brand-blue/5',
      view: 'medicaments',
      filter: 'all',
      statusColor: "bg-emerald-50 text-emerald-600"
    },
    {
      label: 'Prises du Jour',
      value: totalRappels.toString().padStart(2, '0'),
      change: totalRappels > 0 ? "Planifié" : "Aucun",
      isPositive: totalRappels > 0,
      icon: <Clock size={16} className="text-brand-green" />,
      bg: 'bg-brand-green/5',
      view: 'planning',
      filter: null,
      statusColor: totalRappels > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
    },
    {
      label: 'Alertes Stock',
      value: alertesCount.toString().padStart(2, '0'),
      change: alertesCount > 0 ? `${alertesCount} alerte(s)` : 'Optimal',
      isPositive: alertesCount === 0,
      icon: <AlertTriangle size={16} className="text-brand-amber" />,
      bg: 'bg-amber-50',
      view: 'medicaments',
      filter: 'stock',
      statusColor: alertesCount === 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
    },
    {
      label: 'Échéance',
      value: daysToExpiration !== null ? `${daysToExpiration}j` : '—',
      change: expirationStatus,
      isPositive: daysToExpiration === null || daysToExpiration > 30,
      icon: <Package size={16} className="text-slate-400" />,
      bg: 'bg-slate-50',
      view: 'medicaments',
      filter: 'expired',
      statusColor: expirationColor
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
            <div className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold ${stat.statusColor}`}>
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
