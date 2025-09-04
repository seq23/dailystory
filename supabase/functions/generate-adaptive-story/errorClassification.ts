// Error Classification for Edge Functions
// Mirror of frontend error classification utility

export enum ErrorCategory {
  API_ERROR = 'api_error',           // Network, auth, rate limits - should trigger model fallback
  CONTENT_ERROR = 'content_error',   // Validation failures - should retry same model with enhanced prompts
  REASONING_TOKEN_ERROR = 'reasoning_token_error', // Reasoning models consuming tokens without content
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

  // PHASE 5: Reasoning token specific errors - should skip reasoning models
  if (
    lowerMessage.includes('reasoning models consuming tokens without content') ||
    lowerMessage.includes('reasoning token') ||
    lowerMessage.includes('used reasoning tokens but produced')
  ) {
    return {
      category: ErrorCategory.REASONING_TOKEN_ERROR,
      shouldRetryWithSameModel: false,
      shouldFallbackToNextModel: true,
      retryEnhancement: 'Prioritize content generation over reasoning. Focus on creating story text, not analysis.'
    };
  }

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
  if (errorCategory === ErrorCategory.CONTENT_ERROR) {
    const enhancements = [
      'Please ensure content meets all validation requirements and guidelines.',
      'Focus on generating appropriate, well-structured content that passes all validation checks.',
      'Generate clean, appropriate content with proper formatting and suitable vocabulary for the target audience.'
    ];
    return enhancements[Math.min(attemptNumber - 1, enhancements.length - 1)] || enhancements[0];
  }
  
  if (errorCategory === ErrorCategory.REASONING_TOKEN_ERROR) {
    return 'IMPORTANT: Generate actual story content, not reasoning or analysis. Focus on creative narrative text suitable for readers.';
  }
  
  return '';
}