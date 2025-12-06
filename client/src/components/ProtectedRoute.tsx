import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Spinner } from "./ui/spinner";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  role?: "admin" | "practitioner" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, role }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Rediriger vers la page de connexion si non authentifié
        if (location !== "/login") {
          setLocation("/login");
        }
      } else if (role && user.role !== role && user.role !== "admin") {
        // Rediriger si le rôle ne correspond pas et n'est pas admin
        setLocation("/404"); // Ou une page d'accès refusé
      }
      // Si déjà authentifié et sur la page de connexion, rediriger vers admin
      else if (isAuthenticated && location === "/login") {
        setLocation("/admin");
      }
    }
  }, [isAuthenticated, isLoading, user, role, setLocation, location]);

  if (isLoading) {
    // Afficher un spinner pendant le chargement uniquement
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600 text-sm">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Laisser le useEffect gérer la redirection
    return null;
  }

  if (role && user && user.role !== role && user.role !== "admin") {
    // Laisser le useEffect gérer la redirection
    return null;
  }

  return <Component />;
};

export default ProtectedRoute;
