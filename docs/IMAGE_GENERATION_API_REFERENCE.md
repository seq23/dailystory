# Image Generation API Reference

## Core Endpoints

### Frontend Entry Point

#### `SimpleImageService.generateStoryImage()`
Frontend service method that handles all image generation requests.

**Location**: `src/services/SimpleImageService.ts`

**Method Signature**:
```typescript
async generateStoryImage(
  storyText: string,
  userInfo: {
    name: string;
    age: number;
    userName: string;
  },
  pageNumber?: number,
  sessionId?: string
): Promise<string>
```

**Parameters**:
- `storyText`: The story content to generate an image for
- `userInfo`: Avatar identity information
- `pageNumber`: Current page number (optional)
- `sessionId`: Story session identifier (optional)

**Returns**: Image URL (data URL, blob URL, or fallback SVG)

**Flow**:
1. Calls main orchestrator (`runware-generate-image`)
2. On orchestrator failure, attempts Tier 2.5 directly
3. On all failures, returns SVG placeholder

---

### Main Orchestrator

#### `POST /functions/v1/runware-generate-image`
Primary backend orchestrator that manages tier progression and fallback logic.

**Request Body**:
```json
{
  "storyText": "string (required)",
  "avatarIdentity": {
    "name": "string",
    "age": "number", 
    "userName": "string"
  },
  "sessionId": "string (optional)",
  "pageNumber": "number (optional)",
  "forceOrchestrator": "boolean (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "string",
  "tier": "1 | 2.5 | 4",
  "requestId": "string",
  "processingTime": "number"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "string",
  "tier": "string",
  "requestId": "string"
}
```

---

### Tier 1: AI Visual Scene Creator

#### `POST /functions/v1/ai-visual-scene-creator`
AI-powered visual scene enhancement using OpenAI + Runware.

**Request Body**:
```json
{
  "storyText": "string (required)",
  "avatarIdentity": {
    "name": "string",
    "age": "number",
    "userName": "string"
  },
  "sessionId": "string (optional)",
  "pageNumber": "number (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "string",
  "enhancedScene": "string",
  "characterSeed": "number",
  "requestId": "string",
  "processingTime": "number"
}
```

**Features**:
- AI scene analysis and enhancement
- Character consistency via database-backed seeds
- Cultural intelligence for appropriate representation
- Visual detail extraction and integration

---

### Tier 2.5: Template Fallback

#### `POST /functions/v1/runware-simple-fallback`
Template-based fallback with multiple complexity levels.

**Request Body**:
```json
{
  "storyText": "string (required)",
  "avatarIdentity": {
    "name": "string",
    "age": "number",
    "userName": "string"
  },
  "sessionId": "string (optional)",
  "complexity": "A | B | C | D (optional, defaults to A)"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "string",
  "complexity": "A | B | C | D",
  "templateUsed": "string",
  "requestId": "string",
  "processingTime": "number"
}
```

**Complexity Levels**:
- **A**: Full character consistency + cultural intelligence
- **B**: Basic character consistency
- **C**: Simplified generation
- **D**: Minimal generation

---

## Error Handling

### Standard Error Format
```json
{
  "success": false,
  "error": "string",
  "details": "string (optional)",
  "requestId": "string",
  "tier": "string (optional)",
  "retryable": "boolean"
}
```

### Error Categories

#### Tier 1 Errors
- `OPENAI_TIMEOUT`: OpenAI API timeout
- `RUNWARE_CONNECTION`: WebSocket connection failed
- `CHARACTER_CONSISTENCY`: Database character storage failed
- `SCENE_GENERATION`: AI scene analysis failed

#### Tier 2.5 Errors
- `TEMPLATE_SELECTION`: Template selection failed
- `RUNWARE_API`: Runware API error
- `COMPLEXITY_FALLBACK`: Complexity level fallback triggered

#### System Errors
- `ORCHESTRATOR_FAILURE`: Main orchestrator completely failed
- `VALIDATION_ERROR`: Request validation failed
- `UNKNOWN_ERROR`: Unexpected system error

---

## Authentication & CORS

### Authentication
All image generation endpoints are **public** (`verify_jwt = false`) to ensure accessibility.

### CORS Headers
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## Request Correlation

### Request ID Pattern
- Format: `[req-{8char}]-{timestamp}`
- Example: `req-mferghcd-e98ij`
- Used across all tiers for debugging

### Logging
All functions log with structured format:
```
[PHASE] [REQ-{requestId}] {message}: {data}
```

---

## Rate Limiting

### Frontend Limits
- Max 10 requests per second per user
- Circuit breaker protection on repeated failures

### Backend Limits
- Per-function rate limiting via Supabase
- OpenAI API rate limits respected
- Automatic backoff on service failures

---

## Integration Examples

### Basic Frontend Usage
```typescript
import { SimpleImageService } from '@/services/SimpleImageService';

const imageService = new SimpleImageService();
const imageUrl = await imageService.generateStoryImage(
  "A magical forest adventure begins",
  { name: "Maya", age: 8, userName: "User123" },
  1,
  "session-abc123"
);
```

### Direct Backend Call
```typescript
const { data, error } = await supabase.functions.invoke('runware-generate-image', {
  body: {
    storyText: "A young explorer discovers a hidden cave",
    avatarIdentity: { name: "Alex", age: 10, userName: "Explorer" },
    sessionId: "session-xyz789"
  }
});
```

### Testing Specific Tiers
```typescript
// Test Tier 1 directly
const tier1Result = await supabase.functions.invoke('ai-visual-scene-creator', {
  body: { storyText, avatarIdentity, sessionId }
});

// Test Tier 2.5 with specific complexity
const tier25Result = await supabase.functions.invoke('runware-simple-fallback', {
  body: { storyText, avatarIdentity, complexity: 'B' }
});
```

---

## Performance Metrics

### Target Response Times
- **Tier 1**: 3-8 seconds (AI processing)
- **Tier 2.5**: 2-5 seconds (template-based)
- **Tier 4**: <100ms (local SVG)

### Success Rate Targets
- **Tier 1**: 85-90%
- **Tier 2.5**: 95-99%
- **Tier 4**: 100%
- **Overall**: 100% (guaranteed via fallbacks)