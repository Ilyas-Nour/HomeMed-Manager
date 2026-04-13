import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, 
  CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    password_confirmation: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-blue/10 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden text-slate-900">
      
      {/* Background Blobs subtils pour le relief */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-violet-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-[440px] animate-fade-up">
        
        <div className="space-y-2 mb-10 text-center">
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Créer un compte.</h1>
           <p className="text-slate-500 font-medium text-lg italic tracking-tight">Commencez votre parcours santé aujourd'hui.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-fade-in">
              <AlertCircle size={18} />
              <span className="text-sm font-bold tracking-tight">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom Complet</label>
            <div className="relative group">
              <input 
                type="text" required placeholder="Ex: Jean Dupont"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="auth-input !bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Adresse Email</label>
            <div className="relative group">
              <input 
                type="email" required placeholder="nom@exemple.com"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="auth-input !bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mot de passe</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="auth-input !bg-slate-50/50 !text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Confirmation</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="auth-input !bg-slate-50/50 !text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end px-1">
             <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors flex items-center gap-2"
              >
                {showPassword ? <><EyeOff size={14} /> Masquer</> : <><Eye size={14} /> Afficher</>}
              </button>
          </div>

          <div className="pt-2">
             <button 
              type="submit"
              disabled={loading}
              className="auth-btn flex items-center justify-center gap-3 bg-slate-900 border-none scale-100 shadow-2xl shadow-slate-200 active:scale-95"
             >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs font-black">Créer mon compte</span>
                  <ArrowRight size={18} />
                </>
              )}
             </button>
          </div>
        </form>

        <div className="relative flex items-center justify-center my-10">
          <div className="w-full h-px bg-slate-100" />
          <span className="absolute px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou s'inscrire via</span>
        </div>

        <div className="flex flex-col gap-4">
           <button className="h-12 border border-slate-100 bg-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm w-full">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              <span className="text-[11px] font-black uppercase tracking-wider">S'inscrire avec Google</span>
           </button>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 mt-12">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-blue font-bold hover:text-blue-700 underline underline-offset-4 decoration-2">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
