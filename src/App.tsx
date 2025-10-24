import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/toast';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import './globals.css';

// Composant de chargement global
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Chargement...</p>
    </div>
  </div>
);

// Lazy loading des pages pour optimiser les performances
// Pages publiques - chargées à la demande
const TherapyLandingPage = lazy(() => import('@/pages/TherapyLandingPage').then(m => ({ default: m.TherapyLandingPage })));
const PatientLoginPage = lazy(() => import('@/pages/PatientLoginPage').then(m => ({ default: m.PatientLoginPage })));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const PatientRegisterPage = lazy(() => import('@/pages/PatientRegisterPage').then(m => ({ default: m.PatientRegisterPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const PatientBookingPage = lazy(() => import('@/pages/PatientBookingPage').then(m => ({ default: m.PatientBookingPage })));

// Pages légales - chargées à la demande
const LegalNoticesPage = lazy(() => import('@/pages/LegalNoticesPage').then(m => ({ default: m.LegalNoticesPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));

// Pages patient protégées - chargées uniquement si authentifié
const PatientDashboard = lazy(() => import('@/pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const PatientAppointmentsPage = lazy(() => import('@/pages/PatientAppointmentsPage').then(m => ({ default: m.PatientAppointmentsPage })));
const PatientFollowUpPage = lazy(() => import('@/pages/PatientFollowUpPage').then(m => ({ default: m.PatientFollowUpPage })));
const PatientProfilePage = lazy(() => import('@/pages/PatientProfilePage').then(m => ({ default: m.PatientProfilePage })));

// Pages admin protégées - chargées uniquement si admin authentifié
const TherapyAdminDashboard = lazy(() => import('@/pages/TherapyAdminDashboard').then(m => ({ default: m.TherapyAdminDashboard })));

// Page 404
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Créer le client React Query avec configuration optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - les données sont considérées fraîches pendant 5 min
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache conservé 10 min
    },
  },
});

// Composant App avec React.memo pour éviter les re-rendus inutiles
const App = React.memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<LoadingFallback />}>
                <Switch>
                  {/* Page d'accueil */}
                  <Route path="/" component={TherapyLandingPage} />
                  
                  {/* Pages de connexion et inscription */}
                  <Route path="/login/patient" component={PatientLoginPage} />
                  <Route path="/login/admin" component={AdminLoginPage} />
                  <Route path="/patient/register" component={PatientRegisterPage} />
                  <Route path="/reset-password" component={ResetPasswordPage} />
                  
                  {/* Redirections pour compatibilité */}
                  <Route path="/praticien">
                    {() => {
                      window.location.href = '/admin/dashboard';
                      return <LoadingFallback />;
                    }}
                  </Route>
                  <Route path="/practitioner">
                    {() => {
                      window.location.href = '/admin/dashboard';
                      return <LoadingFallback />;
                    }}
                  </Route>
                  
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
              </Suspense>
              
              {/* Global UI Components */}
              <ConnectionStatus />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;