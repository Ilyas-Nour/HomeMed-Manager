import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Utiliser l'IP directe
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Nécessaire pour les cookies Sanctum (bien que nous utilisions des tokens)
});

const inflightRequests = new Map();

// Intercepteur de requête : Ajouter le token d'autorisation si existant
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const profilId = localStorage.getItem('profil_actif_id');
        if (profilId) {
            config.headers['X-Profil-Id'] = profilId;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Surcharge des méthodes de lecture pour le dédoublonnage
const wrapMethod = (method) => {
    const original = api[method];
    api[method] = function(url, config) {
        if (method !== 'get') return original.apply(this, arguments);
        
        const key = `${url}${JSON.stringify(config?.params || {})}`;
        if (inflightRequests.has(key)) return inflightRequests.get(key);
        
        const promise = original.apply(this, arguments).finally(() => {
            inflightRequests.delete(key);
        });
        
        inflightRequests.set(key, promise);
        return promise;
    };
};

['get', 'head', 'options'].forEach(wrapMethod);

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
