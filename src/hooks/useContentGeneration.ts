/**
 * Hook for tracking content generation operations
 * Integrates with ContentGenerationDetector for performance optimization
 */

import { useEffect, useRef } from 'react';
import { trackContentGeneration } from '@/services/ContentGenerationDetector';

interface UseContentGenerationOptions {
  type: 'story' | 'image' | 'tts';
  enabled?: boolean;
}

export const useContentGeneration = ({ type, enabled = true }: UseContentGenerationOptions) => {
  const operationIdRef = useRef<string | null>(null);

  const startGeneration = (customId?: string) => {
    if (!enabled) return;
    
    const operationId = customId || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    operationIdRef.current = operationId;
    
    trackContentGeneration[type].start(operationId);
    return operationId;
  };

  const endGeneration = () => {
    if (!enabled || !operationIdRef.current) return;
    
    trackContentGeneration[type].end(operationIdRef.current);
    operationIdRef.current = null;
  };

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (operationIdRef.current) {
        trackContentGeneration[type].end(operationIdRef.current);
      }
    };
  }, [type]);

  return {
    startGeneration,
    endGeneration,
    isTracking: operationIdRef.current !== null,
    currentOperationId: operationIdRef.current
  };
};