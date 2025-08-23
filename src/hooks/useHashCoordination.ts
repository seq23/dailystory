import { useEffect, useRef } from 'react';
// Removed: import { audioSyncService } from '@/services/audioSyncService';

/**
 * Hook to coordinate hash synchronization between UI and audio systems
 * Ensures audio only plays when content is properly synchronized
 */
export const useHashCoordination = (contentHash?: string) => {
  const lastHashRef = useRef<string | undefined>();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storyStabilityRef = useRef<boolean>(false);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip if no content hash
    if (!contentHash) return;

    // Skip if hash hasn't changed
    if (lastHashRef.current === contentHash) return;

    const previousHash = lastHashRef.current;
    lastHashRef.current = contentHash;

    console.log(`🔄 Hash coordination: ${previousHash?.slice(0,10)} → ${contentHash?.slice(0,10)}`);

    // Clear any existing sync timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Mark story as unstable during content changes
    storyStabilityRef.current = false;
    
    // Clear existing stability timeout
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }

    // Debounce hash updates with faster sync for better coordination
    syncTimeoutRef.current = setTimeout(() => {
      // Update global hash reference
      (window as any).__pageContentHash = contentHash;

      // Emit coordinated hash change event
      window.dispatchEvent(new CustomEvent('hash:coordinated', {
        detail: {
          previousHash,
          newHash: contentHash,
          timestamp: Date.now(),
          isStable: false
        }
      }));

      console.log(`🔄 Hash coordination (unstable): ${contentHash?.slice(0,10)}`);
      
      // Set story as stable after additional delay to prevent image generation during rapid changes
      stabilityTimeoutRef.current = setTimeout(() => {
        storyStabilityRef.current = true;
        
        // Emit story stabilized event for image generation
        window.dispatchEvent(new CustomEvent('story:stabilized', {
          detail: {
            contentHash,
            timestamp: Date.now()
          }
        }));
        
        console.log(`✅ Story stabilized: ${contentHash?.slice(0,10)}`);
      }, 200); // Additional 200ms for content stability
      
    }, 100); // Reduced from 300ms to 100ms for faster sync

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, [contentHash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentHash: contentHash,
    isCoordinated: Boolean(contentHash && lastHashRef.current === contentHash),
    isStoryStable: storyStabilityRef.current
  };
};