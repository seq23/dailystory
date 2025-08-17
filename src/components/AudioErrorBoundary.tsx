import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AudioErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  fallbackComponent?: React.ReactNode;
}

export const AudioErrorBoundary: React.FC<AudioErrorBoundaryProps> = ({
  children,
  onRetry,
  fallbackComponent
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for audio system errors
    const handleAudioError = (event: CustomEvent) => {
      console.error('Audio system error detected:', event.detail);
      setHasError(true);
      setErrorMessage(event.detail?.message || 'Audio playback failed');
      
      // Show user-friendly error toast
      toast({
        title: 'Audio Error',
        description: 'Audio playback encountered an issue. You can try again or continue reading silently.',
        variant: 'destructive',
        duration: 5000
      });
    };

    // Listen for ElevenLabs specific errors
    const handleElevenLabsError = (event: CustomEvent) => {
      console.error('ElevenLabs error:', event.detail);
      setHasError(true);
      setErrorMessage('Text-to-speech service is temporarily unavailable');
      
      toast({
        title: 'Text-to-Speech Error',
        description: 'The audio service is temporarily unavailable. Try using your browser\'s built-in speech instead.',
        variant: 'destructive',
        duration: 5000
      });
    };

    // Listen for network-related audio errors
    const handleNetworkError = () => {
      setHasError(true);
      setErrorMessage('Network connection lost');
      
      toast({
        title: 'Connection Lost',
        description: 'Audio requires an internet connection. Please check your network.',
        variant: 'destructive',
        duration: 5000
      });
    };

    window.addEventListener('audio:error', handleAudioError as EventListener);
    window.addEventListener('elevenlabs:error', handleElevenLabsError as EventListener);
    window.addEventListener('offline', handleNetworkError);

    return () => {
      window.removeEventListener('audio:error', handleAudioError as EventListener);
      window.removeEventListener('elevenlabs:error', handleElevenLabsError as EventListener);
      window.removeEventListener('offline', handleNetworkError);
    };
  }, [toast]);

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setRetryCount(prev => prev + 1);
    
    // Clear any stuck audio states
    try {
      window.dispatchEvent(new CustomEvent('audio:stop:all'));
    } catch (error) {
      console.warn('Failed to clear audio states:', error);
    }
    
    if (onRetry) {
      onRetry();
    }
  };

  if (hasError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="ml-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again {retryCount > 0 && `(${retryCount})`}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AudioErrorBoundary;