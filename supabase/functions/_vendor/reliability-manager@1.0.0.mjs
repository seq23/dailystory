/**
 * VENDOR FALLBACK: Local copy of ReliabilityManager stack v1.0.0
 * Created: 2025-10-12
 * 
 * This file serves as Tier 1 vendor bundle when TypeScript imports fail.
 * TRUE LOCAL VENDOR - No network dependencies.
 * 
 * Contains consolidated bundle of:
 * - ReliabilityManager (orchestration)
 * - UniversalLKGCache (Last Known Good cache)
 * - RequestDeduplicator (duplicate prevention)
 * - EnhancedCircuitBreaker (circuit breaker)
 * - MonitoringService (metrics & alerts)
 * 
 * Import Pattern: vendor-first → _shared fallback
 */

// Re-export from local bundle - completely network independent
export { 
  reliabilityManager, 
  ReliabilityManager,
  UniversalLKGCache,
  RequestDeduplicator,
  EnhancedCircuitBreaker,
  MonitoringService,
  monitoringService
} from './reliability-manager@1.0.0.bundle.mjs';
