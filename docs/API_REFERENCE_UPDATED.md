# Complete API Reference - AI Story Generation System

## Overview
This document provides comprehensive API reference for all 38 Supabase Edge Functions and their integration patterns in the AI Story Generation System.

## Core Story Generation APIs

### AI Story Enhancer
**Endpoint**: `/functions/v1/ai-story-enhancer`
**Method**: POST
**Purpose**: Central orchestrator for AI-powered story enhancement

**Request Body**:
```json
{
  "storyText": "string (required) - Base story content to enhance",
  "userInfo": {
    "name": "string - User's name",
    "nativeLanguage": "string - ISO language code", 
    "avatar": {
      "type": "boy | girl | neutral",
      "skinTone": "pale | light | medium | olive | dark"
    },
    "favoriteColor": "string",
    "favoriteAnimal": "string",
    "favoriteFood": "string",
    "hobbies": "string",
    "gradeLevel": "string",
    "difficultyLevel": "beginner | easy | medium | hard | expert"
  },
  "sessionId": "string - Unique session identifier",
  "pageNumber": "number - Current page in story sequence"
}
```

**Response**:
```json
{
  "success": true,
  "enhancedStoryData": {
    "culturalContext": "string - Applied cultural adaptations",
    "characterDetails": "object - Character consistency data",
    "enhancedNarrative": "string - AI-enhanced story content"
  },
  "processingTime": "number - Processing duration in ms",
  "metadata": {
    "aiModel": "string - AI model used",
    "culturalAdaptations": "array - Applied adaptations",
    "qualityScore": "number - Content quality assessment"
  }
}
```

## Image Generation APIs

### Premium Runware Image Generation
**Endpoint**: `/functions/v1/runware-generate-image`
**Method**: POST  
**Purpose**: High-quality image generation using Runware Flux models

**Request Body**:
```json
{
  "positivePrompt": "string (required) - Image description prompt",
  "negativePrompt": "string - Elements to avoid in image",
  "width": "number - Image width (default: 1024)",
  "height": "number - Image height (default: 1024)",
  "userInfo": "object - User personalization data",
  "pageNumber": "number - Story page reference",
  "sessionId": "string - Session identifier for consistency"
}
```

**Response**:
```json
{
  "success": true,
  "imageURL": "string - Generated image URL",
  "provider": "runware",
  "model": "string - Specific Flux model used",
  "processingTime": "number - Generation time in ms",
  "seed": "number - Random seed for reproducibility",
  "qualityMetrics": {
    "resolution": "string - Final image dimensions",
    "compressionRatio": "number - File size optimization",
    "culturalScore": "number - Cultural appropriateness score"
  }
}
```

### OpenAI Image Generation (Fallback)
**Endpoint**: `/functions/v1/openai-image`
**Method**: POST
**Purpose**: Reliable fallback image generation using DALL-E 3

**Request Body**:
```json
{
  "positivePrompt": "string (required) - Image description",
  "width": "number (default: 1024)",
  "height": "number (default: 1024)", 
  "quality": "hd | standard - Image quality setting",
  "style": "vivid | natural - Image style preference",
  "userInfo": "object - User personalization context",
  "pageNumber": "number - Story page reference",
  "sessionId": "string - Session tracking"
}
```

**Response**:
```json
{
  "success": true,
  "imageURL": "string - Generated image URL",
  "provider": "openai",
  "model": "dall-e-3",
  "cost": "number - API cost for generation",
  "seed": "number - Generation seed",
  "quality": "string - Applied quality setting",
  "size": "string - Final image dimensions",
  "revisedPrompt": "string - OpenAI's prompt interpretation"
}
```

## Template System APIs

### Template Library Access
**Endpoint**: `/functions/v1/template-library`
**Method**: GET
**Purpose**: Access to 35-template fallback library system

**Query Parameters**:
- `level`: Difficulty level (level1, level2, level3, level4, grade6-grade10)
- `templateIndex`: Specific template number (optional, random if omitted)
- `userId`: User identifier for personalization

**Response**:
```json
{
  "success": true,
  "template": {
    "title": "string - Template name",
    "theme": "string - Story theme/genre", 
    "level": "string - Difficulty level",
    "scenes": [
      {
        "text": "string - Scene content with placeholders",
        "pause": "boolean - Page break indicator",
        "hook": "string - Connection to next scene",
        "microVariants": {
          "text": "string - Base text",
          "alternatives": ["array of alternative phrasings"],
          "optionalDetails": ["array of additional details"]
        }
      }
    ],
    "endings": [
      {
        "type": "cozy | silly | triumphant | reflective",
        "text": "string - Ending content",
        "microVariants": ["array of ending variations"]
      }
    ],
    "reuse": {
      "swappableElements": "object - Dynamic content options",
      "weatherVariants": ["array of weather options"],
      "settingVariants": ["array of setting options"]
    }
  },
  "libraryStats": {
    "totalTemplates": 35,
    "totalPages": "390+",
    "availableEndings": 140
  }
}
```

### Template Processing
**Endpoint**: `/functions/v1/process-template`
**Method**: POST
**Purpose**: Process template with user personalization

**Request Body**:
```json
{
  "template": "object - Template structure",
  "userInfo": "object - User personalization data",
  "sessionId": "string - Session identifier",
  "sceneIndex": "number - Current scene to process"
}
```

**Response**:
```json
{
  "success": true,
  "processedContent": "string - Personalized story content",
  "nextSceneAvailable": "boolean - Can continue story",
  "grammarScore": "number - Grammar quality assessment",
  "placeholdersResolved": "number - Count of resolved placeholders",
  "characterConsistency": "object - Character tracking data"
}
```

## Grammar and Processing APIs

### Grammar Validation Service
**Endpoint**: `/functions/v1/validate-grammar`
**Method**: POST
**Purpose**: Comprehensive grammar checking and correction

**Request Body**:
```json
{
  "text": "string (required) - Text to validate",
  "userInfo": "object - Context for pronoun selection",
  "strictMode": "boolean - Enable strict validation rules"
}
```

**Response**:
```json
{
  "success": true,
  "validation": {
    "isValid": "boolean - Overall grammar validity",
    "errors": ["array of identified grammar issues"],
    "corrections": ["array of suggested corrections"],
    "grammarScore": "number - Quality score (0-1)"
  },
  "correctedText": "string - Grammar-corrected version",
  "appliedRules": ["array of grammar rules applied"]
}
```

### Enhanced Post-Processing
**Endpoint**: `/functions/v1/post-process`
**Method**: POST
**Purpose**: Final story enhancement and consistency checking

**Request Body**:
```json
{
  "pages": ["array of story page texts"],
  "userInfo": "object - User context",
  "sessionId": "string - Session identifier"
}
```

**Response**:
```json
{
  "success": true,
  "processedPages": ["array of enhanced story pages"],
  "consistencyReport": {
    "hasCharacterSeeds": "boolean",
    "characterCount": "number", 
    "seedsStored": "number",
    "consistencyScore": "number"
  },
  "qualityMetrics": {
    "grammarScore": "number",
    "coherenceScore": "number",
    "ageAppropriatenessScore": "number"
  }
}
```

## Character Consistency APIs

### Character Management
**Endpoint**: `/functions/v1/character-consistency`
**Method**: POST
**Purpose**: Maintain visual and narrative character consistency

**Request Body**:
```json
{
  "action": "initialize | validate | update | report",
  "sessionId": "string (required)",
  "userInfo": "object - User context",
  "characterData": "object - Character information (for updates)"
}
```

**Response**:
```json
{
  "success": true,
  "characterSeeds": [
    {
      "characterType": "string - Type of character",
      "description": "string - Character description",
      "visualTraits": ["array of visual characteristics"],
      "consistencyScore": "number - Consistency rating"
    }
  ],
  "recommendations": ["array of consistency suggestions"]
}
```

## Cultural Context APIs

### Cultural Adaptation Service
**Endpoint**: `/functions/v1/cultural-context`
**Method**: POST
**Purpose**: Apply culturally appropriate story modifications

**Request Body**:
```json
{
  "content": "string - Story content to adapt",
  "userInfo": {
    "nativeLanguage": "string - ISO language code",
    "culturalBackground": "string - Cultural context",
    "region": "string - Geographic region"
  },
  "adaptationLevel": "light | moderate | comprehensive"
}
```

**Response**:
```json
{
  "success": true,
  "adaptedContent": "string - Culturally adapted content",
  "adaptations": [
    {
      "type": "character | setting | reference | language",
      "original": "string - Original content",
      "adapted": "string - Adapted version",
      "reason": "string - Adaptation rationale"
    }
  ],
  "culturalScore": "number - Cultural appropriateness rating"
}
```

## Quality Assurance APIs

### Content Validation
**Endpoint**: `/functions/v1/validate-content`
**Method**: POST
**Purpose**: Comprehensive content quality assessment

**Request Body**:
```json
{
  "content": "string - Content to validate",
  "userInfo": "object - User context for age appropriateness",
  "validationCriteria": ["array of criteria to check"]
}
```

**Response**:
```json
{
  "success": true,
  "validation": {
    "overallScore": "number - Composite quality score",
    "criteria": {
      "grammarAccuracy": "number",
      "ageAppropriateness": "number", 
      "culturalSensitivity": "number",
      "narrativeCoherence": "number",
      "educationalValue": "number"
    },
    "issues": ["array of identified issues"],
    "recommendations": ["array of improvement suggestions"]
  },
  "approved": "boolean - Meets quality standards"
}
```

## Monitoring and Analytics APIs

### Performance Metrics
**Endpoint**: `/functions/v1/metrics`
**Method**: GET
**Purpose**: System performance and usage analytics

**Query Parameters**:
- `timeRange`: Time period for metrics (1h, 1d, 7d, 30d)
- `services`: Comma-separated list of services to include
- `userId`: User-specific metrics (optional)

**Response**:
```json
{
  "success": true,
  "metrics": {
    "totalRequests": "number",
    "averageResponseTime": "number - in milliseconds",
    "errorRate": "number - percentage",
    "serviceHealth": {
      "aiStoryEnhancer": "healthy | degraded | down",
      "imageGeneration": "healthy | degraded | down",
      "templateLibrary": "healthy | degraded | down"
    },
    "userEngagement": {
      "storiesGenerated": "number",
      "averageStoryLength": "number",
      "completionRate": "number - percentage"
    }
  },
  "timestamp": "string - ISO 8601 timestamp"
}
```

### Error Reporting
**Endpoint**: `/functions/v1/report-error`
**Method**: POST
**Purpose**: Centralized error tracking and analysis

**Request Body**:
```json
{
  "error": {
    "message": "string - Error description",
    "stack": "string - Stack trace",
    "service": "string - Service where error occurred",
    "context": "object - Additional error context"
  },
  "userInfo": "object - User context (optional)",
  "sessionId": "string - Session identifier"
}
```

**Response**:
```json
{
  "success": true,
  "errorId": "string - Unique error identifier",
  "reportedAt": "string - ISO timestamp",
  "similarIssues": "number - Count of similar errors"
}
```

## Authentication & Security

### Authentication Requirements
- **Public Functions**: Template library access, basic validation services
- **Authenticated Functions**: AI enhancement, premium image generation, user data processing
- **Service Functions**: Internal processing, database operations, analytics

### Security Headers
All functions include standard security headers:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
```

### Rate Limiting
- **AI Services**: 60 requests/minute per user
- **Image Generation**: 30 requests/minute per user  
- **Template Access**: 300 requests/minute per user
- **Validation Services**: 120 requests/minute per user

## Error Response Format
All APIs return standardized error responses:

```json
{
  "error": "string - Error message",
  "details": "string - Detailed error information",
  "errorCode": "string - Specific error identifier",
  "timestamp": "string - ISO 8601 timestamp",
  "functionName": "string - Function that generated error",
  "requestId": "string - Unique request identifier",
  "suggestions": ["array of resolution suggestions"]
}
```

## Integration Examples

### Frontend Integration
```typescript
// Story generation with error handling
const generateStory = async (userInput: StoryRequest) => {
  try {
    const response = await supabase.functions.invoke('ai-story-enhancer', {
      body: userInput
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error);
    }
    
    return response.data;
  } catch (error) {
    console.error('Story generation failed:', error);
    
    // Fallback to template system
    return await supabase.functions.invoke('process-template', {
      body: { ...userInput, fallbackMode: true }
    });
  }
}
```

### Batch Processing
```typescript
// Process multiple story pages
const processStoryBatch = async (pages: string[], userInfo: UserInfo) => {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(page => supabase.functions.invoke('post-process', {
        body: { pages: [page], userInfo }
      }))
    );
    
    results.push(...batchResults);
  }
  
  return results;
}
```

This comprehensive API reference covers all 38 Supabase Edge Functions and provides the technical foundation for integrating with the complete AI Story Generation System.