import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [profilActif, setProfilActif] = useState(null); 

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/moi');
            const userData = response.data.utilisateur;
            setUser(userData);
            
            if (userData.profils && userData.profils.length > 0) {
                const storedId = localStorage.getItem('profil_actif_id');
                const savedProfil = storedId ? userData.profils.find(p => p.id === parseInt(storedId)) : null;
                
                if (savedProfil) {
                    setProfilActif(savedProfil);
                } else {
                    setProfilActif(userData.profils[0]);
                    localStorage.setItem('profil_actif_id', userData.profils[0].id);
                }
            }
        } catch (error) {
            console.error("Erreur de récupération de l'utilisateur", error);
            setUser(null);
            setProfilActif(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/connexion', { email, password });
        const { token, utilisateur } = response.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(utilisateur);
        if (utilisateur.profils && utilisateur.profils.length > 0) {
            setProfilActif(utilisateur.profils[0]);
        }
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/inscription', userData);
        const { token, utilisateur } = response.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(utilisateur);
        if (utilisateur.profils && utilisateur.profils.length > 0) {
            setProfilActif(utilisateur.profils[0]);
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/deconnexion');
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('profil_actif_id');
            setToken(null);
            setUser(null);
            setProfilActif(null);
        }
    };

    const changerProfil = (profilId) => {
        if (!user || (!user.profils)) return;
        const newProfil = user.profils.find(p => p.id === parseInt(profilId, 10));
        if (newProfil) {
            setProfilActif(newProfil);
            localStorage.setItem('profil_actif_id', newProfil.id);
        }
    };

    const value = {
        user,
        token,
        profilActif,
        loading,
        fetchUser,
        login,
        register,
        logout,
        changerProfil,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                    <div className="h-12 w-12 border-b-2 border-brand-blue mb-4 animate-spin"></div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight animate-pulse">Session Sécurisée HomeMed...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
