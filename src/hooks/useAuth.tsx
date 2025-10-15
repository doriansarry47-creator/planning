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

    if (token && user && userType) {
      setState({
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        userType,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'admin' | 'patient') => {
    try {
      const endpoint = `/auth?action=login&userType=${userType}`;
      const response = await api.post(endpoint, { email, password });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', userType);
      
      setState({
        user: userData,
        token,
        isAuthenticated: true,
        userType,
      });

      // Redirect to appropriate dashboard after successful login
      const dashboardPath = userType === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
      setLocation(dashboardPath);
    } catch (error: any) {
      throw new Error(error.message || error.response?.data?.message || 'Erreur de connexion');
    }
  };

  const register = async (userData: any, userType: 'admin' | 'patient') => {
    try {
      const endpoint = `/auth?action=register&userType=${userType}`;
      const response = await api.post(endpoint, userData);
      
      const { token, user: newUser } = response.data;
      
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
      throw new Error(error.message || error.response?.data?.message || 'Erreur d\'inscription');
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