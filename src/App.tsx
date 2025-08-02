import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SessionEnded from "./pages/SessionEnded";
import { MobileTestPage } from "./components/MobileTestPage";
import { AudioTestPage } from "./components/AudioTestPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mobile-test" element={<MobileTestPage />} />
            <Route path="/audio-test" element={<AudioTestPage />} />
            <Route path="/session-ended" element={<SessionEnded onHome={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} onNewStory={() => { window.history.pushState(null, '', '/'); window.location.reload(); }} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
