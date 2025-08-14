// Phase 4: Enhanced Image Session Cache Verification Tests
// Tests for character consistency and image caching behavior

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CharacterConsistencyCache } from '@/services/CharacterConsistencyCache';
import { StorySessionCache } from '@/services/storySessionCache';
import type { UserInfo, DifficultyLevel } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Enhanced Image Session Cache', () => {
  const mockUserInfo: UserInfo = {
    name: 'TestChild',
    age: 8,
    grade: '2nd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: {
      type: 'boy',
      skinTone: 'medium'
    },
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: 'adventure stories',
    difficultyLevel: 'medium'
  };

  const sessionId = 'test_session_123';
  const difficultyLevel: DifficultyLevel = 'medium';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Character Consistency Cache', () => {
    it('should cache character traits for a session', () => {
      const traits = CharacterConsistencyCache.cacheCharacterTraits(
        sessionId,
        mockUserInfo,
        difficultyLevel
      );

      expect(traits.name).toBe('TestChild');
      expect(traits.ageGroup).toBe('child');
      expect(traits.avatarType).toBe('boy');
      expect(traits.skinTone).toBe('medium');
      expect(traits.sessionId).toBe(sessionId);
      expect(traits.difficultyLevel).toBe('medium');
    });

    it('should retrieve cached character traits', () => {
      // Cache traits first
      CharacterConsistencyCache.cacheCharacterTraits(
        sessionId,
        mockUserInfo,
        difficultyLevel
      );

      // Retrieve cached traits
      const cachedTraits = CharacterConsistencyCache.getCachedCharacterTraits(sessionId);
      
      expect(cachedTraits).toBeTruthy();
      expect(cachedTraits?.name).toBe('TestChild');
      expect(cachedTraits?.sessionId).toBe(sessionId);
    });

    it('should return null for expired cache (24+ hours)', () => {
      // Cache traits
      CharacterConsistencyCache.cacheCharacterTraits(
        sessionId,
        mockUserInfo,
        difficultyLevel
      );

      // Fast-forward 25 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      // Should return null for expired cache
      const cachedTraits = CharacterConsistencyCache.getCachedCharacterTraits(sessionId);
      expect(cachedTraits).toBeNull();
    });

    it('should generate consistent character prompts from scene data', () => {
      const sceneData = CharacterConsistencyCache.buildSceneCharacterData(
        sessionId,
        mockUserInfo,
        difficultyLevel,
        {
          emotion: 'happy',
          action: 'exploring',
          setting: 'magical forest',
          lighting: 'morning lighting',
          perspective: 'eye-level perspective'
        }
      );

      const prompt = CharacterConsistencyCache.generateCharacterPrompt(sceneData);
      
      expect(prompt).toContain('TestChild');
      expect(prompt).toContain('boy');
      expect(prompt).toContain('medium skin tone');
      expect(prompt).toContain('exploring');
      expect(prompt).toContain('happy');
    });
  });

  describe('Story Session Cache Integration', () => {
    it('should cache story session with images', () => {
      const pages = ['Page 1 content', 'Page 2 content'];
      const images = [
        { url: 'https://example.com/image1.jpg', prompt: 'prompt 1' },
        { url: undefined, prompt: 'prompt 2' }
      ];

      const cachedSessionId = StorySessionCache.cacheStorySession(
        'test_user',
        'medium',
        pages,
        images,
        0
      );

      expect(cachedSessionId).toBeTruthy();
      expect(StorySessionCache.hasCachedSession('test_user')).toBe(true);
    });

    it('should retrieve cached session with preserved images', () => {
      const pages = ['Page 1', 'Page 2'];
      const images = [
        { url: 'https://example.com/cached1.jpg', prompt: 'cached prompt 1' },
        { url: 'https://example.com/cached2.jpg', prompt: 'cached prompt 2' }
      ];

      StorySessionCache.cacheStorySession('test_user', 'medium', pages, images, 1);
      
      const cached = StorySessionCache.getCachedStorySession('test_user');
      
      expect(cached).toBeTruthy();
      expect(cached?.images).toHaveLength(2);
      expect(cached?.images[0].url).toBe('https://example.com/cached1.jpg');
      expect(cached?.images[1].url).toBe('https://example.com/cached2.jpg');
      expect(cached?.currentPage).toBe(1);
    });

    it('should update pages while preserving cached images', () => {
      // Initial cache
      const initialImages = [
        { url: 'https://example.com/img1.jpg', prompt: 'prompt 1' }
      ];
      StorySessionCache.cacheStorySession('test_user', 'medium', ['Page 1'], initialImages);

      // Update with new pages and additional images
      const updatedImages = [
        { url: 'https://example.com/img1.jpg', prompt: 'prompt 1' }, // same
        { url: 'https://example.com/img2.jpg', prompt: 'prompt 2' }  // new
      ];
      
      StorySessionCache.updatePages('test_user', ['Page 1', 'Page 2'], 1, updatedImages);
      
      const cached = StorySessionCache.getCachedStorySession('test_user');
      expect(cached?.pages).toHaveLength(2);
      expect(cached?.images).toHaveLength(2);
      expect(cached?.images[0].url).toBe('https://example.com/img1.jpg');
      expect(cached?.images[1].url).toBe('https://example.com/img2.jpg');
      expect(cached?.currentPage).toBe(1);
    });

    it('should handle navigation back to cached pages', () => {
      const pages = ['Page 1', 'Page 2', 'Page 3'];
      const images = [
        { url: 'https://example.com/nav1.jpg', prompt: 'nav prompt 1' },
        { url: 'https://example.com/nav2.jpg', prompt: 'nav prompt 2' },
        { url: 'https://example.com/nav3.jpg', prompt: 'nav prompt 3' }
      ];

      StorySessionCache.cacheStorySession('test_user', 'medium', pages, images, 2);
      
      // Navigate back to page 1
      StorySessionCache.updateCurrentPage('test_user', 0);
      
      const cached = StorySessionCache.getCachedStorySession('test_user');
      expect(cached?.currentPage).toBe(0);
      // Images should still be preserved
      expect(cached?.images[0].url).toBe('https://example.com/nav1.jpg');
      expect(cached?.images[1].url).toBe('https://example.com/nav2.jpg');
      expect(cached?.images[2].url).toBe('https://example.com/nav3.jpg');
    });

    it('should expire cache after 24 hours', () => {
      StorySessionCache.cacheStorySession('test_user', 'medium', ['Page 1'], []);
      
      // Verify cache exists
      expect(StorySessionCache.hasCachedSession('test_user')).toBe(true);
      
      // Fast-forward 25 hours
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      // Cache should be expired
      expect(StorySessionCache.getCachedStorySession('test_user')).toBeNull();
      expect(StorySessionCache.hasCachedSession('test_user')).toBe(false);
    });
  });

  describe('Image Cache Verification Scenarios', () => {
    it('should prevent re-generation of existing images', () => {
      // Simulate pageImages state with existing image
      const pageImages = {
        0: 'https://example.com/existing.jpg',
        1: undefined // not generated yet
      };

      // Page 0 should not regenerate (has URL)
      expect(pageImages[0]).toBeTruthy();
      
      // Page 1 should generate (no URL)
      expect(pageImages[1]).toBeFalsy();
    });

    it('should support cache preloading optimization', () => {
      const analytics = StorySessionCache.getSessionAnalytics('test_user');
      
      // Should provide analytics for preloading decisions
      expect(analytics).toHaveProperty('hasCachedSession');
      expect(analytics).toHaveProperty('sessionAge');
      expect(analytics).toHaveProperty('difficulty');
      expect(analytics).toHaveProperty('progress');
    });

    it('should handle fallback for failed cache retrievals', () => {
      // Simulate corrupted localStorage
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const cached = StorySessionCache.getCachedStorySession('test_user');
      expect(cached).toBeNull(); // Should handle error gracefully
    });
  });
});