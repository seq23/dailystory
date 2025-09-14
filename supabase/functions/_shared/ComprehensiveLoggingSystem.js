/**
 * COMPREHENSIVE LOGGING SYSTEM - SIMPLIFIED
 * Simple console wrapper - complex logging moved to UnifiedDebugValidator
 */

import { unifiedDebugValidator } from './UnifiedDebugValidator.js';

export class ComprehensiveLoggingSystem {
  constructor() {
    this.logs = new Map();
    this.maxLogsPerCategory = 50; // Reduced from 100
  }

  // Simple console wrapper with validation logging
  logWithValidation(category, message, details = {}) {
    try {
      // Use unified validator for comprehensive logging
      unifiedDebugValidator.validateSystem({
        operation: `log_${category}`,
        logMessage: message,
        logDetails: details,
        timestamp: Date.now()
      });

      // Simple console output
      console.log(`[${category}] ${message}`, details);
    } catch (error) {
      console.warn('⚠️ [ComprehensiveLoggingSystem] Logging error (non-blocking):', error.message);
    }
  }

  // Simplified logging methods
  logTierRouting(event, details = {}) {
    this.logWithValidation('TIER_ROUTING', `Tier routing: ${event}`, details);
  }

  logCulturalResolution(event, details = {}) {
    this.logWithValidation('CULTURAL_RESOLUTION', `Cultural resolution: ${event}`, details);
  }

  logSecondaryCharacterProcessing(event, details = {}) {
    this.logWithValidation('SECONDARY_CHARACTER', `Secondary character: ${event}`, details);
  }

  logErrorRecovery(event, details = {}) {
    this.logWithValidation('ERROR_RECOVERY', `Error recovery: ${event}`, details);
  }

  logPerformanceMonitoring(event, details = {}) {
    this.logWithValidation('PERFORMANCE', `Performance: ${event}`, details);
  }

  logDataFlowValidation(event, details = {}) {
    this.logWithValidation('DATA_FLOW', `Data flow: ${event}`, details);
  }

  logServiceHealthMonitoring(event, details = {}) {
    this.logWithValidation('SERVICE_HEALTH', `Service health: ${event}`, details);
  }

  // Get logs for debugging
  getAllLogs() {
    return unifiedDebugValidator.getValidationHistory();
  }

  clearAllLogs() {
    this.logs.clear();
  }
}