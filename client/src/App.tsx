import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient, queryClient } from "./lib/trpc";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import BookAppointmentV2 from "./pages/BookAppointmentV2";
import EnhancedBookAppointment from "./pages/EnhancedBookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import CancelAppointment from "./pages/CancelAppointment";
import AvailableSlots from "./pages/AvailableSlots";
import ImprovedBooking from "./pages/ImprovedBooking";
import AdminAvailability from "./pages/AdminAvailability";
import SimpleBooking from "./pages/SimpleBooking";
import OptimizedBooking from "./pages/OptimizedBooking";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"\\"} component={Home} />
      {/* Route principale de réservation optimisée */}
      <Route path={"/book-appointment"} component={OptimizedBooking} />
      {/* Routes alternatives pour les anciennes versions */}
      <Route path={"/book-appointment-v2"} component={BookAppointmentV2} />
      <Route path={"/book-appointment-old"} component={BookAppointment} />
      <Route path={"/book"} component={EnhancedBookAppointment} />
      <Route path={"/available-slots"} component={AvailableSlots} />
      <Route path={"/booking"} component={ImprovedBooking} />
      <Route path={"/simple-booking"} component={SimpleBooking} />
      <Route path={"/login"} component={Login} />
      <Route path={"/appointments/cancel/:hash"} component={CancelAppointment} />
      <Route path={"/appointments"} component={() => <ProtectedRoute component={MyAppointments} role="user" />} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminDashboard} role="admin" />} />
      <Route path={"/admin/availability"} component={() => <ProtectedRoute component={AdminAvailability} role="admin" />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            defaultTheme="light"
            // switchable
          >
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

export default App;
