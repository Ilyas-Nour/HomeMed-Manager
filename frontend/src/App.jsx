import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Composant pour protéger les routes qui nécessitent une authentification
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Composant pour empêcher un utilisateur connecté d'accéder à /login ou /register
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Redirection raçine vers Dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Routes publiques */}
                    <Route 
                        path="/login" 
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } 
                    />

                    {/* Routes protégées */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } 
                    />

                    {/* 404 - Page non trouvée (redirection temporaire) */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
