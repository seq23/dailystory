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
    "This is a simple story.",
    "Something happens next.",
    "Then more things happen.",
    "Everything works out well.",
    "The end."
  ],
  level1: [
    "Once there was an adventure.",
    "The journey began with curiosity.",
    "Challenges appeared along the way.",
    "Courage helped overcome them.",
    "Success came at the end."
  ],
  level2: [
    "In a world of possibilities, stories unfold.",
    "Characters discover their inner strength.",
    "Through trials and tribulations, they grow.",
    "Wisdom emerges from experience.",
    "Hope lights the path forward."
  ],
  level3: [
    "Complex narratives weave through time and space.",
    "Protagonists face multifaceted challenges requiring strategic thinking.",
    "Environmental factors influence decision-making processes.",
    "Character development accelerates through adversity.",
    "Resolution emerges through collaborative problem-solving."
  ],
  level4: [
    "Sophisticated storytelling incorporates psychological depth and narrative complexity.",
    "Advanced character archetypes navigate intricate moral and ethical dilemmas.",
    "Multiple plot threads converge through carefully orchestrated dramatic tension.",
    "Thematic elements explore profound philosophical questions about human nature.",
    "Culmination delivers both emotional satisfaction and intellectual stimulation."
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
      const { loadTemplate } = await import('./dynamicTemplateLoader.js');
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
    const { loadTemplate } = await import('./dynamicTemplateLoader.js');
    const template = await Promise.race([
      loadTemplate(level, templateIndex),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    if (validateTemplateIntegrity(template)) {
      recordSuccess(circuitKey);
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
function getNuclearEmergencyContent(level: string): string[] {
  const normalizedLevel = level.toLowerCase();
  
  // Map levels to emergency content
  if (normalizedLevel.includes('0') || normalizedLevel === 'beginner') {
    return [...NUCLEAR_EMERGENCY_CONTENT.level0];
  } else if (normalizedLevel.includes('1') || normalizedLevel === 'easy') {
    return [...NUCLEAR_EMERGENCY_CONTENT.level1];
  } else if (normalizedLevel.includes('2') || normalizedLevel === 'medium') {
    return [...NUCLEAR_EMERGENCY_CONTENT.level2];
  } else if (normalizedLevel.includes('3') || normalizedLevel === 'hard') {
    return [...NUCLEAR_EMERGENCY_CONTENT.level3];
  } else {
    return [...NUCLEAR_EMERGENCY_CONTENT.level4];
  }
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