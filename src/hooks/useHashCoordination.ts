import { useEffect, useRef } from 'react';
// Removed: import { audioSyncService } from '@/services/audioSyncService';

/**
 * Hook to coordinate hash synchronization between UI and audio systems
 * Ensures audio only plays when content is properly synchronized
 */
export const useHashCoordination = (contentHash?: string) => {
  const lastHashRef = useRef<string | undefined>();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Debounce hash updates to avoid rapid changes during content generation
    syncTimeoutRef.current = setTimeout(() => {
      // Sync audio service with new hash
      // TODO: Replace with SimplifiedAudioEngine
      // if (typeof SimplifiedAudioEngine.syncContentHash === 'function') {
      //   SimplifiedAudioEngine.syncContentHash(contentHash);
      // }

      // Update global hash reference
      (window as any).__pageContentHash = contentHash;

      // Emit coordinated hash change event
      window.dispatchEvent(new CustomEvent('hash:coordinated', {
        detail: {
          previousHash,
          newHash: contentHash,
          timestamp: Date.now()
        }
      }));

      console.log(`✅ Hash coordination complete: ${contentHash?.slice(0,10)}`);
    }, 300); // 300ms debounce to handle rapid content changes

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [contentHash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentHash: contentHash,
    isCoordinated: Boolean(contentHash && lastHashRef.current === contentHash)
  };
};