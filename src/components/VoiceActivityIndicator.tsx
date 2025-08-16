import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VoiceActivityIndicatorProps {
  className?: string;
}

export const VoiceActivityIndicator: React.FC<VoiceActivityIndicatorProps> = ({ className }) => {
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    const handleVoiceLevel = (event: any) => {
      setLevel(event.detail.level);
    };

    const handleVoiceStatus = (event: any) => {
      setStatus(event.detail.status);
    };

    window.addEventListener('voice:level', handleVoiceLevel);
    window.addEventListener('voice:status', handleVoiceStatus);

    return () => {
      window.removeEventListener('voice:level', handleVoiceLevel);
      window.removeEventListener('voice:status', handleVoiceStatus);
    };
  }, []);

  if (status !== 'listening') {
    return null;
  }

  // Create visual bars based on voice level
  const bars = Array.from({ length: 5 }, (_, i) => {
    const barLevel = (i + 1) / 5;
    const isActive = level > barLevel;
    
    return (
      <div
        key={i}
        className={cn(
          "w-1 bg-primary transition-all duration-75",
          isActive ? "h-6 opacity-100" : "h-2 opacity-30"
        )}
      />
    );
  });

  return (
    <div className={cn("flex items-end gap-1 h-6", className)}>
      {bars}
    </div>
  );
};