/**
 * Voice Catalog System - Main Export
 * Advanced Voice Catalog (AVC) v1.1.0 Implementation
 */

import { VoiceCatalogService } from './VoiceCatalogService';

export { CodebookService } from './CodebookService';
export { VoiceProcessor } from './VoiceProcessor';
export { VoiceCatalogService, type DifficultyLevel } from './VoiceCatalogService';
export { VoiceSelector } from './VoiceSelector';
export { VoiceCatalogIntegration } from './VoiceCatalogIntegration';

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
  console.log('🎭 Voice Catalog System initialized with AVC v1.1.0');
  const stats = await VoiceCatalogService.getCatalogStats();
  console.log('📊 Catalog stats:', stats);
  return stats;
}