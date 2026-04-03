import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Activity, Package, 
  TrendingUp, AlertCircle, Search, Mail,
  Calendar, ShieldAlert, BarChart3, Loader2,
  HardDrive, CreditCard
} from 'lucide-react';
import api from '../services/api';

/**
 * Vue Administration — Supervision Globale des données (Requirement 4)
 * Design : Studio Admin — Premium Dark/Light mode compatible, Glassmorphism, Metrics cards.
 */
export default function AdminView() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error('Erreur chargement admin', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32 grayscale opacity-40">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={40} strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-widest tracking-[0.2em]">Accès sécurisé en cours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header — Studio Admin Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg shadow-slate-900/10">
            <ShieldCheck size={12} /> Console d'administration
          </div>
          <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">Supervision Plateforme</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1 italic">État de santé global de HomeMed Manager</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Système Opérationnel</span>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          label="Utilisateurs" 
          value={stats.users_count} 
          icon={Users} 
          trend="+5%" 
          color="blue" 
        />
        <AdminStatCard 
          label="Traitements suivis" 
          value={stats.meds_count} 
          icon={Activity} 
          trend="+12%" 
          color="emerald" 
        />
        <AdminStatCard 
          label="Alertes Stock" 
          value={stats.low_stock_count} 
          icon={ShieldAlert} 
          trend="Action" 
          color="amber" 
          isWarning={stats.low_stock_count > 0}
        />
        <AdminStatCard 
          label="CA Pharmacie (Total)" 
          value={`${parseFloat(stats.total_purchases).toFixed(2)} MAD`} 
          icon={CreditCard} 
          trend="Achats" 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* User List Section */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  Annuaire des utilisateurs 
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  {users.length}
               </h3>
               
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="text" 
                    placeholder="Chercher..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="h-8 pl-9 pr-3 rounded-full bg-slate-100/50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 outline-none text-[10px] font-bold text-slate-700 transition-all w-48"
                  />
               </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profils</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscrit</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredUsers.map(user => (
                       <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs uppercase group-hover:bg-slate-900 group-hover:text-white transition-all">
                                   {user.name.substring(0, 2)}
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-900 mb-0.5">{user.name}</p>
                                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                      <Mail size={10} /> {user.email}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                                {user.profils_count || 0} profils
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <span className="text-[11px] font-bold text-slate-500">
                                {new Date(user.created_at).toLocaleDateString()}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-300'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                   {user.role}
                                </span>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Sidebar Stats & Health Section */}
         <div className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Santé Infrastructure</h3>
            
            <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-6 shadow-2xl shadow-slate-900/20">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                     <HardDrive size={20} className="text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Données</p>
                     <p className="text-xs font-bold">SQL (Sanctum Secure)</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Charge Système</span>
                        <span className="text-emerald-400">Stable (12%)</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[12%] bg-emerald-500 rounded-full" />
                     </div>
                  </div>
                  
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Indexation Médicaments</span>
                        <span className="text-blue-400">Optimisé</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-blue-500 rounded-full" />
                     </div>
                  </div>
               </div>

               <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version</p>
                  <p className="text-[10px] font-black text-white px-2 py-0.5 bg-white/10 rounded-md">V 2.6.0-PRO</p>
               </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-slate-100 space-y-4 shadow-sm">
               <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <BarChart3 size={18} />
                   </div>
                   <h4 className="text-xs font-black text-slate-900 uppercase">Alertes Récentes</h4>
               </div>
               <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-dotted border-slate-200">
                     <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-slate-600 leading-tight">
                        {stats.low_stock_count} traitements sont passés sous le seuil d'alerte critique aujourd'hui.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

/** Sous-composant Statistique Admin */
function AdminStatCard({ label, value, icon: Icon, trend, color, isWarning }) {
  const colors = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    indigo: "bg-indigo-600"
  };

  return (
    <div className={`relative overflow-hidden bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group`}>
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${colors[color]} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`} />
      
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isWarning ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'} transition-all`}>
           <Icon size={20} />
        </div>
        <div className={`px-2 py-1 rounded-lg ${isWarning ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'} text-[9px] font-black uppercase tracking-widest`}>
           {trend}
        </div>
      </div>

      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-[900] text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
