/**
 * Arc Manager - Never-Ending Story Arc System
 * Handles modulo-based arc calculations, transitions, and rotation logic
 */

// Types and interfaces
export interface ArcPosition {
  arcNumber: number;
  sceneIndex: number;
  isEndingPage: boolean;
  totalArcs: number;
  scenesPerArc: number;
}

export interface ArcTransition {
  fromArc: number;
  toArc: number;
  transitionType: 'continuation' | 'new_arc' | 'climax';
  carriedIntent?: string;
  metadata?: any;
}

export interface EndingRotationConfig {
  endingRotation: number;
}

/**
 * Calculate arc position based on page index and template level
 */
export function calculateArcPosition(pageIndex: number, templateLevel: number = 1): ArcPosition {
  // Base scenes per arc (adjustable based on template level)
  const baseScenesPerArc = Math.max(3, 4 + Math.floor(templateLevel / 2));
  
  // Calculate which arc we're in (0-indexed)
  const arcNumber = Math.floor(pageIndex / baseScenesPerArc);
  
  // Calculate position within current arc (0-indexed)
  const sceneIndex = pageIndex % baseScenesPerArc;
  
  // Determine if this is an ending page (last scene in arc)
  const isEndingPage = sceneIndex === baseScenesPerArc - 1;
  
  console.log(`🎪 Arc Calculation: Page ${pageIndex} → Arc ${arcNumber}, Scene ${sceneIndex}/${baseScenesPerArc}, Ending: ${isEndingPage}`);
  
  return {
    arcNumber,
    sceneIndex,
    isEndingPage,
    totalArcs: arcNumber + 1,
    scenesPerArc: baseScenesPerArc
  };
}

/**
 * Generate arc transition data for story continuity
 */
export function generateArcTransition(fromPageIndex: number, toPageIndex: number, templateLevel: number = 1): ArcTransition {
  const fromPosition = calculateArcPosition(fromPageIndex, templateLevel);
  const toPosition = calculateArcPosition(toPageIndex, templateLevel);
  
  let transitionType: ArcTransition['transitionType'] = 'continuation';
  let carriedIntent = '';
  
  if (toPosition.arcNumber > fromPosition.arcNumber) {
    transitionType = 'new_arc';
    carriedIntent = `Continuing from arc ${fromPosition.arcNumber} to arc ${toPosition.arcNumber}`;
  } else if (fromPosition.isEndingPage) {
    transitionType = 'climax';
    carriedIntent = `Climax resolution for arc ${fromPosition.arcNumber}`;
  }
  
  console.log(`🔄 Arc Transition: ${fromPageIndex} → ${toPageIndex} (${transitionType})`);
  
  return {
    fromArc: fromPosition.arcNumber,
    toArc: toPosition.arcNumber,
    transitionType,
    carriedIntent,
    metadata: {
      fromPosition,
      toPosition,
      templateLevel
    }
  };
}

/**
 * Check if arc transition is needed between pages
 */
export function needsArcTransition(fromPageIndex: number, toPageIndex: number, templateLevel: number = 1): boolean {
  const fromPosition = calculateArcPosition(fromPageIndex, templateLevel);
  const toPosition = calculateArcPosition(toPageIndex, templateLevel);
  
  const needsTransition = fromPosition.arcNumber !== toPosition.arcNumber || fromPosition.isEndingPage;
  
  console.log(`🎭 Arc Transition Check: ${fromPageIndex} → ${toPageIndex}, Needed: ${needsTransition}`);
  
  return needsTransition;
}

/**
 * Get B-value for modulo calculations (business logic parameter)
 */
export function getBValue(templateLevel: number = 1, difficulty: string = 'medium'): number {
  // B-value affects arc length and complexity
  let baseB = 4;
  
  // Adjust based on template level
  baseB += Math.floor(templateLevel / 2);
  
  // Adjust based on difficulty
  switch (difficulty.toLowerCase()) {
    case 'beginner':
    case 'easy':
      baseB = Math.max(3, baseB - 1);
      break;
    case 'hard':
    case 'expert':
      baseB += 1;
      break;
    default: // medium
      break;
  }
  
  console.log(`📊 B-Value: Level ${templateLevel}, Difficulty ${difficulty} → ${baseB}`);
  
  return baseB;
}

/**
 * Select rotated ending based on rotation configuration
 */
export function selectRotatedEnding<T>(endings: T[], config: EndingRotationConfig): T | null {
  if (!endings || endings.length === 0) {
    console.warn('⚠️ No endings available for rotation');
    return null;
  }
  
  // Use rotation value to select ending deterministically
  const rotationIndex = config.endingRotation % endings.length;
  const selectedEnding = endings[rotationIndex];
  
  console.log(`🎲 Ending Rotation: Index ${rotationIndex}/${endings.length}, Rotation: ${config.endingRotation}`);
  
  return selectedEnding;
}

/**
 * Get arc metadata for debugging and analytics
 */
export function getArcMetadata(pageIndex: number, templateLevel: number = 1): Record<string, any> {
  const position = calculateArcPosition(pageIndex, templateLevel);
  const bValue = getBValue(templateLevel);
  
  return {
    pageIndex,
    templateLevel,
    arcPosition: position,
    bValue,
    calculatedAt: new Date().toISOString(),
    arcProgress: (position.sceneIndex + 1) / position.scenesPerArc,
    isArcStart: position.sceneIndex === 0,
    isArcMidpoint: position.sceneIndex === Math.floor(position.scenesPerArc / 2),
    isArcEnd: position.isEndingPage
  };
}

/**
 * Reset arc state for new sessions
 */
export function resetArcState(): void {
  console.log('🔄 Arc state reset for new session');
  // This function can be extended to clear any persistent arc state
  // Currently serves as a placeholder for future arc state management
}

export default {
  calculateArcPosition,
  generateArcTransition,
  needsArcTransition,
  getBValue,
  selectRotatedEnding,
  getArcMetadata,
  resetArcState
};