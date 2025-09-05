// Non-Blocking Resource Loader with Timeout Handling
// Implements fail-soft loading with embedded fallbacks

import { withTimeout, TIMEOUT_CONFIGS } from '@/utils/networkTimeout';
import { THEMES_FALLBACK, NEUTRAL_VOICE, getRenderProfile } from './EmbeddedDefaults';

export interface ResourceLoadResult {
  codebook?: any;
  voices?: any[];
  themes?: any[];
  loadedFrom: 'cache' | 'cdn' | 'embedded';
}

export class ResourceLoader {
  private static cache = new Map<string, any>();

  /**
   * Load resources with fail-soft behavior
   */
  static async loadResources(
    level: string,
    options?: { timeout?: number }
  ): Promise<ResourceLoadResult> {
    const { timeout = 50 } = options || {};
    const result: ResourceLoadResult = { loadedFrom: 'embedded' };

    console.log(`🔄 Loading resources for level: ${level} (timeout: ${timeout}ms)`);

    try {
      // Try cache first (fast)
      const cacheKey = `resources_${level}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
        console.log('✅ Resources loaded from cache');
        return { ...cached.data, loadedFrom: 'cache' };
      }

      // Try to load with timeout - but don't block if it fails
      const loadPromise = this.loadFromCDN(level);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );

      try {
        const cdnData = await Promise.race([loadPromise, timeoutPromise]);
        if (cdnData) {
          // Cache successful load
          this.cache.set(cacheKey, { data: cdnData, timestamp: Date.now() });
          console.log('✅ Resources loaded from CDN');
          return { ...cdnData, loadedFrom: 'cdn' };
        }
      } catch (error) {
        console.warn('⚠️ CDN load failed, using embedded defaults:', error);
      }

      // Fire-and-forget background refresh (don't await)
      this.refreshCacheBackground(level);

    } catch (error) {
      console.warn('⚠️ Resource loading failed, using embedded defaults:', error);
    }

    // Return embedded fallbacks
    console.log('📦 Using embedded defaults');
    return {
      codebook: null, // Will use inline generation
      voices: [NEUTRAL_VOICE],
      themes: Array.from(THEMES_FALLBACK).map(theme => ({ id: theme, metadata: {} })),
      loadedFrom: 'embedded'
    };
  }

  /**
   * Attempt CDN loading - Now integrates with Voice Catalog JSON files
   */
  private static async loadFromCDN(level: string): Promise<Partial<ResourceLoadResult> | null> {
    try {
      // Try to load from the new JSON voice catalog structure
      const { VoiceCatalogService } = await import('../voiceCatalog/VoiceCatalogService');
      
      // Map level to difficulty
      const levelToDialifficulty: { [key: string]: any } = {
        'beginner': 'beginner',
        'easy': 'easy', 
        'medium': 'medium',
        'hard': 'hard',
        'expert': 'expert'
      };
      
      const difficulty = levelToDialifficulty[level.toLowerCase()] || 'medium';
      const voices = await VoiceCatalogService.getVoicesForLevel(difficulty);
      
      if (voices && voices.length > 0) {
        console.log(`✅ Loaded ${voices.length} voices from Voice Catalog for ${level}`);
        return {
          voices: voices,
          themes: Array.from(THEMES_FALLBACK).map(theme => ({ id: theme, metadata: {} })),
          codebook: null // Will use inline generation
        };
      }
    } catch (error) {
      console.warn('⚠️ Voice Catalog integration failed, falling back to embedded defaults:', error);
    }
    
    return null;
  }

  /**
   * Background cache refresh (fire-and-forget)
   */
  private static async refreshCacheBackground(level: string): Promise<void> {
    try {
      setTimeout(async () => {
        const cdnData = await withTimeout(
          () => this.loadFromCDN(level),
          TIMEOUT_CONFIGS.API_CALL
        );
        
        if (cdnData) {
          const cacheKey = `resources_${level}`;
          this.cache.set(cacheKey, { data: cdnData, timestamp: Date.now() });
          console.log('🔄 Background cache refresh completed');
        }
      }, 100); // Small delay to not impact current request
    } catch (error) {
      console.warn('⚠️ Background refresh failed:', error);
    }
  }

  /**
   * Get safe theme with fallback matching
   */
  static getSafeTheme(themeIntent: any): string {
    if (!themeIntent || !themeIntent.theme || themeIntent.theme.length === 0) {
      return 'friendship';
    }

    // Simple keyword matching
    const requestedThemes = themeIntent.theme;
    const availableThemes = Array.from(THEMES_FALLBACK);
    
    for (const requested of requestedThemes) {
      const normalized = requested.toLowerCase().replace(/[^a-z]/g, '');
      const match = availableThemes.find(theme => 
        theme.includes(normalized) || normalized.includes(theme.replace('_', ''))
      );
      if (match) return match;
    }
    
    return 'friendship';
  }

  /**
   * Build CTRL line for AI generation
   */
  static buildControlLine(userInfo: any, themeIntent: any, voiceResult: any, level: string): string {
    const profile = getRenderProfile(level);
    const voice = voiceResult?.selectedVoice || NEUTRAL_VOICE;
    const theme = this.getSafeTheme(themeIntent);

    // Build minimal, valid control structure
    const ctrlData = {
      vf: {
        id: voice.id || 'neutral_v0',
        cad: voice.vf?.cad || profile.avg_wps[0],
        var: voice.vf?.var || 3,
        fig: Math.min(voice.vf?.fig || 0.45, profile.fig),
        hum: voice.vf?.hum || 0.5,
        warm: voice.vf?.warm || 0.85,
        nar: voice.vf?.nar || 'storybook'
      },
      iu: {
        mode: profile.inputs,
        caps: voice.uig?.rules || {
          u: { max: profile.inputs === "direct" ? 4 : 2 },
          c: { max: profile.inputs === "direct" ? 3 : 2 },
          a: { max: 2 },
          f: { max: 1 },
          h: { max: 1 }
        }
      },
      u: userInfo.name || "Friend",
      c: userInfo.favoriteColor || null,
      a: userInfo.favoriteAnimal || null,
      f: userInfo.favoriteFood || null,
      h: userInfo.hobbies || null,
      themes: [theme],
      setting: themeIntent?.setting?.[0] || null,
      characters: themeIntent?.characters || [],
      level
    };

    return `<CTRL>${JSON.stringify(ctrlData)}</CTRL>`;
  }
}