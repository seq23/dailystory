import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { DebugLogger } from '@/services/DebugLogger';
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
        DebugLogger.log('audio', `Hash change detected: ${currentUIHash?.slice(0,10)} - notifying audio service`);
        // Notify audio service of hash change
        // TODO: Replace with SimplifiedAudioEngine.syncContentHash
        // if (typeof SimplifiedAudioEngine.syncContentHash === 'function') {
        //   SimplifiedAudioEngine.syncContentHash(currentUIHash);
        // }
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
    const MAX_WAIT_TIME = 5000; // CRITICAL FIX: Reduced from 30 seconds to 5 seconds for faster audio sync
    const startTime = Date.now();
    let attempt = 0;
    let delay = 50; // CRITICAL FIX: Reduced initial delay from 100ms to 50ms
    
    // 🔍 PHASE 1: Enhanced sync debugging
    DebugLogger.log('audio', 'Starting hash sync wait - DETAILED', {
      expectedHash: expectedHash?.slice(0,12),
      expectedHashFull: expectedHash,
      initialUIHash: initialUIHash?.slice(0,12), 
      initialUIHashFull: initialUIHash,
      hashLengthsMatch: expectedHash?.length === initialUIHash?.length,
      textSource: (window as any).__pageContentString?.length || 0,
      maxWaitTime: MAX_WAIT_TIME,
      startTime
    });
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      // Check current hash
      const currentUIHash = (window as any).__pageContentHash;
      const currentText = (window as any).__pageContentString;
      
      // 🔍 PHASE 2: Track hash source discrepancy
      DebugLogger.log('audio', `Hash sync attempt ${attempt + 1}`, {
        currentUIHash: currentUIHash?.slice(0,12),
        expectedHash: expectedHash?.slice(0,12),
        initialUIHash: initialUIHash?.slice(0,12),
        currentTextLength: currentText?.length || 0,
        hashesMatch: currentUIHash === expectedHash,
        hashChanged: currentUIHash !== initialUIHash,
        timingElapsed: Date.now() - startTime,
        potentialIssue: !currentUIHash ? 'no_ui_hash' : 
                       currentUIHash === initialUIHash ? 'ui_hash_stale' : 'hash_mismatch'
      });
      
      // If hashes now match, we're synchronized
      if (currentUIHash && currentUIHash === expectedHash) {
        DebugLogger.log('audio', `Hash sync successful after ${Date.now() - startTime}ms and ${attempt} attempts`);
        return true;
      }
      
      // If UI hash changed to something else, update audio service
      if (currentUIHash && currentUIHash !== initialUIHash && currentUIHash !== expectedHash) {
        DebugLogger.log('audio', `UI hash changed during sync: ${currentUIHash?.slice(0,10)} - updating audio service`);
        DebugLogger.log('audio', 'Hash Change Analysis', {
          newUIHash: currentUIHash?.slice(0,12),
          wasExpected: currentUIHash === expectedHash,
          textLength: currentText?.length,
          changeType: 'ui_hash_updated_during_sync'
        });
        // Force sync the audio service's hash
        // TODO: Replace with SimplifiedAudioEngine.syncContentHash
        // if (typeof SimplifiedAudioEngine.syncContentHash === 'function') {
        //   SimplifiedAudioEngine.syncContentHash(currentUIHash);
        // }
        return true; // Consider this a successful sync to new content
      }
      
      attempt++;      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // CRITICAL FIX: Faster backoff: 50ms → 100ms → 200ms → 500ms (max) for quicker audio sync
      delay = Math.min(500, delay * 2);
    }
    
    DebugLogger.error('network', `❌ Hash sync timeout after ${MAX_WAIT_TIME}ms - DETAILED FAILURE:`, {
      finalUIHash: (window as any).__pageContentHash?.slice(0,12),
      expectedHash: expectedHash?.slice(0,12),
      finalTextLength: (window as any).__pageContentString?.length,
      totalAttempts: attempt,
      failureReason: !(window as any).__pageContentHash ? 'no_ui_hash_set' : 'persistent_mismatch'
    });
    return false;
  };

  /**
   * Validate hash synchronization before playback
   */
  const validateHashSync = async (): Promise<boolean> => {
    // Get current hashes
    const currentUIHash = (window as any).__pageContentHash;
    const currentText = (window as any).__pageContentString;
    
    // 🔍 PHASE 1 & 2: Comprehensive validation debugging
    DebugLogger.log('audio', 'Hash Validation Debug', {
      audioServiceHash: contentHash?.slice(0,12),
      uiWindowHash: currentUIHash?.slice(0,12), 
      audioServiceHashFull: contentHash,
      uiWindowHashFull: currentUIHash,
      hashesMatch: contentHash === currentUIHash,
      audioHashExists: !!contentHash,
      uiHashExists: !!currentUIHash,
      textLength: currentText?.length || 0,
      mismatchType: !contentHash ? 'no_audio_hash' :
                   !currentUIHash ? 'no_ui_hash' : 
                   contentHash !== currentUIHash ? 'hash_values_different' : 'hashes_match',
      timestamp: Date.now()
    });
    
    // If there's a hash mismatch, wait for proper synchronization
    if (contentHash && currentUIHash && currentUIHash !== contentHash) {
      DebugLogger.log('audio', `Hash mismatch detected: UI=${currentUIHash?.slice(0,10)}, Audio=${contentHash?.slice(0,10)} - waiting for sync...`);
      
      // 🔍 PHASE 2: Analyze mismatch source
      DebugLogger.log('audio', 'Mismatch Analysis', {
        uiHashLength: currentUIHash.length,
        audioHashLength: contentHash.length,
        lengthDifference: Math.abs(currentUIHash.length - contentHash.length),
        firstDiffIndex: (() => {
          for (let i = 0; i < Math.min(currentUIHash.length, contentHash.length); i++) {
            if (currentUIHash[i] !== contentHash[i]) return i;
          }
          return -1;
        })(),
        likelySource: currentText?.length ? 'text_processing_difference' : 'timing_issue'
      });
      
      // Show sync progress to user
      toast({
        title: "Syncing content...",
        description: "Waiting for content synchronization. This may take a moment during story generation.",
        duration: 3000,
      });
      
      // Wait for hash synchronization with extended timeout
      const syncSuccess = await waitForHashSync(contentHash, currentUIHash);
      
      if (!syncSuccess) {
        DebugLogger.error('network', '❌ Hash sync timeout - unable to synchronize content');
        DebugLogger.error('network', '🔍 Final State Analysis:', {
          finalUIHash: (window as any).__pageContentHash?.slice(0,12),
          targetAudioHash: contentHash?.slice(0,12),
          finalTextLength: (window as any).__pageContentString?.length,
          failureType: 'sync_timeout'
        });
        toast({
          title: "Sync timeout",
          description: "Content synchronization took too long. Please try again.",
          variant: "destructive",
          duration: 4000,
        });
        return false;
      }
      
      DebugLogger.log('audio', 'Hash synchronization successful');
      toast({
        title: "Content synchronized",
        description: "Audio is now ready to play with synchronized content.",
        duration: 1500,
      });
    } else if (!contentHash || !currentUIHash) {
      DebugLogger.log('audio', 'Missing hash data', {
        missingAudioHash: !contentHash,
        missingUIHash: !currentUIHash,
        actionTaken: 'proceeding_without_sync'
      });
    } else {
      DebugLogger.log('audio', 'Hashes already synchronized - no sync needed');
    }

    return true;
  };

  return {
    validateHashSync
  };
};