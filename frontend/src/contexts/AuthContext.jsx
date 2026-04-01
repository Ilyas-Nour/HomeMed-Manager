import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [profilActif, setProfilActif] = useState(null); // Par défaut null, le 1er profil sera sélectionné au chargement

    useEffect(() => {
        // Au chargement, si on a un token, on récupère le profil utilisateur Backend
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
            // Si l'utilisateur a des profils, sélectionner le premier (le "Moi-même" par défaut)
            if (userData.profils && userData.profils.length > 0 && !profilActif) {
                setProfilActif(userData.profils[0]);
            }
        } catch (error) {
            console.error("Erreur de récupération de l'utilisateur", error);
            // Le token est expiré ou invalide, l'intercepteur API va gérer ça (supprimer le token)
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
        }
    };

    const value = {
        user,
        token,
        profilActif,
        loading,
        login,
        register,
        logout,
        changerProfil,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
