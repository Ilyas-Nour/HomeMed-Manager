import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Chargement paresseux (Lazy Loading) pour une expérience ultra-rapide
const Login    = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

/**
 * Composant de chargement Premium - HomeMed Spinner
 */
const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 transition-colors duration-500 overflow-hidden relative">
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-3xl p-3 shadow-xl shadow-emerald-200/50 border border-emerald-100 flex items-center justify-center animate-pulse mb-8">
                <img src="/HomeMed-Logo.png" alt="HomeMed" className="w-12 h-12 object-contain" />
            </div>
            <div className="w-48 h-1 bg-slate-200/50 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-emerald-600 animate-[loading_1.5s_infinite_ease-in-out]"></div>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                Initialisation...
            </p>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes loading {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 60%; transform: translateX(50%); }
                100% { width: 0%; transform: translateX(200%); }
            }
        `}} />
    </div>
);

// Composant pour protéger les routes qui nécessitent une authentification
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Composant pour empêcher un utilisateur connecté d'accéder à /login ou /register
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        <Route path="/login" element={
                            <PublicRoute><Login /></PublicRoute>
                        } />
                        
                        <Route path="/register" element={
                            <PublicRoute><Register /></PublicRoute>
                        } />

                        <Route path="/dashboard" element={
                            <PrivateRoute><Dashboard /></PrivateRoute>
                        } />

                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
