import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
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
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // Ajouter un timeout de sécurité pour éviter le chargement infini
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 secondes max pour le chargement

    return () => clearTimeout(timer);
  }, []);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <p className="text-lg font-medium text-gray-900">Planning Médical</p>
            <p className="text-sm text-gray-600">Application en cours de déploiement...</p>
            <p className="text-xs text-gray-500 mt-2">Veuillez patienter, le système se configure automatiquement.</p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger vers le bon tableau de bord
  if (user) {
    if (user.type === "admin") {
      return <AdminDashboard />;
    } else if (user.type === "patient") {
      return <PatientDashboard />;
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
