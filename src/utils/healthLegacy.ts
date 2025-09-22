/**
 * HEALTH LEGACY ADAPTER - Temporary compatibility layer
 * 
 * 🚨 SCHEDULED FOR DELETION: 72 hours from implementation
 * 
 * This adapter bridges the breaking change in HealthCheckService from:
 * - OLD: boolean (healthy/unhealthy)  
 * - NEW: 'healthy' | 'network' | 'server'
 * 
 * Use this ONLY where you cannot update callers in the same PR.
 * 
 * Part of ERROR-001 fix implementation.
 */

import type { HealthStatus } from '@/services/HealthCheckService';

/**
 * Legacy health status type (boolean-based)
 */
export interface LegacyHealthStatus {
  orchestrator: boolean;
  runwareAPI: boolean;
  serviceDependencies: boolean;
  overallHealth: boolean;
  timestamp: string;
  checkDuration: number;
}

/**
 * Converts new tri-state health status to legacy boolean format
 * 
 * @param modernStatus - New HealthStatus with tri-state values
 * @returns LegacyHealthStatus - Compatible with old callers
 */
export function toLegacyHealthStatus(modernStatus: HealthStatus): LegacyHealthStatus {
  return {
    orchestrator: modernStatus.orchestrator === 'healthy',
    runwareAPI: modernStatus.runwareAPI === 'healthy', 
    serviceDependencies: modernStatus.serviceDependencies === 'healthy',
    overallHealth: modernStatus.overallHealth === 'healthy',
    timestamp: modernStatus.timestamp,
    checkDuration: modernStatus.checkDuration
  };
}

/**
 * Legacy health check wrapper - DO NOT USE IN NEW CODE
 * 
 * @deprecated Use HealthCheckService.checkSystemHealth() directly
 * @returns Promise<LegacyHealthStatus> - Boolean-based status
 */
export async function legacyHealthCheck(): Promise<LegacyHealthStatus> {
  console.warn('🚨 legacyHealthCheck() is deprecated - update caller to use new tri-state format');
  
  // Dynamic import to avoid circular dependencies
  const { HealthCheckService } = await import('@/services/HealthCheckService');
  const modernStatus = await HealthCheckService.checkSystemHealth();
  
  return toLegacyHealthStatus(modernStatus);
}

/**
 * Log usage of legacy adapter for monitoring
 */
function logLegacyUsage(caller: string): void {
  console.warn(`⚠️ Legacy health adapter used by: ${caller} - scheduled for removal in 72h`);
}

// Export usage logger for visibility
export { logLegacyUsage };