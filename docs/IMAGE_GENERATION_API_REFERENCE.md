# Image Generation API Reference

## Overview

Complete API reference for the Image Generation System, including all endpoints, parameters, responses, and integration patterns.

## Core Endpoints

### Frontend Service Layer

#### `SimpleImageService.generateStoryImage()`
**Purpose**: Main entry point for image generation from frontend

**Method**: Static method call
**Location**: `src/services/SimpleImageService.ts`

**Parameters**:
```typescript
static async generateStoryImage(
  pageText: string,           // Required: Story text to visualize
  userInfo: UserInfo,         // Required: User avatar and preferences
  difficulty: string,         // Optional: Frontend difficulty level (default: 'developing')
  storyId?: string,          // Optional: Story identifier for tracking
  pageNumber?: number,       // Optional: Page number for consistency
  sessionId?: string,        // Optional: Session identifier
  isPremium?: boolean        // Optional: For analytics only - does NOT affect quality
): Promise<ImageResult>
```

**UserInfo Interface**:
```typescript
interface UserInfo {
  name?: string;
  nativeLanguage?: string;
  avatar?: {
    type: 'boy' | 'girl' | 'neutral';
    skinTone: 'pale' | 'light' | 'medium' | 'olive' | 'dark';
  };
}
```

**Response - ImageResult Interface**:
```typescript
interface ImageResult {
  url: string;              // Generated image URL or data URI
  success: boolean;         // Generation success status
  provider?: string;        // Provider used ('runware', 'openai', 'svg')
  model?: string;          // Model identifier
  cost?: number;           // Estimated cost in USD
  seed?: number;           // Generation seed for reproducibility
  error?: string;          // Error message if failed
  prompt?: string;         // Final prompt used
  metadata?: {
    tier: number;          // Tier used (1, 2.5, or 4)
    enhancementLevel: string; // 'ai_enhanced', 'template_based', 'placeholder'
    qualityScore?: number; // AI quality score (0-5)
    orchestrated: boolean; // Whether backend orchestrator was used
    [key: string]: any;   // Additional metadata
  };
}
```

**Example Usage**:
```typescript
const result = await SimpleImageService.generateStoryImage(
  "A young girl reading a magical book in her bedroom",
  {
    name: "Emma",
    nativeLanguage: "en",
    avatar: {
      type: "girl",
      skinTone: "light"
    }
  },
  "developing",
  "story_123",
  1,
  "session_456",
  false // Guest user - still gets Tier 1 images
);

if (result.success) {
  console.log(`Generated with Tier ${result.metadata?.tier}: ${result.url}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

### Backend Orchestrator

#### `/functions/v1/runware-generate-image`
**Purpose**: Main orchestration hub with tier management

**Method**: POST
**Authentication**: Public (no JWT required)
**CORS**: Full support for cross-origin requests

**Request Body**:
```typescript
{
  pageText: string,          // Required: Story text to visualize
  userInfo: UserInfo,        // Required: User information and avatar
  sessionId?: string,        // Optional: Session identifier
  pageNumber?: number,       // Optional: Page number for consistency
  storyId?: string,         // Optional: Story identifier
  isGuestUser?: boolean,    // Optional: For analytics only - does NOT affect quality
  difficultyLevel?: string  // Optional: Backend difficulty level
}
```

**Response Format**:
```typescript
{
  success: boolean,
  imageURL?: string,        // Generated image URL
  tier?: number,            // Tier used (1, 2.5, or 4)
  provider?: string,        // Provider identifier
  model?: string,          // Model used
  cost?: number,           // Generation cost in USD
  seed?: number,           // Generation seed
  enhancementLevel?: string, // Enhancement type applied
  qualityScore?: number,   // AI validation score
  metadata?: {
    requestId: string,     // Correlation ID for debugging
    processingTime: number, // Total processing time (ms)
    avatarIdentity: object, // Processed avatar data
    culturalProfile: string, // Cultural processing applied
    [key: string]: any    // Additional metadata
  },
  error?: string           // Error message if failed
}
```

**Example Request**:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/runware-generate-image' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "pageText": "A curious boy exploring a mysterious forest",
    "userInfo": {
      "name": "Alex",
      "nativeLanguage": "en",
      "avatar": {
        "type": "boy",
        "skinTone": "medium"
      }
    },
    "sessionId": "session_789",
    "pageNumber": 1,
    "isGuestUser": true,
    "difficultyLevel": "medium"
  }'
```

### AI Enhancement Layer

#### `/functions/v1/ai-visual-scene-creator`
**Purpose**: Advanced AI processing for visual scene enhancement

**Method**: POST
**Authentication**: Public (no JWT required)
**Internal Use**: Called by backend orchestrator

**Request Body**:
```typescript
{
  storyText: string,        // Required: Story text for AI processing
  userInfo: UserInfo,       // Required: User information
  sessionId?: string,       // Optional: Session correlation
  pageNumber?: number,      // Optional: Page number
  requestId?: string       // Optional: Request correlation ID
}
```

**Response Format**:
```typescript
{
  success: boolean,
  enhancedStoryData?: {
    culturalContext?: string,      // Cultural context analysis
    characterDetails?: object,     // Character consistency data
    enhancedNarrative?: string,   // AI-enhanced narrative
    primaryScene?: string,        // Main visual scene description
    characters?: string[],        // Character list
    visualComponents?: string[],  // Visual elements identified
    extractionMethod?: string     // Method used for data extraction
  },
  processingTime?: number,        // AI processing time (ms)
  metadata?: {
    requestId: string,           // Correlation ID
    modelUsed: string,          // AI model used
    qualityScore: number,       // Validation score (0-5)
    circuitBreakerState: string, // Circuit breaker status
    [key: string]: any         // Additional metadata
  },
  error?: string                // Error message if failed
}
```

### Nuclear Template Fallback

#### `/functions/v1/runware-simple-fallback`
**Purpose**: Guaranteed generation with template system

**Method**: POST  
**Authentication**: Public (no JWT required)
**Nuclear Independence**: Zero external dependencies

**Request Body**:
```typescript
{
  pageText: string,         // Required: Story text
  userInfo: UserInfo,       // Required: User information
  sessionId?: string,       // Optional: Session ID
  pageNumber?: number,      // Optional: Page number  
  difficultyLevel?: string, // Optional: Difficulty level
  requestId?: string       // Optional: Request correlation
}
```

**Response Format**:
```typescript
{
  success: boolean,
  imageURL?: string,        // Generated image URL
  prompt?: string,         // Final constructed prompt
  tier: 2.5,              // Always Tier 2.5
  provider: "runware",    // Always Runware
  model: "runware:100@1", // Template-based generation
  cost?: number,          // Generation cost
  seed?: number,          // Generation seed
  metadata?: {
    template: string,      // Template used
    culturalProcessing: object, // Cultural arrays applied
    pronounResolution: object,  // Pronoun resolution details
    nuclearIndependence: true, // Confirms zero dependencies
    [key: string]: any    // Additional metadata
  },
  error?: string          // Error message if failed
}
```

## Error Handling

### Standardized Error Responses

All endpoints return consistent error formats:

```typescript
{
  success: false,
  error: string,           // Human-readable error message
  details?: string,        // Detailed technical information
  timestamp: string,       // ISO timestamp
  functionName: string,    // Function that generated error
  requestId?: string,      // Correlation ID for debugging
  tier?: number,          // Tier where error occurred
  retryable?: boolean,    // Whether request can be retried
  circuitBreakerOpen?: boolean // Whether circuit breaker is triggered
}
```

### Error Categories

#### WebSocket Errors (Tier 1)
```typescript
{
  "error": "WebSocket connection failed",
  "details": "Connection timeout after 30000ms", 
  "type": "TIMEOUT",
  "retryable": true,
  "tier": 1
}
```

#### AI Processing Errors (Enhancement Layer)
```typescript
{
  "error": "AI enhancement failed",
  "details": "Circuit breaker open: 3 consecutive failures",
  "type": "CIRCUIT_BREAKER",
  "retryable": false,
  "circuitBreakerOpen": true
}
```

#### Template Processing Errors (Tier 2.5)
```typescript
{
  "error": "Template processing failed",
  "details": "Nuclear fallback system error",
  "type": "TEMPLATE_ERROR", 
  "retryable": false,
  "tier": 2.5
}
```

## Rate Limiting & Quotas

### Frontend Rate Limiting
- **User Rate**: 2 requests per second per user
- **Daily Cost Ceiling**: $50 USD per user
- **Estimated Cost**: $0.002 per image
- **Throttling**: Exponential backoff on limits

### Backend Rate Limiting
- **Runware API**: Provider-specific limits
- **OpenAI API**: Provider-specific limits  
- **Circuit Breaker**: 2 failures = 15s timeout

## Authentication & Security

### Public Access
All image generation endpoints are configured with `verify_jwt = false` for public access:

```toml
[functions.runware-generate-image]
verify_jwt = false

[functions.ai-visual-scene-creator]
verify_jwt = false

[functions.runware-simple-fallback]
verify_jwt = false
```

### Security Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
```

### Input Validation
- Text sanitization (removes special characters)
- Parameter validation (required fields, types)
- Cost tracking and limits
- Request throttling

## Integration Patterns

### Frontend Integration
```typescript
import { SimpleImageService } from '@/services/SimpleImageService';

// Basic usage
const result = await SimpleImageService.generateStoryImage(
  storyText, 
  userInfo, 
  difficulty
);

// Advanced usage with all parameters
const result = await SimpleImageService.generateStoryImage(
  storyText,
  userInfo,
  difficulty,
  storyId,
  pageNumber,
  sessionId,
  isPremium
);

// Handle result
if (result.success) {
  setImageUrl(result.url);
  console.log(`Tier ${result.metadata?.tier} image generated`);
} else {
  console.error('Generation failed:', result.error);
  // Result still contains fallback SVG placeholder
  setImageUrl(result.url); // Safe to use - always has fallback
}
```

### Direct Backend Call
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('runware-generate-image', {
  body: {
    pageText: "A magical adventure begins",
    userInfo: userInfo,
    sessionId: sessionId,
    pageNumber: 1,
    isGuestUser: !isPremium
  }
});
```

### Batch Processing
```typescript
// Generate multiple images with proper throttling
const results = await Promise.allSettled([
  SimpleImageService.generateStoryImage(text1, userInfo, difficulty),
  SimpleImageService.generateStoryImage(text2, userInfo, difficulty),
  SimpleImageService.generateStoryImage(text3, userInfo, difficulty)
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled' && result.value.success) {
    console.log(`Image ${index + 1} generated: Tier ${result.value.metadata?.tier}`);
  }
});
```

## Debugging & Monitoring

### Request Correlation
**Phase 5 Enhancement**: All requests include correlation IDs for cross-function tracking

```typescript
const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Debug Parameters
Add debug parameters to see internal processing:

```bash
# Enable debug logging
curl -X POST 'https://your-project.supabase.co/functions/v1/runware-generate-image' \
  -H 'Content-Type: application/json' \
  -d '{
    "pageText": "debug test",
    "userInfo": {...},
    "debug": true,
    "debugLevel": "verbose"
  }'
```

### Health Check
```bash
# Check system health
curl 'https://your-project.supabase.co/functions/v1/runware-generate-image' \
  -X OPTIONS
```

### Performance Monitoring
```typescript
// Monitor generation performance
console.log('Performance Metrics:', {
  totalTime: result.metadata?.processingTime,
  tier: result.metadata?.tier,
  enhancementLevel: result.metadata?.enhancementLevel,
  qualityScore: result.metadata?.qualityScore,
  cost: result.cost
});
```

## Best Practices

### Error Handling
```typescript
try {
  const result = await SimpleImageService.generateStoryImage(...);
  
  // Always check success flag
  if (result.success) {
    // Use generated image
    setImageUrl(result.url);
  } else {
    // Log error but still use fallback
    console.error('Generation failed:', result.error);
    setImageUrl(result.url); // Contains SVG fallback
  }
} catch (error) {
  // Handle network/system errors
  console.error('System error:', error);
  // Implement your own fallback
}
```

### Performance Optimization
```typescript
// Pre-generate images for better UX
const preloadImages = async (texts: string[]) => {
  const promises = texts.slice(0, 3).map(text => // Limit concurrent requests
    SimpleImageService.generateStoryImage(text, userInfo, difficulty)
  );
  
  return Promise.allSettled(promises);
};
```

### Cultural Sensitivity
```typescript
// Ensure proper user information for cultural authenticity
const userInfo = {
  name: user.name,
  nativeLanguage: user.language || 'en',
  avatar: {
    type: user.avatar.type,
    skinTone: user.avatar.skinTone // Critical for cultural processing
  }
};
```

---

**Last Updated**: December 2024  
**API Version**: 2.0  
**Status**: Production Ready