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
import TTSDebug from "./pages/TTSDebug";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import PromptTesting from "./pages/PromptTesting";
import VoiceHUD from "./components/VoiceHUD";
import { AudioFallbackNotification } from "./components/AudioFallbackNotification";
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
              <Route path="/tts-debug" element={<TTSDebug />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/prompt-testing" element={<PromptTesting />} />
              <Route path="/session-ended" element={<SessionEnded />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <VoiceHUD />
            <FloatingFeedback />
            <AudioFallbackNotification />
          </BrowserRouter>
        </MobileWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
