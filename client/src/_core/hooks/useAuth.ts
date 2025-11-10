import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'practitioner' | 'user';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simuler une vérification d'authentification
    // Dans une vraie application, cela vérifierait un token ou ferait un appel API
    setTimeout(() => {
      setIsLoading(false);
      // Par défaut, pas d'utilisateur connecté
      setIsAuthenticated(false);
      setUser(null);
    }, 100);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
  };
}
