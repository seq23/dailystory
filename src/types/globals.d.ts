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
      charlotteHearWord: (options: { text: string; context: string }) => Promise<void>;
      stopAudio: () => void;
      stop: () => void;
    };
    __SimplifiedAudioEngine?: {
      playText: (text: string, contentHash: string) => Promise<void>;
      stopAudio: () => void;
      stop: () => void;
    };
    __IS_PREMIUM?: boolean;
    __showDiscountActivationToast?: (message: string) => void;
    SmartElevenLabsTTS?: any;
  }
  // For non-browser contexts
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Global {}
}

declare module 'pronouncing';

export {};
