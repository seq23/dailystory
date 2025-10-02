/**
 * SERVICE HEALTH MONITOR - SIMPLIFIED
 * Basic ping tests only - most validation moved to UnifiedDebugValidator
 */

import { unifiedDebugValidator } from './UnifiedDebugValidator.js';

export class ServiceHealthMonitor {
  constructor() {
    this.services = new Map();
    this.healthHistory = [];
    this.maxHistory = 50; // Reduced from 100
  }

  // Basic ping test for database
  async pingDatabase() {
    try {
      const { memoizedImport, createVendorFirstSupabaseClient } = await import('./resilientLoader.ts');
      const supabase = await createVendorFirstSupabaseClient();
      
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return { success: !error, service: 'database' };
    } catch (error) {
      return { success: false, service: 'database', error: error.message };
    }
  }

  // Comprehensive health check using unified validator
  async checkSystemHealth() {
    try {
      const context = {
        timestamp: Date.now(),
        operation: 'health_check'
      };

      const validationResults = await unifiedDebugValidator.validateSystem(context);
      
      return {
        overall: validationResults.overallStatus,
        details: validationResults.checks,
        recommendations: validationResults.recommendations,
        timestamp: validationResults.timestamp
      };
    } catch (error) {
      return {
        overall: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get health summary
  getHealthSummary() {
    return unifiedDebugValidator.getHealthSummary();
  }
}