import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from '@/hooks/useAuth';
import { PatientLoginPage } from '@/pages/PatientLoginPage';
import { PatientDashboard } from '@/pages/PatientDashboard';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { LandingPage } from '@/pages/LandingPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import './globals.css';

// Créer le client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Switch>
              {/* Page d'accueil */}
              <Route path="/" component={LandingPage} />
              
              {/* Pages de connexion */}
              <Route path="/login/patient" component={PatientLoginPage} />
              <Route path="/login/admin" component={AdminLoginPage} />
              
              {/* Tableaux de bord protégés */}
              <Route path="/patient/dashboard">
                <ProtectedRoute userType="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              </Route>
              
              <Route path="/admin/dashboard">
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              </Route>
              
              {/* Route 404 */}
              <Route>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page non trouvée</p>
                    <a 
                      href="/" 
                      className="text-medical-600 hover:text-medical-700 font-medium"
                    >
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              </Route>
            </Switch>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;