# API Reference Guide

⚠️ **DEPRECATED FUNCTIONS - DO NOT USE** ⚠️  
The following edge functions are **DEPRECATED**: `runware-generate-image` and `prompt-studio`. Use `runware-template-ab` or `runware-template-cd` instead. See [IMAGE_FUNCTIONS_DEPRECATION.md](IMAGE_FUNCTIONS_DEPRECATION.md) for details.

## Core Endpoints

### AI Story Enhancer
**Endpoint**: `/functions/v1/ai-visual-scene-creator`
**Method**: POST
**Purpose**: Enhance story content with AI processing

**Request Body**:
```json
{
  "storyText": "string (required)",
  "userInfo": {
    "name": "string",
    "nativeLanguage": "string", 
    "avatar": {
      "type": "boy | girl | neutral",
      "skinTone": "pale | light | medium | olive | dark"
    }
  },
  "sessionId": "string",
  "pageNumber": "number"
}
```

**Response**:
```json
{
  "success": true,
  "enhancedStoryData": {
    "culturalContext": "string",
    "characterDetails": "object",
    "enhancedNarrative": "string"
  },
  "processingTime": "number",
  "metadata": "object"
}
```

### Image Generation Orchestrator
**Endpoint**: `/functions/v1/runware-generate-image`
**Method**: POST
**Purpose**: Generate images using advanced tier-based fallback system

**Request Body**:
```json
{
  "pageText": "string (required)",
  "userInfo": "object (required)",
  "sessionId": "string",
  "pageNumber": "number",
  "isGuestUser": "boolean",
  "difficultyLevel": "string"
}
```

**Response**:
```json
{
  "success": true,
  "imageURL": "string",
  "tier": "number",
  "provider": "string", 
  "model": "string",
  "cost": "number",
  "seed": "number",
  "enhancementLevel": "string",
  "qualityScore": "number",
  "metadata": "object"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "ISO string",
  "functionName": "string"
}
```

## Authentication

All functions are configured with `verify_jwt = false` for public access. No authentication required.

## Rate Limits & Timeouts (Updated 2025-09-28)

- **Image Generation**: Governed by Runware API limits
- **AI Story Enhancer**: No specific limits (uses OpenAI internally)
- **API Timeouts**: 12 seconds per individual call (balanced from 8s)
- **Frontend Timeouts**: 60 seconds for full image generation process (balanced from 25s)
- **Boot Recovery**: 6-second maximum retry pattern for edge function recovery

## CORS Support

All endpoints include full CORS support for cross-origin requests.