/**
 * React hook for character consistency management
 * Note: Requires database migration for character_traits and visual_details tables
 */

import { useState, useEffect, useCallback } from 'react';
import { DebugLogger } from '@/services/DebugLogger';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    DebugLogger.log('story', `🔄 useCharacterConsistency: Hook initialized for ${characterName}`, { userId });
    // Database integration pending migration
  }, [userId, characterName]);

  const saveTraits = useCallback(async (newTraits: CharacterTraits['visual_traits']) => {
    DebugLogger.log('story', `💾 useCharacterConsistency: Save traits requested`, { userId, characterName });
    // Implementation pending database migration
    return false;
  }, [userId, characterName]);

  return {
    traits,
    loading,
    saveTraits,
    hasTraits: !!traits,
    hasConflicts: false,
    unresolvedConflicts: 0
  };
};

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

        // Load main character traits
        const characterTraits = await characterConsistencyService.getCharacterTraits(userId, characterName);
        setTraits(characterTraits);

        // Load secondary characters
        const secondaries = await characterConsistencyService.getSecondaryCharacters(userId, characterName);
        setSecondaryCharacters(secondaries);

        // Load visual history
        const history = await visualDetailTracker.getVisualHistory(userId, characterName);
        setVisualHistory(history);

        // Get consistency recommendations
        const { consistencyScore: score } = await visualDetailTracker.getConsistencyRecommendations(userId, characterName);
        setConsistencyScore(score);

        DebugLogger.log('story', `✅ useCharacterConsistency: Data loaded successfully`, { 
          userId, 
          characterName,
          hasTraits: !!characterTraits,
          secondaryCount: secondaries.length,
          historyCount: history.length,
          consistencyScore: score
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
      
      const success = await characterConsistencyService.saveCharacterTraits(userId, characterName, newTraits);
      if (success) {
        // Reload traits to get updated data
        const updatedTraits = await characterConsistencyService.getCharacterTraits(userId, characterName);
        setTraits(updatedTraits);
        return true;
      }
      return false;
    } catch (error) {
      DebugLogger.error('story', `❌ useCharacterConsistency: Failed to save traits`, { error, userId, characterName });
      return false;
    }
  }, [userId, characterName]);

  // Add secondary character
  const addSecondaryCharacter = useCallback(async (character: SecondaryCharacter) => {
    try {
      DebugLogger.log('story', `👥 useCharacterConsistency: Adding secondary character`, { userId, characterName, secondary: character.name });
      
      const success = await characterConsistencyService.addSecondaryCharacter(userId, characterName, character);
      if (success) {
        setSecondaryCharacters(prev => [...prev, character]);
        return true;
      }
      return false;
    } catch (error) {
      DebugLogger.error('story', `❌ useCharacterConsistency: Failed to add secondary character`, { error, userId, characterName, character });
      return false;
    }
  }, [userId, characterName]);

  // Track visual detail
  const trackVisualDetail = useCallback(async (detail: Omit<VisualDetail, 'id' | 'generated_at'>) => {
    try {
      DebugLogger.log('image', `👁️ useCharacterConsistency: Tracking visual detail`, { userId, characterName });
      
      const success = await visualDetailTracker.trackVisualDetail(detail);
      if (success) {
        // Check for conflicts
        const detectedConflicts = await visualDetailTracker.detectAppearanceConflicts(
          userId, 
          characterName, 
          detail.visual_elements
        );
        setConflicts(detectedConflicts);
        
        // Update visual history
        const updatedHistory = await visualDetailTracker.getVisualHistory(userId, characterName);
        setVisualHistory(updatedHistory);
        
        return true;
      }
      return false;
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
      
      const resolvedElements = await visualDetailTracker.resolveConflicts(conflicts, userId, characterName);
      setConflicts(prev => prev.map(c => ({ ...c, resolved: true })));
      
      return resolvedElements;
    } catch (error) {
      DebugLogger.error('image', `❌ useCharacterConsistency: Failed to resolve conflicts`, { error, userId, characterName });
      return null;
    }
  }, [conflicts, userId, characterName]);

  // Extract traits from story text
  const extractTraitsFromStory = useCallback((storyText: string) => {
    return characterConsistencyService.extractTraitsFromStory(storyText, characterName);
  }, [characterName]);

  // Generate visual description
  const generateVisualDescription = useCallback((characterTraits?: CharacterTraits['visual_traits']) => {
    const traitsToUse = characterTraits || traits?.visual_traits;
    if (!traitsToUse) return '';
    
    return characterConsistencyService.generateVisualDescription(traitsToUse, characterName);
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