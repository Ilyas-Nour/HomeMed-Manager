import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '/HomeMed-Logo.png';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
      setError(err.response?.data?.message || 'Identifiants incorrects.'); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 p-6">
      
      <div className="max-w-md w-full space-y-10 bg-white p-8 sm:p-12 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
        
        <div className="space-y-4">
           <div className="flex justify-center mb-8">
             <img src={logo} alt="HomeMed" className="h-12 object-contain" />
           </div>
           <div className="text-center">
             <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">Ravi de vous revoir.</h1>
             <p className="text-slate-500 font-medium leading-relaxed mt-2 text-sm">Connectez-vous pour reprendre le suivi de vos traitements de santé.</p>
           </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] font-bold flex items-center gap-3 animate-shake">
               <ShieldCheck size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors" />
                <input
                  type="email" required placeholder="nom@exemple.fr"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors bg-white/50 p-1 rounded-md"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-14 bg-slate-950 text-white rounded-2xl font-bold text-sm tracking-wide shadow-2xl shadow-slate-950/20 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  <>CONNEXION <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>
        </div>

        <div className="pt-8 flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-slate-100" />
              <span className="text-[9px] font-bold text-slate-300 tracking-[0.2em] uppercase">Pas encore de compte ?</span>
              <div className="h-[1px] flex-1 bg-slate-100" />
           </div>
           
           <Link to="/register" className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-all flex items-center gap-2 group decoration-2 underline-offset-4 hover:underline">
              Créer un compte <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
           </Link>
        </div>

      </div>
    </div>
  );
}
