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

      console.log(`🎤 ElevenLabs response received (attempt ${attempt}):`, {
        dataType: typeof data,
        hasAudio: !!data?.audio,
        hasError: !!data?.error,
        audioLength: data?.audio?.length,
        size: data?.size
      });

      // Check for error response from edge function
      if (data?.error) {
        console.error(`🎤 ElevenLabs edge function error (attempt ${attempt}):`, data.error);
        throw new Error(data.error);
      }

      // Handle JSON response with base64 audio (new format)
      if (data?.audio) {
        try {
          const binaryString = atob(data.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBuffer = bytes.buffer;
          console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
            audioSize: audioBuffer.byteLength,
            format: 'JSON base64',
            expectedSize: data.size
          });
          return audioBuffer;
        } catch (error) {
          console.error(`🎤 Base64 decode error from JSON (attempt ${attempt}):`, error);
          throw new Error(`Base64 decoding failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Legacy fallback for direct ArrayBuffer responses
      if (data instanceof ArrayBuffer) {
        console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
          audioSize: data.byteLength,
          format: 'ArrayBuffer (legacy)'
        });
        return data;
      }
      
      if (data instanceof Uint8Array) {
        console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
          audioSize: data.byteLength,
          format: 'Uint8Array (legacy)'
        });
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      }
      
      if (typeof data === 'string') {
        try {
          const audioBuffer = safeBase64Decode(data);
          console.log(`✅ ElevenLabs TTS success (attempt ${attempt}):`, {
            audioSize: audioBuffer.byteLength,
            format: 'base64 string (legacy)'
          });
          return audioBuffer;
        } catch (error) {
          console.error(`🎤 Base64 decode error (attempt ${attempt}):`, error);
          throw new Error(`Base64 decoding failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      throw new Error(`Unexpected audio data format from edge function: ${typeof data}`);

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
