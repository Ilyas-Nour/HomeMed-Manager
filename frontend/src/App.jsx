import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ShieldCheck, Activity, Plus } from 'lucide-react';

import LoadingScreen from './components/LoadingScreen';
import { NotificationProvider } from './contexts/NotificationContext';
import SoundToast from './components/SoundToast';
import ScrollToTop from './components/ScrollToTop';
import AIChatbot from './components/AIChatbot';

// Chargement paresseux (Lazy Loading) pour une expérience professionnelle fluide
const Login    = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
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
                    <ScrollToTop />
                    <Suspense fallback={<LoadingScreen />}>
                        <Routes>
                            {/* ... existing routes ... */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Suspense>
                    <AIChatbot />
                </BrowserRouter>
                <SoundToast />
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
