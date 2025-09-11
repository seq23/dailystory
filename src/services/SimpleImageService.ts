import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { ErrorHandler } from '@/utils/errorHandling';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';
import { ImageFallbackService } from '@/services/ImageFallbackService';

// Simple service configuration
interface ImageGenerationConfig {
  provider: 'runware' | 'openai';
  dimensions: { width: number; height: number };
  style?: string;
  difficultyLevel?: DifficultyLevel;
  sessionId?: string;
  totalPages?: number;
  pageNumber?: number;
}

interface ImageResult {
  url: string;
  success: boolean;
  provider?: string;
  model?: string;
  cost?: number;
  seed?: number;
  error?: string;
  prompt?: string;
  metadata?: any;
}

export class SimpleImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: 'runware',
    dimensions: { width: 1024, height: 1024 },
    style: 'children-book',
    difficultyLevel: 'medium'
  };

  private static readonly CONCURRENCY_LIMIT = 4;
  private static readonly RATE_LIMIT_PER_SEC = 2;
  private static readonly DAILY_COST_CEILING_USD = 50;
  private static readonly ESTIMATED_COST_PER_IMAGE_USD = 0.002;

  // ============================================================================
  // UNIVERSAL ANIMAL SYSTEM - Master Plan Implementation
  // ============================================================================

  // OUTDOOR_ONLY_ANIMALS Array (~50+ animals)
  private static readonly OUTDOOR_ONLY_ANIMALS = [
    // Farm Animals (15 animals)
    'cow', 'pig', 'sheep', 'chicken', 'duck', 'goose', 'horse', 'goat', 'llama', 'alpaca', 'donkey', 'mule', 'turkey', 'rooster', 'hen',
    
    // Wild Animals (34 animals)
    'lion', 'tiger', 'bear', 'elephant', 'wolf', 'fox', 'deer', 'squirrel', 'raccoon', 'skunk', 'porcupine', 'beaver', 'otter', 'mink', 'badger', 'leopard', 'cheetah', 'jaguar', 'panther', 'lynx', 'bobcat', 'coyote', 'hyena', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle', 'buffalo', 'bison', 'moose', 'elk', 'caribou',
    
    // Large Birds (15 animals)
    'eagle', 'owl', 'flamingo', 'penguin', 'pelican', 'heron', 'crane', 'stork', 'swan', 'hawk', 'falcon', 'vulture', 'peacock', 'ostrich', 'emu'
  ];

  // WATER_ONLY_ANIMALS Array (~25+ animals)
  private static readonly WATER_ONLY_ANIMALS = [
    // Ocean Mammals
    'whale', 'shark', 'dolphin', 'orca', 'seal', 'sea lion', 'walrus',
    
    // Fish & Ocean Life
    'fish', 'octopus', 'crab', 'lobster', 'seahorse', 'starfish', 'jellyfish', 'stingray',
    'tuna', 'salmon', 'angelfish', 'clownfish', 'swordfish', 'marlin', 'bass', 'trout', 'cod', 'flounder', 'sole', 'manta ray',
    
    // Ocean Invertebrates
    'squid', 'shrimp', 'sea urchin', 'sea anemone', 'coral', 'barnacle'
  ];

  // Enhanced outdoor keywords with water terms
  private static readonly ENHANCED_OUTDOOR_KEYWORDS = [
    'outside', 'outdoor', 'nature', 'forest', 'park', 'garden', 'yard', 'playground', 'beach', 'mountain', 'hill', 'field', 'meadow', 'woods', 'trail', 'path', 'river', 'lake', 'pond', 'stream', 'creek', 'waterfall', 'ocean', 'sea', 'shore', 'coast', 'island', 'desert', 'valley', 'canyon', 'cliff', 'cave', 'camping', 'hiking', 'picnic', 'safari', 'jungle', 'rainforest', 'farm', 'barn', 'stable', 'pasture', 'fence', 'gate', 'bridge', 'dock', 'pier', 'marina', 'harbor', 'bay', 'aquarium', 'pool', 'swimming pool', 'hot tub', 'fountain', 'wharf', 'diving', 'snorkeling', 'surfing', 'boating', 'sailing', 'kayaking', 'canoeing', 'water skiing', 'jet skiing', 'wet', 'splash', 'wave', 'tide', 'current', 'deep', 'shallow', 'underwater'
  ];

  // Enhanced indoor keywords
  private static readonly ENHANCED_INDOOR_KEYWORDS = [
    'inside', 'indoor', 'home', 'house', 'room', 'bedroom', 'living room', 'kitchen', 'bathroom', 'dining room', 'basement', 'attic', 'garage', 'office', 'study', 'library', 'classroom', 'school', 'hospital', 'restaurant', 'store', 'shop', 'mall', 'theater', 'cinema', 'museum', 'gym', 'studio', 'apartment', 'building', 'elevator', 'stairs', 'hallway', 'closet', 'pantry', 'laundry room', 'nursery', 'playroom', 'den', 'loft', 'cabin', 'cottage', 'mansion', 'palace', 'castle', 'tent', 'cabin', 'shelter'
  ];

  // Setting mappings with water-specific settings
  private static readonly settingMappings = {
    // Indoor settings
    'kitchen': ' a cozy kitchen with warm lighting and cooking elements',
    'bedroom': ' a comfortable bedroom with soft furnishings',
    'living room': ' a welcoming living room with comfortable seating',
    'bathroom': ' a clean bathroom with modern fixtures',
    'dining room': ' an elegant dining room with table setting',
    'office': ' a professional office environment',
    'classroom': ' a bright classroom with learning materials',
    'library': ' a quiet library with books and reading areas',
    
    // Outdoor settings
    'forest': ' a lush green forest with tall trees and natural wildlife',
    'park': ' a beautiful park with open spaces and nature',
    'garden': ' a colorful garden with flowers and plants',
    'beach': ' a sandy beach with ocean waves and coastal atmosphere',
    'mountain': ' a majestic mountain landscape with scenic wilderness',
    'farm': ' a peaceful farm with rolling green fields and barn structures',
    'jungle': ' a dense tropical jungle with rich green vegetation',
    'safari': ' an expansive safari landscape with golden grasslands',
    
    // Water-specific settings
    'ocean': ' a vast blue ocean with rolling waves and marine life',
    'underwater': ' a magical underwater world with colorful coral and sea creatures',
    'aquarium': ' a fascinating aquarium with clear water and swimming fish',
    'pool': ' a sparkling swimming pool with clear blue water',
    'lake': ' a peaceful lake with calm reflective water',
    'river': ' a flowing river with gentle current and natural beauty',
    'pond': ' a quiet pond with still water and nature around',
    'bay': ' a scenic bay with calm water and natural beauty',
    'harbor': ' a bustling harbor with boats and water activities',
    'marina': ' a modern marina with sailboats and water sports'
  };

  // Context-aware outdoor setting mappings
  private static readonly OUTDOOR_SETTING_MAPPINGS = {
    // Farm Animals → Farm settings
    farm: ' a peaceful farm with rolling green fields and barn structures',
    barnyard: ' a rustic barnyard with hay bales and wooden fences',
    
    // Wild Animals → Nature settings
    forest: ' a lush green forest with tall trees and natural wildlife',
    safari: ' an expansive safari landscape with golden grasslands',
    jungle: ' a dense tropical jungle with rich green vegetation',
    mountain: ' a majestic mountain landscape with scenic wilderness',
    
    // Large Birds & General → Open nature
    nature: ' a beautiful natural outdoor environment with open skies and fresh air'
  };

  // UNIVERSAL HAIR MAPPING - Single source of truth for all systems
  private static getHairColorFromAvatar(avatar: any): string {
    if (!avatar?.skinTone) return 'brown';
    
    // Universal mapping: pale → red, light → blonde, medium → brown, olive → black
    const universalHairMap = {
      'pale': 'red',
      'light': 'blonde', 
      'medium': 'brown',
      'olive': 'black',
      'dark': 'textured black hair variety' // Special handling below
    };
    
    // For dark skin tone, use natural textured hair
    if (avatar.skinTone === 'dark') {
      return 'natural textured hair';
    }
    
    return universalHairMap[avatar.skinTone] || 'brown';
  }

  // NEW: Universal hair mapping that handles cultural logic
  private static getUniversalHairMapping(userInfo: UserInfo): string {
    if (!userInfo?.avatar?.skinTone) return 'brown';
    
    // Enhanced cultural processing handled by backend
    if (userInfo.avatar.skinTone === 'dark' && userInfo.nativeLanguage === 'en') {
      return 'natural textured hair';
    }
    
    // Use standard universal mapping
    return this.getHairColorFromAvatar(userInfo.avatar);
  }

  private static detectEmotionalContext(text: string): any {
    // Detect emotional context from text for StructuredPromptEngine
    const emotions = {
      curiosity: /curious|wonder|explore|discover|interested/i,
      excitement: /excited|happy|joy|thrilled|amazing/i,
      sadness: /sad|cry|tear|upset|disappointed/i,
      surprise: /surprise|shocked|unexpected|wow|gasp/i,
      determination: /determined|brave|strong|confident|bold/i
    };

    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(text)) {
        return {
          mood: emotion,
          intensity: 0.7,
          colorPalette: emotion === 'excitement' ? 'warm' : emotion === 'sadness' ? 'cool' : 'balanced',
          lighting: emotion === 'surprise' ? 'dramatic' : 'soft',
          composition: 'centered'
        };
      }
    }

    return {
      mood: 'neutral',
      intensity: 0.5,
      colorPalette: 'balanced',
      lighting: 'soft',
      composition: 'centered'
    };
  }

  // User key generation for session tracking
  private static generateUserKey(userId?: string): string {
    return userId ? `user_${userId}` : `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Usage tracking methods
  private static async loadUsage(userKey: string): Promise<{ count: number; cost: number; lastReset: string }> {
    try {
      const stored = localStorage.getItem(`image_usage_${userKey}`);
      if (!stored) return { count: 0, cost: 0, lastReset: new Date().toDateString() };
      
      const usage = JSON.parse(stored);
      const today = new Date().toDateString();
      
      if (usage.lastReset !== today) {
        return { count: 0, cost: 0, lastReset: today };
      }
      
      return usage;
    } catch {
      return { count: 0, cost: 0, lastReset: new Date().toDateString() };
    }
  }

  private static async saveUsage(userKey: string, count: number, cost: number): Promise<void> {
    try {
      const usage = {
        count,
        cost,
        lastReset: new Date().toDateString()
      };
      localStorage.setItem(`image_usage_${userKey}`, JSON.stringify(usage));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  }

  // Character logic moved to backend - all methods removed

  private static async throttleAndQueue(userKey: string): Promise<void> {
    const lastRequest = this.userRequestTimes.get(userKey) || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    const minInterval = 1000 / this.RATE_LIMIT_PER_SEC;
    
    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }
    
    this.userRequestTimes.set(userKey, Date.now());
  }

  private static userRequestTimes = new Map<string, number>();

  // Quality degradation (currently disabled but structure in place)
  private static shouldDegrade(userKey: string): boolean {
    // Future: Implement based on usage patterns
    return false;
  }

  private static applyDegradationIfNeeded(config: ImageGenerationConfig, userKey: string): ImageGenerationConfig {
    if (!this.shouldDegrade(userKey)) return config;
    
    // Future: Apply quality degradation
    return {
      ...config,
      dimensions: { width: 512, height: 512 }
    };
  }

  // Usage recording
  private static async recordUsage(result: ImageResult, userId?: string): Promise<void> {
    try {
      const userKey = this.generateUserKey(userId);
      const usage = await this.loadUsage(userKey);
      const newCost = usage.cost + (result.cost || this.ESTIMATED_COST_PER_IMAGE_USD);
      
      await this.saveUsage(userKey, usage.count + 1, newCost);
      
      console.log(`📊 Usage recorded: ${usage.count + 1} images, $${newCost.toFixed(4)} cost`);
    } catch (error) {
      console.warn('Failed to record usage:', error);
    }
  }

  // Enhanced prompt generation - now calls backend orchestrator directly
  private static async generateEnhancedPrompt(
    pageText: string, 
    userInfo: UserInfo, 
    pageNumber: number, 
    sessionId: string
  ): Promise<string> {
    console.warn('Enhanced prompt generation moved to backend orchestrator');
    return this.generateLegacyPrompt(pageText, userInfo);
  }

  // Legacy prompt generation as fallback
  private static async generateLegacyPrompt(pageText: string, userInfo?: UserInfo): Promise<string> {
    let characterDesc = 'friendly character';
    
    if (userInfo && userInfo.avatar) {
      try {
        characterDesc = `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
        
        if (userInfo.name && pageText.toLowerCase().includes(userInfo.name.toLowerCase())) {
          characterDesc = `${userInfo.name} (${characterDesc})`;
        }
      } catch (error) {
        console.warn('Character description error, using basic description:', error);
        characterDesc = `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
      }
    }
    
    const visualElements = '';
    return `Children's book illustration: ${characterDesc}. Scene: ${pageText}${visualElements}. Bright, colorful, safe for children, consistent character appearance`;
  }

  /**
   * ============================================================================
   * MAIN IMAGE GENERATION METHOD - ALL USERS GET TIER 1 IMAGES
   * ============================================================================
   * 
   * CRITICAL BUSINESS RULE: This method provides Tier 1 (highest quality) images
   * to ALL users regardless of subscription status.
   * 
   * The `isPremium` parameter is used for:
   * - Analytics and usage tracking only
   * - Passed as `isGuestUser: !isPremium` to backend for logging
   * - DOES NOT affect image quality or tier selection
   * 
   * Backend orchestrator ensures 100% success rate through fallback tiers:
   * Tier 1 → Tier 2.5 → Tier 4
   * 
   * All users start with Tier 1 premium image generation.
   * ============================================================================
   */
  static async generateStoryImage(
    pageText: string,
    userInfo: UserInfo,
    difficulty: string = 'developing', // Frontend difficulty level - will be converted to backend
    storyId?: string,
    pageNumber?: number,
    sessionId?: string,
    isPremium?: boolean // For analytics only - does not affect image quality
  ): Promise<ImageResult> {
    // CRITICAL: Add prompt flow debugging
    try {
      const { PromptFlowDebugger } = await import('@/services/PromptFlowDebugger');
      PromptFlowDebugger.logPromptStage(
        sessionId || `session_${Date.now()}`, 
        pageNumber || 1, 
        'frontend', 
        pageText, 
        {
          userInfo: userInfo?.name,
          difficulty,
          isPremium,
          timestamp: Date.now()
        }
      );
    } catch (debugError) {
      console.warn('Prompt flow debugging failed:', debugError);
    }

    // Convert frontend difficulty to backend format
    const backendDifficulty = DifficultyLevelMapper.toBackend(difficulty) as DifficultyLevel;
    console.log(`🔄 SimpleImage: Difficulty mapping - Frontend: "${difficulty}" → Backend: "${backendDifficulty}"`);
    
    const userKey = this.generateUserKey(userInfo?.name);
    
    try {
      await this.throttleAndQueue(userKey);
    } catch (error) {
      console.warn('Throttling error:', error);
    }

    const cleanScene = pageText.replace(/[^\w\s\-.,!?]/g, '').trim();

    // Create timeout promise that will reject if request takes too long
    let timeoutId: NodeJS.Timeout | undefined;
    let requestAborted = false;

    try {
      console.log('🎯 Calling backend orchestrator for image generation');
      console.log('📊 Request details:', {
        sessionId: sessionId.substring(0, 10) + '...',
        pageNumber,
        cleanSceneLength: cleanScene.length,
        timestamp: new Date().toISOString()
      });
      
      // Create timeout promise that rejects after 150 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          requestAborted = true;
          console.warn('⏰ Frontend timeout: Request exceeded 150 seconds');
          reject(new Error('Request timeout: Image generation took longer than 150 seconds'));
        }, 150000);
      });

      // CORRECT TIER PROGRESSION: SimpleImageService → Orchestrator → Tier 1 → Tier 2.5 → Tier 4
      console.log('🎯 Using proper orchestrator flow: runware-generate-image (orchestrator) → ai-visual-scene-creator (Tier 1) → fallback tiers');
      
      let requestPromise;
      let tier1Failed = false;
      
      try {
        // Call the main orchestrator (runware-generate-image) which handles all tiers
        console.log('🎯 Calling main orchestrator: runware-generate-image');
        requestPromise = supabase.functions.invoke('runware-generate-image', {
          body: {
            pageText: cleanScene,
            userInfo,
            sessionId,
            storyId: sessionId, // Use sessionId as storyId for consistency
            pageNumber,
            isGuestUser: !isPremium,
            difficultyLevel: backendDifficulty
          }
        });
      } catch (tier1Error) {
        console.warn('🥈 Tier 1 failed, falling back to Tier 2.5: runware-simple-fallback');
        tier1Failed = true;
        // Fallback to runware-simple-fallback (Tier 2.5)
        requestPromise = supabase.functions.invoke('runware-simple-fallback', {
          body: {
            pageText: cleanScene,
            userInfo,
            storyId,
            sessionId,
            pageNumber,
            isGuestUser: !isPremium,
            difficultyLevel: backendDifficulty
          }
        });
      }

      // Race between request and timeout
      const { data, error } = await Promise.race([requestPromise, timeoutPromise]);
      
      clearTimeout(timeoutId); // Clear timeout on successful response

      // If first tier failed, check if we can try next tier
      if (error && !tier1Failed) {
        console.warn('🥈 Tier 1 failed, attempting Tier 2.5: runware-simple-fallback');
        try {
          const tier2Response = await Promise.race([
            supabase.functions.invoke('runware-simple-fallback', {
              body: {
                pageText: cleanScene,
                userInfo,
                storyId,
                sessionId,
                pageNumber,
                isGuestUser: !isPremium,
                difficultyLevel: backendDifficulty
              }
            }),
            timeoutPromise
          ]);

          if (tier2Response.data?.success) {
            console.log(`✅ Tier 2.5 succeeded: ${tier2Response.data.enhancementLevel}`);
            const result: ImageResult = {
              url: tier2Response.data.imageURL,
              success: true,
              provider: tier2Response.data.provider || 'tier-2.5',
              model: tier2Response.data.metadata?.model || 'runware-template',
              cost: tier2Response.data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
              seed: tier2Response.data.seed,
              metadata: {
                tier: '2.5',
                enhancementLevel: tier2Response.data.enhancementLevel,
                qualityScore: tier2Response.data.qualityScore,
                fallbackFromTier1: true,
                ...tier2Response.data.metadata
              }
            };
            await this.recordUsage(result, userInfo?.name);
            return result;
          }
        } catch (tier2Error) {
          console.warn('🥉 Tier 2.5 also failed, proceeding to Tier 4 fallback');
        }
      }

      if (error) {
        throw new Error(`Image generation failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Image generation failed');
      }

      console.log(`✅ Image generation succeeded (Tier ${data.tier || '1'}): ${data.enhancementLevel || 'enhanced'}`);

      const result: ImageResult = {
        url: data.imageURL,
        success: true,
        provider: data.provider || 'ai-visual-scene-creator',
        model: data.metadata?.model || 'enhanced',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed,
        metadata: {
          tier: data.tier || '1',
          enhancementLevel: data.enhancementLevel,
          qualityScore: data.qualityScore,
          ...data.metadata
        }
      };

      // Record usage for tracking
      await this.recordUsage(result, userInfo?.name);
      
      return result;

    } catch (error) {
      // Clear timeout if error occurs
      if (timeoutId) clearTimeout(timeoutId);
      
      // FAIL-OPEN: Always return placeholder instead of throwing
      console.warn('🖼️ Image generation failed, returning placeholder:', error.message);
      
      const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(cleanScene, pageNumber || 1);
      
      const result: ImageResult = {
        url: fallbackUrl,
        success: true, // Mark as success so UI never stalls
        provider: 'fallback-service',
        model: 'svg-placeholder',
        cost: 0,
        metadata: {
          isFallback: true,
          originalError: error.message,
          tier: 'fallback'
        }
      };
      
    }
  }

  // TIER 4: SVG Placeholder (guaranteed success) - Proper fallback
  private static generateSVGPlaceholder(cleanScene: string, userInfo?: UserInfo): ImageResult {
    console.warn('🎨 Using local SVG fallback due to backend unavailability');
    
    // Provide a proper fallback placeholder
    return {
      url: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <!-- Background -->
          <rect width="100%" height="100%" fill="#f8f9fa" stroke="#e5e7eb" stroke-width="1"/>
          
          <!-- Broken Wand Image -->
          <image 
            x="100" 
            y="30" 
            width="200" 
            height="150" 
            href="/lovable-uploads/93432db4-84aa-4992-a216-9e542d03f7d3.png"
            preserveAspectRatio="xMidYMid meet"
          />
          
          <!-- Arrow marker definition -->
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#9ca3af"/>
            </marker>
          </defs>
          
          <!-- Main message -->
          <text x="50%" y="220" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#374151">
            Images not working right now
          </text>
          <text x="50%" y="240" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6b7280">
            Please try again later
          </text>
        </svg>
      `),
      success: true,
      provider: 'svg-fallback',
      model: 'placeholder',
      cost: 0,
      seed: undefined
    };
  }
  static getTierUsed(result: ImageResult): string {
    if (result.metadata?.tier) {
      const tierMap = {
        1: 'AI-Enhanced Premium (Tier 1)',
        2.5: 'Nuclear Hardcoded (Tier 2.5)',
        4: 'SVG Placeholder (Tier 4)'
      };
      return tierMap[result.metadata.tier] || 'Unknown';
    }
    
    // Legacy fallback based on provider
    if (result.provider === 'runware-premium') return 'High-Quality AI-Enhanced (Tier 1)';
    if (result.provider === 'runware-simple-fallback') return 'Nuclear Hardcoded (Tier 2.5)';
    if (result.provider === 'svg') return 'SVG Placeholder (Tier 4)';
    return 'Backend Orchestrated';
  }

  // Simplified provider switching (now affects backend orchestrator)
  static async switchProvider(provider: 'runware' | 'openai'): Promise<void> {
    this.DEFAULT_CONFIG.provider = provider;
    console.log(`🔄 Default provider preference set to: ${provider} (affects backend orchestrator)`);
  }

  static getAvailableProviders(): string[] {
    return ['runware', 'openai'];
  }

  // ============================================================================
  // ANIMAL DETECTION HELPER FUNCTIONS - Master Plan Implementation
  // ============================================================================

  private static checkForWaterOnlyAnimals(sentence: string): { hasWaterAnimal: boolean; animalType: string; suggestedSetting: string } {
    const lowerSentence = sentence.toLowerCase();
    
    for (const animal of this.WATER_ONLY_ANIMALS) {
      if (lowerSentence.includes(animal)) {
        let suggestedSetting = '';
        
        // Context-aware water setting selection
        if (['whale', 'dolphin', 'orca', 'shark'].includes(animal)) {
          suggestedSetting = ' a vast blue ocean with rolling waves and marine life';
        }
        else if (['octopus', 'crab', 'lobster', 'seahorse', 'starfish', 'jellyfish'].includes(animal)) {
          suggestedSetting = ' a magical underwater world with colorful coral and sea creatures';
        }
        else if (['tuna', 'salmon', 'bass', 'trout'].includes(animal)) {
          suggestedSetting = ' a peaceful lake with calm reflective water';
        }
        else {
          suggestedSetting = ' a vast blue ocean with rolling waves and marine life'; // Default to ocean
        }
        
        console.log(`🌊 Water-only animal detected: ${animal} → forcing water setting`);
        return { hasWaterAnimal: true, animalType: animal, suggestedSetting };
      }
    }
    
    return { hasWaterAnimal: false, animalType: '', suggestedSetting: '' };
  }

  private static checkForOutdoorOnlyAnimals(sentence: string): { hasOutdoorAnimal: boolean; animalType: string; suggestedSetting: string } {
    const lowerSentence = sentence.toLowerCase();
    
    for (const animal of this.OUTDOOR_ONLY_ANIMALS) {
      if (lowerSentence.includes(animal)) {
        let suggestedSetting = '';
        
        // Context-aware setting selection based on animal habitat
        if (['cow', 'pig', 'sheep', 'chicken', 'duck', 'goose', 'horse', 'goat', 'llama', 'alpaca', 'donkey', 'mule', 'turkey', 'rooster', 'hen'].includes(animal)) {
          suggestedSetting = ' a peaceful farm with rolling green fields and barn structures';
        }
        else if (['lion', 'tiger', 'leopard', 'cheetah', 'jaguar', 'panther'].includes(animal)) {
          suggestedSetting = ' an expansive safari landscape with golden grasslands';
        }
        else if (['bear', 'wolf', 'fox', 'deer', 'squirrel', 'raccoon', 'beaver', 'otter'].includes(animal)) {
          suggestedSetting = ' a lush green forest with tall trees and natural wildlife';
        }
        else if (['elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'buffalo', 'bison'].includes(animal)) {
          suggestedSetting = ' an expansive safari landscape with golden grasslands';
        }
        else if (['eagle', 'owl', 'hawk', 'falcon', 'vulture'].includes(animal)) {
          suggestedSetting = ' a majestic mountain landscape with scenic wilderness';
        }
        else {
          suggestedSetting = ' a beautiful natural outdoor environment with open skies and fresh air';
        }
        
        console.log(`🦁 Outdoor-only animal detected: ${animal} → forcing outdoor setting`);
        return { hasOutdoorAnimal: true, animalType: animal, suggestedSetting };
      }
    }
    
    return { hasOutdoorAnimal: false, animalType: '', suggestedSetting: '' };
  }

  // ============================================================================
  // SETTING EXTRACTION WITH CORRECTED PRIORITY LOGIC - Master Plan Implementation
  // ============================================================================

  static extractSettingFromSentence(sentence: string, previousSetting?: string): string {
    const lowerSentence = sentence.toLowerCase();
    
    // PRIORITY 1: Specific setting keywords in page text (HIGHEST PRIORITY)
    for (const [setting, description] of Object.entries(this.settingMappings)) {
      if (lowerSentence.includes(setting)) {
        console.log(`🏠 Explicit setting found in text: ${setting} → using page text setting`);
        return description; // PAGE TEXT ALWAYS WINS
      }
    }
    
    // PRIORITY 2: Indoor/outdoor keywords in page text
    let isIndoor = false;
    let isOutdoor = false;
    
    // Check for indoor keywords
    for (const keyword of this.ENHANCED_INDOOR_KEYWORDS) {
      if (lowerSentence.includes(keyword)) {
        isIndoor = true;
        console.log(`🏠 Indoor keyword detected: ${keyword} → indoor setting`);
        break;
      }
    }
    
    // Check for outdoor keywords
    if (!isIndoor) {
      for (const keyword of this.ENHANCED_OUTDOOR_KEYWORDS) {
        if (lowerSentence.includes(keyword)) {
          isOutdoor = true;
          console.log(`🌳 Outdoor keyword detected: ${keyword} → outdoor setting`);
          break;
        }
      }
    }
    
    // Apply indoor/outdoor classification if found
    if (isIndoor) {
      return ' a comfortable indoor space with cozy atmosphere';
    } else if (isOutdoor) {
      return ' a beautiful outdoor setting with natural environment';
    }
    
    // PRIORITY 3: Water-only animals (only if no explicit setting found)
    const waterAnimalCheck = this.checkForWaterOnlyAnimals(sentence);
    if (waterAnimalCheck.hasWaterAnimal) {
      return waterAnimalCheck.suggestedSetting;
    }
    
    // PRIORITY 4: Outdoor-only animals (only if no explicit setting found)
    const outdoorAnimalCheck = this.checkForOutdoorOnlyAnimals(sentence);
    if (outdoorAnimalCheck.hasOutdoorAnimal) {
      return outdoorAnimalCheck.suggestedSetting;
    }
    
    // PRIORITY 5: Nuclear-safe setting memory
    if (previousSetting && previousSetting.trim().length > 0) {
      console.log('🛡️ Tier 2.5: Using previous setting memory:', previousSetting);
      return previousSetting;
    }
    
    // PRIORITY 6: Ultimate fallback
    return ' indoor portrait style photo with main character focus';
  }
}