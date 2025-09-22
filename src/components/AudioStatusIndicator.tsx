import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Volume2, Wifi, WifiOff } from 'lucide-react';
import { ManagedTimers } from '@/utils/TimerManager';

interface AudioStatusIndicatorProps {
  className?: string;
}

/**
 * Component that shows the current audio status without toast notifications
 */
export const AudioStatusIndicator: React.FC<AudioStatusIndicatorProps> = ({ className }) => {
  const [status, setStatus] = useState<'ready' | 'fallback' | 'offline'>('ready');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleAudioFallback = (event: CustomEvent) => {
      setStatus('fallback');
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      ManagedTimers.setTimeout(() => setIsVisible(false), 5000, 'AudioStatusIndicator');
    };

    const handleAudioReady = () => {
      setStatus('ready');
      setIsVisible(false);
    };

    const handleOnline = () => {
      setStatus('ready');
      setIsVisible(false);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
    };

    window.addEventListener('audio:fallback', handleAudioFallback as EventListener);
    window.addEventListener('audio:ready', handleAudioReady as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('audio:fallback', handleAudioFallback as EventListener);
      window.removeEventListener('audio:ready', handleAudioReady as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'fallback':
        return {
          text: 'Using browser speech',
          icon: Volume2,
          variant: 'secondary' as const,
          className: 'bg-warning/10 text-warning border-warning/20'
        };
      case 'offline':
        return {
          text: 'Offline mode',
          icon: WifiOff,
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: 'Audio ready',
          icon: Wifi,
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`fixed bottom-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-2 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};