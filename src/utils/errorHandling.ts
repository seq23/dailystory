// Centralized error handling utilities
import { SecurityLogger } from "./security";

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  AUTH = 'auth',
  STORAGE = 'storage',
  IMAGE_GENERATION = 'image_generation',
  STORY_GENERATION = 'story_generation',
  TTS = 'tts',
  SECURITY = 'security',
  SUBSCRIPTION = 'subscription',
  UNKNOWN = 'unknown'
}

// Trial session error classes  
export class FreeTrialTimeoutError extends Error {
  constructor(
    public sessionDuration: number,
    public maxDuration: number,
    message: string = `Free trial session ended: ${Math.round(sessionDuration/60000)} minutes`
  ) {
    super(message);
    this.name = 'FreeTrialTimeoutError';
  }
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  recoverable: boolean;
}

export class ErrorHandler {
  private static errorCounts = new Map<string, number>();
  
  /**
   * Create a standardized error object
   */
  static createError(
    type: ErrorType,
    message: string,
    details?: any,
    recoverable: boolean = true
  ): AppError {
    return {
      type,
      message,
      details,
      timestamp: Date.now(),
      recoverable
    };
  }
  
  /**
   * Handle and log errors with retry logic
   */
  static handleError(error: AppError | Error, context?: string): AppError {
    let appError: AppError;
    
    if (error instanceof Error) {
      appError = this.createError(
        ErrorType.UNKNOWN,
        error.message,
        { stack: error.stack, context },
        true
      );
    } else {
      appError = error;
    }
    
    // Log the error
    SecurityLogger.log(`error_${appError.type}`, {
      message: appError.message,
      details: appError.details,
      context,
      recoverable: appError.recoverable
    });
    
    // Track error frequency
    const errorKey = `${appError.type}_${context}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    
    // Log if error is happening frequently
    if (count > 5) {
      console.warn(`Frequent error detected: ${errorKey} (${count} occurrences)`);
    }
    
    return appError;
  }
  
  /**
   * Get user-friendly error messages
   */
  static getUserMessage(error: AppError): string {
    const messages = {
      [ErrorType.VALIDATION]: "Please check your input and try again.",
      [ErrorType.NETWORK]: "Network connection issue. Please check your internet and try again.",
      [ErrorType.API]: "Service temporarily unavailable. Please try again.",
      [ErrorType.AUTH]: "Authentication issue. Please log in again.",
      [ErrorType.STORAGE]: "Unable to save your progress right now.",
      [ErrorType.IMAGE_GENERATION]: "Unable to generate image. Using fallback content.",
      [ErrorType.STORY_GENERATION]: "Story generation failed. Using pre-written content.",
      [ErrorType.TTS]: "Text-to-speech temporarily unavailable.",
      [ErrorType.SECURITY]: "For safety reasons, we can't process that content.",
      [ErrorType.SUBSCRIPTION]: "Subscription service temporarily unavailable.",
      [ErrorType.UNKNOWN]: "Something went wrong. Please try again."
    };
    
    return messages[error.type] || messages[ErrorType.UNKNOWN];
  }
  
  /**
   * Retry logic for recoverable errors
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw this.handleError(lastError!, 'retry_operation');
  }
  
  /**
   * Clear error counts (for testing or reset)
   */
  static clearErrorCounts(): void {
    this.errorCounts.clear();
  }
  
  /**
   * Get error statistics
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
}

/**
 * Decorator for automatic error handling
 */
export function handleErrors(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      const appError = ErrorHandler.handleError(error as Error, `${target.constructor.name}.${propertyKey}`);
      throw appError;
    }
  };
  
  return descriptor;
}