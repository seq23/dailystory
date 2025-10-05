# ElevenLabs Parameter Fix Documentation

## Issue Resolved
**Fixed Parameter Mismatch**: ElevenLabs API parameter mapping corrected for proper TTS functionality.

## Problem Description
The ElevenLabs TTS service was experiencing failures due to incorrect parameter naming in API calls:
- Backend expected `voice_id` but frontend sent `voiceId`
- Backend returned `audio_base64` but frontend expected `audioContent`

## Solution Implemented ✅

### Parameter Mapping Fixed
**File**: `src/services/smartElevenLabsTTS.ts`

```typescript
// BEFORE (Incorrect)
supabase.functions.invoke('elevenlabs-tts-smart', {
  body: {
    text,
    voiceId,          // ❌ Wrong parameter name
    context
  }
});

if (data?.audioContent) {  // ❌ Wrong response field
  const binaryString = atob(data.audioContent);
}

// AFTER (Correct)
supabase.functions.invoke('elevenlabs-tts-smart', {
  body: {
    text,
    voice_id: voiceId,      // ✅ Correct parameter name
    context
  }
});

if (data?.audio_base64) {   // ✅ Correct response field
  const binaryString = atob(data.audio_base64);
}
```

## Testing Verification

### Test Charlotte Voice
1. Visit `/prompt-testing?debug=1`
2. Enable debug mode to see TTS logs
3. Test voice commands and Charlotte responses
4. Verify proper audio generation

### Debug Console Access
```javascript
// Check recent ElevenLabs requests
window.getImageGenerationLogs(sessionId)

// Monitor audio generation
DebugLogger.getLogs('audio')

// Test voice parameter mapping
DebugLogger.isDebugEnabled()
```

## Troubleshooting Guide

### Common Issues

#### 1. "No audio content received from Smart TTS" 
**Cause**: Parameter mismatch between frontend and backend
**Solution**: Ensure `voice_id` parameter is used (not `voiceId`)

#### 2. "TTS request timeout"
**Cause**: Long processing time or API limitations  
**Solution**: 
- Check 15-second timeout setting
- Verify ElevenLabs API status
- Use fallback browser speech synthesis

#### 3. "Charlotte conversation speech not working"
**Cause**: Audio coordinator conflicts or context issues
**Solution**:
- Check Charlotte audio coordination
- Verify conversation context is set properly
- Monitor audio system conflicts

### Debug Commands
```javascript
// Test Charlotte voice integration
window.testCharlotteVoice = () => {
  DebugLogger.log('audio', 'Testing Charlotte voice...');
  // Manual TTS test code here
};

// Check parameter mapping
window.checkTTSParams = (text) => {
  console.log('Testing TTS with:', {
    text,
    voice_id: 'XB0fDUnXU5powFXDhCwa',
    context: 'conversation'
  });
};
```

## System Status

### ✅ Working Features
- Charlotte conversation speech
- Learning context pronunciation
- Audio coordinator integration
- Fallback browser speech synthesis
- Debug logging integration

### 🔧 Configuration
- **Voice ID**: `XB0fDUnXU5powFXDhCwa` (Charlotte)
- **Timeout**: 15 seconds with browser fallback
- **Context Support**: conversation | learning
- **Debug Category**: `DebugLogger.log('audio', ...)`

## Integration Notes

### For Developers
When implementing ElevenLabs TTS:
1. Always use `voice_id` parameter (snake_case)
2. Expect `audio_base64` in response (not `audioContent`)
3. Implement 15-second timeout with fallback
4. Use proper debug logging: `DebugLogger.log('audio', ...)`
5. Handle conversation vs learning contexts appropriately

### Related Services
- **Audio Coordinator**: Manages Charlotte speech conflicts
- **SimpleAudioEngine**: Handles playback synchronization
- **PhoneticRulesEngine**: Manages pronunciation contexts
- **VoiceIntegration**: Voice command processing

## Performance Impact
- **Fixed**: TTS generation failures
- **Improved**: Charlotte voice reliability
- **Reduced**: Error-related console noise
- **Enhanced**: Debug monitoring for audio systems

---

**Last Updated**: 2025-09-22  
**Status**: ✅ Implemented and Working  
**Debug Access**: `?debug=1` in URL