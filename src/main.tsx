import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize debug console functions
import './utils/debugConsole';
import './utils/cacheDebugConsole';
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
