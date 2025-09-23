/**
 * Audio utilities for OpenAI Realtime API
 * Handles PCM encoding, WAV conversion, and audio queue management
 */
import { DebugLogger } from '@/services/DebugLogger';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      DebugLogger.log('audio', 'Starting audio recording...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      DebugLogger.log('audio', 'Audio recording started');
    } catch (error) {
      DebugLogger.error('audio', 'Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    DebugLogger.log('audio', 'Stopping audio recording...');
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    DebugLogger.log('audio', 'Audio recording stopped');
  }
}

/**
 * Encode Float32Array audio data to base64 PCM16 for OpenAI API
 */
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

/**
 * Create WAV header for PCM audio data
 */
const createWavHeader = (dataLength: number, sampleRate: number = 24000): ArrayBuffer => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return header;
};

/**
 * Convert PCM data to WAV format
 */
export const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  DebugLogger.log('audio', 'Converting PCM to WAV', { size: pcmData.length });
  
  // Convert bytes to 16-bit samples (little endian)
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  const wavHeader = createWavHeader(int16Data.byteLength);
  const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
  
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
  
  DebugLogger.log('audio', 'WAV conversion complete', { finalSize: wavArray.length });
  return wavArray;
};

/**
 * Audio queue for sequential playback
 */
export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    DebugLogger.log('audio', 'AudioQueue initialized');
  }

  async addToQueue(audioData: Uint8Array) {
    DebugLogger.log('audio', 'Adding audio chunk to queue', { size: audioData.length });
    this.queue.push(audioData);
    
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      DebugLogger.log('audio', 'Audio queue empty, stopping playback');
      this.isPlaying = false;
      return;
    }

    DebugLogger.log('audio', 'Playing next audio chunk', { queueSize: this.queue.length });
    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        DebugLogger.log('audio', 'Audio chunk finished');
        this.playNext();
      };
      
      source.start(0);
      DebugLogger.log('audio', 'Audio chunk started');
    } catch (error) {
      DebugLogger.error('audio', 'Error playing audio chunk', error);
      this.playNext(); // Continue with next segment
    }
  }

  clear() {
    DebugLogger.log('audio', 'Clearing audio queue');
    this.queue = [];
    this.isPlaying = false;
  }
}

// Singleton audio queue instance
let audioQueueInstance: AudioQueue | null = null;

export const playAudioData = async (audioContext: AudioContext, audioData: Uint8Array) => {
  if (!audioQueueInstance) {
    audioQueueInstance = new AudioQueue(audioContext);
  }
  await audioQueueInstance.addToQueue(audioData);
};

export const clearAudioQueue = () => {
  if (audioQueueInstance) {
    audioQueueInstance.clear();
  }
};