import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'admin' | 'patient';
}

export function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { isAuthenticated, userType: currentUserType, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion appropriée
        console.log('ProtectedRoute: Non authentifié, redirection vers', `/login/${userType}`);
        setLocation(`/login/${userType}`);
        setShouldRender(false);
      } else if (currentUserType !== userType) {
        // Rediriger vers le bon dashboard si l'utilisateur est connecté mais avec un mauvais type
        const redirectPath = currentUserType === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
        console.log('ProtectedRoute: Mauvais type utilisateur, redirection vers', redirectPath);
        setLocation(redirectPath);
        setShouldRender(false);
      } else {
        // Utilisateur correctement authentifié avec le bon type
        console.log('ProtectedRoute: Utilisateur authentifié correctement', { userType, currentUserType });
        setShouldRender(true);
      }
    }
  }, [isAuthenticated, currentUserType, userType, loading, setLocation]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant la redirection
  if (!isAuthenticated || currentUserType !== userType || !shouldRender) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}