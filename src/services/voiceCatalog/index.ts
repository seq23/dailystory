/**
 * STORY GENERATION SYSTEM - Voice Catalog Main Export
 * Advanced Voice Catalog (AVC) v1.1.0 Implementation
 * Purpose: Narrative style selection for story content generation
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 */

import { VoiceCatalogService } from './VoiceCatalogService';
import { DebugLogger } from '../DebugLogger';

export { CodebookService } from './CodebookService';
export { VoiceProcessor } from './VoiceProcessor';
export { VoiceCatalogService, type DifficultyLevel } from './VoiceCatalogService';
export { VoiceSelector } from './VoiceSelector';
export { VoiceCatalogIntegration } from './VoiceCatalogIntegration';
export { ThemeLibraryService } from './ThemeLibraryService';

export type {
  GlobalCodebook,
  VoiceDefinition,
  ProcessedVoice,
  VoiceSelectionResult,
  LevelFile,
  DeltaLevelFile
} from './types';

// Quick setup function
export async function initializeVoiceCatalog() {
  DebugLogger.log('performance', 'Voice Catalog System initialized with AVC v1.1.0');
  const stats = await VoiceCatalogService.getCatalogStats();
  DebugLogger.log('performance', 'Catalog stats', stats);
  return stats;
}