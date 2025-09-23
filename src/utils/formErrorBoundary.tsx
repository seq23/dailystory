import React from 'react';
import { toast } from 'sonner';
import { DebugLogger } from '@/services/DebugLogger';
import { ErrorHandler, ErrorType } from '@/utils/errorHandling';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Error boundary specifically designed for form submission and validation errors
 */
export class FormErrorBoundary extends React.Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  private maxRetries = 3;
  
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    DebugLogger.error('ui', 'Form error boundary caught error', { error, errorInfo });
    
    // Handle specific error types
    const appError = ErrorHandler.handleError(error, 'FormErrorBoundary');
    
    // Notify parent component
    this.props.onError?.(error);
    
    // Show user-friendly message based on error type
    if (error.message?.includes('validation')) {
      toast.error('Please check your form inputs and try again');
    } else if (error.message?.includes('network')) {
      toast.error('Network error. Please check your connection and try again');
    } else if (error.message?.includes('submission')) {
      toast.error('Form submission failed. Please try again');
    } else {
      toast.error('An error occurred. Please try again');
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      toast.error(`Maximum retry attempts (${this.maxRetries}) reached. Please refresh the page.`);
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <h3 className="text-lg font-semibold text-destructive">Form Error</h3>
          <p className="text-sm text-muted-foreground text-center">
            Something went wrong with the form. Please try again.
          </p>
          {this.state.retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again ({this.state.retryCount + 1}/{this.maxRetries})
            </button>
          )}
          {this.state.retryCount >= this.maxRetries && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap forms with error boundary
 */
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  customFallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <FormErrorBoundary fallback={customFallback}>
      <Component {...props} />
    </FormErrorBoundary>
  );

  WrappedComponent.displayName = `withFormErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling form submission errors with retry logic
 */
export function useFormSubmission<T = any>() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const submit = React.useCallback(async (
    submitFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    }
  ) => {
    const { 
      onSuccess, 
      onError, 
      showSuccessToast = false, 
      showErrorToast = true 
    } = options || {};

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitFn();
      setRetryCount(0); // Reset retry count on success
      
      if (showSuccessToast) {
        toast.success('Form submitted successfully');
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Form submission failed');
      
      setError(error);
      DebugLogger.error('ui', 'Form submission failed', { error, retryCount });
      
      if (showErrorToast) {
        const userMessage = ErrorHandler.getUserMessage({
          type: ErrorType.VALIDATION,
          message: error.message,
          timestamp: Date.now(),
          recoverable: true
        });
        toast.error(userMessage);
      }
      
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [retryCount]);

  const retry = React.useCallback(async (submitFn: () => Promise<T>) => {
    if (retryCount >= maxRetries) {
      toast.error(`Maximum retry attempts (${maxRetries}) reached`);
      return;
    }

    setRetryCount(prev => prev + 1);
    return submit(submitFn);
  }, [retryCount, submit, maxRetries]);

  return {
    submit,
    retry,
    isSubmitting,
    error,
    retryCount,
    maxRetries,
    canRetry: retryCount < maxRetries
  };
}