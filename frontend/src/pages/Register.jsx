import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, ArrowRight, Pill } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);

        if (password !== passwordConfirm) {
            setErrors({ password_confirmation: ["Les mots de passe ne correspondent pas."] });
            return;
        }

        setLoading(true);

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirm
            });
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 422) {
                // Erreurs de validation Laravel
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: ["Une erreur est survenue lors de l'inscription."] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-600 p-3 rounded-full shadow-lg shadow-green-200">
                            <Pill size={32} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Rejoignez HomeMed</h2>
                    <p className="text-center text-gray-500 mb-8">Créez votre compte pour gérer vos traitements.</p>

                    {errors?.general && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-200">
                            {errors.general[0]}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="name">
                                Nom complet
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className={`pl-10 w-full rounded-lg border ${errors?.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} px-4 py-2.5 outline-none focus:ring-2 transition-shadow`}
                                    placeholder="Jean Dupont"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="email">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className={`pl-10 w-full rounded-lg border ${errors?.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} px-4 py-2.5 outline-none focus:ring-2 transition-shadow`}
                                    placeholder="vous@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="password">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className={`pl-10 w-full rounded-lg border ${errors?.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} px-4 py-2.5 outline-none focus:ring-2 transition-shadow`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="passwordConfirm">
                                Confirmer mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="passwordConfirm"
                                    type="password"
                                    required
                                    className={`pl-10 w-full rounded-lg border ${errors?.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} px-4 py-2.5 outline-none focus:ring-2 transition-shadow`}
                                    placeholder="••••••••"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                />
                            </div>
                            {errors?.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70 shadow-md shadow-green-200"
                        >
                            {loading ? 'Création en cours...' : 'S\'inscrire'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
                
                <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                    <p className="text-sm text-gray-600">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-green-600 font-semibold hover:text-green-800 transition-colors">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
