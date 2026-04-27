import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, 
  CheckCircle2, AlertCircle, Eye, EyeOff,
  ChevronLeft, Loader2
} from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Info
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    password_confirmation: '',
    code: '',
    verification_token: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { register, sendVerificationCode, verifyCode } = useAuth();
  const navigate                = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendVerificationCode(formData.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await verifyCode(formData.email, formData.code);
      setFormData({ ...formData, verification_token: data.verification_token });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        verification_token: formData.verification_token
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSendCode} className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Adresse Email</label>
        <div className="relative group">
          <input 
            type="email" required placeholder="nom@exemple.com"
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/8 outline-none transition-all"
          />
          <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={16} />
        </div>
      </div>
      <button 
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
       >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : (
          <>
            <span className="uppercase tracking-widest text-[10px] font-black">Recevoir mon code</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Ou s'inscrire via</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

      <button 
        type="button"
        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`}
        className="h-12 border border-slate-200 bg-white/50 rounded-xl flex items-center justify-center gap-3 hover:bg-white hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm w-full group"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 group-hover:scale-110 transition-transform" alt="Google" />
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">continuer avec Google</span>
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyCode} className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code de vérification</label>
          <button 
            type="button" onClick={() => setStep(1)}
            className="text-[10px] font-bold text-brand-blue hover:text-blue-700 transition-colors"
          >
            Changer d'email
          </button>
        </div>
        <div className="relative group">
          <input 
            type="text" required placeholder="000000" maxLength={6}
            value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
            className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-center tracking-[0.5em] font-black text-lg text-brand-blue focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/8 outline-none transition-all"
          />
        </div>
      </div>
      <button 
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
       >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : (
          <>
            <span className="uppercase tracking-widest text-[10px] font-black">Vérifier le code</span>
            <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
          </>
        )}
      </button>
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
        Pas reçu ? <button type="button" onClick={handleSendCode} className="text-brand-blue hover:text-blue-700 transition-colors">Renvoyer</button>
      </p>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom Complet</label>
        <div className="relative group">
          <input 
            type="text" required placeholder="Ex: Jean Dupont"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 px-5 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
          />
          <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={16} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mot de passe</label>
        <div className="relative group">
          <input 
            type={showPassword ? "text" : "password"} required placeholder="••••••••"
            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 px-5 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
          />
          <button 
            type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Confirmation</label>
        <input 
          type={showPassword ? "text" : "password"} required placeholder="••••••••"
          value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
          className="w-full h-12 px-5 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 flex items-center justify-center gap-3 bg-slate-900 hover:bg-brand-blue text-white rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
       >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : (
          <>
            <span className="uppercase tracking-widest text-[10px] font-black">Créer mon compte</span>
            <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden flex items-center justify-end font-sans">
      {/* Full Page Wavy Background */}
      <img 
        src="/image copy.png" 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Form — floats directly on the open right area */}
      <div className="relative z-10 w-full max-w-[380px] mr-[7vw] xl:mr-[10vw] animate-fade-up">

        {/* Logo + Brand */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/HomeMed-Logo.png" alt="HomeMed" className="h-14 object-contain" />
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: step >= s ? '#0f172a' : '#e2e8f0' }}
            />
          ))}
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
            {step === 1 && "Commençons."}
            {step === 2 && "Vérification."}
            {step === 3 && "Presque fini."}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {step === 1 && "Créez votre compte HomeMed."}
            {step === 2 && "Entrez le code reçu par email."}
            {step === 3 && "Finalisez votre profil."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3">
            <AlertCircle size={15} className="shrink-0" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <p className="text-center text-xs text-slate-400 mt-8">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-slate-700 font-bold hover:text-brand-blue transition-colors">Se connecter →</Link>
        </p>
      </div>
    </div>
  );
}
