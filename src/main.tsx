import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import './i18n/config'
import './services/simpleAudioCoordinator'
// Import enhanced error suppression FIRST to catch all errors early
import './utils/errorSuppressionManager'
// Initialize debug logger service
import './services/DebugLogger'

// GLOBAL AUDIO SERVICE EXPOSURE - For AudioPlaybackTester and debugging
import { charlotteVoiceService } from './services/CharlotteVoiceService';
import { SmartElevenLabsTTS } from './services/smartElevenLabsTTS';

// Expose unified Charlotte audio service globally for testing and debugging
if (typeof window !== 'undefined') {
  (window as any).__CharlotteVoiceService = charlotteVoiceService;
  (window as any).SmartElevenLabsTTS = SmartElevenLabsTTS;
}

// Tells the start-up watchdog in index.html that the app is running, so it never shows
// "Something stopped Time-2-Read from loading" over a working page.
function Booted() {
  useEffect(() => {
    (window as any).__t2rBooted = true;
    const banner = document.getElementById('t2r-boot-banner');
    if (banner) banner.hidden = true;
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Booted />
    <App />
  </StrictMode>
);
