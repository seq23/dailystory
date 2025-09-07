import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import './services/simpleAudioCoordinator'
// Import enhanced error suppression FIRST to catch all errors early
import './utils/errorSuppressionManager'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
