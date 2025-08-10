import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CustomerHome from "@/pages/customer-home";
import DriverDashboard from "@/pages/driver-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import RestaurantMenu from "@/pages/restaurant-menu";
import OrderTracking from "@/pages/order-tracking";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={CustomerHome} />
      <ProtectedRoute path="/driver" component={DriverDashboard} />
      <ProtectedRoute path="/vendor" component={VendorDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/restaurant/:id" component={RestaurantMenu} />
      <ProtectedRoute path="/order/:id" component={OrderTracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
