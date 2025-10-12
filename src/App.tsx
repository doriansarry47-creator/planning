import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/toast';
import { ConnectionStatus } from '@/components/ui/connection-status';
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
import { PatientRegisterPage } from '@/pages/PatientRegisterPage';
import { LegalNoticesPage } from '@/pages/LegalNoticesPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
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
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Switch>
              {/* Page d'accueil */}
              <Route path="/" component={TherapyLandingPage} />
              
              {/* Pages de connexion et inscription */}
              <Route path="/login/patient" component={PatientLoginPage} />
              <Route path="/login/admin" component={AdminLoginPage} />
              <Route path="/patient/register" component={PatientRegisterPage} />
              <Route path="/reset-password" component={ResetPasswordPage} />
              
              {/* Page de prise de rendez-vous */}
              <Route path="/patient/book-appointment" component={PatientBookingPage} />
              
              {/* Pages légales */}
              <Route path="/mentions-legales" component={LegalNoticesPage} />
              <Route path="/politique-confidentialite" component={PrivacyPolicyPage} />
              <Route path="/conditions-utilisation" component={TermsOfServicePage} />
              
              {/* Tableaux de bord protégés */}
              <Route path="/patient/dashboard">
                <ProtectedRoute userType="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              </Route>
              
              <Route path="/admin/dashboard">
                <ProtectedRoute userType="admin">
                  <TherapyAdminDashboard />
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
              
              {/* Route 404 - Page non trouvée personnalisée */}
              <Route component={NotFoundPage} />
              </Switch>
              
              {/* Global UI Components */}
              <ConnectionStatus />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;