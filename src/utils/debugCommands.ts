/**
 * Global Debug Commands - Console utilities for debugging
 */

import { DebugGateway } from '@/services/DebugGateway';
import { DebugLogger } from '@/services/DebugLogger';
import { TIMEOUT_CONFIGS } from '@/utils/networkTimeout';
import { extractImageUrl, extractSuccessValue } from '@/utils/typeGuards';

// Charlotte TTS Debug Commands
function debugCharlotte(): void {
  console.log('🎙️ Charlotte TTS Debug Information:');
  console.log('Timeout Settings:', TIMEOUT_CONFIGS.TTS_REQUEST);
  
  const charlotteService = (window as any).__CharlotteVoiceService;
  if (charlotteService) {
    console.log('Charlotte Service Status:', charlotteService.getStatus?.() || 'Available');
  } else {
    console.log('❌ Charlotte Service not available');
  }
  
  // Show recent audio logs
  const logs = DebugLogger.getLogs().filter(log => log.category === 'audio').slice(-5);
  console.log('Recent Audio Logs:', logs);
}

// Image Generation Debug Commands  
async function debugLastImage(): Promise<void> {
  console.log('🖼️ Fetching last generated image debug data...');
  
  try {
    const result = await DebugGateway.getLastGeneratedImage();
    const imageData = result.data?.imagePrompts?.[0];
    
    if (imageData) {
      console.log('Last Generated Image:', imageData);
      console.log('Success:', extractSuccessValue(imageData));
      console.log('Session ID:', imageData.sessionId);
      console.log('Tier Used:', imageData.tier);
      console.log('Image URL:', extractImageUrl(imageData));
    } else {
      console.log('❌ No recent image generation found');
    }
  } catch (error) {
    console.error('❌ Failed to fetch image debug data:', error);
  }
}

// Test Charlotte with custom text
async function testCharlotteTimeout(text: string = 'This is a test of Charlotte voice service timeout handling.'): Promise<void> {
  console.log(`🧪 Testing Charlotte timeout with text: "${text}"`);
  
  const startTime = Date.now();
  
  try {
    const charlotteService = (window as any).__CharlotteVoiceService;
    if (!charlotteService) {
      throw new Error('Charlotte service not available');
    }
    
    await charlotteService.charlotteInteractiveAudio({
      text,
      context: 'conversation'
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Charlotte test completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Charlotte test failed after ${duration}ms:`, error);
  }
}

// Get recent image generation logs
async function getImageGenerationLogs(count: number = 5): Promise<void> {
  console.log(`📸 Fetching last ${count} image generation attempts...`);
  
  try {
    const result = await DebugGateway.getRecentImagePrompts(count);
    const images = result.data?.imagePrompts || [];
    
    console.log(`Found ${images.length} recent image generations:`);
    images.forEach((img: any, index: number) => {
      console.log(`${index + 1}. Session: ${img.sessionId} | Success: ${img.success} | Tier: ${img.tier}`);
    });
  } catch (error) {
    console.error('❌ Failed to fetch image logs:', error);
  }
}

// Attach debug commands to window for global access
if (typeof window !== 'undefined') {
  (window as any).debugCharlotte = debugCharlotte;
  (window as any).debugLastImage = debugLastImage;
  (window as any).testCharlotteTimeout = testCharlotteTimeout;
  (window as any).getImageGenerationLogs = getImageGenerationLogs;
  
  // Show available commands
  console.log('🐛 Debug commands available:');
  console.log('  window.debugCharlotte() - Show Charlotte TTS debug info');
  console.log('  window.debugLastImage() - Show last generated image data');
  console.log('  window.testCharlotteTimeout(text) - Test Charlotte with custom text');
  console.log('  window.getImageGenerationLogs(count) - Get recent image logs');
}

export { debugCharlotte, debugLastImage, testCharlotteTimeout, getImageGenerationLogs };