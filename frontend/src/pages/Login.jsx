import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, Pill } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.code === 'ERR_NETWORK') {
                setError("Notre serveur est momentanément indisponible. Merci de réessayer.");
            } else if (err.response?.status === 401) {
                setError("Oups ! Vos identifiants de connexion semblent incorrects.");
            } else {
                setError("Une petite erreur technique est survenue lors de la connexion.");
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
                        <div className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-200">
                            <Pill size={32} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Bon retour !</h2>
                    <p className="text-center text-gray-500 mb-8">Gérez vos médicaments en toute simplicité.</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
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
                                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    placeholder="vous@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
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
                                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-md shadow-blue-200"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
                
                <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                    <p className="text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
