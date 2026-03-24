import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileWrapper } from "@/components/MobileWrapper";
import { FloatingFeedback } from "@/components/FloatingFeedback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SessionEnded from "./pages/SessionEnded";
import StylePreview from "./pages/StylePreview";

import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PromptTesting from "./pages/PromptTesting";
import TemplateTestingPage from "./pages/TemplateTestingPage";
import CCPA from "./pages/CCPA";
import Accessibility from "./pages/Accessibility";
import Vendors from "./pages/Vendors";
import GDPR from "./pages/GDPR";
import FERPA from "./pages/FERPA";
import VerifyConsent from "./pages/VerifyConsent";
import DataTransfers from "./pages/DataTransfers";
import Subprocessors from "./pages/Subprocessors";
import { PromptStudio } from "./components/PromptStudio";
import VoiceHUD from "./components/VoiceHUD";
import { AudioFallbackNotification } from "./components/AudioFallbackNotification";
import { VoiceCommands } from "./components/VoiceCommands";
import { VoiceHoverController } from "./components/VoiceHoverController";
import { UnifiedDebugMonitor } from "./components/UnifiedDebugMonitor";
import { CookieConsent } from "./components/CookieConsent";
// Import debug services conditionally for performance
import { DebugLogger } from "./services/DebugLogger";
import { initializeViteLogGrouper, cleanupViteLogGrouper } from "./utils/viteLogGrouper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  // Initialize development tools conditionally for performance
  React.useEffect(() => {
    // Migrate console logging to DebugLogger
    DebugLogger.log('performance', 'App component loaded successfully');
    
    // Only initialize debug services when in debug mode for performance
    const isDebugMode = DebugLogger.isDebugEnabled();
    
    if (isDebugMode) {
      // Lazy load debug services only when needed
      Promise.all([
        import("./services/AdvancedPerformanceMonitor"),
        import("./services/NetworkDebugger"),
        import("./services/ABTestingFramework")
      ]).then(() => {
        DebugLogger.log('performance', 'Debug services loaded for debug mode');
      }).catch(error => {
        DebugLogger.error('performance', 'Failed to load debug services', error);
      });
    }
    
    // Initialize Vite log grouper in development
    initializeViteLogGrouper();
    
    return () => {
      cleanupViteLogGrouper();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileWrapper>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/style-preview" element={<StylePreview />} />
              
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/prompt-testing" element={<PromptTesting />} />
              <Route path="/template-testing" element={<TemplateTestingPage />} />
              <Route path="/prompt-studio" element={<PromptStudio />} />
              <Route path="/session-ended" element={<SessionEnded />} />
              <Route path="/ccpa" element={<CCPA />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route path="/ferpa" element={<FERPA />} />
              <Route path="/verify-consent" element={<VerifyConsent />} />
              <Route path="/data-transfers" element={<DataTransfers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <VoiceHUD />
            <FloatingFeedback />
            <AudioFallbackNotification />
            <UnifiedDebugMonitor />
            <CookieConsent />
          </BrowserRouter>
        </MobileWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
