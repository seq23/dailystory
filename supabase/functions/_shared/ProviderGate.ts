/**
 * ProviderGate: Lightweight backpressure and circuit breaker for edge functions
 * 
 * Features:
 * - Per-key concurrency caps with small queue and jitter
 * - Simple circuit breaker per key (failure threshold and cooldown)
 * - Minimal memory footprint
 * - Can be disabled via environment variables
 */

interface GateConfig {
  maxConcurrency: number;
  failThreshold: number;
  cooldownMs: number;
  maxWaitMs: number;
}

interface CircuitState {
  failures: number;
  lastFailureAt: number;
  isOpen: boolean;
}

interface GateState {
  active: number;
  waiting: Array<{ resolve: () => void; acquiredAt: number }>;
  circuit: CircuitState;
}

// Global state map: key → GateState
const gates = new Map<string, GateState>();

// Default configurations (can be overridden via env)
const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'T1:ai-visual-scene-creator': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_T1') || '6'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '30000'),
    maxWaitMs: 2000
  },
  'DM:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25A:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25B:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'IMG:runware-generate-image': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, {
      active: 0,
      waiting: [],
      circuit: {
        failures: 0,
        lastFailureAt: 0,
        isOpen: false
      }
    });
  }
  return gates.get(key)!;
}

function getConfig(key: string): GateConfig {
  return DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS['T25A:runware-template-ab'];
}

/**
 * Check if circuit is open (unhealthy)
 * Automatically transitions to closed if cooldown has passed
 */
export function isCircuitOpen(key: string): boolean {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  const now = Date.now();
  
  if (state.circuit.isOpen) {
    // Check if cooldown period has passed
    if (now - state.circuit.lastFailureAt >= config.cooldownMs) {
      console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
      state.circuit.isOpen = false;
      state.circuit.failures = 0;
    }
  }
  
  return state.circuit.isOpen;
}

/**
 * Acquire gate (wait if needed, fail if circuit open or timeout)
 * Returns: { acquired: boolean, reason?: string, retryAfterSeconds?: number }
 */
export async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  // Check circuit first
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { 
      acquired: false, 
      reason: 'CIRCUIT_OPEN', 
      retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown))
    };
  }
  
  // Fast path: immediate acquisition
  if (state.active < config.maxConcurrency) {
    state.active++;
    return { acquired: true };
  }
  
  // Queue with timeout and jitter
  const jitter = Math.floor(Math.random() * 150); // 0-150ms jitter
  const timeout = config.maxWaitMs + jitter;
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      // Remove from queue if still waiting
      const index = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (index !== -1) {
        state.waiting.splice(index, 1);
      }
      resolve({ 
        acquired: false, 
        reason: 'QUEUE_TIMEOUT', 
        retryAfterSeconds: Math.floor(3 + Math.random() * 5) // 3-8s
      });
    }, timeout);
    
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    
    state.waiting.push({ 
      resolve: resolveAcquire, 
      acquiredAt: Date.now() 
    });
  });
}

/**
 * Release gate and process queue
 * @param ok - Whether the operation succeeded (for circuit tracking)
 */
export function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (state.active > 0) {
    state.active--;
  }
  
  // Update circuit state
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    
    // Open circuit if threshold exceeded
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    // Success resets failure count
    if (state.circuit.failures > 0) {
      state.circuit.failures = Math.max(0, state.circuit.failures - 1);
    }
  }
  
  // Process queue (FIFO with cleanup)
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    if (waiter) {
      waiter.resolve();
    }
  }
}

/**
 * Get gate status for observability
 */
export function getStatus(key: string): { 
  active: number; 
  waiting: number; 
  circuitOpen: boolean; 
  failures: number;
  maxConcurrency: number;
} {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  return {
    active: state.active,
    waiting: state.waiting.length,
    circuitOpen: state.circuit.isOpen,
    failures: state.circuit.failures,
    maxConcurrency: config.maxConcurrency
  };
}

/**
 * Reset circuit breaker (for manual recovery)
 */
export function resetCircuit(key: string): void {
  const state = getOrCreateGateState(key);
  state.circuit.failures = 0;
  state.circuit.isOpen = false;
  state.circuit.lastFailureAt = 0;
  console.log(`🔄 [GATE] Circuit ${key} manually reset`);
}

/**
 * Get all gate statuses (for debugging)
 */
export function getAllStatuses(): Record<string, ReturnType<typeof getStatus>> {
  const statuses: Record<string, ReturnType<typeof getStatus>> = {};
  for (const key of gates.keys()) {
    statuses[key] = getStatus(key);
  }
  return statuses;
}
