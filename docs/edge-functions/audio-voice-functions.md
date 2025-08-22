# Audio and Voice Edge Functions Reference

## Overview

This document provides comprehensive reference for all audio and voice-related Supabase Edge Functions, including API contracts, authentication, error handling, and integration patterns.

## Function Index

1. [elevenlabs-tts](#elevenlabs-tts) - Basic TTS generation
2. [elevenlabs-tts-smart](#elevenlabs-tts-smart) - Context-aware TTS with dictionary support  
3. [elevenlabs-agent-signed-url](#elevenlabs-agent-signed-url) - Secure agent URL generation
4. [openai-realtime](#openai-realtime) - WebSocket proxy for OpenAI Realtime API
5. [elevenlabs-dictionary-manager](#elevenlabs-dictionary-manager) - Pronunciation dictionary management
6. [openai-tts](#openai-tts) - OpenAI text-to-speech generation
7. [voice-to-text](#voice-to-text) - Speech recognition processing

## Function Details

### elevenlabs-tts

**Purpose**: Basic text-to-speech generation using ElevenLabs API

**Location**: `supabase/functions/elevenlabs-tts/index.ts`

#### API Contract
```typescript
// Request
interface ElevenLabsTTSRequest {
  text: string;
  voice?: string; // Default: 'XB0fDUnXU5powFXDhCwa' (Charlotte)
  model?: string; // Default: 'eleven_turbo_v2'
}

// Response
interface ElevenLabsTTSResponse {
  audioData: string; // Base64 encoded MP3
  wordTimings: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}
```

#### Usage Example
```javascript
const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
  body: {
    text: 'Hello, this is a test of the text-to-speech system.',
    voice: 'XB0fDUnXU5powFXDhCwa',
    model: 'eleven_turbo_v2'
  }
});

if (error) {
  console.error('TTS generation failed:', error);
  return;
}

// Play the audio
const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
audio.play();
```

#### Error Handling
- **401**: Invalid or missing ElevenLabs API key
- **429**: Rate limit exceeded
- **400**: Invalid request parameters
- **500**: ElevenLabs API error or processing failure

### elevenlabs-tts-smart

**Purpose**: Context-aware TTS with pronunciation dictionary support

**Location**: `supabase/functions/elevenlabs-tts-smart/index.ts`

#### API Contract
```typescript
interface SmartTTSRequest {
  text: string;
  context: 'conversation' | 'learning';
  voice?: string;
  model?: string;
  pronunciation_dictionary?: string;
  user_id?: string;
}

interface SmartTTSResponse {
  audioData: string;
  wordTimings: WordTimestamp[];
  metadata: {
    model_used: string;
    voice_used: string;
    dictionary_applied?: string;
    processing_time: number;
  };
}
```

#### Context-Aware Features
- **Learning Context**: Optimized for educational content with slower pace
- **Conversation Context**: Natural speaking pace for dialogue  
- **Dictionary Integration**: Applies custom pronunciations
- **User Personalization**: Adapts to user preferences

#### Usage Example
```javascript
const { data, error } = await supabase.functions.invoke('elevenlabs-tts-smart', {
  body: {
    text: 'The knight rode through the night.',
    context: 'learning',
    pronunciation_dictionary: 'charlotte-learning-lexicon',
    user_id: userId
  }
});
```

### elevenlabs-agent-signed-url

**Purpose**: Generate secure signed URLs for ElevenLabs Conversational AI agents

**Location**: `supabase/functions/elevenlabs-agent-signed-url/index.ts`

#### API Contract
```typescript
interface AgentSignedUrlRequest {
  agentId?: string; // Optional, falls back to env variable
}

interface AgentSignedUrlResponse {
  signed_url: string;
  expires_at: string;
  agent_id: string;
}
```

#### Security Features
- Server-side API key management
- Signed URL generation with expiration
- Agent ID validation
- CORS protection

#### Usage Example
```javascript
const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', {
  body: { agentId: 'your-agent-id' }
});

if (data?.signed_url) {
  // Use with ElevenLabs React SDK
  await conversation.startSession({ url: data.signed_url });
}
```

### openai-realtime

**Purpose**: WebSocket proxy for OpenAI Realtime API with audio processing

**Location**: `supabase/functions/openai-realtime/index.ts`

#### WebSocket Protocol
```typescript
// Client -> Server messages
interface ClientMessage {
  type: 'session.update' | 'input_audio_buffer.append' | 'conversation.item.create';
  [key: string]: any;
}

// Server -> Client messages  
interface ServerMessage {
  type: 'response.audio.delta' | 'response.function_call_arguments.done' | 'session.created';
  [key: string]: any;
}
```

#### Audio Format Requirements
- **Input**: PCM16 at 24kHz, mono channel
- **Output**: PCM16 at 24kHz, mono channel  
- **Encoding**: Base64 for transmission

#### Connection Example
```javascript
const ws = new WebSocket(`wss://project-id.functions.supabase.co/functions/v1/openai-realtime`);

ws.onopen = () => {
  // Send session configuration
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        silence_duration_ms: 1000
      }
    }
  }));
};
```

### elevenlabs-dictionary-manager

**Purpose**: Manage pronunciation dictionaries for improved TTS accuracy

**Location**: `supabase/functions/elevenlabs-dictionary-manager/index.ts`

#### API Contract
```typescript
interface DictionaryRequest {
  action: 'upload' | 'list' | 'delete';
  dictionaryName?: string;
  dictionaryId?: string;
}

interface DictionaryResponse {
  success: boolean;
  dictionary_id?: string;
  dictionaries?: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
}
```

#### Usage Examples
```javascript
// Upload dictionary
await supabase.functions.invoke('elevenlabs-dictionary-manager', {
  body: {
    action: 'upload',
    dictionaryName: 'charlotte-learning-lexicon'
  }
});

// List dictionaries
const { data } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
  body: { action: 'list' }
});

// Delete dictionary
await supabase.functions.invoke('elevenlabs-dictionary-manager', {
  body: {
    action: 'delete', 
    dictionaryId: 'dict-id-here'
  }
});
```

### openai-tts

**Purpose**: Generate speech using OpenAI's text-to-speech API

**Location**: `supabase/functions/openai-tts/index.ts`

#### API Contract
```typescript
interface OpenAITTSRequest {
  text: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

interface OpenAITTSResponse {
  audioContent: string; // Base64 encoded audio
  format: string;
}
```

#### Voice Characteristics
- **alloy**: Balanced, neutral tone
- **echo**: Clear, professional  
- **fable**: Warm, storytelling
- **onyx**: Deep, authoritative
- **nova**: Young, energetic
- **shimmer**: Soft, pleasant

### voice-to-text

**Purpose**: Convert speech to text using OpenAI Whisper

**Location**: `supabase/functions/voice-to-text/index.ts`

#### API Contract
```typescript
interface VoiceToTextRequest {
  audio: string; // Base64 encoded audio
  format?: string; // Audio format (webm, mp3, wav, etc.)
  language?: string; // Optional language hint
}

interface VoiceToTextResponse {
  text: string;
  confidence?: number;
  language?: string;
}
```

#### Supported Formats
- WebM (preferred for web recording)
- MP3, WAV, M4A, FLAC
- Maximum file size: 25MB

## Common Integration Patterns

### Error Handling
```javascript
const handleEdgeFunctionError = (error, functionName) => {
  console.error(`${functionName} error:`, error);
  
  // Dispatch error event for global handling
  window.dispatchEvent(new CustomEvent('edge-function:error', {
    detail: { 
      function: functionName,
      error: error.message,
      timestamp: Date.now()
    }
  }));
  
  // Activate fallback if available
  if (hasFailover(functionName)) {
    activateFailover(functionName);
  }
};
```

### Retry Logic
```javascript
const callWithRetry = async (functionName, body, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw new Error(error.message);
      return data;
      
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
```

### Caching Strategy
```javascript
const EdgeFunctionCache = {
  cache: new Map(),
  
  async get(key, fetcher, ttl = 300000) { // 5 minute default TTL
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  },
  
  clear() {
    this.cache.clear();
  }
};
```

## Performance Optimization

### Connection Pooling
```javascript
class EdgeFunctionPool {
  private pool = new Map();
  
  async getConnection(functionName) {
    if (!this.pool.has(functionName)) {
      // Pre-warm connection
      const connection = await this.createConnection(functionName);
      this.pool.set(functionName, connection);
    }
    
    return this.pool.get(functionName);
  }
}
```

### Batch Processing
```javascript
const batchTTSGeneration = async (texts) => {
  const batch = texts.map(text => ({
    text,
    voice: 'XB0fDUnXU5powFXDhCwa',
    model: 'eleven_turbo_v2'
  }));
  
  return Promise.all(
    batch.map(request => 
      supabase.functions.invoke('elevenlabs-tts', { body: request })
    )
  );
};
```

## Security Considerations

### API Key Management
- All API keys stored as Supabase secrets
- No client-side API key exposure
- Edge functions act as secure proxies

### Input Validation
```javascript
const validateTTSInput = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }
  
  if (text.length > 5000) {
    throw new Error('Text exceeds maximum length of 5000 characters');
  }
  
  // Sanitize input
  return text.replace(/<[^>]*>/g, '').trim();
};
```

### Rate Limiting
```javascript
const RateLimiter = {
  requests: new Map(),
  
  async checkLimit(userId, limit = 100, window = 3600000) { // 100 requests per hour
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    this.requests.set(userId, validRequests);
  }
};
```

## Monitoring and Logging

### Function Performance Tracking
```javascript
const trackFunctionPerformance = (functionName, startTime, success) => {
  const duration = Date.now() - startTime;
  
  console.log(`Function ${functionName}: ${duration}ms (${success ? 'success' : 'error'})`);
  
  // Send to analytics
  window.dispatchEvent(new CustomEvent('edge-function:performance', {
    detail: {
      function: functionName,
      duration,
      success,
      timestamp: Date.now()
    }
  }));
};
```

### Error Aggregation
```javascript
const ErrorAggregator = {
  errors: [],
  
  log(functionName, error, context = {}) {
    this.errors.push({
      function: functionName,
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Send to monitoring service
    this.sendToMonitoring();
  },
  
  sendToMonitoring() {
    // Implementation depends on monitoring service
  }
};
```

## Testing Edge Functions

### Unit Testing
```javascript
describe('Edge Functions', () => {
  it('should generate TTS audio', async () => {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text: 'Test content' }
    });
    
    expect(error).toBeNull();
    expect(data.audioData).toBeDefined();
    expect(data.wordTimings).toBeArray();
  });
  
  it('should handle invalid input', async () => {
    const { error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text: '' }
    });
    
    expect(error).toBeDefined();
    expect(error.message).toContain('Text is required');
  });
});
```

### Integration Testing
```javascript
describe('Edge Function Integration', () => {
  it('should coordinate between TTS and dictionary services', async () => {
    // Upload dictionary
    await supabase.functions.invoke('elevenlabs-dictionary-manager', {
      body: { action: 'upload', dictionaryName: 'test-dict' }
    });
    
    // Use dictionary in TTS
    const { data } = await supabase.functions.invoke('elevenlabs-tts-smart', {
      body: {
        text: 'Test pronunciation',
        context: 'learning',
        pronunciation_dictionary: 'test-dict'
      }
    });
    
    expect(data.metadata.dictionary_applied).toBe('test-dict');
  });
});
```