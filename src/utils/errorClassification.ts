// Error Classification Utility
// Distinguishes between API errors and content validation errors for proper circuit breaker logic

export enum ErrorCategory {
  API_ERROR = 'api_error',           // Network, auth, rate limits - should trigger model fallback
  CONTENT_ERROR = 'content_error',   // Validation failures - should retry same model with enhanced prompts
  SYSTEM_ERROR = 'system_error'      // Internal errors - should trigger full fallback
}

export interface ClassifiedError {
  category: ErrorCategory;
  shouldRetryWithSameModel: boolean;
  shouldFallbackToNextModel: boolean;
  retryEnhancement?: string;
}

export function classifyError(error: Error | string): ClassifiedError {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // API-related errors - should trigger model fallback
  if (
    lowerMessage.includes('api key') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('quota') ||
    lowerMessage.includes('model') ||
    lowerMessage.includes('availability') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('429')
  ) {
    return {
      category: ErrorCategory.API_ERROR,
      shouldRetryWithSameModel: false,
      shouldFallbackToNextModel: true
    };
  }

  // Content validation errors - should retry same model with enhancements
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('inappropriate') ||
    lowerMessage.includes('content') ||
    lowerMessage.includes('vocabulary') ||
    lowerMessage.includes('length') ||
    lowerMessage.includes('format') ||
    lowerMessage.includes('parse') ||
    lowerMessage.includes('coherence')
  ) {
    return {
      category: ErrorCategory.CONTENT_ERROR,
      shouldRetryWithSameModel: true,
      shouldFallbackToNextModel: false,
      retryEnhancement: 'Content validation failed. Please generate more appropriate content following all requirements exactly.'
    };
  }

  // System errors - full fallback
  return {
    category: ErrorCategory.SYSTEM_ERROR,
    shouldRetryWithSameModel: false,
    shouldFallbackToNextModel: true
  };
}

export function getRetryEnhancement(errorCategory: ErrorCategory, attemptNumber: number): string {
  if (errorCategory !== ErrorCategory.CONTENT_ERROR) {
    return '';
  }

  const enhancements = [
    'Please ensure content meets all validation requirements and guidelines.',
    'Focus on generating appropriate, well-structured content that passes all validation checks.',
    'Generate clean, appropriate content with proper formatting and suitable vocabulary for the target audience.'
  ];

  return enhancements[Math.min(attemptNumber - 1, enhancements.length - 1)] || enhancements[0];
}