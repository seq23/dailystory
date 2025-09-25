/**
 * Arc-Aware Template Processor
 * Main orchestrator for modulo-based never-ending story generation
 * Integrates with smart template selection, cache management, and character validation
 */

import { convertStoryTemplateToStringArray } from './templateConverter.ts';
import { calculateArcPosition, generateArcTransition, needsArcTransition, getBValue } from './arcManager.ts';
import { getNuclearSession, updateCurrentArc, sessionToJSON } from './nuclearSessionManager.ts';
import { getTemplate, getTemplateCount } from './templateImporter.ts';
import type { UserInfo, TemplateLevel } from './types/index.ts';
import { toTemplateLevel } from './types/index.ts';

export interface ArcProcessingResult {
  pages: string[];
  arcTransition?: any;
  sessionState?: any;
  metadata?: any;
}

/**
 * Process story page with full arc awareness
 * Main entry point for arc-based story generation
 */
export async function processArcAwarePage(
  pageIndex: number,
  userInfo: UserInfo,
  templateLevel: string,
  sessionId: string,
  mode: string = 'real-user'
): Promise<ArcProcessingResult> {
  // Normalize template level to proper type
  const normalizedTemplateLevel: TemplateLevel = toTemplateLevel(templateLevel);
  try {
    // Level 0 exclusion - should never reach arc-aware processing
    if (normalizedTemplateLevel === 'level0') {
      throw new Error('Level 0 should use legacy processing, not arc-aware system');
    }
    
    console.log(`🎪 Processing arc-aware page ${pageIndex} for ${normalizedTemplateLevel}`);
    
    // Get or create nuclear session state
    const sessionState = getNuclearSession(sessionId, templateLevel);
    
    // Calculate arc position using modulo logic
    const arcPosition = calculateArcPosition(pageIndex, normalizedTemplateLevel);
    console.log(`📍 Arc Position:`, arcPosition);
    
    // Check if we need arc transition
    if (needsArcTransition(pageIndex, normalizedTemplateLevel) && pageIndex > 0) {
      console.log(`🔄 Arc transition needed at page ${pageIndex}`);
      
      // Generate arc transition data with smart template selection
      const arcTransitionData = await generateArcTransition(
        { arcNumber: arcPosition.arcNumber - 1 }, // Previous arc
        userInfo,
        normalizedTemplateLevel,
        sessionState as any // Type adapter for NuclearSessionState -> SessionState compatibility
      );
      
      // Complete current arc and start new one - using nuclear session
      updateCurrentArc(sessionId, { 
        sceneIndex: 0, 
        templateIndex: arcTransitionData.nextTemplateIndex 
      });
      
      // Load new template for next arc
      const template = await getTemplate(
        templateLevel,
        arcTransitionData.nextTemplateIndex,
        userInfo,
        1,
        mode
      );
      
      if (!template) {
        throw new Error('Failed to load template for arc transition');
      }
      
      // Process ending page with arc transition context
      const arcConfig = {
        pageIndex,
        arcNumber: arcPosition.arcNumber,
        isArcTransition: true,
        carriedIntent: arcTransitionData.carriedIntent || undefined,
        environmentalVariants: arcTransitionData.environmentalChanges,
        swappableElements: arcTransitionData.swappableChanges,
        continuityLine: arcTransitionData.continuityLine
      };
      
      const pages = await convertStoryTemplateToStringArray(
        (Array.isArray(template) ? template[0] : template) as any, // Type adapter for template compatibility
        userInfo,
        1,
        mode,
        arcConfig
      );
      
      return {
        pages: Array.isArray(pages) ? pages : pages.pages,
        arcTransition: arcTransitionData,
        sessionState: sessionToJSON(sessionId),
        metadata: {
          arcNumber: arcPosition.arcNumber,
          isArcTransition: true,
          templateIndex: arcTransitionData.nextTemplateIndex
        }
      };
    }
    
    // Regular scene processing within current arc
    const currentTemplateIndex = sessionState.currentArc.templateIndex || 0;
    
    // Load current template
    const template = await getTemplate(
      templateLevel,
      currentTemplateIndex,
      userInfo,
      1,
      mode
    );
    
    if (!template) {
      throw new Error(`Failed to load template ${currentTemplateIndex} for ${templateLevel}`);
    }
    
    // Process scene with arc context
    const arcConfig = {
      pageIndex,
      arcNumber: arcPosition.arcNumber,
      isArcTransition: false,
      environmentalVariants: (sessionState as any).environmentState || {},
      swappableElements: (sessionState as any).swappableState || {}
    };
    
    const pages = await convertStoryTemplateToStringArray(
      (Array.isArray(template) ? template[0] : template) as any, // Type adapter for template compatibility
      userInfo,
      1,
      mode,
      arcConfig
    );
    
    // Update session state
    updateCurrentArc(sessionId, {
      sceneIndex: arcPosition.sceneIndex,
      totalPages: sessionState.currentArc.totalPages + 1
    });
    
    return {
      pages: Array.isArray(pages) ? pages : pages.pages,
      sessionState: sessionToJSON(sessionId),
      metadata: {
        arcNumber: arcPosition.arcNumber,
        sceneIndex: arcPosition.sceneIndex,
        isArcTransition: false,
        templateIndex: currentTemplateIndex
      }
    };
    
  } catch (error) {
    console.error('❌ Arc-aware processing failed:', error);
    
    // Emergency fallback
    return {
      pages: [`Chapter ${Math.floor(pageIndex / 10) + 1}: The adventure continues with new discoveries ahead.`],
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        fallback: true
      }
    };
  }
}

/**
 * Batch process multiple pages for testing mode
 */
export async function batchProcessArcAwarePages(
  startPage: number,
  pageCount: number,
  userInfo: UserInfo,
  templateLevel: string,
  sessionId: string,
  mode: string = 'testing'
): Promise<ArcProcessingResult> {
  try {
    // Level 0 exclusion - should never reach arc-aware processing
    if (templateLevel === 'level0') {
      throw new Error('Level 0 should use legacy processing, not arc-aware batch system');
    }
    
    console.log(`🎪 Batch processing ${pageCount} pages starting from ${startPage}`);
    
    const allPages: string[] = [];
    const arcTransitions: any[] = [];
    let sessionState = null;
    
    for (let i = 0; i < pageCount; i++) {
      const pageIndex = startPage + i;
      const result = await processArcAwarePage(pageIndex, userInfo, templateLevel, sessionId, mode);
      
      allPages.push(...result.pages);
      
      if (result.arcTransition) {
        arcTransitions.push(result.arcTransition);
      }
      
      sessionState = result.sessionState;
    }
    
    return {
      pages: allPages,
      sessionState,
      metadata: {
        batchProcessed: true,
        totalPages: pageCount,
        arcTransitions: arcTransitions.length,
        startPage,
        endPage: startPage + pageCount - 1
      }
    };
    
  } catch (error) {
    console.error('❌ Batch arc processing failed:', error);
    
    // Emergency fallback
    const fallbackPages = Array.from({ length: pageCount }, (_, i) => 
      `Page ${startPage + i + 1}: The story continues with new adventures.`
    );
    
    return {
      pages: fallbackPages,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        fallback: true,
        batchProcessed: true
      }
    };
  }
}

/**
 * Clear session for new story (rewrite mode)
 */
export function clearArcSession(sessionId: string, context: 'rewrite' | 'new-story' | 'session-end' = 'session-end') {
  console.log(`🧹 Clearing arc session ${sessionId} for ${context}`);
  
  // Import clearNuclearSession dynamically to avoid circular imports
  import('./nuclearSessionManager.ts').then(({ clearNuclearSession }) => {
    clearNuclearSession(sessionId);
  });
}

/**
 * Get session analytics for monitoring
 */
export function getArcSessionAnalytics(sessionId?: string) {
  if (sessionId) {
    const sessionState = getNuclearSession(sessionId);
    return sessionState ? {
      sessionId: sessionState.sessionId,
      currentArc: sessionState.currentArc,
      arcHistory: sessionState.arcHistory,
      templateLevel: sessionState.templateLevel,
      lastActivity: sessionState.lastActivity
    } : null;
  }
  
  // Import and return system health for global monitoring
  import('./nuclearSessionManager.ts').then(({ getNuclearSystemHealth }) => {
    return getNuclearSystemHealth();
  });
}