/**
 * Nuclear Template System - Maximum Reliability Architecture
 * Implements circuit breakers, preloading, failsafes, and nuclear fallbacks
 * Never show error philosophy - always provide content
 */

// Template preload cache with instant fallback
const preloadCache = new Map<string, any>();
const integrityCache = new Map<string, boolean>();

// Circuit breaker state
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  halfOpenAttempts: number;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

// Configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  halfOpenMaxAttempts: 3
};

// Nuclear emergency content - guaranteed to work
const NUCLEAR_EMERGENCY_CONTENT = {
  level0: [
    "Story broke.",
    "We fix soon.",
    "Ask grown-up help.",
    "Try again.",
    "Stories come back."
  ],
  level1: [
    "Our story maker needs a break right now.",
    "Sometimes computers get tired and need to rest.",
    "Ask your grown-up to refresh this page for you.",
    "If it still doesn't work, we can try again later.",
    "New stories are coming back very soon, we promise!"
  ],
  level2: [
    "The story system is having some trouble right now.",
    "This happens sometimes when lots of kids want stories at once.",
    "You can try refreshing the page to see if that fixes it.",
    "If it still doesn't work, waiting a few minutes usually helps.",
    "Our team is working hard to bring back all your favorite stories!"
  ],
  level3: [
    "Our story generation system is experiencing some technical difficulties at the moment.",
    "This usually happens when there is high demand from many users trying to create stories.",
    "Please try refreshing the browser page using Ctrl+R on Windows or ⌘+R on Mac.",
    "If the problem continues after refreshing, our support team is available to help you out.",
    "We apologize for any inconvenience and expect normal service to resume very soon."
  ],
  level4: [
    "The AI-powered story generation service is currently experiencing system-wide maintenance issues that are affecting story creation capabilities.",
    "This may be due to server overload conditions, database connectivity problems, scheduled maintenance windows, or upstream API service disruptions.",
    "Technical solution: Force refresh the page using Ctrl+Shift+R (Windows) or ⌘+Shift+R (Mac) to clear all cached data and reinitialize the connection.",
    "If issues persist after multiple refresh attempts, please report this incident via our feedback system and include your browser type, version, and any console error messages.",
    "Our engineering team is actively monitoring system performance metrics and working to restore full functionality with minimal downtime impact."
  ]
};

/**
 * Circuit Breaker Pattern Implementation
 */
function getCircuitBreakerState(key: string): CircuitBreakerState {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
      halfOpenAttempts: 0
    });
  }
  return circuitBreakers.get(key)!;
}

function recordFailure(key: string): void {
  const state = getCircuitBreakerState(key);
  state.failures++;
  state.lastFailure = Date.now();
  
  if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    state.isOpen = true;
    console.log(`🔴 Circuit breaker OPEN for ${key} (${state.failures} failures)`);
  }
}

function recordSuccess(key: string): void {
  const state = getCircuitBreakerState(key);
  state.failures = 0;
  state.isOpen = false;
  state.halfOpenAttempts = 0;
  console.log(`🟢 Circuit breaker CLOSED for ${key}`);
}

function canAttempt(key: string): boolean {
  const state = getCircuitBreakerState(key);
  
  if (!state.isOpen) return true;
  
  const now = Date.now();
  const timeSinceLastFailure = now - state.lastFailure;
  
  // Reset to half-open after timeout
  if (timeSinceLastFailure >= CIRCUIT_BREAKER_CONFIG.resetTimeout) {
    if (state.halfOpenAttempts < CIRCUIT_BREAKER_CONFIG.halfOpenMaxAttempts) {
      state.halfOpenAttempts++;
      console.log(`🟡 Circuit breaker HALF-OPEN for ${key} (attempt ${state.halfOpenAttempts})`);
      return true;
    }
  }
  
  return false;
}

/**
 * Reset Circuit Breaker - Manual Recovery
 */
export function resetCircuitBreaker(key: string): void {
  const state = getCircuitBreakerState(key);
  state.failures = 0;
  state.isOpen = false;
  state.halfOpenAttempts = 0;
  state.lastFailure = 0;
  console.log(`🔄 Circuit breaker MANUALLY RESET for ${key}`);
}

/**
 * Get Circuit Breaker Status
 */
export function getCircuitBreakerStatus(key: string): {
  isOpen: boolean;
  failures: number;
  lastFailure: number;
  timeSinceLastFailure: number;
  canAttempt: boolean;
} {
  const state = getCircuitBreakerState(key);
  const now = Date.now();
  const timeSinceLastFailure = now - state.lastFailure;
  
  return {
    isOpen: state.isOpen,
    failures: state.failures,
    lastFailure: state.lastFailure,
    timeSinceLastFailure,
    canAttempt: canAttempt(key)
  };
}

/**
 * Level 0 Recovery Logic - Test if Level 0 templates are working
 */
async function testLevel0Recovery(): Promise<boolean> {
  try {
    console.log('🧪 Testing Level 0 template recovery...');
    const { getLevel0Template } = await import('./templates/level0.js');
    const testTemplate = getLevel0Template(0);
    
    if (validateTemplateIntegrity(testTemplate)) {
      console.log('✅ Level 0 template recovery test PASSED');
      return true;
    }
  } catch (error) {
    console.log('❌ Level 0 template recovery test FAILED:', error.message);
  }
  
  return false;
}

/**
 * Template Preloading System
 */
export async function preloadPopularTemplates(): Promise<void> {
  const popularTemplates = [
    { level: 'level1', index: 0 },
    { level: 'level2', index: 0 },
    { level: 'level1', index: 1 },
    { level: 'level2', index: 1 }
  ];
  
  console.log('🚀 Starting template preloading...');
  
  for (const { level, index } of popularTemplates) {
    try {
      const { loadTemplate } = await import('./dynamicTemplateLoader.ts');
      const template = await loadTemplate(level, index);
      
      if (template) {
        const preloadKey = `${level}_${index}`;
        preloadCache.set(preloadKey, template);
        integrityCache.set(preloadKey, true);
        console.log(`✅ Preloaded ${preloadKey}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${level}[${index}]:`, error.message);
    }
  }
  
  console.log(`🎯 Preloading complete: ${preloadCache.size} templates cached`);
}

/**
 * Template Integrity Validation
 */
function validateTemplateIntegrity(template: any): boolean {
  if (!template) return false;
  
  // For array templates (Level 0)
  if (Array.isArray(template)) {
    return template.length > 0 && template.every(page => typeof page === 'string' && page.trim().length > 0);
  }
  
  // For structured templates
  if (typeof template === 'object') {
    return !!(template.title && template.scenes && Array.isArray(template.scenes) && template.scenes.length > 0);
  }
  
  return false;
}

/**
 * Nuclear Template Loader with Maximum Resilience
 */
export async function nuclearLoadTemplate(level: string, templateIndex?: number): Promise<any> {
  const preloadKey = `${level}_${templateIndex ?? 'random'}`;
  const circuitKey = `template_${level}`;
  
  // Log circuit breaker status for Level 0
  if (level === 'level0') {
    const status = getCircuitBreakerStatus(circuitKey);
    console.log(`🔍 Level 0 circuit breaker status:`, status);
    
    // Automatic recovery for Level 0 if circuit has been open for > 60 seconds
    if (status.isOpen && status.timeSinceLastFailure > 60000) {
      console.log('🔄 Level 0 circuit breaker has been open for >60s, attempting recovery...');
      const recoverySuccess = await testLevel0Recovery();
      
      if (recoverySuccess) {
        console.log('✅ Level 0 recovery successful, resetting circuit breaker');
        resetCircuitBreaker(circuitKey);
      }
    }
  }
  
  // Stage 1: Preload cache (instant)
  if (preloadCache.has(preloadKey) && integrityCache.get(preloadKey)) {
    console.log(`⚡ Instant preload hit: ${preloadKey}`);
    return preloadCache.get(preloadKey);
  }
  
  // Stage 2: Circuit breaker check
  if (!canAttempt(circuitKey)) {
    console.log(`🔴 Circuit breaker blocked ${circuitKey}, using emergency content`);
    return getNuclearEmergencyContent(level);
  }
  
  // Stage 3: Dynamic loading with circuit breaker protection
  try {
    let template;
    
    // Special handling for Level 0 templates (static import)
    if (level === 'level0') {
      console.log('📚 Loading Level 0 template directly...');
      const { getLevel0Template } = await import('./templates/level0.js');
      template = getLevel0Template(templateIndex);
    } else {
      // Use dynamic loader for other levels
      const { loadTemplate } = await import('./dynamicTemplateLoader.ts');
      template = await Promise.race([
        loadTemplate(level, templateIndex),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
    }
    
    if (validateTemplateIntegrity(template)) {
      recordSuccess(circuitKey);
      console.log(`✅ Successfully loaded ${level} template`);
      // Cache successful load
      preloadCache.set(preloadKey, template);
      integrityCache.set(preloadKey, true);
      return template;
    } else {
      throw new Error('Template integrity validation failed');
    }
    
  } catch (error) {
    console.error(`❌ Template loading failed for ${level}:`, error);
    recordFailure(circuitKey);
    
    // Stage 4: Emergency fallback
    return getNuclearEmergencyContent(level);
  }
}

/**
 * Get Nuclear Emergency Content
 */
export function getNuclearEmergencyContent(level: string): string[] {
  console.log('🚨 NUCLEAR EMERGENCY: Serving fallback content for level:', level);
  
  const normalizedLevel = level.toLowerCase();
  
  // Map levels to emergency content with enhanced logging
  let emergencyContent: string[];
  if (normalizedLevel.includes('0') || normalizedLevel === 'beginner') {
    emergencyContent = [...NUCLEAR_EMERGENCY_CONTENT.level0];
  } else if (normalizedLevel.includes('1') || normalizedLevel === 'easy') {
    emergencyContent = [...NUCLEAR_EMERGENCY_CONTENT.level1];
  } else if (normalizedLevel.includes('2') || normalizedLevel === 'medium') {
    emergencyContent = [...NUCLEAR_EMERGENCY_CONTENT.level2];
  } else if (normalizedLevel.includes('3') || normalizedLevel === 'hard') {
    emergencyContent = [...NUCLEAR_EMERGENCY_CONTENT.level3];
  } else {
    emergencyContent = [...NUCLEAR_EMERGENCY_CONTENT.level4];
  }
  
  console.log('✅ Nuclear emergency content provided:', emergencyContent.length, 'pages');
  return emergencyContent;
}

/**
 * Memory Pressure Detection and Cleanup
 */
export function performMemoryCleanup(): void {
  const maxCacheSize = 50;
  
  if (preloadCache.size > maxCacheSize) {
    const entries = Array.from(preloadCache.entries());
    const toRemove = entries.slice(0, preloadCache.size - maxCacheSize);
    
    for (const [key] of toRemove) {
      preloadCache.delete(key);
      integrityCache.delete(key);
    }
    
    console.log(`🧹 Memory cleanup: Removed ${toRemove.length} cached templates`);
  }
}

/**
 * System Health Check
 */
export function getSystemHealth(): {
  preloadCacheSize: number;
  circuitBreakerStates: Array<{key: string, isOpen: boolean, failures: number}>;
  memoryPressure: 'low' | 'medium' | 'high';
} {
  const circuitStates = Array.from(circuitBreakers.entries()).map(([key, state]) => ({
    key,
    isOpen: state.isOpen,
    failures: state.failures
  }));
  
  const memoryPressure = preloadCache.size > 30 ? 'high' : preloadCache.size > 15 ? 'medium' : 'low';
  
  return {
    preloadCacheSize: preloadCache.size,
    circuitBreakerStates: circuitStates,
    memoryPressure
  };
}

/**
 * Initialize Nuclear System
 */
export async function initializeNuclearSystem(): Promise<void> {
  console.log('🚀 Initializing Nuclear Template System...');
  
  // Start preloading popular templates
  await preloadPopularTemplates();
  
  // Set up periodic memory cleanup
  setInterval(performMemoryCleanup, 300000); // Every 5 minutes
  
  console.log('✅ Nuclear Template System initialized');
}