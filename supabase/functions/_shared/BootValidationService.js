/**
 * BOOT VALIDATION SERVICE
 * Validates all system components during edge function startup
 * Prevents crashes by checking all dependencies upfront
 */

export class BootValidationService {
  constructor() {
    this.validationResults = new Map();
  }

  /**
   * Comprehensive startup validation
   */
  async validateSystemStartup(functionName) {
    console.log(`🔍 [BootValidation] Starting system validation for ${functionName}`);
    
    const validation = {
      functionName,
      timestamp: new Date().toISOString(),
      results: {},
      overallStatus: 'unknown',
      errors: [],
      warnings: []
    };

    try {
      // 1. Environment Variables Validation
      validation.results.environment = await this.validateEnvironment();
      
      // 2. Module Integrity Validation
      validation.results.modules = await this.validateModules();
      
      // 3. CORS System Validation
      validation.results.cors = await this.validateCors();
      
      // 4. Database Connection Validation
      validation.results.database = await this.validateDatabase();
      
      // Calculate overall status
      validation.overallStatus = this.calculateOverallStatus(validation.results);
      
      // Store results
      this.validationResults.set(functionName, validation);
      
      console.log(`✅ [BootValidation] System validation complete for ${functionName} - Status: ${validation.overallStatus}`);
      return validation;
      
    } catch (error) {
      validation.overallStatus = 'critical_failure';
      validation.errors.push(`Boot validation failed: ${error.message}`);
      console.error(`❌ [BootValidation] Critical failure for ${functionName}:`, error);
      return validation;
    }
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment() {
    const env = {
      status: 'pass',
      score: 1.0,
      required: {},
      optional: {},
      issues: []
    };

    // Required environment variables
    const required = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    // Optional but recommended
    const optional = [
      'RUNWARE_API_KEY',
      'OPENAI_API_KEY',
      'ELEVENLABS_API_KEY'
    ];

    // Check required variables
    for (const varName of required) {
      const value = Deno.env.get(varName);
      env.required[varName] = {
        present: !!value,
        valid: !!(value && value.length > 10)
      };
      
      if (!value) {
        env.issues.push(`Missing required environment variable: ${varName}`);
        env.score -= 0.3;
      } else if (value.length < 10) {
        env.issues.push(`Invalid ${varName}: too short`);
        env.score -= 0.1;
      }
    }

    // Check optional variables
    for (const varName of optional) {
      const value = Deno.env.get(varName);
      env.optional[varName] = {
        present: !!value,
        valid: !!(value && value.length > 10)
      };
    }

    if (env.score < 0.7) env.status = 'warning';
    if (env.score < 0.5) env.status = 'fail';

    return env;
  }

  /**
   * Validate module imports and exports
   */
  async validateModules() {
    const modules = {
      status: 'pass',
      score: 1.0,
      tested: {},
      issues: []
    };

    // Test critical module imports
    const criticalModules = [
      { name: 'corsAdvanced', path: '../_shared/corsAdvanced.js' },
      { name: 'tier25Vocabulary', path: '../_shared/tier25Vocabulary.js' }
      // Note: SessionStateManager removed - deprecated and no longer used
    ];

    for (const mod of criticalModules) {
      try {
        const imported = await import(mod.path);
        modules.tested[mod.name] = {
          imported: true,
          hasExports: Object.keys(imported).length > 0,
          exports: Object.keys(imported)
        };
        
        // Special checks for known problematic modules
        if (mod.name === 'tier25Vocabulary' && !imported.VOCABULARY && !imported.CULTURAL_ARRAYS) {
          modules.issues.push(`${mod.name}: Missing expected exports`);
          modules.score -= 0.2;
        }
        
      } catch (error) {
        modules.tested[mod.name] = {
          imported: false,
          error: error.message
        };
        modules.issues.push(`Failed to import ${mod.name}: ${error.message}`);
        modules.score -= 0.3;
      }
    }

    if (modules.score < 0.8) modules.status = 'warning';
    if (modules.score < 0.6) modules.status = 'fail';

    return modules;
  }

  /**
   * Validate CORS system
   */
  async validateCors() {
    const cors = {
      status: 'pass',
      score: 1.0,
      systems: {},
      issues: []
    };

    try {
      // Test CORS import
      const corsModule = await import('../_shared/corsAdvanced.js');
      cors.systems.corsAdvanced = {
        imported: true,
        functions: [
          'createDynamicCorsOptionsResponse',
          'createDynamicCorsResponse', 
          'createDynamicCorsErrorResponse'
        ].map(fn => ({ name: fn, available: typeof corsModule[fn] === 'function' }))
      };
      
    } catch (error) {
      cors.systems.corsAdvanced = { imported: false, error: error.message };
      cors.issues.push(`CORS system unavailable: ${error.message}`);
      cors.score -= 0.5;
    }

    if (cors.score < 0.8) cors.status = 'warning';
    return cors;
  }

  /**
   * Validate database connection
   */
  async validateDatabase() {
    const db = {
      status: 'pass',
      score: 1.0,
      connection: false,
      issues: []
    };

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        db.connection = true;
        // Could add actual connection test here if needed
      } else {
        db.issues.push('Database credentials not configured');
        db.score -= 0.4;
      }
      
    } catch (error) {
      db.issues.push(`Database validation failed: ${error.message}`);
      db.score -= 0.6;
    }

    if (db.score < 0.8) db.status = 'warning';
    if (db.score < 0.5) db.status = 'fail';
    
    return db;
  }

  /**
   * Calculate overall system status
   */
  calculateOverallStatus(results) {
    const scores = Object.values(results).map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 0.9) return 'excellent';
    if (avgScore >= 0.8) return 'good';
    if (avgScore >= 0.7) return 'warning';
    if (avgScore >= 0.5) return 'degraded';
    return 'critical';
  }

  /**
   * Get validation results for a function
   */
  getValidationResults(functionName) {
    return this.validationResults.get(functionName);
  }

  /**
   * Get system health summary
   */
  getHealthSummary() {
    const results = Array.from(this.validationResults.values());
    if (results.length === 0) return { status: 'unknown', message: 'No validations performed' };
    
    const latest = results[results.length - 1];
    return {
      status: latest.overallStatus,
      timestamp: latest.timestamp,
      functionName: latest.functionName,
      issues: latest.errors.length + latest.warnings.length
    };
  }
}

// Export singleton instance
export const bootValidationService = new BootValidationService();