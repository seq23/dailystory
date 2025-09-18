import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { LeanErrorService } from '@/utils/LeanErrorService';

interface SecurityBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SecurityBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SecurityBoundary extends React.Component<SecurityBoundaryProps, SecurityBoundaryState> {
  constructor(props: SecurityBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SecurityBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    LeanErrorService.logError(error, 'react_error_boundary');
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Oops! Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Don't worry, your data is safe!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                Error details have been logged for our team to review.
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}