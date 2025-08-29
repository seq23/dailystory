// Enhanced Story Content Buffer Hook - Prevents flickering with buffered updates
import { useState, useCallback, useRef, useEffect } from 'react';

interface StoryContentState {
  pages: string[];
  title: string;
  isStable: boolean;
  isLoading: boolean;
  loadingStage: 'generating' | 'processing' | 'finalizing' | 'complete';
  source: 'ai' | 'fallback' | 'unknown' | null;
}

interface BufferedUpdate {
  pages?: string[];
  title?: string;
  source?: 'ai' | 'fallback' | 'unknown' | null;
  markStable?: boolean;
}

interface UseStoryContentBufferOptions {
  stabilityDebounceMs?: number;
  loadingDebounceMs?: number;
}

export function useStoryContentBuffer(options: UseStoryContentBufferOptions = {}) {
  const {
    stabilityDebounceMs = 800, // Debounce stability changes
    loadingDebounceMs = 150    // Debounce loading state changes
  } = options;

  const [contentState, setContentState] = useState<StoryContentState>({
    pages: [],
    title: '',
    isStable: false,
    isLoading: true,
    loadingStage: 'generating',
    source: null
  });

  const [bufferedContent, setBufferedContent] = useState<{
    pages: string[];
    title: string;
    source: 'ai' | 'fallback' | 'unknown' | null;
  } | null>(null);

  const stabilityTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const updateSequenceRef = useRef(0);

  // Progressive loading messages
  const loadingMessages = {
    generating: 'Generating your story...',
    processing: 'Processing content...',
    finalizing: 'Finalizing story...',
    complete: 'Story ready!'
  };

  // Debounced stability setter
  const setStabilityDebounced = useCallback((stable: boolean, delay?: number) => {
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }

    const timeoutMs = delay ?? stabilityDebounceMs;
    
    stabilityTimeoutRef.current = setTimeout(() => {
      console.log(`📚 Story stability: ${stable ? 'STABLE' : 'UNSTABLE'} (debounced ${timeoutMs}ms)`);
      setContentState(prev => ({
        ...prev,
        isStable: stable
      }));
    }, timeoutMs);
  }, [stabilityDebounceMs]);

  // Debounced loading setter
  const setLoadingDebounced = useCallback((loading: boolean, stage: StoryContentState['loadingStage'] = 'generating') => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      console.log(`📚 Loading state: ${loading ? stage.toUpperCase() : 'COMPLETE'}`);
      setContentState(prev => ({
        ...prev,
        isLoading: loading,
        loadingStage: stage
      }));
    }, loadingDebounceMs);
  }, [loadingDebounceMs]);

  // Buffer content update - doesn't render until committed
  const bufferContentUpdate = useCallback((update: BufferedUpdate) => {
    const sequenceId = ++updateSequenceRef.current;
    console.log(`📚 [BUFFER ${sequenceId}] Buffering content update:`, {
      pagesCount: update.pages?.length,
      title: update.title,
      source: update.source,
      markStable: update.markStable
    });

    if (update.pages || update.title || update.source) {
      setBufferedContent(prev => ({
        pages: update.pages || prev?.pages || [],
        title: update.title || prev?.title || '',
        source: update.source || prev?.source || null
      }));
    }

    if (update.markStable) {
      setStabilityDebounced(false); // Mark unstable first
      setLoadingDebounced(true, 'processing');
    }
  }, [setStabilityDebounced, setLoadingDebounced]);

  // Commit buffered content - renders the story
  const commitBufferedContent = useCallback(() => {
    if (!bufferedContent) {
      console.warn('📚 [BUFFER] No buffered content to commit');
      return;
    }

    const sequenceId = ++updateSequenceRef.current;
    console.log(`📚 [COMMIT ${sequenceId}] Committing buffered content:`, {
      pagesCount: bufferedContent.pages.length,
      title: bufferedContent.title,
      source: bufferedContent.source
    });

    // Batch all state updates in single render cycle
    setContentState(prev => ({
      ...prev,
      pages: bufferedContent.pages,
      title: bufferedContent.title,
      source: bufferedContent.source,
      loadingStage: 'finalizing'
    }));

    // Clear buffer
    setBufferedContent(null);

    // Mark as stable after brief delay
    setStabilityDebounced(true, 200);
    setLoadingDebounced(false, 'complete');
  }, [bufferedContent, setStabilityDebounced, setLoadingDebounced]);

  // Add single page without full commit (for live generation)
  const appendPage = useCallback((page: string) => {
    const sequenceId = ++updateSequenceRef.current;
    console.log(`📚 [APPEND ${sequenceId}] Adding page:`, page.substring(0, 50) + '...');
    
    setContentState(prev => ({
      ...prev,
      pages: [...prev.pages, page]
    }));

    // Brief instability during append
    setStabilityDebounced(false, 100);
    setTimeout(() => setStabilityDebounced(true, 100), 200);
  }, [setStabilityDebounced]);

  // Force stability (for external events like navigation)
  const forceStability = useCallback((stable: boolean, immediate = false) => {
    if (immediate) {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
      setContentState(prev => ({ ...prev, isStable: stable }));
    } else {
      setStabilityDebounced(stable, 100);
    }
  }, [setStabilityDebounced]);

  // Reset to initial state
  const resetContent = useCallback(() => {
    console.log('📚 [RESET] Resetting story content buffer');
    
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setContentState({
      pages: [],
      title: '',
      isStable: false,
      isLoading: true,
      loadingStage: 'generating',
      source: null
    });
    setBufferedContent(null);
    updateSequenceRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Current state
    story: contentState.pages,
    storyTitle: contentState.title,
    isStoryStable: contentState.isStable,
    isLoading: contentState.isLoading,
    loadingStage: contentState.loadingStage,
    loadingMessage: loadingMessages[contentState.loadingStage],
    storySource: contentState.source,
    
    // Buffer management
    hasBufferedContent: bufferedContent !== null,
    bufferContentUpdate,
    commitBufferedContent,
    
    // Direct updates (for live generation)
    appendPage,
    
    // State control
    forceStability,
    resetContent,
    
    // Loading control
    setLoadingStage: (stage: StoryContentState['loadingStage']) => {
      setLoadingDebounced(true, stage);
    },
    finishLoading: () => {
      setLoadingDebounced(false, 'complete');
    }
  };
}