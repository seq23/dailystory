declare global {
  interface Window {
    __LAST_STORY_SOURCE__?: 'ai' | 'fallback' | 'emergency' | 'unknown';
    __LAST_PAGE_SOURCE__?: 'ai' | 'fallback' | 'emergency' | 'unknown';
    __pageContentHash?: string;
    __audioHashLocked?: string;
    __audioSyncService?: {
      stopAudio: () => void;
    };
  }
  // For non-browser contexts
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Global {}
}

declare module 'pronouncing';

export {};
