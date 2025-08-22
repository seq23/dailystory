/**
 * Visual State API - Clean interface for frontend to backend visual state services
 * Handles character consistency, pronoun resolution, and visual detail tracking
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo } from '@/types';

export interface VisualStateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastUsedPage: number;
}

export interface VisualDetail {
  id: string;
  type: 'color' | 'clothing' | 'object' | 'animal' | 'vehicle' | 'accessory';
  name: string;
  description: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  attributes: Record<string, string>;
}

/**
 * Clean API wrapper for backend visual state management
 */
export class VisualStateAPI {
  
  /**
   * Initialize character context for visual consistency
   */
  static async initializeCharacterContext(
    sessionId: string,
    userInfo: UserInfo,
    totalPages: number
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'initialize-character',
          sessionId,
          userInfo,
          totalPages
        }
      });

      if (error) {
        console.error('Failed to initialize character context:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Character initialization error:', error);
      return { success: false, error: 'Failed to initialize character context' };
    }
  }

  /**
   * Update character with seed for consistency
   */
  static async updateCharacterWithSeed(
    sessionId: string,
    characterName: string,
    description: string,
    seed?: number,
    pageNumber: number = 1
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'update-character',
          sessionId,
          characterName,
          description,
          seed,
          pageNumber
        }
      });

      if (error) {
        console.error('Failed to update character:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Character update error:', error);
      return { success: false, error: 'Failed to update character' };
    }
  }

  /**
   * Get character seed for consistency
   */
  static async getCharacterSeed(
    sessionId: string,
    characterName: string
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'get-character-seed',
          sessionId,
          characterName
        }
      });

      if (error) {
        console.error('Failed to get character seed:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Character seed retrieval error:', error);
      return { success: false, error: 'Failed to get character seed' };
    }
  }

  /**
   * Resolve pronouns in text for consistency
   */
  static async resolvePronouns(
    sessionId: string,
    text: string,
    pageNumber: number = 1
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'resolve-pronouns',
          sessionId,
          text,
          pageNumber
        }
      });

      if (error) {
        console.error('Failed to resolve pronouns:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Pronoun resolution error:', error);
      return { success: false, error: 'Failed to resolve pronouns' };
    }
  }

  /**
   * Analyze text for visual details
   */
  static async analyzeTextForDetails(
    sessionId: string,
    text: string,
    pageNumber: number
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'analyze-details',
          sessionId,
          text,
          pageNumber
        }
      });

      if (error) {
        console.error('Failed to analyze visual details:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Visual detail analysis error:', error);
      return { success: false, error: 'Failed to analyze visual details' };
    }
  }

  /**
   * Inject consistent details into text
   */
  static async injectConsistentDetails(
    sessionId: string,
    text: string,
    pageNumber: number
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'inject-details',
          sessionId,
          text,
          pageNumber
        }
      });

      if (error) {
        console.error('Failed to inject consistent details:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Detail injection error:', error);
      return { success: false, error: 'Failed to inject consistent details' };
    }
  }

  /**
   * Get visual details for prompt enhancement
   */
  static async getVisualDetailsForPrompt(
    sessionId: string,
    pageNumber?: number
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'get-prompt-details',
          sessionId,
          pageNumber
        }
      });

      if (error) {
        console.error('Failed to get visual details for prompt:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Prompt details retrieval error:', error);
      return { success: false, error: 'Failed to get visual details for prompt' };
    }
  }

  /**
   * Clear visual state for session cleanup
   */
  static async clearVisualState(sessionId: string): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'clear-state',
          sessionId
        }
      });

      if (error) {
        console.error('Failed to clear visual state:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Visual state clearing error:', error);
      return { success: false, error: 'Failed to clear visual state' };
    }
  }

  /**
   * Update story setting for consistency
   */
  static async updateSetting(
    sessionId: string,
    pageNumber: number,
    newSetting: Record<string, any>
  ): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'update-setting',
          sessionId,
          pageNumber,
          newSetting
        }
      });

      if (error) {
        console.error('Failed to update setting:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Setting update error:', error);
      return { success: false, error: 'Failed to update setting' };
    }
  }

  /**
   * Get setting for prompt enhancement
   */
  static async getSettingForPrompt(sessionId: string): Promise<VisualStateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-state-api', {
        body: {
          action: 'get-setting-prompt',
          sessionId
        }
      });

      if (error) {
        console.error('Failed to get setting for prompt:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Setting retrieval error:', error);
      return { success: false, error: 'Failed to get setting for prompt' };
    }
  }
}