import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SecurityBoundary } from "@/components/SecurityBoundary";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";

const queryClient = new QueryClient();

const AppContent = () => {
  useSecurityHeaders();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SecurityBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
