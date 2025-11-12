import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'practitioner' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté (depuis le localStorage)
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Appel à l'API d'authentification réelle
      const response = await fetch('/trpc/admin.login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: { email, password },
        }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la connexion:', response.statusText);
        return false;
      }

      const data = await response.json();
      
      if (data.result?.data?.json?.success && data.result?.data?.json?.user) {
        const authenticatedUser: User = {
          id: String(data.result.data.json.user.id),
          email: data.result.data.json.user.email,
          name: data.result.data.json.user.name,
          role: data.result.data.json.user.role,
        };
        
        setUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Fallback sur l'authentification mock pour le développement
      if (email === 'doriansarry@yahoo.fr' && password === 'admin123') {
        const adminUser: User = {
          id: '1',
          email: email,
          name: 'Administrateur',
          role: 'admin',
        };
        
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Appeler l'API de déconnexion
      await fetch('/trpc/auth.logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    
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
        login,
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
