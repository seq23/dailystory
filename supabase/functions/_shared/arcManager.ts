/**
 * Arc Manager - Lean Modulo-Based Arc Generation for Levels 1-4 & Grades 6-10
 * Handles never-ending story arc transitions with smart template selection integration
 */

import { selectWithTimeout } from './smartTemplateSelector.ts';
import { getTemplateCount } from './templateImporter.ts';

// Types and Interfaces
export interface ArcPosition {
  arcNumber: number;
  positionInArc: number;
  sceneIndex: number;
  isEndingPage: boolean;
  B: number;
  totalArcLength: number;
}

export interface ArcTransitionData {
  nextTemplateIndex: number;
  carriedIntent: string | null;
  swappableChanges: Record<string, string>;
  environmentalChanges: Record<string, string>;
  continuityLine: string;
  arcNumber: number;
}

export interface SessionState {
  originalSpecialRequest?: string;
  arcHistory?: Array<{
    theme?: string;
    keyObject?: string;
    setting?: string;
    templateIndex?: number;
  }>;
  environmentalState?: {
    time?: string;
    weather?: string;
    mood?: string;
    season?: string;
  };
  swappableState?: {
    secondaryCharacter?: string;
    setting?: string;
    keyObject?: string;
  };
  endingRotation?: string[];
}

export interface CurrentArcData {
  arcNumber: number;
}

// Import UserInfo from canonical types
import type { UserInfo, TemplateLevel } from './types/index.ts';

export interface Ending {
  type: string;
  text: string;
  microVariants: string[];
}

// Remove duplicate TemplateLevel export - using the one from types/index.ts

// B values for each level (scene count per arc)
const ARC_B_VALUES: Record<TemplateLevel, number> = {
  level0: 0, // Not used for arc-based processing
  level1: 5,
  level2: 8, 
  level3: 10,
  level4: 12,
  grade6: 15,
  grade7: 15,
  grade8: 15,
  grade9: 15,
  grade10: 15
};

// Environmental variants (8 total as per lean plan)
const ENVIRONMENTAL_VARIANTS: Record<string, string[]> = {
  time: ['morning', 'afternoon', 'evening', 'night'],
  weather: ['sunny', 'rainy', 'cloudy', 'windy'],
  mood: ['energetic', 'calm', 'mysterious', 'cheerful'],
  season: ['spring', 'summer', 'fall', 'winter']
};

// 3 Core Swappable Elements
const SWAPPABLE_CATEGORIES: string[] = ['secondaryCharacter', 'setting', 'keyObject'];

/**
 * Calculate arc position from absolute page index
 * EXCLUDES Level 0 - uses legacy processing
 */
export function calculateArcPosition(pageIndex: number, templateLevel: TemplateLevel): ArcPosition {
  // Level 0 exclusion - not arc-based
  if (templateLevel === 'level0') {
    throw new Error('Level 0 does not use arc-based processing');
  }
  const B = ARC_B_VALUES[templateLevel] || 5;
  const arcNumber = Math.floor(pageIndex / (B + 1));
  const positionInArc = pageIndex % (B + 1);
  const isEndingPage = positionInArc === B;
  const sceneIndex = isEndingPage ? -1 : positionInArc;
  
  return {
    arcNumber,
    positionInArc,
    sceneIndex,
    isEndingPage,
    B,
    totalArcLength: B + 1
  };
}

/**
 * Determine if arc transition is needed
 * EXCLUDES Level 0 - uses legacy processing
 */
export function needsArcTransition(pageIndex: number, templateLevel: TemplateLevel): boolean {
  // Level 0 exclusion - not arc-based
  if (templateLevel === 'level0') {
    return false;
  }
  const { isEndingPage } = calculateArcPosition(pageIndex, templateLevel);
  return isEndingPage;
}

/**
 * Generate arc transition data with smart template selection
 */
export async function generateArcTransition(
  currentArcData: CurrentArcData, 
  userInfo: UserInfo, 
  templateLevel: TemplateLevel, 
  sessionState: SessionState
): Promise<ArcTransitionData> {
  try {
    console.log('🔄 Generating arc transition for arc', currentArcData.arcNumber + 1);
    
    // Extract carried intent from previous arc
    const carriedIntent = extractCarriedIntent(currentArcData, sessionState);
    console.log('💭 Carried intent:', carriedIntent);
    
    // Generate variation keywords for environmental/swappable changes
    const variationKeywords = generateVariationKeywords(sessionState, templateLevel);
    
    // Combine carried intent with variation for smart selection
    const combinedRequest = carriedIntent ? `${carriedIntent} ${variationKeywords}` : variationKeywords;
    
    // Try smart template selection for next arc
    let nextTemplateIndex: number | null = null;
    if (combinedRequest) {
      try {
        const templateCount = await getTemplateCount(templateLevel);
        nextTemplateIndex = await selectWithTimeout(
          combinedRequest,
          templateLevel,
          templateCount,
          100
        );
        
        if (nextTemplateIndex !== null) {
          console.log(`🎯 Smart arc transition: Template ${nextTemplateIndex} for \"${combinedRequest}\"`);
        }
      } catch (error) {
        console.warn('⚠️ Smart selection failed for arc transition:', (error as Error).message);
      }
    }
    
    // Fallback to random if smart selection failed
    if (nextTemplateIndex === null) {
      const templateCount = await getTemplateCount(templateLevel) || 1;
      nextTemplateIndex = Math.floor(Math.random() * templateCount);
      console.log('📍 Random arc transition: Template', nextTemplateIndex);
    }
    
    // Generate swappable element changes (at least 2 of 3)
    const swappableChanges = generateSwappableChanges(sessionState);
    
    // Generate environmental variant changes
    const environmentalChanges = generateEnvironmentalChanges(sessionState);
    
    // Create soft continuity line
    const continuityLine = generateContinuityLine(currentArcData, sessionState);
    
    return {
      nextTemplateIndex,
      carriedIntent,
      swappableChanges,
      environmentalChanges,
      continuityLine,
      arcNumber: currentArcData.arcNumber + 1
    };
    
  } catch (error) {
    console.error('❌ Arc transition generation failed:', error);
    
    // Emergency fallback
    const templateCount = await getTemplateCount(templateLevel) || 1;
    return {
      nextTemplateIndex: Math.floor(Math.random() * templateCount),
      carriedIntent: null,
      swappableChanges: {},
      environmentalChanges: {},
      continuityLine: "The adventure continues...",
      arcNumber: (currentArcData?.arcNumber || 0) + 1
    };
  }
}

/**
 * Extract intent keywords from previous arc for continuity
 */
function extractCarriedIntent(currentArcData: CurrentArcData, sessionState: SessionState): string | null {
  try {
    // Get original special request if this is the first arc
    if (currentArcData.arcNumber === 0 && sessionState?.originalSpecialRequest) {
      return sessionState.originalSpecialRequest;
    }
    
    // Extract key elements from previous arc
    const previousElements = sessionState?.arcHistory?.[0];
    if (!previousElements) return null;
    
    // Create simplified intent from previous arc elements
    const intentElements: string[] = [];
    
    if (previousElements.theme) {
      intentElements.push(previousElements.theme);
    }
    
    if (previousElements.keyObject) {
      intentElements.push(previousElements.keyObject);
    }
    
    return intentElements.length > 0 ? intentElements.join(' ') : null;
    
  } catch (error) {
    console.warn('⚠️ Intent extraction failed:', error);
    return null;
  }
}

/**
 * Generate variation keywords for environmental/swappable changes
 */
function generateVariationKeywords(sessionState: SessionState, templateLevel: TemplateLevel): string {
  const keywords: string[] = [];
  
  // Add environmental variation
  const currentTime = sessionState?.environmentalState?.time || 'morning';
  const newTime = getNextEnvironmentalVariant('time', currentTime);
  keywords.push(newTime);
  
  // Add mood variation for higher levels
  if (templateLevel === 'level3' || templateLevel === 'level4' || templateLevel.startsWith('grade')) {
    const currentMood = sessionState?.environmentalState?.mood || 'energetic';
    const newMood = getNextEnvironmentalVariant('mood', currentMood);
    keywords.push(newMood);
  }
  
  return keywords.join(' ');
}

/**
 * Get next environmental variant in rotation
 */
function getNextEnvironmentalVariant(category: string, current: string): string {
  const variants = ENVIRONMENTAL_VARIANTS[category];
  if (!variants) return current;
  
  const currentIndex = variants.indexOf(current);
  const nextIndex = (currentIndex + 1) % variants.length;
  return variants[nextIndex];
}

/**
 * Generate swappable element changes (at least 2 of 3)
 */
function generateSwappableChanges(sessionState: SessionState): Record<string, string> {
  const changes: Record<string, string> = {};
  
  // Change at least 2 of 3 swappable elements
  const elementsToChange = SWAPPABLE_CATEGORIES.slice(0, 2 + Math.floor(Math.random() * 2));
  
  elementsToChange.forEach(category => {
    // Generate new value for this category
    changes[category] = generateSwappableValue(category, sessionState);
  });
  
  return changes;
}

/**
 * Generate new swappable value for category
 */
function generateSwappableValue(category: string, sessionState: SessionState): string {
  const pools: Record<string, string[]> = {
    secondaryCharacter: ['wise mentor', 'playful companion', 'mysterious guide', 'helpful friend'],
    setting: ['enchanted forest', 'bustling marketplace', 'quiet library', 'sunny meadow'],
    keyObject: ['golden compass', 'ancient book', 'magical crystal', 'silver key']
  };
  
  const pool = pools[category] || ['unknown'];
  const previous = (sessionState?.swappableState as any)?.[category];
  
  // Avoid immediate repetition
  const availableOptions = pool.filter(option => option !== previous);
  return availableOptions[Math.floor(Math.random() * availableOptions.length)];
}

/**
 * Generate environmental changes
 */
function generateEnvironmentalChanges(sessionState: SessionState): Record<string, string> {
  const changes: Record<string, string> = {};
  
  // Change at least one environmental aspect
  const categoriesToChange = ['time', 'weather'];
  if (Math.random() > 0.5) categoriesToChange.push('mood');
  
  categoriesToChange.forEach(category => {
    const current = (sessionState?.environmentalState as any)?.[category];
    changes[category] = getNextEnvironmentalVariant(category, current || '');
  });
  
  return changes;
}

/**
 * Generate soft continuity line between arcs
 */
function generateContinuityLine(currentArcData: CurrentArcData, sessionState: SessionState): string {
  try {
    const arcNumber = currentArcData.arcNumber + 1;
    
    // Get a carried element from previous arc
    const previousArc = sessionState?.arcHistory?.[0];
    const carriedElement = previousArc?.keyObject || previousArc?.setting || 'the adventure';
    
    const continuityTemplates = [
      `Same ${carriedElement}. New chapter.`,
      `The ${carriedElement} leads to new discoveries.`,
      `With ${carriedElement} in hand, the journey continues.`,
      `Chapter ${arcNumber}: The ${carriedElement} reveals more secrets.`
    ];
    
    return continuityTemplates[Math.floor(Math.random() * continuityTemplates.length)];
    
  } catch (error) {
    return `Chapter ${(currentArcData?.arcNumber || 0) + 1}: The adventure continues...`;
  }
}

/**
 * Rotate ending to prevent back-to-back repeats
 */
export function selectRotatedEnding(availableEndings: Ending[], sessionState: SessionState): Ending | null {
  if (!availableEndings || availableEndings.length === 0) {
    return null;
  }
  
  // Get last 3 endings used
  const recentEndings = sessionState?.endingRotation || [];
  
  // Filter out recently used endings if we have options
  let eligibleEndings = availableEndings;
  if (availableEndings.length > 1 && recentEndings.length > 0) {
    eligibleEndings = availableEndings.filter(ending => 
      !recentEndings.includes(ending.type)
    );
    
    // If all endings were recently used, allow all again
    if (eligibleEndings.length === 0) {
      eligibleEndings = availableEndings;
    }
  }
  
  // Select random from eligible endings
  return eligibleEndings[Math.floor(Math.random() * eligibleEndings.length)];
}

/**
 * Update ending rotation state
 */
export function updateEndingRotation(selectedEnding: Ending, sessionState: SessionState): void {
  if (!selectedEnding || !sessionState) return;
  
  const rotation = sessionState.endingRotation || [];
  rotation.unshift(selectedEnding.type);
  
  // Keep only last 3 endings
  sessionState.endingRotation = rotation.slice(0, 3);
}

/**
 * Check if template switch is needed due to similarity
 */
export function needsTemplateSwitchForSimilarity(
  templateIndex: number, 
  sessionState: SessionState, 
  templateLevel: TemplateLevel
): boolean {
  try {
    // Simple similarity check: avoid same template in last 2 arcs
    const arcHistory = sessionState?.arcHistory || [];
    
    if (arcHistory.length < 2) return false;
    
    // Check if current template was used in last 2 arcs
    const recentTemplates = arcHistory.slice(0, 2).map(arc => arc.templateIndex);
    return recentTemplates.includes(templateIndex);
    
  } catch (error) {
    console.warn('⚠️ Similarity check failed:', error);
    return false;
  }
}

/**
 * Get B value for template level
 */
export function getBValue(templateLevel: TemplateLevel): number {
  return ARC_B_VALUES[templateLevel] || 5;
}
