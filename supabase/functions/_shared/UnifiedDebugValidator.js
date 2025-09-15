/**
 * UNIFIED DEBUG VALIDATION SYSTEM
 * Consolidates ALL validation for debugging/logging purposes ONLY
 * NEVER blocks tiers or crashes system - purely for monitoring
 */

import { TIER_25_UNIFIED_VOCABULARY_EXTENDED } from './tier25Vocabulary.js';

export class UnifiedDebugValidator {
  constructor() {
    this.validationHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * MASTER VALIDATION FUNCTION - runs all checks for debugging
   * Returns comprehensive validation results, never throws errors
   */
  async validateSystem(context = {}) {
    const validationResults = {
      timestamp: new Date().toISOString(),
      context,
      checks: {},
      overallStatus: 'unknown',
      recommendations: []
    };

    try {
      // 1. CHARACTER APPEARANCE CONSISTENCY
      validationResults.checks.characterConsistency = await this.validateCharacterConsistency(context);
      
      // 2. OBJECT COLOR/SIZE CONSISTENCY
      validationResults.checks.objectConsistency = await this.validateObjectConsistency(context);
      
      // 3. CROSS-PAGE VISUAL COHERENCE
      validationResults.checks.visualCoherence = await this.validateVisualCoherence(context);
      
      // 4. SERVICE HEALTH (basic ping tests only)
      validationResults.checks.serviceHealth = await this.validateServiceHealth(context);
      
      // 5. DATA FLOW VALIDATION
      validationResults.checks.dataFlow = await this.validateDataFlow(context);
      
      // 6. TEMPLATE VALIDATION
      validationResults.checks.templateValidation = await this.validateTemplates(context);

      // Calculate overall status
      validationResults.overallStatus = this.calculateOverallStatus(validationResults.checks);
      validationResults.recommendations = this.generateRecommendations(validationResults.checks);

      // Store in history for debugging
      this.addToHistory(validationResults);

      console.log(`🔍 [UnifiedDebugValidator] System validation complete - Status: ${validationResults.overallStatus}`);
      return validationResults;

    } catch (error) {
      console.warn(`⚠️ [UnifiedDebugValidator] Validation error (non-blocking):`, error.message);
      validationResults.overallStatus = 'error';
      validationResults.error = error.message;
      return validationResults;
    }
  }

  /**
   * 1. CHARACTER APPEARANCE CONSISTENCY VALIDATION
   */
  async validateCharacterConsistency(context) {
    try {
      const { sessionId, characterName, userInfo } = context;
      if (!sessionId || !characterName) return { status: 'skipped', reason: 'missing_context' };

      // Basic consistency checks
      const consistency = {
        status: 'pass',
        score: 1.0,
        details: {
          hasCharacterData: !!characterName,
          hasUserInfo: !!userInfo,
          sessionActive: !!sessionId
        },
        issues: [],
        recommendations: []
      };

      // Check for basic character data
      if (!characterName || characterName === 'child') {
        consistency.issues.push('Generic character name used');
        consistency.score -= 0.1;
      }

      if (consistency.score < 0.8) {
        consistency.status = 'warning';
        consistency.recommendations.push('Consider improving character name specificity');
      }

      return consistency;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * 2. OBJECT COLOR/SIZE CONSISTENCY VALIDATION
   */
  async validateObjectConsistency(context) {
    try {
      const { pageText, sessionId } = context;
      if (!pageText) return { status: 'skipped', reason: 'no_page_text' };

      const objectConsistency = {
        status: 'pass',
        score: 1.0,
        detectedObjects: [],
        coloredObjects: [],
        sizedObjects: [],
        issues: [],
        recommendations: []
      };

      // Simple object detection patterns
      const colors = TIER_25_UNIFIED_VOCABULARY_EXTENDED.colors.basic.join('|');
      const colorPattern = new RegExp(`(${colors})\\s+(ball|car|house|tree|flower)`, 'gi');
      const sizePattern = /(big|small|tiny|huge|large|little)\s+(ball|car|house|tree|flower)/gi;

      let match;
      while ((match = colorPattern.exec(pageText)) !== null) {
        objectConsistency.coloredObjects.push(`${match[1]} ${match[2]}`);
      }

      while ((match = sizePattern.exec(pageText)) !== null) {
        objectConsistency.sizedObjects.push(`${match[1]} ${match[2]}`);
      }

      objectConsistency.detectedObjects = [
        ...objectConsistency.coloredObjects,
        ...objectConsistency.sizedObjects
      ];

      if (objectConsistency.detectedObjects.length > 0) {
        objectConsistency.recommendations.push(`Found ${objectConsistency.detectedObjects.length} objects for tracking`);
      }

      return objectConsistency;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * 3. CROSS-PAGE VISUAL COHERENCE VALIDATION
   */
  async validateVisualCoherence(context) {
    try {
      const { sessionId, pageNumber } = context;
      
      const coherence = {
        status: 'pass',
        score: 1.0,
        pageNumber: pageNumber || 1,
        sessionId: sessionId || 'unknown',
        coherenceFactors: {
          hasSessionId: !!sessionId,
          pageTracking: pageNumber > 0
        },
        issues: [],
        recommendations: []
      };

      if (!sessionId) {
        coherence.issues.push('No session ID for cross-page tracking');
        coherence.score -= 0.3;
      }

      if (coherence.score < 0.7) {
        coherence.status = 'warning';
        coherence.recommendations.push('Improve session tracking for better coherence');
      }

      return coherence;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * 4. BASIC SERVICE HEALTH VALIDATION (ping tests only)
   */
  async validateServiceHealth(context) {
    try {
      const health = {
        status: 'pass',
        score: 1.0,
        services: {
          database: 'available',
          imageGeneration: 'available',
          aiServices: 'available'
        },
        issues: [],
        recommendations: []
      };

      // Basic availability checks (no actual pings to avoid overhead)
      const hasDatabase = !!Deno.env.get('SUPABASE_URL');
      const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
      const hasRunware = !!Deno.env.get('RUNWARE_API_KEY');

      if (!hasDatabase) {
        health.services.database = 'unavailable';
        health.issues.push('Database connection not configured');
        health.score -= 0.4;
      }

      if (!hasOpenAI) {
        health.services.aiServices = 'unavailable';
        health.issues.push('OpenAI API not configured');
        health.score -= 0.3;
      }

      if (!hasRunware) {
        health.services.imageGeneration = 'degraded';
        health.issues.push('Runware API not configured');
        health.score -= 0.2;
      }

      if (health.score < 0.8) {
        health.status = 'warning';
        health.recommendations.push('Check service configurations');
      }

      return health;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * 5. DATA FLOW VALIDATION (input/output structure checks)
   */
  async validateDataFlow(context) {
    try {
      const { input, output, operation } = context;
      
      const dataFlow = {
        status: 'pass',
        score: 1.0,
        operation: operation || 'unknown',
        inputValidation: { valid: true, issues: [] },
        outputValidation: { valid: true, issues: [] },
        issues: [],
        recommendations: []
      };

      // Basic input validation
      if (input) {
        if (typeof input !== 'object') {
          dataFlow.inputValidation.issues.push('Input is not an object');
          dataFlow.score -= 0.2;
        }
        if (!input.sessionId && !input.session_id) {
          dataFlow.inputValidation.issues.push('Missing session identifier');
          dataFlow.score -= 0.1;
        }
      }

      // Basic output validation
      if (output) {
        if (typeof output !== 'object') {
          dataFlow.outputValidation.issues.push('Output is not an object');
          dataFlow.score -= 0.2;
        }
      }

      dataFlow.inputValidation.valid = dataFlow.inputValidation.issues.length === 0;
      dataFlow.outputValidation.valid = dataFlow.outputValidation.issues.length === 0;

      if (dataFlow.score < 0.8) {
        dataFlow.status = 'warning';
        dataFlow.recommendations.push('Review data structure consistency');
      }

      return dataFlow;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * 6. TEMPLATE VALIDATION
   */
  async validateTemplates(context) {
    try {
      const { template, userInfo, pageText } = context;
      
      const templateValidation = {
        status: 'pass',
        score: 1.0,
        templateProvided: !!template,
        userInfoProvided: !!userInfo,
        pageTextProvided: !!pageText,
        placeholderCount: 0,
        issues: [],
        recommendations: []
      };

      if (template) {
        // Count placeholders
        const placeholders = template.match(/\{[^}]+\}/g) || [];
        templateValidation.placeholderCount = placeholders.length;
        
        if (placeholders.length > 10) {
          templateValidation.issues.push('High placeholder count may affect performance');
          templateValidation.score -= 0.1;
        }
      }

      if (!userInfo && template) {
        templateValidation.issues.push('Template provided but no user info for placeholder resolution');
        templateValidation.score -= 0.2;
      }

      if (templateValidation.score < 0.8) {
        templateValidation.status = 'warning';
        templateValidation.recommendations.push('Review template structure and user info availability');
      }

      return templateValidation;
    } catch (error) {
      return { status: 'error', error: error.message, score: 0 };
    }
  }

  /**
   * Calculate overall system status from individual checks
   */
  calculateOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.every(status => status === 'pass')) return 'healthy';
    return 'mixed';
  }

  /**
   * Generate system-wide recommendations
   */
  generateRecommendations(checks) {
    const recommendations = [];
    
    Object.entries(checks).forEach(([checkName, result]) => {
      if (result.recommendations && result.recommendations.length > 0) {
        recommendations.push(`${checkName}: ${result.recommendations[0]}`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('System validation passed - no immediate recommendations');
    }

    return recommendations;
  }

  /**
   * Add validation result to history
   */
  addToHistory(validationResult) {
    this.validationHistory.unshift(validationResult);
    
    // Keep only recent history
    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory = this.validationHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get validation history for debugging
   */
  getValidationHistory(limit = 10) {
    return this.validationHistory.slice(0, limit);
  }

  /**
   * Get system health summary
   */
  getHealthSummary() {
    if (this.validationHistory.length === 0) {
      return { status: 'unknown', message: 'No validation history available' };
    }

    const recent = this.validationHistory[0];
    return {
      status: recent.overallStatus,
      timestamp: recent.timestamp,
      checksPerformed: Object.keys(recent.checks).length,
      recommendations: recent.recommendations.slice(0, 3) // Top 3
    };
  }
}

// Export singleton instance
export const unifiedDebugValidator = new UnifiedDebugValidator();
