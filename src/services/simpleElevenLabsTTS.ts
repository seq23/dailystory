import { supabase } from '@/integrations/supabase/client';

/**
 * Minimal ElevenLabs TTS client via Supabase Edge Function.
 * Defaults to Charlotte and Turbo v2.5 unless overridden.
 */
export async function fetchElevenLabsAudioArrayBuffer(text: string, voiceId?: string, modelId?: string): Promise<ArrayBuffer> {
  if (!text || !text.trim()) throw new Error('Text is required');

  const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
    body: {
      text,
      voice: voiceId, // edge function will default to Charlotte
      model: modelId, // edge function will default to eleven_turbo_v2_5
    },
  });

  if (error) throw new Error(error.message || 'TTS generation failed');
  if (!data) throw new Error('No audio data received from TTS service');

  // Normalize possible response types (ArrayBuffer | Uint8Array | base64 string)
  if (data instanceof ArrayBuffer) return data;
  if (data instanceof Uint8Array) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }
  if (typeof data === 'string') {
    try {
      // Enhanced base64 decoding with UTF-8 support
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error('Base64 decode error:', error);
      throw new Error(`Invalid base64 audio data: ${error.message}`);
    }
  }

  // As a last resort, try to extract from Response-like object
  try {
    if (typeof (data as any).arrayBuffer === 'function') {
      return await (data as any).arrayBuffer();
    }
  } catch {}

  throw new Error('Unexpected audio data format from edge function');
}
