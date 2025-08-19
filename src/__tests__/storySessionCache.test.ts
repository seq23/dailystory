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
    const id = StorySessionCache.cacheStorySession('u1', 'beginner' as DifficultyLevel, pages, images, 0, {}, undefined, undefined, 'boy');
    expect(id).toBeTruthy();

    const cached = StorySessionCache.getCachedStorySession('u1', 'boy');
    expect(cached).not.toBeNull();
    expect(cached!.metadata.wordCount).toBe(3);

    const analytics = StorySessionCache.getSessionAnalytics('u1', 'boy');
    expect(analytics.hasCachedSession).toBe(true);
    expect(analytics.progress).toBeCloseTo((0 + 1) / pages.length);
  });

  it('updatePages preserves existing images when not provided and updates wordCount', () => {
    StorySessionCache.cacheStorySession('u1', 'easy' as DifficultyLevel, ['Page one'], [{ prompt: 'p1' }], 0, {}, undefined, undefined, 'girl');
    StorySessionCache.updatePages('u1', ['New text here'], undefined, [], 'girl');
    const cached = StorySessionCache.getCachedStorySession('u1', 'girl')!;
    expect(cached.images.length).toBe(1);
    expect(cached.metadata.wordCount).toBe(3);
  });

  it('expires sessions after 24 hours', () => {
    StorySessionCache.cacheStorySession('u1', 'medium' as DifficultyLevel, ['A B'], [], 0, {}, undefined, undefined, 'neutral');
    // Advance just over 24h
    vi.setSystemTime(new Date('2025-01-02T00:00:01Z'));
    expect(StorySessionCache.getCachedStorySession('u1', 'neutral')).toBeNull();
  });

  it('marks session complete', () => {
    StorySessionCache.cacheStorySession('u1', 'hard' as DifficultyLevel, ['x'], [], 0, {}, undefined, undefined, 'boy');
    StorySessionCache.markSessionComplete('u1', 'boy');
    const cached = StorySessionCache.getCachedStorySession('u1', 'boy');
    expect(cached?.isComplete).toBe(true);
  });

  it('handles avatar-aware cache keys for guest users', () => {
    // Test all three avatar types for guest users
    StorySessionCache.cacheStorySession('guest', 'beginner' as DifficultyLevel, ['Girl story'], [], 0, {}, undefined, undefined, 'girl');
    StorySessionCache.cacheStorySession('guest', 'beginner' as DifficultyLevel, ['Boy story'], [], 0, {}, undefined, undefined, 'boy');
    StorySessionCache.cacheStorySession('guest', 'beginner' as DifficultyLevel, ['Neutral story'], [], 0, {}, undefined, undefined, 'neutral');

    // Each avatar type should have its own separate cache
    const girlSession = StorySessionCache.getCachedStorySession('guest', 'girl');
    const boySession = StorySessionCache.getCachedStorySession('guest', 'boy');
    const neutralSession = StorySessionCache.getCachedStorySession('guest', 'neutral');

    expect(girlSession?.pages[0]).toBe('Girl story');
    expect(boySession?.pages[0]).toBe('Boy story');
    expect(neutralSession?.pages[0]).toBe('Neutral story');

    // Clearing guest sessions should clear all avatar variants
    StorySessionCache.clearCachedSession('guest');
    expect(StorySessionCache.getCachedStorySession('guest', 'girl')).toBeNull();
    expect(StorySessionCache.getCachedStorySession('guest', 'boy')).toBeNull();
    expect(StorySessionCache.getCachedStorySession('guest', 'neutral')).toBeNull();
  });
});
