/**
 * React hook for character consistency management
 * 
 * **CURRENT STATUS**: Mock implementation - actual functionality handled by backend
 * 
 * **Backend Implementation**: 
 * - Visual detail tracking: supabase/functions/_shared/VisualDetailTracker.js
 * - Character consistency: supabase/functions/_shared/CharacterConsistencyService.js
 * - Database schema: character_traits and visual_details tables
 * 
 * **Frontend CharacterConsistencyService**: DEPRECATED - do not use
 * 
 * This hook provides mock data until full backend integration is complete.
 * Real character consistency is handled server-side for security and performance.
 */

import { useState, useEffect, useCallback } from 'react';
import { DebugLogger } from '@/services/DebugLogger';
// CharacterConsistencyService now backend-only - this hook provides mock data
import { type VisualDetail, type AppearanceConflict } from '@/types/visualDetailTypes';

interface CharacterTraits {
  visual_traits: {
    hairColor: string;
    hairStyle: string;
    skinTone: string;
    facialFeatures: string[];
    clothingStyle: string;
    accessories: string[];
  };
}

interface SecondaryCharacter {
  name: string;
  relationship: string;
  traits: {
    hairColor: string;
    skinTone: string;
    facialFeatures: string[];
  };
}

interface UseCharacterConsistencyOptions {
  userId: string;
  characterName: string;
  sessionId?: string;
}

export const useCharacterConsistency = ({ userId, characterName, sessionId }: UseCharacterConsistencyOptions) => {
  const [traits, setTraits] = useState<CharacterTraits | null>(null);
  const [secondaryCharacters, setSecondaryCharacters] = useState<SecondaryCharacter[]>([]);
  const [visualHistory, setVisualHistory] = useState<VisualDetail[]>([]);
  const [conflicts, setConflicts] = useState<AppearanceConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [consistencyScore, setConsistencyScore] = useState(1.0);

  // Load character traits on mount
  useEffect(() => {
    const loadCharacterData = async () => {
      setLoading(true);
      try {
        DebugLogger.log('story', `🔄 useCharacterConsistency: Loading data for ${characterName}`, { userId });

        // For now, return mock data until database is ready
        setTraits({
          visual_traits: {
            hairColor: 'brown',
            hairStyle: 'curly',
            skinTone: 'medium',
            facialFeatures: ['friendly eyes'],
            clothingStyle: 'casual',
            accessories: []
          }
        });
        setSecondaryCharacters([]);
        setVisualHistory([]);
        setConsistencyScore(1.0);

        DebugLogger.log('story', `✅ useCharacterConsistency: Mock data loaded`, { 
          userId, 
          characterName,
          hasTraits: true,
          secondaryCount: 0,
          historyCount: 0,
          consistencyScore: 1.0
        });
      } catch (error) {
        DebugLogger.error('story', `❌ useCharacterConsistency: Failed to load data`, { error, userId, characterName });
      } finally {
        setLoading(false);
      }
    };

    if (userId && characterName) {
      loadCharacterData();
    }
  }, [userId, characterName]);

  // Save character traits
  const saveTraits = useCallback(async (newTraits: CharacterTraits['visual_traits']) => {
    try {
      DebugLogger.log('story', `💾 useCharacterConsistency: Saving traits`, { userId, characterName });
      
      // Mock implementation until database is ready
      setTraits({ visual_traits: newTraits });
      return true;
    } catch (error) {
      DebugLogger.error('story', `❌ useCharacterConsistency: Failed to save traits`, { error, userId, characterName });
      return false;
    }
  }, [userId, characterName]);

  // Add secondary character
  const addSecondaryCharacter = useCallback(async (character: SecondaryCharacter) => {
    try {
      DebugLogger.log('story', `👥 useCharacterConsistency: Adding secondary character`, { userId, characterName, secondary: character.name });
      
      setSecondaryCharacters(prev => [...prev, character]);
      return true;
    } catch (error) {
      DebugLogger.error('story', `❌ useCharacterConsistency: Failed to add secondary character`, { error, userId, characterName, character });
      return false;
    }
  }, [userId, characterName]);

  // Track visual detail
  const trackVisualDetail = useCallback(async (detail: Omit<VisualDetail, 'id' | 'generated_at'>) => {
    try {
      DebugLogger.log('image', `👁️ useCharacterConsistency: Tracking visual detail`, { userId, characterName });
      
      // Mock implementation
      return true;
    } catch (error) {
      DebugLogger.error('image', `❌ useCharacterConsistency: Failed to track visual detail`, { error, userId, characterName });
      return false;
    }
  }, [userId, characterName]);

  // Resolve appearance conflicts
  const resolveConflicts = useCallback(async () => {
    try {
      if (conflicts.length === 0) return null;

      DebugLogger.log('image', `🔧 useCharacterConsistency: Resolving conflicts`, { userId, characterName, conflictCount: conflicts.length });
      
      setConflicts(prev => prev.map(c => ({ ...c, resolved: true })));
      return {};
    } catch (error) {
      DebugLogger.error('image', `❌ useCharacterConsistency: Failed to resolve conflicts`, { error, userId, characterName });
      return null;
    }
  }, [conflicts, userId, characterName]);

  // Extract traits from story text
  const extractTraitsFromStory = useCallback((storyText: string) => {
    // Mock implementation - extract basic traits from story text
    return {
      hairColor: 'brown',
      hairStyle: 'curly', 
      skinTone: 'medium',
      facialFeatures: ['friendly eyes'],
      clothingStyle: 'casual',
      accessories: []
    };
  }, [characterName]);

  // Generate visual description
  const generateVisualDescription = useCallback((characterTraits?: CharacterTraits['visual_traits']) => {
    const traitsToUse = characterTraits || traits?.visual_traits;
    if (!traitsToUse) return '';
    
    return `${traitsToUse.hairColor} ${traitsToUse.hairStyle} hair, ${traitsToUse.skinTone} skin tone, ${traitsToUse.clothingStyle} clothing`;
  }, [traits, characterName]);

  return {
    // Data
    traits,
    secondaryCharacters,
    visualHistory,
    conflicts,
    consistencyScore,
    loading,
    
    // Actions
    saveTraits,
    addSecondaryCharacter,
    trackVisualDetail,
    resolveConflicts,
    extractTraitsFromStory,
    generateVisualDescription,
    
    // Computed values
    hasTraits: !!traits,
    hasConflicts: conflicts.length > 0,
    unresolvedConflicts: conflicts.filter(c => !c.resolved).length
  };
};