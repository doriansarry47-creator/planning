import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'practitioner' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté (depuis le localStorage)
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ Utilisateur restauré depuis localStorage:', parsedUser.email);
        } catch (error) {
          console.error('❌ Erreur lors de la lecture des données utilisateur:', error);
          localStorage.removeItem('authUser');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // Déconnexion côté serveur (si API disponible)
      await fetch('/trpc/auth.logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Ignorer les erreurs de déconnexion API
      console.warn('Déconnexion API non disponible, nettoyage local uniquement');
    }

    // Nettoyage local
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setUser,
        setIsAuthenticated,
        logout,
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
