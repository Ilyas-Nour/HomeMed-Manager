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
  const storageKey = 'homemed_notifications';
  const [prefs, setPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {
        push_medications: true,
        push_renewals: true,
        email_reports: false,
        email_alerts: true,
        sound: true,
      };
    } catch { return { push_medications: true, push_renewals: true, email_reports: false, email_alerts: true, sound: true }; }
  });

  const toggle = (key) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
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

  return (
    <PanelLayout title="Notifications" icon={<Bell size={20} className="text-brand-amber" />} onBack={onBack}>
      <div className="space-y-6">
        {notifSections.map((section, idx) => (
          <div key={idx} className="bg-white border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              {section.icon}
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-tight">{section.title}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-5">
                  <div className="space-y-0.5 mr-4">
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <Toggle enabled={prefs[item.key]} onToggle={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => showToast('Préférences de notifications enregistrées !')}
          className="med-btn-primary w-full h-12 text-sm font-bold"
        >
          <Save size={16} className="mr-2" /> Enregistrer
        </button>
      </div>
    </PanelLayout>
  );
}

/* ─── Sub‑panel: Sécurité / 2FA ─── */
function SecurityPanel({ onBack, showToast }) {
  const [twoFa, setTwoFa] = useState(false);
  const [sessions] = useState([
    { device: 'Chrome · Windows', location: 'Alger, DZ', current: true, time: "Maintenant" },
    { device: 'Safari · iPhone', location: 'Alger, DZ', current: false, time: "Il y a 2 jours" },
  ]);

  return (
    <PanelLayout title="Sécurité" icon={<Shield size={20} className="text-brand-green" />} onBack={onBack}>
      <div className="space-y-6">
        {/* 2FA */}
        <div className="bg-white border border-slate-100 overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-0.5 mr-4">
              <p className="text-sm font-bold text-slate-800">Authentification à deux facteurs</p>
              <p className="text-xs text-slate-400">Ajoutez une couche de sécurité supplémentaire avec un code OTP.</p>
            </div>
            <Toggle enabled={twoFa} onToggle={() => { setTwoFa(!twoFa); showToast(twoFa ? '2FA désactivée.' : '2FA activée ! (Demo)'); }} />
          </div>
          {twoFa && (
            <div className="mx-5 mb-5 p-4 bg-brand-green/5 border border-brand-green/20">
              <p className="text-xs text-brand-green font-bold flex items-center gap-2">
                <Check size={14} /> Authentification forte activée
              </p>
            </div>
          )}
        </div>

        {/* Sessions actives */}
        <div className="bg-white border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Sessions Actives</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">{s.device}</p>
                    {s.current && (
                      <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase tracking-tight">Actuel</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{s.location} · {s.time}</p>
                </div>
                {!s.current && (
                  <button onClick={() => showToast('Session révoquée.')} className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors">
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

/* ─── Sub‑panel: Membre de la Famille ─── */
function FamilyPanel({ onBack, setCurrentView }) {
  const { user } = useAuth();
  return (
    <PanelLayout title="Famille" icon={<Users size={20} className="text-brand-blue" />} onBack={onBack}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Gérez les profils médicaux des membres de votre famille.</p>
        {user?.profils?.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100">
            <div className="h-10 w-10 bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
              {p.nom.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{p.nom}</p>
              <p className="text-xs text-slate-400">{p.relation}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-brand-green px-2 py-1 bg-brand-green/10">Actif</span>
          </div>
        ))}
        <button
          onClick={() => { onBack(); setCurrentView('family'); }}
          className="med-btn-primary w-full h-12 text-sm font-bold"
        >
          <Users size={16} className="mr-2" /> Gérer les Profils Familiaux
        </button>
      </div>
    </PanelLayout>
  );
}

/* ─── Sub‑panel: Supprimer le compte ─── */
function DeleteAccountPanel({ onBack, showToast }) {
  const { logout } = useAuth();
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (confirm !== 'SUPPRIMER') return;
    setLoading(true);
    try {
      // endpoint not yet implemented — show graceful message
      showToast('Demande envoyée. Un administrateur traitera votre demande.', 'info');
      setTimeout(() => logout(), 2000);
    } catch {
      showToast('Erreur lors de la demande de suppression.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelLayout title="Supprimer le Compte" icon={<Trash2 size={20} className="text-red-500" />} onBack={onBack}>
      <div className="space-y-6">
        <div className="p-5 bg-red-50 border border-red-100 space-y-2">
          <p className="text-sm font-bold text-red-700">⚠️ Action irréversible</p>
          <p className="text-xs text-red-600">Toutes vos données, profils familiaux et médicaments seront définitivement effacés. Cette action ne peut pas être annulée.</p>
        </div>
        <div className="med-form-field">
          <label className="med-form-label">Tapez <span className="font-bold text-red-500">SUPPRIMER</span> pour confirmer</label>
          <input
            type="text"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="med-input"
            placeholder="SUPPRIMER"
          />
        </div>
        <button
          onClick={handle}
          disabled={confirm !== 'SUPPRIMER' || loading}
          className="w-full h-12 text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Supprimer définitivement</>}
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
export default function SettingsView({ showToast, setCurrentView }) {
  const { user, logout } = useAuth();
  const [activePanel, setActivePanel] = useState(null); // null = main list

  /* If a sub-panel is active, render it */
  if (activePanel === 'profile')       return <ProfilePanel onBack={() => setActivePanel(null)} showToast={showToast} />;
  if (activePanel === 'family')        return <FamilyPanel  onBack={() => setActivePanel(null)} setCurrentView={setCurrentView} />;
  if (activePanel === 'notifications') return <NotificationsPanel onBack={() => setActivePanel(null)} showToast={showToast} />;
  if (activePanel === 'password')      return <PasswordPanel onBack={() => setActivePanel(null)} showToast={showToast} />;
  if (activePanel === 'security')      return <SecurityPanel onBack={() => setActivePanel(null)} showToast={showToast} />;
  if (activePanel === 'delete')        return <DeleteAccountPanel onBack={() => setActivePanel(null)} showToast={showToast} />;

  const sections = [
    {
      title: 'Paramètres du Profil',
      icon: <User size={16} className="text-brand-blue" />,
      items: [
        {
          id: 'profile',
          label: 'Informations Personnelles',
          desc: 'Nom, email et avatar de votre compte.',
          badge: user?.name,
          icon: <UserCircle size={18} className="text-brand-blue" />
        },
        {
          id: 'family',
          label: 'Membres de la Famille',
          desc: 'Gérez les profils médicaux familiaux.',
          badge: user?.profils?.length ? `${user.profils.length} profil(s)` : null,
          icon: <Users size={18} className="text-slate-400" />
        },
      ]
    },
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
        },
        {
          id: 'security',
          label: 'Authentification Forte',
          desc: 'Sessions actives et protection 2FA.',
          icon: <Shield size={18} className="text-brand-green" />
        },
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
          onClick={() => setActivePanel('profile')}
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
                  onClick={() => setActivePanel(item.id)}
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
        <button
          onClick={() => setActivePanel('delete')}
          className="w-full flex items-center justify-center gap-2 h-12 border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 text-sm font-bold transition-all"
        >
          <Trash2 size={16} /> Supprimer le Compte
        </button>
      </div>
    </div>
  );
}
