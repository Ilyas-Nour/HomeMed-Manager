import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Register — Product Precision "Sleek & Clean"
 * Design professionnel · Épuré · Haute Sécurité.
 */
export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans selection:bg-brand-blue/10 py-12 px-4 relative overflow-hidden">
      
      {/* ── Background minimal ── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-fade-up space-y-8">
        
        {/* ── Logo ── */}
        <div className="flex flex-col items-center gap-4 text-center">
           <div className="h-14 w-14 bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <img src="/HomeMed-Logo.png" alt="HomeMed" className="h-10 w-auto object-contain" />
           </div>
           <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Créer un Dossier</h1>
              <p className="text-sm text-slate-500 font-medium">Rejoignez la plateforme de gestion santé.</p>
           </div>
        </div>

        {/* ── Carte d'Inscription ── */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-6">
           {error && (
             <div className="p-3 bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle size={14} /> {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="med-form-field">
                 <label className="med-form-label">Nom complet</label>
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                       <User size={16} />
                    </div>
                    <input
                      type="text" required placeholder="Dr. Jean Dupont"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/5 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="med-form-field">
                 <label className="med-form-label">Adresse email</label>
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                       <Mail size={16} />
                    </div>
                    <input
                      type="email" required placeholder="nom@exemple.com"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/5 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="med-form-field">
                    <label className="med-form-label">Mot de passe</label>
                    <div className="relative group">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                          <Lock size={16} />
                       </div>
                       <input
                         type={showPassword ? "text" : "password"} required placeholder="••••••••••••"
                         value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                         className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/5 outline-none transition-all"
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                       >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-brand-blue hover:bg-blue-700 text-white text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 pt-1"
              >
                {loading ? 'Création...' : "Créer le compte"}
                {!loading && <CheckCircle2 size={16} />}
              </button>
           </form>

           <div className="relative flex items-center justify-center py-1">
              <div className="w-full h-px bg-slate-100" />
              <span className="absolute px-3 bg-white text-[10px] font-bold text-slate-300 uppercase tracking-tight">OU</span>
           </div>

           <div className="text-center space-y-4">
              <p className="text-xs font-medium text-slate-500">
                 Déjà membre ?{' '}
                 <Link to="/login" className="text-brand-blue font-bold hover:underline transition-all">
                    Se connecter
                 </Link>
              </p>
           </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center space-y-4 opacity-40">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
              Données Patient Chiffrées AES-256 <br />
              © 2026 HomeMed Suite Pro
           </p>
        </div>
      </div>
    </div>
  );
}
