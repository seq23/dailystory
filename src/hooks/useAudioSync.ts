import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
// Removed: import { audioSyncService } from '@/services/audioSyncService';

interface AudioSyncOptions {
  contentHash?: string;
  text: string;
  currentPage: number;
}

/**
 * Hook for managing audio-content synchronization and hash coordination
 * Handles hash validation and content synchronization
 */
export const useAudioSync = ({ contentHash, text, currentPage }: AudioSyncOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Listen for hash changes and update audio service immediately
  useEffect(() => {
    const handleHashChange = () => {
      const currentUIHash = (window as any).__pageContentHash;
      if (currentUIHash && currentUIHash !== contentHash) {
        console.log(`🔄 Hash change detected: ${currentUIHash?.slice(0,10)} - notifying audio service`);
        // Notify audio service of hash change
        if (typeof audioSyncService.syncContentHash === 'function') {
          audioSyncService.syncContentHash(currentUIHash);
        }
      }
    };

    // Listen for content hash changes
    window.addEventListener('content:hash:changed', handleHashChange);
    
    return () => {
      window.removeEventListener('content:hash:changed', handleHashChange);
    };
  }, [contentHash]);

  /**
   * Wait for hash synchronization with exponential backoff and extended timeout
   */
  const waitForHashSync = async (expectedHash: string, initialUIHash: string): Promise<boolean> => {
    const MAX_WAIT_TIME = 30000; // 30 seconds timeout
    const startTime = Date.now();
    let attempt = 0;
    let delay = 100; // Start with 100ms
    
    console.log(`⏳ Starting hash sync wait: expected=${expectedHash?.slice(0,10)}, initial=${initialUIHash?.slice(0,10)}`);
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      // Check current hash
      const currentUIHash = (window as any).__pageContentHash;
      
      // If hashes now match, we're synchronized
      if (currentUIHash && currentUIHash === expectedHash) {
        console.log(`✅ Hash sync successful after ${Date.now() - startTime}ms and ${attempt} attempts`);
        return true;
      }
      
      // If UI hash changed to something else, update audio service
      if (currentUIHash && currentUIHash !== initialUIHash && currentUIHash !== expectedHash) {
        console.log(`🔄 UI hash changed during sync: ${currentUIHash?.slice(0,10)} - updating audio service`);
        // Force sync the audio service's hash
        if (typeof audioSyncService.syncContentHash === 'function') {
          audioSyncService.syncContentHash(currentUIHash);
        }
        return true; // Consider this a successful sync to new content
      }
      
      attempt++;
      console.log(`⏳ Hash sync attempt ${attempt}: current=${currentUIHash?.slice(0,10)}, waiting ${delay}ms...`);
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff: 100ms → 200ms → 500ms → 1s → 2s → 5s (max)
      delay = Math.min(5000, delay < 500 ? delay * 2 : delay + 1000);
    }
    
    console.error(`❌ Hash sync timeout after ${MAX_WAIT_TIME}ms`);
    return false;
  };

  /**
   * Validate hash synchronization before playback
   */
  const validateHashSync = async (): Promise<boolean> => {
    // Get current hashes
    const currentUIHash = (window as any).__pageContentHash;
    
    // If there's a hash mismatch, wait for proper synchronization
    if (contentHash && currentUIHash && currentUIHash !== contentHash) {
      console.log(`🔄 Hash mismatch detected: UI=${currentUIHash?.slice(0,10)}, Audio=${contentHash?.slice(0,10)} - waiting for sync...`);
      
      // Show sync progress to user
      toast({
        title: "Syncing content...",
        description: "Waiting for content synchronization. This may take a moment during story generation.",
        duration: 3000,
      });
      
      // Wait for hash synchronization with extended timeout
      const syncSuccess = await waitForHashSync(contentHash, currentUIHash);
      
      if (!syncSuccess) {
        console.error('❌ Hash sync timeout - unable to synchronize content');
        toast({
          title: "Sync timeout",
          description: "Content synchronization took too long. Please try again.",
          variant: "destructive",
          duration: 4000,
        });
        return false;
      }
      
      console.log('✅ Hash synchronization successful');
      toast({
        title: "Content synchronized",
        description: "Audio is now ready to play with synchronized content.",
        duration: 1500,
      });
    }

    return true;
  };

  return {
    validateHashSync
  };
};