import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'admin' | 'patient';
}

export function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { isAuthenticated, userType: currentUserType, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion appropriée
        setLocation(`/login/${userType}`);
      } else if (currentUserType !== userType) {
        // Rediriger vers le bon dashboard si l'utilisateur est connecté mais avec un mauvais type
        const redirectPath = currentUserType === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
        setLocation(redirectPath);
      }
    }
  }, [isAuthenticated, currentUserType, userType, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || currentUserType !== userType) {
    return null;
  }

  return <>{children}</>;
}