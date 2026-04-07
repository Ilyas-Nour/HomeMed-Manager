import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ShieldCheck, Activity } from 'lucide-react';

// Chargement paresseux (Lazy Loading) pour une expérience professionnelle fluide
const Login    = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

/**
 * Composant de chargement Clinique - Standard HomeMed
 */
const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white selection:bg-brand-blue/10 overflow-hidden relative">
        <div className="relative z-10 flex flex-col items-center animate-med-in">
            {/* Logo Médical en chargement */}
            <div className="w-20 h-20 bg-white p-4 shadow-sm border border-slate-100 flex items-center justify-center animate-pulse mb-8">
                <img src="/HomeMed-Logo.png" alt="HomeMed" className="w-14 h-14 object-contain" />
            </div>
            
            {/* Barre de progression clinique */}
            <div className="w-56 h-1 bg-slate-100 overflow-hidden shrink-0">
                <div className="h-full bg-brand-blue animate-[loading_1.8s_infinite_ease-in-out]"></div>
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight animate-pulse">
                   Préparation de votre tableau de bord...
               </p>
               <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck size={12} strokeWidth={3} />
                  <span className="text-[8px] font-bold uppercase tracking-tight">Environnement Sécurisé</span>
               </div>
            </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes loading {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 70%; transform: translateX(50%); }
                100% { width: 0%; transform: translateX(200%); }
            }
        `}} />
    </div>
);

/**
 * Routes Protégées (Accès réservé aux utilisateurs authentifiés)
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Routes Publiques (Redirection vers Dashboard si déjà connecté)
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * App — Architecture de la Renaissance Médicale
 * Phasing : 
 * Phase 1 (Actuelle) : Auth + Core Meds + Sidebar UI.
 * Phase 2-4 : Définies via Dashboard Switchers.
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* Redirection Racine */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        <Route path="/login" element={
                            <PublicRoute><Login /></PublicRoute>
                        } />
                        
                        <Route path="/register" element={
                            <PublicRoute><Register /></PublicRoute>
                        } />

                        {/* Point d'entrée unique de la Renaissance */}
                        <Route path="/dashboard" element={
                            <PrivateRoute><Dashboard /></PrivateRoute>
                        } />

                        {/* Gestion des erreurs 404 */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
