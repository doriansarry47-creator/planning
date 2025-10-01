import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  type: "admin" | "patient";
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, userType: "admin" | "patient") => Promise<void>;
  register: (userData: any, userType: "admin" | "patient") => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Debug logging
console.log("AuthContext initialized with API_BASE_URL:", API_BASE_URL);
console.log("Environment check:", {
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      // Vérifier si on est côté client avant d'accéder à localStorage
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem("authToken");
      
      if (!storedToken) {
        console.log("Pas de token stocké, utilisateur non connecté");
        setLoading(false);
        return;
      }

      // En production, timeout encore plus agressif pour éviter les blocages
      const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
      const timeoutDuration = isProduction ? 800 : 1500; // 800ms en production, 1.5s en dev

      try {
        console.log("Attempting to verify token with API:", `${API_BASE_URL}/auth/verify`);
        console.log("Production mode:", isProduction, "- Timeout:", timeoutDuration + "ms");
        
        // Timeout très court pour éviter l'attente en cas de problème réseau
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.warn("Timeout de vérification du token - abandon après", timeoutDuration + "ms");
        }, timeoutDuration);

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Token verification response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Token verification successful, user data:", data.user);
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token invalide
          console.warn("Token invalide, status:", response.status);
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        // En cas d'erreur de réseau, on continue sans authentification
        console.warn("Suppression du token en raison d'une erreur de vérification");
        if (storedToken) {
          localStorage.removeItem("authToken");
        }
        setToken(null);
        setUser(null);
      } finally {
        // S'assurer que le loading se termine TOUJOURS
        setLoading(false);
      }
    };

    // Timeout de sécurité global : plus agressif en production
    const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
    const globalTimeout = isProduction ? 1000 : 2000; // 1s en production, 2s en dev
    
    const maxLoadingTimeout = setTimeout(() => {
      console.warn("Timeout global d'authentification - arrêt forcé du loading après", globalTimeout + "ms");
      setLoading(false);
    }, globalTimeout);

    // Démarrer la vérification immédiatement
    verifyToken().finally(() => {
      clearTimeout(maxLoadingTimeout);
    });

    return () => {
      clearTimeout(maxLoadingTimeout);
    };
  }, []);

  const login = async (email: string, password: string, userType: "admin" | "patient") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/${userType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any, userType: "admin" | "patient") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/${userType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur d'inscription");
      }

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};