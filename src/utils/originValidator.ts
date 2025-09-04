/**
 * Origin validation utilities for secure cross-origin communication
 */

// Known safe origins for the application
const ALLOWED_ORIGINS = [
  // Lovable development and preview environments
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.gptengineer\.app$/,
  
  // Audio services
  /^https:\/\/.*\.elevenlabs\.io$/,
  /^https:\/\/.*\.runware\.ai$/,
  
  // Local development
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/0\.0\.0\.0:\d+$/,
  
  // Production domains (add your actual domains here)
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.netlify\.app$/,
];

/**
 * Validates if an origin is allowed for postMessage communication
 */
export const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return false;
  
  return ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
};

/**
 * Safe postMessage wrapper with origin validation
 */
export const safePostMessage = (
  targetWindow: Window,
  message: any,
  targetOrigin: string
): boolean => {
  try {
    // Validate origin before sending
    if (targetOrigin !== '*' && !isOriginAllowed(targetOrigin)) {
      console.warn('🚫 Blocked postMessage to untrusted origin:', targetOrigin);
      return false;
    }
    
    targetWindow.postMessage(message, targetOrigin);
    return true;
  } catch (error) {
    // Silently handle postMessage errors to prevent console spam
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔇 PostMessage failed (suppressed):', error);
    }
    return false;
  }
};

/**
 * Gets the current environment type for origin validation
 */
export const getEnvironmentType = (): 'development' | 'preview' | 'production' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return 'development';
  }
  
  if (hostname.includes('lovable.dev') || hostname.includes('gptengineer.app')) {
    return 'preview';
  }
  
  return 'production';
};

/**
 * Enhanced message event listener with origin validation
 */
export const addSafeMessageListener = (
  callback: (event: MessageEvent) => void,
  validateOrigin = true
): () => void => {
  const safeCallback = (event: MessageEvent) => {
    // Skip origin validation in development if requested
    if (validateOrigin && getEnvironmentType() !== 'development') {
      if (!isOriginAllowed(event.origin)) {
        console.warn('🚫 Blocked message from untrusted origin:', event.origin);
        return;
      }
    }
    
    callback(event);
  };
  
  window.addEventListener('message', safeCallback);
  
  // Return cleanup function
  return () => window.removeEventListener('message', safeCallback);
};