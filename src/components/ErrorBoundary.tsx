import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { NetworkTimeoutError } from '@/utils/networkTimeout';
import { DebugLogger } from '@/services/DebugLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    DebugLogger.error('error', 'ErrorBoundary caught an error', { error, errorInfo });
    
    // Suppress Chrome extension errors
    if (error.message?.includes('Extension context invalidated') ||
        error.stack?.includes('chrome-extension://')) {
      return;
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({ 
        hasError: false, 
        error: undefined,
        retryCount: this.state.retryCount + 1 
      });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error instanceof NetworkTimeoutError;
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Something went wrong
            </CardTitle>
            <CardDescription>
              {isNetworkError 
                ? 'Network request timed out. Please check your connection and try again.'
                : 'An unexpected error occurred. Please try refreshing the page.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.error && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md font-mono">
                {this.state.error.message}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.reload()}
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}