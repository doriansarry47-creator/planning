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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      
      // Vérifier si on est côté client avant d'accéder à localStorage
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem("authToken");
      
      if (storedToken) {
        try {
          console.log("Attempting to verify token with API:", `${API_BASE_URL}/auth/verify`);
          
          // Ajouter un timeout à la requête plus court pour éviter l'attente
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes

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
          // Toujours supprimer le token si il y a une erreur et finir le loading
          console.warn("Suppression du token en raison d'une erreur de vérification");
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        }
      } else {
        console.log("Pas de token stocké, utilisateur non connecté");
      }
      // S'assurer que le loading se termine toujours
      setLoading(false);
    };

    // Timeout de sécurité : si ça prend plus de 4 secondes, arrêter le loading
    const maxLoadingTimeout = setTimeout(() => {
      console.warn("Timeout de vérification d'authentification - arrêt du loading");
      setLoading(false);
    }, 4000);

    // Délai court pour éviter les problèmes d'hydratation
    const timer = setTimeout(() => {
      verifyToken().finally(() => {
        clearTimeout(maxLoadingTimeout);
      });
    }, 50); // Réduit à 50ms

    return () => {
      clearTimeout(timer);
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