import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Import des nouvelles pages
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import PatientLogin from "./pages/PatientLogin";
import ImprovedAdminDashboard from "./pages/ImprovedAdminDashboard";
import ImprovedPatientDashboard from "./pages/ImprovedPatientDashboard";

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger vers le bon tableau de bord
  if (user) {
    if (user.type === "admin") {
      return <ImprovedAdminDashboard />;
    } else if (user.type === "patient") {
      return <ImprovedPatientDashboard />;
    }
  }

  // Routeur pour les utilisateurs non authentifiés
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/patient/login" component={PatientLogin} />
      <Route path="/" component={Home} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="medplan-theme">
        <TooltipProvider>
          <AuthProvider>
            <AuthenticatedApp />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
