import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Volume2, Wifi } from 'lucide-react';

/**
 * Component that listens for audio fallback events and shows user-friendly notifications
 */
export const AudioFallbackNotification = () => {
  const [lastNotification, setLastNotification] = useState<number>(0);

  useEffect(() => {
    const handleAudioFallback = (event: CustomEvent) => {
      const now = Date.now();
      
      // Debounce notifications to prevent spam (5 second minimum between notifications)
      if (now - lastNotification < 5000) {
        return;
      }
      
      setLastNotification(now);
      
      const message = event.detail?.message || 'Using device voice due to connection issues';
      
      toast({
        title: 'Audio Mode',
        description: (
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span>{message}</span>
          </div>
        ),
        duration: 3000,
      });
    };

    // Listen for fallback events
    window.addEventListener('audio:fallback', handleAudioFallback as EventListener);

    return () => {
      window.removeEventListener('audio:fallback', handleAudioFallback as EventListener);
    };
  }, [lastNotification]);

  return null; // This component doesn't render anything, just handles events
};