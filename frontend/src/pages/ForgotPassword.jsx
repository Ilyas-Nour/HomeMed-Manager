import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Mail, Lock, ArrowRight, 
  CheckCircle2, AlertCircle, Eye, EyeOff,
  Loader2, ChevronLeft
} from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    password_confirmation: ''
  });

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:8000/api/auth/forgot-password', { email: formData.email });
      setStep(2);
      setMessage('Un code de réinitialisation a été envoyé à votre e-mail.');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:8000/api/auth/reset-password', formData);
      setMessage('Votre mot de passe a été réinitialisé avec succès. Redirection...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
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

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/HomeMed-Logo.png" alt="HomeMed" className="h-14 object-contain" />
        </div>

        {/* Back link */}
        <Link to="/login" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors mb-8 group w-fit">
          <ChevronLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Retour à la connexion</span>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
            {step === 1 ? "Oublié ?" : "Nouveau départ."}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {step === 1 
              ? "Recevez un code de réinitialisation par e-mail." 
              : "Réinitialisez votre mot de passe."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3">
            <AlertCircle size={15} className="shrink-0" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {message && !error && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={15} className="shrink-0" />
            <span className="text-xs font-bold">{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
              <div className="relative group">
                <input 
                  type="email" required placeholder="nom@exemple.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-[52px] px-5 pr-12 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={16} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-[52px] mt-2 flex items-center justify-center gap-3 bg-slate-900 hover:bg-brand-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.35)] group"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : (
                <><span>Envoyer le code</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Code reçu</label>
              <input 
                type="text" required placeholder="000000" maxLength={6}
                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full h-[52px] px-5 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-center tracking-[0.5em] font-black text-lg text-brand-blue focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nouveau mot de passe</label>
              <input 
                type={showPassword ? "text" : "password"} required placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[52px] px-5 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmation</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors">
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} required placeholder="••••••••"
                value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full h-[52px] px-5 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:shadow-[0_2px_20px_rgba(79,70,229,0.12)] focus:border-brand-blue/30 outline-none transition-all duration-200"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-[52px] mt-2 flex items-center justify-center gap-3 bg-slate-900 hover:bg-brand-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.35)] group"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : (
                <><span>Réinitialiser</span><CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" /></>
              )}
            </button>
          </form>
        )}

        <p className="text-xs text-slate-400 mt-8">
          Besoin d'aide ? <a href="#" className="text-slate-700 font-bold hover:text-brand-blue transition-colors">Support →</a>
        </p>
      </div>
    </div>
  );
}
