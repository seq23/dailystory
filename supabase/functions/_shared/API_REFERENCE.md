# API Reference Guide

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

### OpenAI Image Generation
**Endpoint**: `/functions/v1/openai-image`
**Method**: POST
**Purpose**: Generate premium quality images using OpenAI

**Request Body**:
```json
{
  "positivePrompt": "string (required)",
  "width": "number (default: 1024)",
  "height": "number (default: 1024)", 
  "quality": "high | medium | low | auto",
  "style": "vivid | natural",
  "userInfo": "object",
  "pageNumber": "number",
  "sessionId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "imageURL": "string",
  "provider": "openai",
  "model": "gpt-image-1",
  "cost": "number",
  "seed": "number",
  "quality": "string",
  "size": "string"
}
```

### Runware Image Generation  
**Endpoint**: `/functions/v1/runware-generate-image`
**Method**: POST
**Purpose**: Generate images using Runware Flux models

**Request Body**:
```json
{
  "positivePrompt": "string (required)",
  "negativePrompt": "string",
  "width": "number", 
  "height": "number",
  "userInfo": "object",
  "pageNumber": "number",
  "sessionId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "imageURL": "string",
  "provider": "runware", 
  "model": "string",
  "processingTime": "number",
  "seed": "number"
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

## Rate Limits

- OpenAI: Governed by OpenAI API limits
- Runware: Governed by Runware API limits
- AI Story Enhancer: No specific limits (uses OpenAI internally)

## CORS Support

All endpoints include full CORS support for cross-origin requests.