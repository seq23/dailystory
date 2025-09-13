// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
/**
 * STANDARDIZED ERROR HANDLING PATTERNS
 * 
 * This module provides consistent, safe error handling patterns to prevent:
 * - ReferenceErrors from undefined variables in catch blocks
 * - TypeErrors from accessing properties on null/undefined objects
 * - Inconsistent error message extraction
 * 
 * Usage: Import and use these utilities instead of direct property access
 */

/**
 * Safely extracts error message from unknown error types
 * Prevents crashes when error is not an Error instance
 */
export const safeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error occurred';
};

/**
 * Safely accesses nested object properties with fallback
 * Prevents TypeErrors from accessing properties on undefined objects
 */
export const safePropertyAccess = <T>(
  obj: any, 
  property: string, 
  fallback: T
): T => {
  if (obj && typeof obj === 'object' && property in obj) {
    const value = obj[property];
    return value !== null && value !== undefined ? value : fallback;
  }
  return fallback;
};

/**
 * Safely extracts model information from model objects
 * Common pattern used across story generation functions
 */
export const safeModelAccess = (model: any): { name: string; description: string } => {
  const defaultModel = { name: 'unknown', description: 'Unknown model' };
  
  if (!model || typeof model !== 'object') return defaultModel;
  
  return {
    name: safePropertyAccess(model, 'model', 'unknown'),
    description: safePropertyAccess(model, 'description', 'Unknown model')
  };
};

/**
 * Enhanced error logging with safe property access
 * Standard pattern for logging errors with context information
 */
export const logSafeError = (
  message: string, 
  error: unknown, 
  context?: Record<string, any>
): void => {
  const errorMessage = safeErrorMessage(error);
  const logData = {
    error: errorMessage,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  console.error(`❌ ${message}:`, logData);
};

/**
 * Standard patterns for common error scenarios
 */
export const ERROR_PATTERNS = {
  // ✅ SAFE: Use optional chaining and fallbacks
  SAFE_MODEL_ACCESS: `currentModel?.model || 'unknown'`,
  SAFE_ERROR_MESSAGE: `safeErrorMessage(error)`,
  SAFE_PROPERTY_ACCESS: `obj?.property || fallback`,
  
  // ❌ UNSAFE: Patterns to avoid
  UNSAFE_MODEL_ACCESS: `currentModel.model`,
  UNSAFE_ERROR_MESSAGE: `error.message`,
  UNSAFE_PROPERTY_ACCESS: `obj.property`
};

/**
 * Validates that error handling follows safe patterns
 * Used for development-time checking
 */
export const validateErrorHandling = (code: string): string[] => {
  const issues: string[] = [];
  
  if (code.includes('error.message') && !code.includes('safeErrorMessage')) {
    issues.push('Direct error.message access detected - use safeErrorMessage(error) instead');
  }
  
  if (code.includes('currentModel.model') && !code.includes('currentModel?.model')) {
    issues.push('Unsafe currentModel.model access detected - use currentModel?.model || fallback');
  }
  
  return issues;
};