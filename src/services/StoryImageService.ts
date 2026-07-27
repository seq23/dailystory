/**
 * StoryImageService — the ONLY client entry point for story illustrations.
 *
 * Replaces SimpleImageService (2,185 LOC) and its tier cascade with:
 *   cache -> in-flight dedupe -> one edge function call -> static fallback
 *
 * Identical behaviour for guest and premium users.
 *
 * Caching guarantees the product rules:
 *   - navigating BACK always shows the same image (memory + sessionStorage)
 *   - "Next Story" / new session / end of session clears the cache
 */

import { supabase } from '@/integrations/supabase/client';
import { ImageFallbackService } from '@/services/ImageFallbackService';

export interface StoryImageResult {
  success: boolean;
  url: string;
  scene?: string;
  isFallback: boolean;
  error?: string;
}

interface CacheEntry {
  url: string;
  scene?: string;
  /** true when this is the static placeholder, not a real illustration */
  isFallback?: boolean;
  /** epoch ms the placeholder was stored — used for the retry cooldown */
  at?: number;
}

const STORAGE_PREFIX = 't2r:img:';
/** How long a failed page keeps showing the placeholder before we retry. */
const FALLBACK_RETRY_MS = 45_000;

export class StoryImageService {
  /** page-keyed cache for the active session */
  private static memoryCache = new Map<string, CacheEntry>();
  /** de-dupes concurrent requests for the same page */
  private static inFlight = new Map<string, Promise<StoryImageResult>>();

  private static key(sessionId: string, pageNumber: number): string {
    return `${sessionId}::${pageNumber}`;
  }

  // -------------------------------------------------------------------------
  // Cache
  // -------------------------------------------------------------------------

  private static readCache(key: string): CacheEntry | null {
    const hit = this.memoryCache.get(key);
    if (hit) return this.freshEnough(hit) ? hit : null;

    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry;
      if (!parsed?.url) return null;
      if (!this.freshEnough(parsed)) return null;
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Real illustrations are cached forever (back-navigation must be stable).
   * Placeholders expire, so one bad minute doesn't poison the page for the
   * whole session — the next visit to that page tries again.
   */
  private static freshEnough(entry: CacheEntry): boolean {
    if (!entry.isFallback) return true;
    return Date.now() - (entry.at ?? 0) < FALLBACK_RETRY_MS;
  }

  private static writeCache(key: string, entry: CacheEntry): void {
    this.memoryCache.set(key, entry);
    // Placeholders stay in memory only — never persisted across a reload.
    if (entry.isFallback) return;
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      /* quota — memory cache still serves back-navigation this session */
    }
  }

  /** Called on "Next Story", story rewrite, and end of session. */
  static clearSession(sessionId?: string): void {
    if (!sessionId) {
      this.memoryCache.clear();
      this.inFlight.clear();
    } else {
      for (const key of [...this.memoryCache.keys()]) {
        if (key.startsWith(`${sessionId}::`)) this.memoryCache.delete(key);
      }
      for (const key of [...this.inFlight.keys()]) {
        if (key.startsWith(`${sessionId}::`)) this.inFlight.delete(key);
      }
    }

    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const storageKey = sessionStorage.key(i);
        if (!storageKey?.startsWith(STORAGE_PREFIX)) continue;
        if (sessionId && !storageKey.startsWith(`${STORAGE_PREFIX}${sessionId}::`)) continue;
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Real images produced for a session — used when saving a story.
   * Placeholders are excluded: a saved library story must never persist the
   * "images not working" artwork.
   */
  static getSessionImages(sessionId: string): Record<number, string> {
    const out: Record<number, string> = {};
    const take = (key: string, entry: CacheEntry) => {
      if (entry.isFallback || !entry.url) return;
      const pageNumber = Number(key.split('::')[1]);
      if (Number.isFinite(pageNumber)) out[pageNumber] = entry.url;
    };

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!key.startsWith(`${sessionId}::`)) continue;
      take(key, entry);
    }

    // Survive a page reload: sessionStorage holds the same real images.
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const storageKey = sessionStorage.key(i);
        if (!storageKey?.startsWith(`${STORAGE_PREFIX}${sessionId}::`)) continue;
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) continue;
        take(storageKey.slice(STORAGE_PREFIX.length), JSON.parse(raw) as CacheEntry);
      }
    } catch {
      /* ignore */
    }

    return out;
  }

  // -------------------------------------------------------------------------
  // Generation
  // -------------------------------------------------------------------------

  /**
   * Get the illustration for one story page.
   * Never throws and never returns an empty url — a static fallback image is
   * returned when generation fails, so a child never sees a broken page.
   */
  static async generateStoryImage(
    pageText: string,
    userInfo: Record<string, unknown>,
    sessionId: string,
    pageNumber: number,
  ): Promise<StoryImageResult> {
    const key = this.key(sessionId, pageNumber);

    const cached = this.readCache(key);
    if (cached) {
      return {
        success: true,
        url: cached.url,
        scene: cached.scene,
        isFallback: Boolean(cached.isFallback),
      };
    }

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const request = this.requestImage(pageText, userInfo, sessionId, pageNumber, key)
      .finally(() => this.inFlight.delete(key));

    this.inFlight.set(key, request);
    return request;
  }

  private static async requestImage(
    pageText: string,
    userInfo: Record<string, unknown>,
    sessionId: string,
    pageNumber: number,
    key: string,
  ): Promise<StoryImageResult> {
    // The previous page's scene gives the illustrator continuity.
    const previousScene = this.readCache(this.key(sessionId, pageNumber - 1))?.scene;

    try {
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText,
          sessionId,
          pageNumber,
          previousScene,
          userInfo: {
            name: userInfo?.name,
            age: userInfo?.age,
            grade: userInfo?.grade,
            nativeLanguage: userInfo?.nativeLanguage,
            avatar: userInfo?.avatar,
            favoriteColor: userInfo?.favoriteColor,
            favoriteAnimal: userInfo?.favoriteAnimal,
          },
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success && data?.imageURL) {
        const entry: CacheEntry = { url: data.imageURL, scene: data.scene };
        this.writeCache(key, entry);
        return { success: true, url: data.imageURL, scene: data.scene, isFallback: false };
      }

      return this.fallback(key, pageNumber, data?.error ?? 'Image generation unavailable');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image generation failed';
      return this.fallback(key, pageNumber, message);
    }
  }

  /**
   * Final safety net: the static "images not working" illustrations.
   * Cached too, so back-navigation stays visually stable.
   */
  private static fallback(key: string, pageNumber: number, error: string): StoryImageResult {
    console.warn(`[StoryImageService] page ${pageNumber} fallback:`, error);
    const url = ImageFallbackService.generateStoryPlaceholder('', pageNumber);
    this.writeCache(key, { url, isFallback: true, at: Date.now() });
    return { success: true, url, isFallback: true, error };
  }

  static isFallbackImage(url: string): boolean {
    return ImageFallbackService.isFallbackImage(url);
  }
}

export default StoryImageService;