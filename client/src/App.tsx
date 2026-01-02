import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient, queryClient } from "./lib/trpc";
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import Login from "./pages/Login";
import CancelAppointment from "./pages/CancelAppointment";
import AvailableSlots from "./pages/AvailableSlots";
import OptimizedBooking from "./pages/OptimizedBookAppointment";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"\\"} component={Home} />
      {/* Route principale de réservation */}
      <Route path={"/book-appointment"} component={OptimizedBooking} />
      <Route path={"/available-slots"} component={AvailableSlots} />
      <Route path={"/login"} component={Login} />
      <Route path={"/appointments/cancel/:hash"} component={CancelAppointment} />
      <Route path={"/appointments"} component={MyAppointments} />
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
