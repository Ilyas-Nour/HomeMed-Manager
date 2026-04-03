import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import logo from '/HomeMed-Logo.png';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 p-6">
      
      <div className="max-w-md w-full space-y-10 bg-white p-8 sm:p-12 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
        
        <div className="space-y-4 text-center">
           <div className="flex justify-center mb-8">
             <img src={logo} alt="HomeMed" className="h-12 object-contain" />
           </div>
           <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">Commencer l'aventure.</h1>
           <p className="text-slate-500 font-medium leading-relaxed mt-2 text-sm">Créez votre compte en quelques secondes et rejoignez la révolution de la santé connectée.</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] font-bold flex items-center gap-3 animate-shake">
               <ShieldCheck size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Nom Complet</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" />
                <input
                  type="text" required placeholder="Jean Dupont"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" />
                <input
                  type="email" required placeholder="jean@exemple.fr"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" />
                    <input
                      type="password" required placeholder="••••••••"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Confirmation</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" />
                    <input
                      type="password" required placeholder="••••••••"
                      value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 transition-all duration-300"
                    />
                  </div>
                </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-14 bg-slate-950 text-white rounded-2xl font-bold text-sm tracking-wide shadow-2xl shadow-slate-950/20 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>CRÉER MON COMPTE <UserPlus size={18} /></>}
            </button>
          </form>
        </div>

        <div className="pt-6 text-center">
           <p className="text-sm font-medium text-slate-500">
              Déjà inscrit ? <Link to="/login" className="text-slate-900 font-bold hover:text-emerald-600 underline underline-offset-4 decoration-2">Connectez-vous</Link>
           </p>
        </div>

      </div>
    </div>
  );
}
