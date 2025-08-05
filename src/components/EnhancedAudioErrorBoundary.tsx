// Enhanced Audio Error Boundary Component
import React, { Component, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface AudioError {
  type: 'NETWORK_TIMEOUT' | 'AUDIO_INIT_FAILED' | 'TTS_SERVICE_ERROR' | 'MOBILE_AUDIO_ERROR' | 'UNKNOWN';
  message: string;
  context?: string;
  timestamp: number;
}

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: AudioError) => void;
}

interface State {
  hasAudioError: boolean;
  audioError: AudioError | null;
  errorCount: number;
  lastErrorTime: number;
}

export class EnhancedAudioErrorBoundary extends Component<Props, State> {
  private errorRecoveryTimeout?: NodeJS.Timeout;
  private maxErrorsPerMinute = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasAudioError: false,
      audioError: null,
      errorCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const audioError = EnhancedAudioErrorBoundary.classifyAudioError(error);
    
    return {
      hasAudioError: true,
      audioError,
      errorCount: 1,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    const audioError = EnhancedAudioErrorBoundary.classifyAudioError(error);
    
    console.error('🔊 AudioErrorBoundary caught error:', {
      error,
      errorInfo,
      audioError,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Report error to parent component
    if (onError) {
      onError(audioError);
    }

    // Show appropriate toast message
    this.showErrorToast(audioError);

    // Attempt automatic recovery for certain error types
    this.attemptAutoRecovery(audioError);
  }

  private static classifyAudioError(error: Error): AudioError {
    const message = error.message.toLowerCase();
    const timestamp = Date.now();

    if (message.includes('timeout') || message.includes('network')) {
      return {
        type: 'NETWORK_TIMEOUT',
        message: 'Audio service timed out. Please check your internet connection.',
        context: error.message,
        timestamp
      };
    }

    if (message.includes('audio') && message.includes('init')) {
      return {
        type: 'AUDIO_INIT_FAILED',
        message: 'Could not initialize audio. Try tapping to enable audio first.',
        context: error.message,
        timestamp
      };
    }

    if (message.includes('tts') || message.includes('speech') || message.includes('elevenlabs')) {
      return {
        type: 'TTS_SERVICE_ERROR',
        message: 'Text-to-speech service is temporarily unavailable.',
        context: error.message,
        timestamp
      };
    }

    if (message.includes('mobile') || message.includes('ios') || message.includes('android')) {
      return {
        type: 'MOBILE_AUDIO_ERROR',
        message: 'Mobile audio requires user interaction. Please tap the audio button.',
        context: error.message,
        timestamp
      };
    }

    return {
      type: 'UNKNOWN',
      message: 'An audio error occurred. Audio features may be temporarily unavailable.',
      context: error.message,
      timestamp
    };
  }

  private showErrorToast(audioError: AudioError) {
    const toastMessages = {
      'NETWORK_TIMEOUT': {
        title: 'Connection Issue',
        description: 'Audio took too long to load. We\'ll try a different approach.',
        duration: 4000
      },
      'AUDIO_INIT_FAILED': {
        title: 'Audio Setup Needed',
        description: 'Tap the audio button to enable sound features.',
        duration: 6000
      },
      'TTS_SERVICE_ERROR': {
        title: 'Audio Service Unavailable',
        description: 'Text-to-speech is temporarily down. You can still read silently.',
        duration: 5000
      },
      'MOBILE_AUDIO_ERROR': {
        title: 'Mobile Audio Setup',
        description: 'Please tap the play button to activate audio on your device.',
        duration: 7000
      },
      'UNKNOWN': {
        title: 'Audio Error',
        description: 'Audio features are temporarily unavailable.',
        duration: 4000
      }
    };

    const message = toastMessages[audioError.type];
    
    toast({
      title: message.title,
      description: message.description,
      duration: message.duration,
      variant: 'destructive'
    });
  }

  private attemptAutoRecovery(audioError: AudioError) {
    // Clear any existing recovery timeout
    if (this.errorRecoveryTimeout) {
      clearTimeout(this.errorRecoveryTimeout);
    }

    // Auto-recovery strategies based on error type
    switch (audioError.type) {
      case 'NETWORK_TIMEOUT':
        // Retry after 3 seconds for network issues
        this.errorRecoveryTimeout = setTimeout(() => {
          this.handleRetry();
        }, 3000);
        break;

      case 'TTS_SERVICE_ERROR':
        // Retry after 5 seconds for service issues
        this.errorRecoveryTimeout = setTimeout(() => {
          this.handleRetry();
        }, 5000);
        break;

      case 'AUDIO_INIT_FAILED':
      case 'MOBILE_AUDIO_ERROR':
        // These require user interaction, no auto-recovery
        break;

      default:
        // Generic retry after 2 seconds
        this.errorRecoveryTimeout = setTimeout(() => {
          this.handleRetry();
        }, 2000);
        break;
    }
  }

  private handleRetry = () => {
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;
    
    // Rate limiting: don't retry too frequently
    if (timeSinceLastError < 60000 && this.state.errorCount >= this.maxErrorsPerMinute) {
      console.warn('🔊 Audio error retry rate limited');
      return;
    }

    console.log('🔄 Attempting audio error recovery...');
    
    this.setState({
      hasAudioError: false,
      audioError: null,
      errorCount: timeSinceLastError > 60000 ? 0 : this.state.errorCount,
      lastErrorTime: timeSinceLastError > 60000 ? 0 : this.state.lastErrorTime
    });

    toast({
      title: 'Retrying Audio',
      description: 'Attempting to restore audio functionality...',
      duration: 2000
    });
  };

  private handleManualRetry = () => {
    this.setState(prevState => ({
      hasAudioError: false,
      audioError: null,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: Date.now()
    }));
  };

  private getRecoveryInstructions(audioError: AudioError): string {
    switch (audioError.type) {
      case 'NETWORK_TIMEOUT':
        return 'Check your internet connection and try again.';
      case 'AUDIO_INIT_FAILED':
        return 'Tap the audio/play button to initialize audio on your device.';
      case 'TTS_SERVICE_ERROR':
        return 'The text-to-speech service is temporarily down. Try again in a few minutes.';
      case 'MOBILE_AUDIO_ERROR':
        return 'On mobile devices, audio requires user interaction. Tap the play button.';
      default:
        return 'Try refreshing the page or restarting your browser.';
    }
  }

  componentWillUnmount() {
    if (this.errorRecoveryTimeout) {
      clearTimeout(this.errorRecoveryTimeout);
    }
  }

  render() {
    if (this.state.hasAudioError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const { audioError } = this.state;
      if (!audioError) return null;

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-sm font-medium">Audio Error</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {audioError.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {this.getRecoveryInstructions(audioError)}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleManualRetry}
                  className="h-8 gap-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </Button>
                
                {audioError.type === 'MOBILE_AUDIO_ERROR' && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      // Trigger audio initialization
                      const audio = new Audio();
                      audio.play().catch(() => {});
                      this.handleManualRetry();
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                    Enable Audio
                  </Button>
                )}
              </div>
              
              {audioError.type === 'TTS_SERVICE_ERROR' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <VolumeX className="h-3 w-3" />
                  <span>You can continue reading without audio</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}