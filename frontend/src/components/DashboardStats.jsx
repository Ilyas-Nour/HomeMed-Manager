import React from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, Package,
  ArrowRight
} from 'lucide-react';

/**
 * DashboardStats — Sleek SaaS Design
 * Multi-layer shadows, 16px radius, and refined typography.
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
    
  let expirationStatus = "Sûr";
  let expirationColor = "text-emerald-500 bg-emerald-50";
  let daysToExpiration = null;

  if (closestExpiration) {
    daysToExpiration = Math.ceil((new Date(closestExpiration.date_expiration) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiration < 0) {
      expirationStatus = "Expiré";
      expirationColor = "text-rose-600 bg-rose-50";
    } else if (daysToExpiration <= 7) {
      expirationStatus = "Urgent";
      expirationColor = "text-rose-600 bg-rose-50";
    } else if (daysToExpiration <= 30) {
      expirationStatus = "Proche";
      expirationColor = "text-amber-600 bg-amber-50";
    } else {
      expirationStatus = "Optimal";
      expirationColor = "text-brand-blue bg-indigo-50";
    }
  }

  const stats = [
    {
      label: 'Traitements',
      value: actifsCount.toString().padStart(2, '0'),
      badge: `${actifsCount} Actifs`,
      icon: <TrendingUp size={18} />,
      colors: 'text-indigo-600 bg-indigo-50',
      view: 'medicaments',
      filter: 'all'
    },
    {
      label: 'Prises du Jour',
      value: totalRappels.toString().padStart(2, '0'),
      badge: totalRappels > 0 ? "Planifié" : "Libre",
      icon: <Clock size={18} />,
      colors: 'text-emerald-600 bg-emerald-50',
      view: 'planning',
      filter: null
    },
    {
      label: 'Alertes Stock',
      value: alertesCount.toString().padStart(2, '0'),
      badge: alertesCount > 0 ? `${alertesCount} Alertes` : 'Optimal',
      icon: <AlertTriangle size={18} />,
      colors: alertesCount > 0 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50',
      view: 'medicaments',
      filter: 'stock'
    },
    {
      label: 'Prochaine Échéance',
      value: daysToExpiration !== null ? `${daysToExpiration}j` : '—',
      badge: expirationStatus,
      icon: <Package size={18} />,
      colors: expirationColor,
      view: 'medicaments',
      filter: 'expired'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => (
        <button
          key={idx}
          onClick={() => onCardClick && onCardClick(stat.view, stat.filter)}
          className="group bg-white border border-slate-100 rounded-[32px] p-5 sm:p-6 text-left relative transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-blue/10 active:scale-[0.98] overflow-hidden"
        >
          {/* Subtle pattern background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-110 opacity-70"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-110`}>
              <div className={stat.colors.split(' ')[0]}>{stat.icon}</div>
            </div>
            <div className={`badge-dna ${stat.colors}`}>
              {stat.badge}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tighter">{stat.value}</h3>
               <div className="mb-1 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <ArrowRight size={16} className="text-brand-blue" />
               </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
