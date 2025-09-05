import { VoiceDefinition, VoiceOverride } from './types';

// Import voice data from backend files
import beginnerData from '../../../supabase/functions/_shared/voice-catalog/voices-beginner.v1.json';
import easyOverrides from '../../../supabase/functions/_shared/voice-catalog/voices-easy.v1.json';
import mediumData from '../../../supabase/functions/_shared/voice-catalog/voices-medium.v1.json';
import hardData from '../../../supabase/functions/_shared/voice-catalog/voices-hard.v1.json';
import expertData from '../../../supabase/functions/_shared/voice-catalog/voices-expert.v1.json';

/**
 * Voice Data Loader
 * Loads voice definitions from JSON data files with complete 51-voice catalog
 */
export class VoiceDataLoader {
  
  // Load beginner voices from JSON data (18 voices)
  static loadBeginnerVoices(): VoiceDefinition[] {
    return beginnerData.voices;
  }

  // Load easy overrides from JSON data (18 overrides)
  static loadEasyOverrides(): VoiceOverride[] {
    return easyOverrides.overrides;
  }

  // Load medium voices from JSON data (12 voices)  
  static loadMediumVoices(): VoiceDefinition[] {
    return mediumData.voices;
  }

  // Load hard voices from JSON data (11 voices)
  static loadHardVoices(): VoiceDefinition[] {
    return hardData.voices;
  }

  // Load expert voices from JSON data (10 voices)
  static loadExpertVoices(): VoiceDefinition[] {
    return expertData.voices;
  }
}