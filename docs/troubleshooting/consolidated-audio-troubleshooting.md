# Consolidated Audio Troubleshooting Guide

This guide covers troubleshooting for the Phase 4 consolidated audio system using CharlotteVoiceService, useAudioControls, and UnifiedDebugMonitor.

## Quick Diagnosis

### 1. Check System Status
```javascript
// Use UnifiedDebugMonitor to check overall status
const debugMonitor = new UnifiedDebugMonitor();
debugMonitor.getSystemStatus();
```

### 2. Audio Not Playing
**Symptoms:**
- Text-to-speech not working
- No audio output
- Silent playback

**Solutions:**
1. **Check Audio Permissions:**
   ```javascript
   // Verify audio context state
   if (charlotteVoiceService.canUseAudio()) {
     console.log("Audio permissions granted");
   } else {
     console.log("Audio permissions denied or unavailable");
   }
   ```

2. **Verify TTS Provider:**
   ```javascript
   // Check if ElevenLabs or OpenAI TTS is responding
   const status = await charlotteVoiceService.testTTSProvider();
   console.log("TTS Provider Status:", status);
   ```

3. **Mobile Audio Context:**
   ```javascript
   // For mobile devices, ensure audio context is resumed
   if (typeof window !== 'undefined' && window.AudioContext) {
     const audioContext = new AudioContext();
     if (audioContext.state === 'suspended') {
       await audioContext.resume();
     }
   }
   ```

### 3. Word Highlighting Not Working
**Symptoms:**
- Text not highlighting during playback
- Incorrect word synchronization
- Highlighting out of sync

**Solutions:**
1. **Check useAudioControls Configuration:**
   ```javascript
   const { isHighlighting, currentWordIndex } = useAudioControls({
     text: "Your story text",
     enableHighlighting: true, // Ensure this is true
     difficulty: "medium"
   });
   ```

2. **Verify Content Hash:**
   ```javascript
   // Ensure content has proper hash for caching
   const contentHash = charlotteVoiceService.generateContentHash(text);
   console.log("Content Hash:", contentHash);
   ```

### 4. Voice Commands Not Responding
**Symptoms:**
- Voice commands not recognized
- Commands work inconsistently
- ElevenLabs agent not responding

**Solutions:**
1. **Check Agent Configuration:**
   ```javascript
   // Verify ElevenLabs agent tools are properly configured
   const requiredTools = ['play', 'stop', 'pause', 'next', 'previous', 'wordHelp'];
   // Ensure all tools are added to your ElevenLabs agent
   ```

2. **Test Voice Recognition:**
   ```javascript
   // Use UnifiedDebugMonitor to test voice input
   debugMonitor.testVoiceInput();
   ```

## Common Error Messages

### "TTS Provider Error"
**Cause:** API key issues or network connectivity
**Solution:**
```javascript
// Check API key configuration
if (!process.env.ELEVENLABS_API_KEY && !process.env.OPENAI_API_KEY) {
  console.error("No TTS API keys configured");
}

// Test connectivity
const connectivity = await charlotteVoiceService.testConnectivity();
console.log("Connectivity:", connectivity);
```

### "Audio Context Suspended"
**Cause:** Browser requires user interaction to start audio
**Solution:**
```javascript
// Ensure audio starts after user interaction
document.addEventListener('click', async () => {
  await charlotteVoiceService.initializeAudioContext();
}, { once: true });
```

### "Content Validation Failed"
**Cause:** Text content doesn't meet validation requirements
**Solution:**
```javascript
// Check content validation
const isValid = charlotteVoiceService.validateContent(text);
if (!isValid) {
  console.error("Content failed validation - may be too long or contain invalid characters");
}
```

## Performance Issues

### 1. Slow TTS Generation
**Symptoms:**
- Long delays before audio plays
- Timeouts during generation

**Solutions:**
1. **Optimize Text Length:**
   ```javascript
   // Break long text into smaller chunks
   const chunks = charlotteVoiceService.chunkText(longText, 500);
   for (const chunk of chunks) {
     await charlotteVoiceService.playTextWithSynchronization(chunk);
   }
   ```

2. **Enable Caching:**
   ```javascript
   // Ensure audio caching is enabled
   const audioControls = useAudioControls({
     text: content,
     enableCaching: true,
     cacheExpiry: 86400000 // 24 hours
   });
   ```

### 2. Memory Issues on Mobile
**Symptoms:**
- App crashes on mobile devices
- Audio stuttering
- High memory usage

**Solutions:**
1. **Configure Mobile Optimizations:**
   ```javascript
   // Enable mobile-specific optimizations
   charlotteVoiceService.configure({
     mobile: {
       enableOptimizations: true,
       maxConcurrentRequests: 2,
       bufferSize: 4096,
       clearCacheOnBackground: true
     }
   });
   ```

2. **Manage Audio Cache:**
   ```javascript
   // Clear cache when memory is low
   if (performance.memory && performance.memory.usedJSHeapSize > 50000000) {
     charlotteVoiceService.clearCache();
   }
   ```

## Debug Tools and Logging

### 1. Enable Debug Mode
```javascript
// Enable comprehensive debugging
const debugMonitor = new UnifiedDebugMonitor({
  enableLogging: true,
  enableTesting: true,
  enableMetrics: true
});
```

### 2. Monitor Audio Events
```javascript
// Listen for audio events
charlotteVoiceService.addEventListener('tts:start', (event) => {
  console.log('TTS Started:', event.detail);
});

charlotteVoiceService.addEventListener('tts:error', (event) => {
  console.error('TTS Error:', event.detail);
});
```

### 3. Performance Monitoring
```javascript
// Monitor performance metrics
const metrics = charlotteVoiceService.getPerformanceMetrics();
console.log('Audio Performance:', metrics);
```

## Environment-Specific Issues

### Development Environment
- Ensure HTTPS is used (required for audio/microphone access)
- Check that all environment variables are properly loaded
- Verify local network connectivity to TTS services

### Production Environment
- Confirm API keys are properly configured in production
- Check CSP headers allow audio playback
- Verify CDN configuration for audio assets

### Mobile Browsers
- Test audio permissions on first user interaction
- Ensure proper audio context management
- Verify mobile-specific optimizations are enabled

## Emergency Fallbacks

### 1. TTS Service Fallback Chain
```javascript
// CharlotteVoiceService automatically handles fallbacks:
// 1. ElevenLabs TTS (primary)
// 2. OpenAI TTS (secondary)
// 3. Browser Speech Synthesis (emergency)
```

### 2. Manual Fallback Testing
```javascript
// Test each fallback manually
const testFallbacks = async () => {
  try {
    await charlotteVoiceService.testElevenLabs();
  } catch (error) {
    console.log("ElevenLabs failed, testing OpenAI...");
    try {
      await charlotteVoiceService.testOpenAI();
    } catch (error) {
      console.log("OpenAI failed, using browser synthesis...");
      await charlotteVoiceService.useBrowserSynthesis();
    }
  }
};
```

## Getting Help

1. **Check UnifiedDebugMonitor:** Use the built-in debug tools for real-time diagnosis
2. **Review Console Logs:** Audio events are logged with detailed information
3. **Test with Minimal Configuration:** Strip down to basic useAudioControls setup
4. **Verify Dependencies:** Ensure all required packages are properly installed

## Reporting Issues

When reporting audio issues, include:
- Browser and device information
- Console error messages
- UnifiedDebugMonitor output
- Steps to reproduce the problem
- Whether the issue occurs on first load or during navigation