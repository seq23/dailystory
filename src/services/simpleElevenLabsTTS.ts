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
      // UTF-8 safe base64 decoder without atob()
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const base64Map = new Map();
      for (let i = 0; i < base64Chars.length; i++) {
        base64Map.set(base64Chars[i], i);
      }

      // Remove padding and validate
      const cleanData = data.replace(/=/g, '');
      const bytes = new Uint8Array(Math.floor(cleanData.length * 3 / 4));
      
      let byteIndex = 0;
      for (let i = 0; i < cleanData.length; i += 4) {
        const b1 = base64Map.get(cleanData[i]) || 0;
        const b2 = base64Map.get(cleanData[i + 1]) || 0;
        const b3 = base64Map.get(cleanData[i + 2]) || 0;
        const b4 = base64Map.get(cleanData[i + 3]) || 0;

        const bitmap = (b1 << 18) | (b2 << 12) | (b3 << 6) | b4;
        
        if (byteIndex < bytes.length) bytes[byteIndex++] = (bitmap >> 16) & 255;
        if (byteIndex < bytes.length) bytes[byteIndex++] = (bitmap >> 8) & 255;
        if (byteIndex < bytes.length) bytes[byteIndex++] = bitmap & 255;
      }
      
      return bytes.buffer;
    } catch (error) {
      console.error('UTF-8 safe base64 decode error:', error);
      throw new Error(`Base64 decoding failed: ${error.message}`);
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
