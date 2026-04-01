import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Utiliser l'IP directe
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Nécessaire pour les cookies Sanctum (bien que nous utilisions des tokens)
});

// Intercepteur de requête : Ajouter le token d'autorisation si existant
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur de réponse : Gérer les erreurs 401 (non autorisé)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expiré ou invalide : on déconnecte
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
