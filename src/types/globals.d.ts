declare global {
  interface Window {
    __LAST_STORY_SOURCE__?: 'ai' | 'fallback' | 'unknown';
    __LAST_PAGE_SOURCE__?: 'ai' | 'fallback' | 'unknown';
  }
  // For non-browser contexts
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Global {}
}

export {};
