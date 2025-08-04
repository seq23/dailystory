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

const queryClient = new QueryClient();

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
              <Route path="/session-ended" element={<SessionEnded onHome={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} onNewStory={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingFeedback />
          </BrowserRouter>
        </MobileWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
