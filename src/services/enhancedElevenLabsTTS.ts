import { supabase } from '@/integrations/supabase/client';
import { withTimeout, TIMEOUT_CONFIGS } from '@/utils/networkTimeout';
import { safeBase64Decode } from '@/utils/base64Decoder';
import { DebugLogger } from '@/services/DebugLogger';
import { ManagedTimers } from '@/utils/TimerManager';

/**
 * Enhanced ElevenLabs TTS client with improved reliability and error handling
 */

interface TTSOptions {
  text: string;
  voice?: string;
  model?: string;
  stabilization?: number; // seconds to wait for audio to stabilize
  signal?: AbortSignal;
}

interface TTSResult {
  audioData: ArrayBuffer;
  contentHash: string;
  stabilized: boolean;
}

export class EnhancedElevenLabsTTS {
  private static readonly DEFAULT_VOICE = 'XB0fDUnXU5powFXDhCwa'; // Charlotte
  private static readonly DEFAULT_MODEL = 'eleven_turbo_v2_5';
  private static readonly DEFAULT_STABILIZATION = 4; // 4 seconds for better reliability
  private static readonly MAX_RETRIES = 2;

  /**
   * Sanitize text for ElevenLabs TTS to handle non-Latin characters
   */
  private static sanitizeText(text: string): string {
    // Remove or replace problematic characters that can cause TTS failures
    return text
      // Replace smart quotes with regular quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Remove or replace non-printable characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
      // Handle common unicode characters
      .replace(/[^\x00-\x7F]/g, (char) => {
        // Replace common accented characters
        const replacements: Record<string, string> = {
          'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a',
          'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
          'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
          'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
          'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
          'ç': 'c', 'ñ': 'n'
        };
        return replacements[char.toLowerCase()] || char;
      })
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate content hash for caching and consistency
   */
  private static generateContentHash(text: string, voice: string, model: string): string {
    const content = `${text}-${voice}-${model}`;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Wait for audio to stabilize before returning
   */
  private static async waitForStabilization(stabilizationTime: number): Promise<void> {
    if (stabilizationTime > 0) {
      await new Promise(resolve => setTimeout(resolve, stabilizationTime * 1000));
    }
  }

  /**
   * Generate TTS audio with enhanced reliability
   */
  static async generateAudio(options: TTSOptions): Promise<TTSResult> {
    const {
      text,
      voice = this.DEFAULT_VOICE,
      model = this.DEFAULT_MODEL,
      stabilization = this.DEFAULT_STABILIZATION,
      signal
    } = options;

    if (!text?.trim()) {
      throw new Error('Text is required for TTS generation');
    }

    // Sanitize text for better TTS compatibility
    const sanitizedText = this.sanitizeText(text);
    const contentHash = this.generateContentHash(sanitizedText, voice, model);

    DebugLogger.log('audio', 'Enhanced TTS generation', {
      originalText: text,
      sanitizedText,
      voice,
      model,
      stabilization,
      contentHash
    });

    const generateWithRetry = async (attempt: number = 1): Promise<ArrayBuffer> => {
      try {
        DebugLogger.log('audio', `TTS attempt ${attempt}/${this.MAX_RETRIES + 1}`);
        
        const { data, error } = await withTimeout(
          () => supabase.functions.invoke('elevenlabs-tts', {
            body: {
              text: sanitizedText,
              voice,
              model,
            },
          }),
          TIMEOUT_CONFIGS.TTS_REQUEST
        );

        if (error) {
          throw new Error(`TTS API error: ${error.message || JSON.stringify(error)}`);
        }

        if (!data) {
          throw new Error('No audio data received from TTS service');
        }

        // Normalize response format
        let audioData: ArrayBuffer;
        if (data instanceof ArrayBuffer) {
          audioData = data;
        } else if (data instanceof Uint8Array) {
          audioData = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
        } else if (typeof data === 'string') {
          // Handle base64 encoded response with UTF-8 safe decoder
          audioData = safeBase64Decode(data);
        } else if (data && typeof data.arrayBuffer === 'function') {
          audioData = await data.arrayBuffer();
        } else {
          throw new Error('Unexpected audio data format from TTS service');
        }

        // Validate audio data
        if (!audioData || audioData.byteLength === 0) {
          throw new Error('Received empty audio data');
        }

        DebugLogger.log('audio', `TTS generation successful on attempt ${attempt}`, {
          audioSize: audioData.byteLength,
          contentHash
        });

        return audioData;

      } catch (error) {
        DebugLogger.error('audio', `TTS attempt ${attempt} failed`, { error });
        
        if (attempt <= this.MAX_RETRIES && !signal?.aborted) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 5000);
          DebugLogger.log('audio', `Retrying TTS in ${delay}ms`);
          await new Promise(resolve => ManagedTimers.setTimeout(() => resolve(undefined), delay, 'enhancedElevenLabsTTS'));
          return generateWithRetry(attempt + 1);
        }
        
        throw error;
      }
    };

    // Check for abort signal
    if (signal?.aborted) {
      throw new Error('TTS generation was aborted');
    }

    // Generate audio with retries
    const audioData = await generateWithRetry();

    // Wait for stabilization if requested
    if (stabilization > 0) {
      DebugLogger.log('audio', `Stabilizing audio for ${stabilization}s`);
      await this.waitForStabilization(stabilization);
    }

    return {
      audioData,
      contentHash,
      stabilized: stabilization > 0
    };
  }

  /**
   * Quick generation without stabilization (for immediate playback)
   */
  static async generateAudioFast(text: string, options?: Partial<TTSOptions>): Promise<TTSResult> {
    return this.generateAudio({
      text,
      stabilization: 0,
      ...options
    });
  }

  /**
   * Stable generation with default stabilization (for consistent quality)
   */
  static async generateAudioStable(text: string, options?: Partial<TTSOptions>): Promise<TTSResult> {
    return this.generateAudio({
      text,
      stabilization: this.DEFAULT_STABILIZATION,
      ...options
    });
  }
}

export default EnhancedElevenLabsTTS;