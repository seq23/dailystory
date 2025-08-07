import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import './test-performance-suite' // Test the new performance-optimized system
import './manual-test-runner' // Run manual tests to show console results

// Import audit functions for console debugging
import { finalVerificationAudit } from './utils/finalVerificationAudit';
import { tripleCheckImplementation } from './utils/tripleCheckAudit';
import './run-comprehensive-test-fix';
import './execute-tests-now';

// Expose audit functions globally for console access
if (typeof window !== 'undefined') {
  (window as any).finalVerify = finalVerificationAudit;
  (window as any).tripleCheck = tripleCheckImplementation;
  console.log('🔍 Audit functions available: finalVerify(), tripleCheck()');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
