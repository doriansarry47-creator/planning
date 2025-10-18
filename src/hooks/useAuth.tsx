import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { User, Patient, AuthState } from '@/types';
import api from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'admin' | 'patient') => Promise<void>;
  logout: () => void;
  register: (userData: any, userType: 'admin' | 'patient') => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    userType: null,
  });
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType') as 'admin' | 'patient' | null;

    if (token && user && userType && user !== 'undefined') {
      try {
        const parsedUser = JSON.parse(user);
        setState({
          user: parsedUser,
          token,
          isAuthenticated: true,
          userType,
        });
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        // Nettoyer le localStorage en cas d'erreur
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'admin' | 'patient') => {
    try {
      console.log('🔑 Tentative de connexion:', { email, userType });
      const endpoint = `/auth?action=login&userType=${userType}`;
      const response = await api.post(endpoint, { email, password });
      
      // L'API retourne les données dans response.data.data
      const responseData = response.data.data || response.data;
      const { token, user: userData } = responseData;
      
      console.log('✅ Réponse API reçue:', { hasToken: !!token, hasUser: !!userData });
      
      if (!token || !userData) {
        throw new Error('Réponse du serveur invalide');
      }
      
      // Sauvegarder les données de session
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', userType);
      
      console.log('💾 Données sauvegardées dans localStorage');
      
      // Mettre à jour l'état local
      setState({
        user: userData,
        token,
        isAuthenticated: true,
        userType,
      });

      console.log('🔄 État mis à jour, redirection vers dashboard...');
      
      // Petit délai pour s'assurer que l'état est bien mis à jour
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to appropriate dashboard after successful login
      const dashboardPath = userType === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
      console.log('📍 Redirection vers:', dashboardPath);
      setLocation(dashboardPath);
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw new Error(error.message || error.response?.data?.message || error.response?.data?.error || 'Erreur de connexion');
    }
  };

  const register = async (userData: any, userType: 'admin' | 'patient') => {
    try {
      const endpoint = `/auth?action=register&userType=${userType}`;
      const response = await api.post(endpoint, userData);
      
      // L'API retourne les données dans response.data.data
      const responseData = response.data.data || response.data;
      const { token, user: newUser } = responseData;
      
      if (!token || !newUser) {
        throw new Error('Réponse du serveur invalide');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userType', userType);
      
      setState({
        user: newUser,
        token,
        isAuthenticated: true,
        userType,
      });

      // Redirect to appropriate dashboard after successful registration
      const dashboardPath = userType === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
      setLocation(dashboardPath);
    } catch (error: any) {
      throw new Error(error.message || error.response?.data?.message || error.response?.data?.error || 'Erreur d\'inscription');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      userType: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}