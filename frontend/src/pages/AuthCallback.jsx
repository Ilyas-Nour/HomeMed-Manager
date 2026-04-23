import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUser, socialLogin } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            socialLogin(token);
            
            // Rafraîchir les infos utilisateur et rediriger
            fetchUser().then(() => {
                navigate('/dashboard');
            }).catch(() => {
                navigate('/login?error=auth_failed');
            });
        } else {
            navigate('/login?error=' + (error || 'auth_failed'));
        }
    }, [searchParams, navigate, fetchUser]);

    return <LoadingScreen />;
};

export default AuthCallback;
