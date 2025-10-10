import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from '@/hooks/useAuth';
import { PatientLoginPage } from '@/pages/PatientLoginPage';
import { PatientDashboard } from '@/pages/PatientDashboard';
import { PatientAppointmentsPage } from '@/pages/PatientAppointmentsPage';
import { PatientFollowUpPage } from '@/pages/PatientFollowUpPage';
import { PatientProfilePage } from '@/pages/PatientProfilePage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { TherapyLandingPage } from '@/pages/TherapyLandingPage';
import { TherapyAdminDashboard } from '@/pages/TherapyAdminDashboard';
import { PatientBookingPage } from '@/pages/PatientBookingPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
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
              <Route path="/" component={TherapyLandingPage} />
              
              {/* Pages de connexion */}
              <Route path="/login/patient" component={PatientLoginPage} />
              <Route path="/login/admin" component={AdminLoginPage} />
              <Route path="/reset-password" component={ResetPasswordPage} />
              
              {/* Page de prise de rendez-vous */}
              <Route path="/patient/book-appointment" component={PatientBookingPage} />
              
              {/* Tableaux de bord protégés */}
              <Route path="/patient/dashboard">
                <ProtectedRoute userType="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              </Route>
              
              {/* Pages patient protégées */}
              <Route path="/patient/appointments">
                <ProtectedRoute userType="patient">
                  <PatientAppointmentsPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/patient/follow-up">
                <ProtectedRoute userType="patient">
                  <PatientFollowUpPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/patient/profile">
                <ProtectedRoute userType="patient">
                  <PatientProfilePage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/admin/dashboard">
                <ProtectedRoute userType="admin">
                  <TherapyAdminDashboard />
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