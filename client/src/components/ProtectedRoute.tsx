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
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion si non authentifié
        setLocation("/login");
      } else if (role && user && user.role !== role && user.role !== "admin") {
        // Rediriger si le rôle ne correspond pas et n'est pas admin
        setLocation("/404"); // Ou une page d'accès refusé
      }
    }
  }, [isAuthenticated, isLoading, user, role, setLocation]);

  if (isLoading) {
    // Afficher un spinner pendant le chargement uniquement
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
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
