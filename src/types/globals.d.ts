declare global {
  interface Window {
    __LAST_STORY_SOURCE__?: 'ai' | 'fallback' | 'emergency' | 'unknown';
    __LAST_PAGE_SOURCE__?: 'ai' | 'fallback' | 'emergency' | 'unknown';
    __pageContentHash?: string;
    __audioHashLocked?: string;
    __audioSyncService?: {
      stopAudio: () => void;
    };
    __CharlotteVoiceService?: {
      charlotteInteractiveAudio: (options: { text: string; context: string }) => Promise<void>;
      charlotteHearWord: (word: string) => Promise<void>;
      stopAudio: () => void;
      stop: () => void;
      playTextWithSynchronization: (options: { text: string; contentHash?: string; onWordHighlight?: (wordIndex: number) => void }) => Promise<void>;
      getStatus: () => { isPlaying: boolean; currentWordIndex: number; totalWords: number; contentHash: string };
      isPlaying: () => boolean;
    };
    __IS_PREMIUM?: boolean;
    __endingPageCount__?: number;
    __firstEndingPageIndex__?: number;
    __pageContentHash?: string;
    __pageContentString?: string;
    __storyTitle?: string;
    __userName?: string;
    __hoveredWord?: string;
    __lastSelectedWord?: string;
    currentStoryPage?: number;
    pageContent?: string;
    storyImages?: Record<number, string>;
    storyState?: {
      story: any;
      currentPage: number;
      pageImages: Record<number, string>;
    };
    __showDiscountActivationToast?: (message: string) => void;
    SmartElevenLabsTTS?: any;
  }
  // For non-browser contexts
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Global {}
}

declare module 'pronouncing';

export {};
