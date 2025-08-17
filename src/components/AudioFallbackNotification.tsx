import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Volume2 } from 'lucide-react';

export const AudioFallbackNotification: React.FC = () => {
  const [notification, setNotification] = useState<{
    message: string;
    canRetry: boolean;
    service: string;
  } | null>(null);

  useEffect(() => {
    const handleAudioError = (event: CustomEvent) => {
      const { message, canRetry, service } = event.detail;
      setNotification({ message, canRetry, service });
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    const handleAudioFallback = (event: CustomEvent) => {
      const { message } = event.detail;
      setNotification({ 
        message, 
        canRetry: false, 
        service: 'fallback'
      });
      
      // Auto-hide after 3 seconds for fallback messages
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    };

    window.addEventListener('audio:service:error', handleAudioError as EventListener);
    window.addEventListener('audio:fallback', handleAudioFallback as EventListener);

    return () => {
      window.removeEventListener('audio:service:error', handleAudioError as EventListener);
      window.removeEventListener('audio:fallback', handleAudioFallback as EventListener);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <div className="flex items-start gap-3">
          {notification.service === 'fallback' ? (
            <Volume2 className="h-4 w-4 text-orange-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription className="text-orange-800">
              {notification.message}
            </AlertDescription>
            {notification.canRetry && (
              <div className="mt-2">
                <button
                  onClick={() => setNotification(null)}
                  className="text-xs text-orange-700 hover:text-orange-900 underline"
                >
                  Retry with network
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-orange-600 hover:text-orange-800 ml-2"
          >
            ×
          </button>
        </div>
      </Alert>
    </div>
  );
};