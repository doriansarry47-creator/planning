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

  // Timeout de sécurité pour éviter le chargement infini
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn("App.tsx: Timeout de chargement atteint - forçage d'affichage");
      setLoadingTimeout(true);
    }, 1500); // Réduit à 1.5 secondes max

    return () => clearTimeout(timer);
  }, []);

  // Force l'arrêt du loading si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      // Si l'authentification est finie et qu'il n'y a pas d'utilisateur, forcer l'affichage
      setLoadingTimeout(true);
    }
  }, [loading, user]);

  // Animation des points de chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Affichage du loading seulement si nécessaire
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
          <div>
            <p className="text-xl font-semibold text-gray-900">Planning Médical</p>
            <p className="text-sm text-gray-600">Vérification de l'authentification{dots}</p>
            <p className="text-xs text-gray-400 mt-2">Connexion au serveur...</p>
            <p className="text-xs text-gray-300 mt-1">Si cet écran persiste, cliquez pour continuer</p>
          </div>
          <button 
            onClick={() => setLoadingTimeout(true)} 
            className="mt-4 px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
          >
            Continuer sans vérification
          </button>
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
