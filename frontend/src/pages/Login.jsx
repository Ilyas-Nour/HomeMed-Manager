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
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
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
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Bienvenue.</h1>
           <p className="text-slate-500 font-medium text-lg italic tracking-tight">Heureux de vous revoir sur HomeMed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-fade-in">
              <AlertCircle size={18} />
              <span className="text-sm font-bold tracking-tight">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Identifiant</label>
            <div className="relative group">
              <input 
                type="email" 
                required
                placeholder="nom@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input !bg-slate-50/50"
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mot de passe</label>
               <button type="button" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-blue-700">Oublié ?</button>
            </div>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input !bg-slate-50/50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="auth-btn flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-200"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-widest text-xs font-black">S'identifier</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-10">
          <div className="w-full h-px bg-slate-100" />
          <span className="absolute px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou continuer avec</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button className="h-12 border border-slate-100 bg-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              <span className="text-[11px] font-black uppercase tracking-wider">Google</span>
           </button>
           <button className="h-12 border border-slate-100 bg-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm">
              <img src="https://www.svgrepo.com/show/475633/apple-color.svg" className="h-5 w-5" alt="Apple" />
              <span className="text-[11px] font-black uppercase tracking-wider">Apple</span>
           </button>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 mt-12">
          Nouveau sur la plateforme ?{' '}
          <Link to="/register" className="text-brand-blue font-bold hover:text-blue-700 underline underline-offset-4 decoration-2">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
