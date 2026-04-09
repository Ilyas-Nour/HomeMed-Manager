import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ShieldCheck, Activity, Plus } from 'lucide-react';

import LoadingScreen from './components/LoadingScreen';
import { NotificationProvider } from './contexts/NotificationContext';
import SoundToast from './components/SoundToast';

// Chargement paresseux (Lazy Loading) pour une expérience professionnelle fluide
const Login    = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

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
            <NotificationProvider>
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
                <SoundToast />
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
