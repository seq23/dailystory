import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import './utils/languageSeparationTest' // Test language separation functionality
import './utils/comprehensiveLanguageTest' // Comprehensive cross-device language testing
import './utils/storyQualityVerificationTest' // Industry standard quality verification
import './utils/issueResolutionVerificationTest' // Complete issue resolution verification

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
