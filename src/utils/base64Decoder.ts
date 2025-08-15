/**
 * UTF-8 safe base64 decoder that replaces atob() to avoid InvalidCharacterError
 * with non-ASCII characters in base64 strings from ElevenLabs API
 */
export function safeBase64Decode(base64String: string): ArrayBuffer {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const base64Map = new Map();
  for (let i = 0; i < base64Chars.length; i++) {
    base64Map.set(base64Chars[i], i);
  }

  // Remove padding and validate
  const cleanData = base64String.replace(/=/g, '');
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
}