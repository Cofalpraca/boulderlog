import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ActiveSessionProvider } from "@/contexts/ActiveSessionContext";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ActiveSessionGuard } from "@/components/ActiveSessionGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import Gyms from "@/pages/Gyms";
import GymMappings from "@/pages/GymMappings";
import SessionNew from "@/pages/SessionNew";
import BoulderSession from "@/pages/BoulderSession";
import StrengthSession from "@/pages/StrengthSession";
import WeeklyPlan from "@/pages/WeeklyPlan";
import Templates from "@/pages/Templates";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
import Protocols from "@/pages/Protocols";
import SessionHistory from "@/pages/SessionHistory";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import AuthReset from "@/pages/AuthReset";
import MappingHealth from "@/pages/MappingHealth";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";
import "@/i18n";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isComplete, loading: onboardingLoading } = useOnboardingStatus();
  
  if (authLoading || onboardingLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Redirect to onboarding if not complete
  if (!isComplete) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isComplete, loading: onboardingLoading } = useOnboardingStatus();
  
  if (authLoading || onboardingLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  // If onboarding is complete, redirect to dashboard
  if (isComplete) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route path="/auth/reset" element={<AuthReset />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Onboarding route - accessible only when onboarding incomplete */}
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      
      {/* Protected routes - require completed onboarding */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/gyms" element={<ProtectedRoute><Gyms /></ProtectedRoute>} />
      <Route path="/gyms/:gymId/mappings" element={<ProtectedRoute><GymMappings /></ProtectedRoute>} />
      <Route path="/session/new" element={<ProtectedRoute><SessionNew /></ProtectedRoute>} />
      <Route path="/session/:sessionId/boulders" element={<ProtectedRoute><BoulderSession /></ProtectedRoute>} />
      <Route path="/session/:sessionId/strength" element={<ProtectedRoute><StrengthSession /></ProtectedRoute>} />
      <Route path="/plan" element={<ProtectedRoute><WeeklyPlan /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
      <Route path="/protocols" element={<ProtectedRoute><Protocols /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><SessionHistory /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/mapping-health" element={<ProtectedRoute><MappingHealth /></ProtectedRoute>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ActiveSessionProvider>
                <AppRoutes />
                <ActiveSessionGuard />
                <OfflineIndicator />
              </ActiveSessionProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
