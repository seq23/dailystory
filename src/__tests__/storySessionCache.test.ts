import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorySessionCache } from '@/services/storySessionCache';
import type { DifficultyLevel } from '@/types';

describe('StorySessionCache', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('caches and retrieves a session with correct metadata and analytics', () => {
    const pages = ['Hello world', 'End'];
    const images = [{ prompt: 'a cat' }, { prompt: 'a dog' }];
    const id = StorySessionCache.cacheStorySession('u1', 'beginner' as DifficultyLevel, pages, images);
    expect(id).toBeTruthy();

    const cached = StorySessionCache.getCachedStorySession('u1');
    expect(cached).not.toBeNull();
    expect(cached!.metadata.wordCount).toBe(3);

    const analytics = StorySessionCache.getSessionAnalytics('u1');
    expect(analytics.hasCachedSession).toBe(true);
    expect(analytics.progress).toBeCloseTo((0 + 1) / pages.length);
  });

  it('updatePages preserves existing images when not provided and updates wordCount', () => {
    StorySessionCache.cacheStorySession('u1', 'easy' as DifficultyLevel, ['Page one'], [{ prompt: 'p1' }]);
    StorySessionCache.updatePages('u1', ['New text here']);
    const cached = StorySessionCache.getCachedStorySession('u1')!;
    expect(cached.images.length).toBe(1);
    expect(cached.metadata.wordCount).toBe(3);
  });

  it('expires sessions after 24 hours', () => {
    StorySessionCache.cacheStorySession('u1', 'medium' as DifficultyLevel, ['A B'], []);
    // Advance just over 24h
    vi.setSystemTime(new Date('2025-01-02T00:00:01Z'));
    expect(StorySessionCache.getCachedStorySession('u1')).toBeNull();
  });

  it('marks session complete', () => {
    StorySessionCache.cacheStorySession('u1', 'hard' as DifficultyLevel, ['x'], []);
    StorySessionCache.markSessionComplete('u1');
    const cached = StorySessionCache.getCachedStorySession('u1');
    expect(cached?.isComplete).toBe(true);
  });
});
