import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import Toast from './Toast';

export default function SettingsView() {
  const { user, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
          name: formData.name,
          email: formData.email,
      };
      
      if (formData.password) {
          payload.password = formData.password;
          payload.password_confirmation = formData.password_confirmation;
      }

      const res = await api.patch('/auth/update', payload);
      showToast(res.data.message);
      await fetchUser(); // Refresh global auth state
      
      // Reset password fields
      setFormData(prev => ({...prev, password: '', password_confirmation: ''}));
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la mise à jour.";
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres du compte</h1>
        <p className="text-slate-500 font-medium font-sans">Gérez vos informations personnelles et la sécurité de votre accès.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
            <div className="hm-card p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-[32px] bg-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-600/20">
                    {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">{user?.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
            </div>

            <div className="hm-card p-6 space-y-4 bg-slate-900 text-white">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Sécurité</h4>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Utilisez un mot de passe fort combinant majuscules, chiffres et symboles pour une protection maximale.
                </p>
            </div>
        </div>

        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="hm-card p-8 space-y-8">
                
                {/* Section: Informations générales */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <User size={18} className="text-emerald-500" />
                        <h3 className="font-bold text-slate-900">Informations Personnelles</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Nom Complet</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500/30 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Adresse E-mail</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500/30 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Sécurité / Mot de passe */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Lock size={18} className="text-emerald-500" />
                        <h3 className="font-bold text-slate-900">Sécurité du compte</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                placeholder="Laisser vide pour ne pas changer"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500/30 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Confirmer mot de passe</label>
                            <input 
                                type="password" 
                                value={formData.password_confirmation}
                                onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500/30 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="hm-btn min-w-[160px] h-12 shadow-emerald-500/20"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Sauvegarder</>}
                    </button>
                </div>
            </form>

            <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-900">Zone de danger</h4>
                        <p className="text-xs text-red-700/70 font-medium">La suppression du compte est irréversible et effacera toutes vos données.</p>
                    </div>
                </div>
                <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                    Supprimer le compte
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
