import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, Lock, ArrowRight, Eye, EyeOff, 
  ShieldCheck, AlertCircle, Globe
} from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden flex items-center font-sans">
      {/* Full Page Wavy Background */}
      <img 
        src="/image.png" 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Form — floats directly on the open left area */}
      <div className="relative z-10 w-full max-w-[380px] ml-[7vw] xl:ml-[10vw] animate-fade-up">
        
        {/* Logo + Brand */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/HomeMed-Logo.png" alt="HomeMed" className="h-14 object-contain" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">Bienvenue.</h1>
          <p className="text-slate-500 text-sm font-medium">Heureux de vous revoir sur HomeMed.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3">
              <AlertCircle size={15} className="shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
            <div className="relative group">
              <input 
                type="email" required placeholder="nom@exemple.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-[52px] px-5 pr-12 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={16} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mot de passe</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:opacity-70 transition-opacity">Oublié ?</Link>
            </div>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} required placeholder="••••••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-[52px] px-5 pr-12 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-[52px] mt-2 flex items-center justify-center gap-3 bg-slate-900 hover:bg-brand-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.35)] group"
          >
            {loading 
              ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>S'identifier</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
            }
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Ou</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button 
          onClick={() => window.location.href = 'http://localhost:8000/api/auth/google/redirect'}
          className="h-[52px] w-full bg-white rounded-2xl flex items-center justify-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Continuer avec Google</span>
        </button>

        <p className="text-center text-xs text-slate-400 mt-8">
          Nouveau ?{' '}
          <Link to="/register" className="text-slate-700 font-bold hover:text-brand-blue transition-colors">Créer un compte →</Link>
        </p>
      </div>
    </div>
  );
}
