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
        // Rediriger vers la page d'accueil ou de connexion si non authentifié
        setLocation("/");
      } else if (role && user && user.role !== role && user.role !== "admin") {
        // Rediriger si le rôle ne correspond pas et n'est pas admin
        setLocation("/404"); // Ou une page d'accès refusé
      }
    }
  }, [isAuthenticated, isLoading, user, role, setLocation]);

  if (isLoading || !isAuthenticated || (role && user && user.role !== role && user.role !== "admin")) {
    // Afficher un spinner pendant le chargement ou si l'accès est refusé
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return <Component />;
};

export default ProtectedRoute;
