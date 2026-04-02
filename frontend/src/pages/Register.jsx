import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck, Heart, Info, ClipboardList, Eye, EyeOff } from 'lucide-react';
import logo from '/HomeMed-Logo.png';

/**
 * Register Premium — "Perfect White & Emerald"
 * Design : Épuré, Spacieux, Expérience de bienvenue fluide.
 */
export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register }             = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name, email, password, password_confirmation });
      navigate('/dashboard');
    } catch (err) { 
      setError(err.response?.data?.message || "Une erreur s'est produite lors de l'inscription."); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 lg:p-12 relative overflow-hidden font-sans">
      
      {/* Clean Slate Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200" />

      <div className="w-full max-w-lg relative z-10 animate-fade-up">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-center mb-6">
                <img src={logo} alt="HomeMed" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-2">Rejoignez HomeMed</h1>
            <p className="text-slate-400 font-medium text-sm text-center">Commencez dès aujourd'hui votre suivi médical intelligent.</p>
        </div>

        {/* Card Container */}
        <div className="hm-card p-6 sm:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-100/50 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-fade-up">
               <Info size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="hm-label">Votre Nom Complet</label>
                    <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text" required placeholder="Jean Dupont"
                            value={name} onChange={e => setName(e.target.value)}
                            className="hm-input pl-12 h-12"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="hm-label">Adresse E-mail</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="email" required placeholder="nom@exemple.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="hm-input pl-12 h-12"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="hm-label">Mot de passe</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="hm-input pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="hm-label">Confirmez</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="••••••••"
                    value={password_confirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                    className="hm-input pl-12 pr-12 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit" disabled={loading}
                    className="w-full hm-btn h-14 text-base shadow-emerald-500/10 group transition-all"
                >
                    {loading ? 'Création...' : (
                        <>CRÉER MON ESPACE <UserPlus size={18} className="transition-transform group-hover:scale-110 ml-2" /></>
                    )}
                </button>
            </div>
          </form>

          {/* Social Proof Divider */}
          <div className="my-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-100" />
              <span className="text-[9px] font-extrabold text-slate-300 tracking-[0.2em] uppercase">Déjà inscrit ?</span>
              <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          
          <Link to="/login" className="w-full hm-btn-secondary h-12">
            Se Connecter <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Footer Support */}
        <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck size={14} /> <span className="text-[10px] font-bold tracking-widest uppercase">Protection des données</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <ClipboardList size={14} /> <span className="text-[10px] font-bold tracking-widest uppercase">Conforme RGPD</span>
                </div>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">© 2026 HomeMed Manager. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
