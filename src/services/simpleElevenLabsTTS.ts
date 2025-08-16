import { supabase } from '@/integrations/supabase/client';
import { safeBase64Decode } from '@/utils/base64Decoder';

/**
 * Enhanced ElevenLabs TTS client with better error handling and retries.
 * Defaults to Charlotte and Turbo v2.5 unless overridden.
 */
export async function fetchElevenLabsAudioArrayBuffer(text: string, voiceId?: string, modelId?: string): Promise<ArrayBuffer> {
  if (!text || !text.trim()) throw new Error('Text is required');

  const maxRetries = 2;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎤 ElevenLabs TTS attempt ${attempt}/${maxRetries}:`, {
        textLength: text.length,
        voice: voiceId || 'Charlotte (default)',
        model: modelId || 'eleven_turbo_v2_5 (default)',
        textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
      });

      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text,
          voice: voiceId, // edge function will default to Charlotte
          model: modelId, // edge function will default to eleven_turbo_v2_5
        },
      });

      if (error) {
        console.error(`🎤 ElevenLabs API error (attempt ${attempt}):`, error);
        throw new Error(error.message || 'TTS generation failed');
      }
      
      if (!data) {
        console.error(`🎤 No audio data received (attempt ${attempt})`);
        throw new Error('No audio data received from TTS service');
      }

      // Normalize possible response types (ArrayBuffer | Uint8Array | base64 string)
      if (data instanceof ArrayBuffer) {
        console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
          audioSize: data.byteLength,
          format: 'ArrayBuffer'
        });
        return data;
      }
      
      if (data instanceof Uint8Array) {
        console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
          audioSize: data.byteLength,
          format: 'Uint8Array'
        });
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      }
      
      if (typeof data === 'string') {
        try {
          const audioBuffer = safeBase64Decode(data);
          console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
            audioSize: audioBuffer.byteLength,
            format: 'base64 decoded'
          });
          return audioBuffer;
        } catch (error) {
          console.error(`🎤 Base64 decode error (attempt ${attempt}):`, error);
          throw new Error(`Base64 decoding failed: ${error.message}`);
        }
      }

      // As a last resort, try to extract from Response-like object
      try {
        if (typeof (data as any).arrayBuffer === 'function') {
          const audioBuffer = await (data as any).arrayBuffer();
          console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
            audioSize: audioBuffer.byteLength,
            format: 'Response object'
          });
          return audioBuffer;
        }
      } catch (responseError) {
        console.error(`🎤 Response extraction error (attempt ${attempt}):`, responseError);
      }

      throw new Error('Unexpected audio data format from edge function');

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`🎤 ElevenLabs attempt ${attempt} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        console.error('🎤 All ElevenLabs attempts failed, will fallback to browser speech');
        throw lastError;
      }
      
      // Wait before retry with exponential backoff
      const retryDelay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
      console.log(`🎤 Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError!;
}
