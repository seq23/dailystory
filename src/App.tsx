import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SessionEnded from "./pages/SessionEnded";
import { SecurityBoundary } from "@/components/SecurityBoundary";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

const queryClient = new QueryClient();

const SecurityWrapper = () => {
  const securityMonitoring = useSecurityMonitoring();
  
  return (
    <SecurityBoundary>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/session-ended" element={<SessionEnded onHome={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} onNewStory={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SecurityDashboard />
    </SecurityBoundary>
  );
};

const AppContent = () => {
  useSecurityHeaders();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SecurityWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
