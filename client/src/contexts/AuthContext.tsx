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
          // Ajouter un timeout à la requête
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes

          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token invalide
            console.warn("Token invalide, suppression du localStorage");
            localStorage.removeItem("authToken");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          // Ne pas supprimer le token si c'est juste un problème de réseau
          if (error.name !== 'AbortError') {
            console.error("Erreur de vérification:", error);
          }
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Délai pour éviter les problèmes d'hydratation
    const timer = setTimeout(() => {
      verifyToken();
    }, 100);

    return () => clearTimeout(timer);
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