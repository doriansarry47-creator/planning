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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 🔹 Vérifie d'abord le compte administrateur local
      if (email === 'doriansarry@yahoo.fr' && password === 'admin123') {
        const adminUser: User = {
          id: '1',
          email,
          name: 'Administrateur',
          role: 'admin',
        };

        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(adminUser));
        return true;
      }

      // 🔹 Authentification via l'API uniquement si ce n'est pas le compte admin local
      try {
        const response = await fetch('/trpc/admin.login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ json: { email, password } }),
        });

        if (response.ok) {
          const data = await response.json();
          const apiUser = data.result?.data?.json?.user;

          if (data.result?.data?.json?.success && apiUser) {
            const authenticatedUser: User = {
              id: String(apiUser.id),
              email: apiUser.email,
              name: apiUser.name,
              role: apiUser.role,
            };

            setUser(authenticatedUser);
            setIsAuthenticated(true);
            localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
            return true;
          }
        }
      } catch (apiError) {
        // Si l'API n'est pas disponible, on continue sans erreur fatale
        console.warn('API non disponible, seule l\'authentification locale est active');
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // 🔹 Déconnexion côté serveur (si API disponible)
      await fetch('/trpc/auth.logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Ignorer les erreurs de déconnexion API
      console.warn('Déconnexion API non disponible, nettoyage local uniquement');
    }

    // 🔹 Nettoyage local
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
