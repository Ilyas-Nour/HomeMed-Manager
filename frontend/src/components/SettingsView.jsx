import React, { useState } from 'react';
import {
  User, Bell, Shield, Lock,
  ChevronRight, Save, Trash2, X,
  Check, Eye, EyeOff, AlertTriangle,
  UserCircle, Mail, Key, Smartphone,
  ArrowLeft, ToggleLeft, ToggleRight,
  Users, LogOut, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/* ─── Tiny reusable toggle ─── */
function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-brand-blue' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform bg-white shadow-md transition-transform duration-200 ${
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
      showToast('Informations mises à jour avec succès !');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else showToast(data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelLayout title="Informations Personnelles" icon={<UserCircle size={20} className="text-brand-blue" />} onBack={onBack}>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100">
          <div className="h-16 w-16 bg-brand-blue text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-brand-blue/10">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Name */}
        <div className="med-form-field">
          <label className="med-form-label flex items-center gap-2">
            <User size={12} /> Nom Complet
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={`med-input ${errors.name ? 'border-red-400 focus:border-red-500' : ''}`}
            placeholder="Votre nom complet"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
        </div>

        {/* Email */}
        <div className="med-form-field">
          <label className="med-form-label flex items-center gap-2">
            <Mail size={12} /> Adresse Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={`med-input ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
            placeholder="votre@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="med-btn-primary w-full h-12 text-sm font-bold"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="mr-2" /> Enregistrer les modifications</>}
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

  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-brand-green', 'bg-emerald-500'][strength];

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
      showToast('Mot de passe mis à jour avec succès !');
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
    <PanelLayout title="Mot de Passe" icon={<Key size={20} className="text-brand-blue" />} onBack={onBack}>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            Choisissez un mot de passe fort avec au moins 8 caractères, une majuscule et un chiffre.
          </p>
        </div>

        {/* New password */}
        <div className="med-form-field">
          <label className="med-form-label">Nouveau Mot de Passe</label>
          <div className="relative">
            <input
              type={show.pwd ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={`med-input pr-12 ${errors.password ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              minLength={8}
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, pwd: !s.pwd }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              {show.pwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
          {/* Strength bar */}
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 transition-all ${i <= strength ? strengthColor : 'bg-slate-100'}`} />
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{strengthLabel}</p>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="med-form-field">
          <label className="med-form-label">Confirmer le Mot de Passe</label>
          <div className="relative">
            <input
              type={show.confirm ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
              className={`med-input pr-12 ${errors.password_confirmation ? 'border-red-400' : ''}`}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation[0]}</p>}
          {form.password_confirmation && form.password === form.password_confirmation && (
            <p className="text-xs text-brand-green mt-1 flex items-center gap-1"><Check size={12} /> Les mots de passe correspondent</p>
          )}
        </div>

        <button type="submit" disabled={loading || form.password.length < 8}
          className="med-btn-primary w-full h-12 text-sm font-bold disabled:opacity-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={16} className="mr-2" /> Mettre à jour le mot de passe</>}
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
      showToast('Préférences de notifications enregistrées !');
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const notifSections = [
    {
      title: 'Notifications Push',
      icon: <Smartphone size={16} className="text-brand-amber" />,
      items: [
        { key: 'push_medications', label: 'Rappels de médicaments', desc: 'Alertes à chaque heure de prise configurée.' },
        { key: 'push_renewals', label: 'Renouvellement de stock', desc: 'Quand le stock passe sous le seuil critique.' },
        { key: 'sound', label: 'Son des alertes', desc: 'Jouer un son lors des notifications.' },
      ]
    },
    {
      title: 'Rapports par Email',
      icon: <Mail size={16} className="text-brand-blue" />,
      items: [
        { key: 'email_reports', label: 'Résumé hebdomadaire', desc: "Bilan d'observance envoyé chaque lundi." },
        { key: 'email_alerts', label: 'Alertes critiques', desc: "Medications expirées ou stocks critiques." },
      ]
    }
  ];

  if (loading) {
    return (
      <PanelLayout title="Notifications" icon={<Bell size={20} className="text-brand-amber" />} onBack={onBack}>
         <div className="flex flex-col items-center justify-center py-24 opacity-30">
            <Loader2 className="animate-spin text-brand-blue mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Synchronisation...</p>
         </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Notifications" icon={<Bell size={20} className="text-brand-amber" />} onBack={onBack}>
      <div className="space-y-6">
        {notifSections.map((section, idx) => (
          <div key={idx} className="bg-white border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              {section.icon}
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.title}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-5">
                  <div className="space-y-0.5 mr-4">
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
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
          className="med-btn-primary w-full h-12 text-sm font-bold shadow-lg shadow-brand-blue/10"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="mr-2" /> Enregistrer les préférences</>}
        </button>
      </div>
    </PanelLayout>
  );
}


/* ─── Shared Panel Layout Wrapper ─── */
function PanelLayout({ title, icon, onBack, children }) {
  return (
    <div className="animate-fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-blue mb-6 transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour aux Paramètres
      </button>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
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

  const sections = [
    {
      title: 'Notifications',
      icon: <Bell size={16} className="text-brand-amber" />,
      items: [
        {
          id: 'notifications',
          label: 'Alertes et Rappels',
          desc: 'Gérez les rappels push et les rapports par email.',
          icon: <Bell size={18} className="text-brand-amber" />
        },
      ]
    },
    {
      title: 'Sécurité',
      icon: <Shield size={16} className="text-brand-green" />,
      items: [
        {
          id: 'password',
          label: 'Mot de Passe',
          desc: 'Changez le mot de passe de votre compte.',
          icon: <Key size={18} className="text-slate-400" />
        }
      ]
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">Gérez vos préférences de compte et votre sécurité.</p>
      </div>

      {/* User card */}
      <div className="bg-white border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
        <div className="h-14 w-14 bg-brand-blue text-white flex items-center justify-center text-xl font-bold shadow-md shadow-brand-blue/10 shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 truncate">{user?.name || 'Utilisateur'}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
        </div>
        <button
          onClick={() => { setActivePanel('profile'); setSettingsPanel && setSettingsPanel('profile'); }}
          className="text-[11px] font-bold text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 px-3 py-2 transition-all uppercase tracking-tight shrink-0"
        >
          Modifier
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white border border-slate-100 overflow-hidden shadow-sm">
            {/* Section header */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
              {section.icon}
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{section.title}</h3>
            </div>
            {/* Items */}
            <div className="divide-y divide-slate-50">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActivePanel(item.id); setSettingsPanel && setSettingsPanel(item.id); }}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all group text-left"
                >
                  <div className="h-9 w-9 bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-brand-blue/20 group-hover:bg-brand-blue/5 transition-all">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{item.desc}</p>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 uppercase tracking-tight shrink-0 hidden sm:block">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={15} className="text-slate-200 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 h-12 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold transition-all"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
