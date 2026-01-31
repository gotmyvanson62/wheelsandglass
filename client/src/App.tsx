import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import React from "react";
import SidebarLayout from "@/components/layout/sidebar-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/Dashboard";

import AdminLoginFixed from "@/pages/admin-login-fixed";
import SettingsDocumentation from "@/pages/Settings";
import UserManagement from "@/pages/user-management";
import TransactionLogs from "@/pages/transaction-logs";
import AnalyticsOperations from "./pages/operations-center";

import CRM from "./pages/CRM";
import OmegaAdmin from "@/pages/omega-admin";
import VinLookup from "@/pages/vin-lookup";
import CustomerPortal from "@/pages/customer-portal";
import AdminLoginSimple from "@/pages/admin-login-simple";
import Features from "@/pages/features";
import OEM from "@/pages/oem";
import WindshieldRepair from "@/pages/windshield-repair";
import Insurance from "@/pages/insurance";
import AgentPortal from "@/pages/agent-portal";
import ServiceAreas from "@/pages/service-areas";


// Admin redirect component - Check authentication first
function AdminRedirect() {
  const [, setLocation] = useLocation();
  
  React.useEffect(() => {
    // Try to check if user is authenticated by making a test API call
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          setLocation('/admin/dashboard');
        } else {
          // User is not authenticated, redirect to login
          setLocation('/admin/login');
        }
      })
      .catch(() => {
        // Network error or other issue, redirect to login
        setLocation('/admin/login');
      });
  }, [setLocation]);
  
  return null;
}


function Router() {
  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/" component={Landing} />
      
      {/* Customer Portal - No admin layout */}
      <Route path="/customerportal" component={CustomerPortal} />
      
      {/* Public Pages - No authentication required */}
      <Route path="/features" component={Features} />
      <Route path="/oem" component={OEM} />
      <Route path="/windshieldrepair" component={WindshieldRepair} />
      <Route path="/insurance" component={Insurance} />
      <Route path="/agentportal" component={AgentPortal} />
      
      {/* Service Areas - Public page with state subpages */}
      <Route path="/service-areas/:state?" component={ServiceAreas} />
      
      {/* Admin Login - MUST be before other admin routes */}
      <Route path="/admin/login" component={AdminLoginFixed} />
      
      {/* Admin Navigation */}
      <Route path="/admin" component={AdminRedirect} />

      {/* Main Admin Dashboard - Protected route with sidebar */}
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <SidebarLayout>
            <Dashboard />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Specific Admin Routes - Protected */}
      <Route path="/admin/crm/:tab?">
        <ProtectedRoute>
          <SidebarLayout>
            <CRM />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <SidebarLayout>
            <AnalyticsOperations />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/settings/:tab?/:section?">
        <ProtectedRoute>
          <SidebarLayout>
            <SettingsDocumentation />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute>
          <SidebarLayout>
            <UserManagement />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/transaction-logs">
        <ProtectedRoute>
          <SidebarLayout>
            <TransactionLogs />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/vin-lookup">
        <ProtectedRoute>
          <SidebarLayout>
            <VinLookup />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/omega-admin">
        <ProtectedRoute>
          <SidebarLayout>
            <OmegaAdmin />
          </SidebarLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Admin base route - Redirect to login */}
      <Route path="/admin">
        <AdminRedirect />
      </Route>
      
      {/* Catch-all for unknown routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
