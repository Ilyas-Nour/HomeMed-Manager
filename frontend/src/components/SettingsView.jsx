import React, { useState, useEffect } from 'react';
import {
  User, Bell, ShieldCheck, Lock,
  ChevronRight, Save, Trash2, X,
  Check, Eye, EyeOff, AlertTriangle,
  UserCircle, Mail, Key, Smartphone,
  ArrowLeft, ToggleLeft, ToggleRight,
  Users, LogOut, Loader2, ArrowRight, LifeBuoy, Phone
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/* ─── Tiny reusable toggle — Sleek SaaS ─── */
function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-brand-blue/5 ${
        enabled ? 'bg-brand-blue' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-500 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ─── Sub‑panel: Informations Personnelles ─── */
function ProfilePanel({ onBack, showToast }) {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await api.patch('/auth/update', { name: form.name, email: form.email });
      await fetchUser();
      showToast('Informations mises à jour !');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else showToast(data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelLayout title="Informations Personnelles" icon={<UserCircle size={22} className="text-brand-blue" />} onBack={onBack}>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-125"></div>
          <div className="h-20 w-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-black rounded-2xl shadow-xl shadow-slate-900/10 relative z-10 transition-transform group-hover:rotate-3">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="relative z-10">
            <p className="text-lg font-black text-slate-900 tracking-tight">{user?.name}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <User size={12} /> Nom Complet
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={`w-full h-12 px-6 bg-slate-50/50 border rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all ${errors.name ? 'border-rose-400' : 'border-slate-100'}`}
                placeholder="Votre nom complet"
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Mail size={12} /> Adresse Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full h-12 px-6 bg-slate-50/50 border rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all ${errors.email ? 'border-rose-400' : 'border-slate-100'}`}
                placeholder="votre@email.com"
              />
              {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email[0]}</p>}
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} className="mr-3" /> Enregistrer</>}
        </button>
      </form>
    </PanelLayout>
  );
}

/* ─── Sub‑panel: Mot de Passe ─── */
function PasswordPanel({ onBack, showToast }) {
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [show, setShow] = useState({ pwd: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = (() => {
    const p = form.password;
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Sûre'][strength];
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-brand-blue'][strength];

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.patch('/auth/update', { password: form.password, password_confirmation: form.password_confirmation });
      showToast('Mot de passe mis à jour !');
      setForm({ password: '', password_confirmation: '' });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else showToast(data?.message || 'Erreur lors du changement.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelLayout title="Sécurité" icon={<ShieldCheck size={22} className="text-emerald-500" />} onBack={onBack}>
      <form onSubmit={handleSave} className="space-y-8">
        <div className="p-6 bg-slate-950 rounded-3xl text-white flex items-start gap-4 shadow-xl shadow-slate-900/10">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-400 leading-relaxed">
            Pour plus de sécurité, utilisez un mot de passe d'au moins 8 caractères combinant majuscules, chiffres et symboles.
          </p>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nouveau Mot de Passe</label>
              <div className="relative group/input">
                <input
                  type={show.pwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`w-full h-12 px-6 bg-slate-50/50 border rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all ${errors.password ? 'border-rose-400' : 'border-slate-100'}`}
                  placeholder="••••••••"
                  minLength={8}
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, pwd: !s.pwd }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors">
                  {show.pwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password[0]}</p>}
              
              {form.password.length > 0 && (
                <div className="mt-4 px-1 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 transition-all duration-700 rounded-full ${i <= strength ? strengthColor : 'bg-slate-100'}`} />
                    ))}
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${strength > 0 ? strengthColor.replace('bg-', 'text-') : 'text-slate-300'}`}>Sécurité : {strengthLabel}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmer</label>
              <div className="relative group/input">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  className={`w-full h-12 px-6 bg-slate-50/50 border rounded-xl text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue outline-none transition-all ${errors.password_confirmation ? 'border-rose-400' : 'border-slate-100'}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors">
                  {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password_confirmation[0]}</p>}
              {form.password_confirmation && form.password === form.password_confirmation && (
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 ml-1 flex items-center gap-2 animate-fade-in"><Check size={14} strokeWidth={3} /> Correspondance validée</p>
              )}
            </div>
        </div>

        <button type="submit" disabled={loading || form.password.length < 8}
          className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-950/10 hover:bg-brand-blue hover:shadow-brand-blue/30 hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-40">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Key size={18} className="mr-3" /> Mettre à jour</>}
        </button>
      </form>
    </PanelLayout>
  );
}

/* ─── Sub‑panel: Notifications ─── */
function NotificationsPanel({ onBack, showToast }) {
  const [prefs, setPrefs] = useState({
    push_medications: true,
    push_renewals: true,
    email_reports: false,
    email_alerts: true,
    sound: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setPrefs(res.data);
    } catch (e) {
      console.error(e);
      showToast('Erreur de chargement des préférences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/notifications/preferences', prefs);
      showToast('Préférences enregistrées !');
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const notifSections = [
    {
      title: 'Notifications Mobiles',
      icon: <Smartphone size={16} className="text-amber-500" />,
      items: [
        { key: 'push_medications', label: 'Rappels de prise', desc: 'Alertes en temps réel pour vos médicaments.' },
        { key: 'push_renewals', label: 'Alertes stock', desc: 'Quand un médicament arrive à épuisement.' },
        { key: 'sound', label: 'Sons push', desc: 'Activer le signal sonore des notifications.' },
      ]
    },
    {
      title: 'Correspondance Email',
      icon: <Mail size={16} className="text-brand-blue" />,
      items: [
        { key: 'email_reports', label: 'Bilan Hebdomadaire', desc: "Résumé d'observance envoyé chaque lundi." },
        { key: 'email_alerts', label: 'Urgence sécurité', desc: "Alerte en cas d'expiration ou stock critique." },
      ]
    }
  ];

  if (loading) {
    return (
      <PanelLayout title="Notifications" icon={<Bell size={22} className="text-amber-500" />} onBack={onBack}>
         <div className="flex flex-col items-center justify-center py-32">
            <div className="h-10 w-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chargement des alertes...</p>
         </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Notifications" icon={<Bell size={22} className="text-amber-500" />} onBack={onBack}>
      <div className="space-y-8">
        {notifSections.map((section, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm">{section.icon}</div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.title}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-6 group transition-colors hover:bg-slate-50/40">
                  <div className="space-y-1 pr-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{item.label}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  </div>
                  <Toggle enabled={prefs[item.key]} onToggle={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} className="mr-3" /> Appliquer</>}
        </button>
      </div>
    </PanelLayout>
  );
}


/* ─── Sub‑panel: Support ─── */
function SupportPanel({ onBack, publicSettings }) {
  return (
    <PanelLayout title="Besoin d'aide ?" icon={<LifeBuoy size={22} className="text-rose-500" />} onBack={onBack}>
      <div className="space-y-8">
        <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
          <p className="text-xl font-black tracking-tight mb-2 relative z-10">Une question ?</p>
          <p className="text-slate-400 text-sm font-medium relative z-10">Notre équipe est à votre disposition pour vous aider à gérer votre pharmacie familiale.</p>
        </div>

        <div className="space-y-4">
          {publicSettings?.support_email && (
            <a href={`mailto:${publicSettings.support_email}`} className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="h-12 w-12 bg-indigo-50 text-brand-blue rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email de support</p>
                <p className="text-base font-black text-slate-900">{publicSettings.support_email}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </a>
          )}

          {publicSettings?.support_phone && (
            <a href={`tel:${publicSettings.support_phone}`} className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</p>
                <p className="text-base font-black text-slate-900">{publicSettings.support_phone}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>

        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
          <Check size={16} className="text-emerald-500" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            Support disponible du Lundi au Vendredi, 9h - 18h.
          </p>
        </div>
      </div>
    </PanelLayout>
  );
}


/* ─── Shared Panel Layout Wrapper ─── */
function PanelLayout({ title, icon, onBack, children }) {
  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-blue mb-8 transition-all group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-500" />
        Retour
      </button>
      <div className="flex items-center gap-5 mb-12 px-1">
        <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm rotate-3">
          {icon}
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ─── MAIN SettingsView ─── */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function SettingsView({ showToast, settingsPanel, setSettingsPanel }) {
  const { user, logout } = useAuth();
  const [activePanel, setActivePanel] = useState(settingsPanel);
  const [publicSettings, setPublicSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/public');
      setPublicSettings(res.data);
    } catch (e) {
      console.error('Failed to fetch public settings', e);
    }
  };

  React.useEffect(() => {
    setActivePanel(settingsPanel);
  }, [settingsPanel]);

  const handleBack = () => {
    setActivePanel(null);
    setSettingsPanel && setSettingsPanel(null);
  };

  /* If a sub-panel is active, render it */
  if (activePanel === 'profile')       return <ProfilePanel onBack={handleBack} showToast={showToast} />;
  if (activePanel === 'notifications') return <NotificationsPanel onBack={handleBack} showToast={showToast} />;
  if (activePanel === 'password')      return <PasswordPanel onBack={handleBack} showToast={showToast} />;
  if (activePanel === 'support')       return <SupportPanel onBack={handleBack} publicSettings={publicSettings} />;

  const sections = [
    {
      title: 'Préférences',
      icon: <Bell size={14} className="text-amber-500" />,
      items: [
        {
          id: 'notifications',
          label: 'Alertes & Rappels',
          desc: 'Notifications push et rapports hebdomadaires.',
          icon: <Bell size={18} />,
          color: 'text-amber-500 bg-amber-50'
        },
      ]
    },
    {
      title: 'Sécurité & Accès',
      icon: <ShieldCheck size={14} className="text-emerald-500" />,
      items: [
        {
          id: 'password',
          label: 'Mot de passe',
          desc: 'Clés de sécurité et authentification.',
          icon: <Key size={18} />,
          color: 'text-indigo-600 bg-indigo-50'
        }
      ]
    },
    {
      title: 'Aide & Assistance',
      icon: <LifeBuoy size={14} className="text-rose-500" />,
      items: [
        {
          id: 'support',
          label: "Besoin d'aide ?",
          desc: 'Contactez notre équipe de support.',
          icon: <LifeBuoy size={18} />,
          color: 'text-rose-500 bg-rose-50'
        }
      ]
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-up pb-24">
      {/* Header */}
      <div className="px-1 space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-base font-medium text-slate-500">Personnalisez votre expérience et gérez votre sécurité.</p>
      </div>

      {/* User profile card */}
      <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
        <div className="h-20 w-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-black rounded-2xl shadow-xl shadow-slate-900/10 relative transition-transform group-hover:rotate-3 shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-lg font-black text-slate-900 tracking-tight truncate">{user?.name || 'Utilisateur'}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{user?.email || ''}</p>
        </div>
        <button
          onClick={() => { setActivePanel('profile'); setSettingsPanel && setSettingsPanel('profile'); }}
          className="relative h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm shrink-0 active:scale-95"
        >
          Modifier
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-10">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <div className="h-6 w-1 bg-brand-blue rounded-full"></div>
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{section.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActivePanel(item.id); setSettingsPanel && setSettingsPanel(item.id); }}
                  className="w-full flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-blue/30 transition-all duration-500 group text-left active:scale-[0.99]"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white transition-all group-hover:scale-110 group-hover:rotate-3 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-slate-900 tracking-tight">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{item.desc}</p>
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-200 group-hover:bg-brand-blue group-hover:text-white transition-all">
                     <ArrowRight size={18} strokeWidth={3} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="pt-8 px-1">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 h-14 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-rose-100 active:scale-[0.98]"
        >
          <LogOut size={16} strokeWidth={3} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
