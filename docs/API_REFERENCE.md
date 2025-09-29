# API Reference - Edge Functions
**Last Updated:** 2025-09-29  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Payment & Subscription Functions](#payment--subscription-functions)
- [Story Generation Functions](#story-generation-functions)
- [Image Generation Functions](#image-generation-functions)
- [Audio & Voice Functions](#audio--voice-functions)
- [Security & Monitoring Functions](#security--monitoring-functions)
- [Support Functions](#support-functions)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [📚 Related Documentation](#related-documentation)

---

## Overview

### Base URL
```
https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1
```

### Total Functions
**40 operational edge functions** organized by category

### Common Headers
```typescript
{
  'Authorization': 'Bearer <user-jwt-token>',  // For authenticated endpoints
  'apikey': '<supabase-anon-key>',             // Required for all requests
  'Content-Type': 'application/json'
}
```

### Common Response Format
```typescript
{
  "success": boolean,
  "data"?: any,
  "error"?: {
    "message": string,
    "code"?: string,
    "details"?: any
  }
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Authentication

All edge functions use one of two authentication patterns:

### JWT Authentication (verify_jwt = true)
- Requires valid user session token in Authorization header
- User must be authenticated via Supabase Auth
- Returns 401 if token is missing or invalid

### Public Access (verify_jwt = false)
- No authentication required
- Uses anon key for basic API access
- May have rate limiting

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Payment & Subscription Functions

### create-checkout
**Create Stripe checkout session for one-time payments or subscriptions**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/create-checkout`

**Request Body:**
```typescript
{
  priceId: string           // Stripe price ID
  quantity?: number         // Default: 1
  successUrl?: string       // Custom success redirect
  cancelUrl?: string        // Custom cancel redirect
}
```

**Response:**
```typescript
{
  sessionId: string         // Stripe checkout session ID
  url: string              // Redirect URL to Stripe checkout
}
```

**Example:**
```typescript
const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    priceId: 'price_1234567890',
    quantity: 1,
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  }
})

if (data?.url) {
  window.location.href = data.url
}
```

---

### create-premium-subscription
**Create or update premium subscription**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/create-premium-subscription`

**Request Body:**
```typescript
{
  priceId: string           // Stripe subscription price ID
  trialDays?: number        // Optional trial period
}
```

**Response:**
```typescript
{
  subscriptionId: string    // Stripe subscription ID
  status: string           // 'active' | 'trialing' | 'incomplete'
  currentPeriodEnd: string // ISO timestamp
}
```

---

### customer-portal
**Generate Stripe customer portal URL**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/customer-portal`

**Request Body:**
```typescript
{
  returnUrl?: string        // URL to return to after portal session
}
```

**Response:**
```typescript
{
  url: string              // Customer portal URL
}
```

---

### validate-discount-code
**Validate discount code without applying**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/validate-discount-code`

**Request Body:**
```typescript
{
  code: string             // Discount code to validate
}
```

**Response:**
```typescript
{
  valid: boolean
  discountPercent?: number
  expiresAt?: string
  message?: string
}
```

---

### activate-discount-code
**Activate a discount code for user**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/activate-discount-code`

**Request Body:**
```typescript
{
  code: string             // Discount code to activate
}
```

**Response:**
```typescript
{
  activated: boolean
  discountPercent: number
  expiresAt: string
}
```

---

### apply-discount-code
**Apply discount code to checkout session**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/apply-discount-code`

**Request Body:**
```typescript
{
  code: string             // Discount code
  sessionId: string        // Stripe checkout session ID
}
```

**Response:**
```typescript
{
  applied: boolean
  discountAmount: number
  finalAmount: number
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Story Generation Functions

### generate-adaptive-story
**Generate adaptive story content with 4-tier fallback system**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/generate-adaptive-story`

**Request Body:**
```typescript
{
  userInfo: {
    name: string
    age: number
    grade: string
    nativeLanguage: string
    interests?: string[]
    readingLevel?: string
  }
  pageNumber?: number
  previousPages?: string[]
  sessionId?: string
}
```

**Response:**
```typescript
{
  content: string          // Generated story page content
  tier: string            // 'tier1' | 'tier2' | 'tier3' | 'tier4'
  pageNumber: number
  metadata: {
    generationTime: number
    wordCount: number
    readingLevel: string
  }
}
```

**Tier System:**
- **Tier 1:** Network CDN with multi-CDN cascade (85% success)
- **Tier 2:** Local vendor fallback (95% success)
- **Tier 3:** Template service (98% success)
- **Tier 4:** Emergency content (100% success)

**Example:**
```typescript
const { data } = await supabase.functions.invoke('generate-adaptive-story', {
  body: {
    userInfo: {
      name: 'Emma',
      age: 7,
      grade: '2nd',
      nativeLanguage: 'en',
      interests: ['dinosaurs', 'space']
    },
    pageNumber: 1
  }
})

console.log(data.content) // Story page text
console.log(data.tier)    // 'tier1' (most likely)
```

---

### template-service
**Fallback template-based story generation**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/template-service`

**Request Body:**
```typescript
{
  userInfo: {
    name: string
    age: number
    difficulty: string
  }
  pageNumber?: number
}
```

**Response:**
```typescript
{
  content: string
  source: 'template'
  difficulty: string
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Image Generation Functions

### runware-generate-image
**Main image generation orchestrator with 4-tier cascade**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/runware-generate-image`

**Request Body:**
```typescript
{
  storyText: string
  pageNumber: number
  avatar: {
    name: string
    age: number
    ethnicity: string
    hairColor: string
    hairStyle: string
    skinTone: string
  }
  sessionId: string
  userTier?: 'guest' | 'premium'
  forceMode?: 'tier1' | null
}
```

**Response:**
```typescript
{
  imageURL: string         // Generated image URL
  tier: string            // '1' | '2.5A' | '2.5B' | '2.5C' | '2.5D'
  seed?: number           // Random seed used
  prompt: string          // Full prompt used
  metadata: {
    generationTime: number
    model: string
    dimensions: { width: number, height: number }
  }
}
```

**Tier System:**
- **Tier 1:** AI Visual Scene Creator (85% success, premium features)
- **Tier 2.5A:** Premium Template (78% success, sophisticated)
- **Tier 2.5B:** Basic Template (92% success, nuclear independent)
- **Tier 2.5C:** Nuclear Hardcoded (95% success)
- **Tier 2.5D:** Emergency Fallback (100% success)

**Example:**
```typescript
const { data } = await supabase.functions.invoke('runware-generate-image', {
  body: {
    storyText: 'Emma explored the ancient pyramid under the bright desert sun.',
    pageNumber: 1,
    avatar: {
      name: 'Emma',
      age: 7,
      ethnicity: 'Caucasian',
      hairColor: 'brown',
      hairStyle: 'ponytail',
      skinTone: 'fair'
    },
    sessionId: 'session-123',
    userTier: 'premium'
  }
})

console.log(data.imageURL) // Generated image URL
console.log(data.tier)     // '1' or '2.5A' (for premium)
```

**Health Check:**
```typescript
// GET request for system status
const response = await fetch(
  'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image'
)
const status = await response.json()
// Returns: { status: 'operational', tiers: [...], uptime: ... }
```

---

### ai-visual-scene-creator
**Tier 1 premium scene analysis and generation**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/ai-visual-scene-creator`

**Request Body:**
```typescript
{
  storyText: string
  avatar: AvatarData
  sessionId: string
  directMode?: boolean     // Nuclear independent mode
}
```

**Response:**
```typescript
{
  imageURL: string
  scene: string           // Extracted scene description
  tier: '1' | 'direct'
  success: boolean
}
```

---

### runware-template-ab
**Tier 2.5A & 2.5B template-based generation**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/runware-template-ab`

**Request Body:**
```typescript
{
  storyText: string
  avatar: AvatarData
  complexity: 'A' | 'B'   // A=sophisticated, B=basic
  sessionId: string
}
```

**Response:**
```typescript
{
  imageURL: string
  tier: '2.5A' | '2.5B'
  prompt: string
}
```

---

### runware-template-cd
**Tier 2.5C & 2.5D nuclear fallback generation**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/runware-template-cd`

**Request Body:**
```typescript
{
  storyText: string
  avatar?: AvatarData     // Optional for tier D
  complexity: 'C' | 'D'   // C=hardcoded, D=emergency
}
```

**Response:**
```typescript
{
  imageURL: string
  tier: '2.5C' | '2.5D'
  source: 'nuclear_template'
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Audio & Voice Functions

### elevenlabs-tts
**Text-to-speech generation**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/elevenlabs-tts`

**Request Body:**
```typescript
{
  text: string
  voiceId?: string        // Default: system voice
  stability?: number      // 0-1, default: 0.5
  similarityBoost?: number // 0-1, default: 0.75
}
```

**Response:**
```typescript
{
  audioURL: string        // Generated audio file URL
  duration: number        // Duration in seconds
}
```

---

### elevenlabs-tts-smart
**Smart TTS with caching**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/elevenlabs-tts-smart`

**Request Body:**
```typescript
{
  text: string
  sessionId: string       // For cache lookup
  voiceId?: string
}
```

**Response:**
```typescript
{
  audioURL: string
  cached: boolean        // Whether result was from cache
  cacheKey: string
}
```

---

### word-dictionary
**Get word pronunciation and definition**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/word-dictionary`

**Request Body:**
```typescript
{
  word: string
  includeAudio?: boolean  // Generate pronunciation audio
}
```

**Response:**
```typescript
{
  word: string
  definition: string
  pronunciation?: string  // IPA notation
  audioURL?: string      // If includeAudio = true
  partOfSpeech: string
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Security & Monitoring Functions

### log-security-event
**Log security-related events**

**Authentication:** Required (JWT)  
**Method:** POST  
**Endpoint:** `/log-security-event`

**Request Body:**
```typescript
{
  eventType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: Record<string, any>
}
```

**Response:**
```typescript
{
  logged: boolean
  eventId: string
  timestamp: string
}
```

---

### security-dashboard
**Get security metrics and alerts**

**Authentication:** Required (JWT, service role)  
**Method:** GET  
**Endpoint:** `/security-dashboard`

**Response:**
```typescript
{
  criticalEvents24h: number
  highRiskEvents24h: number
  personalInfoIncidents24h: number
  securityStatus: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  lastUpdated: string
}
```

---

### system-diagnostics
**Get system health diagnostics**

**Authentication:** Not Required  
**Method:** GET  
**Endpoint:** `/system-diagnostics`

**Response:**
```typescript
{
  status: 'healthy' | 'degraded' | 'down'
  services: {
    storyGeneration: ServiceStatus
    imageGeneration: ServiceStatus
    payment: ServiceStatus
    audio: ServiceStatus
  }
  metrics: {
    uptime: number
    requestCount: number
    errorRate: number
  }
}

interface ServiceStatus {
  operational: boolean
  responseTime: number
  lastCheck: string
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Support Functions

### translate-universal
**Translate text between languages**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/translate-universal`

**Request Body:**
```typescript
{
  text: string
  targetLanguage: string  // ISO 639-1 code (e.g., 'es', 'fr')
  sourceLanguage?: string // Auto-detect if omitted
}
```

**Response:**
```typescript
{
  translatedText: string
  detectedLanguage?: string
  confidence: number
}
```

---

### correct-spelling
**Check and correct spelling**

**Authentication:** Not Required  
**Method:** POST  
**Endpoint:** `/correct-spelling`

**Request Body:**
```typescript
{
  text: string
}
```

**Response:**
```typescript
{
  correctedText: string
  corrections: Array<{
    original: string
    corrected: string
    position: number
  }>
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    message: string
    code: string
    details?: any
  }
}
```

### Common Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily down | 503 |
| `TIER_ESCALATION` | Tier fallback occurred | 200 (with metadata) |

### Error Handling Example
```typescript
try {
  const { data, error } = await supabase.functions.invoke('function-name', {
    body: requestData
  })
  
  if (error) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 5000))
        break
      case 'VALIDATION_ERROR':
        // Fix request data
        console.error('Invalid request:', error.details)
        break
      case 'SERVICE_UNAVAILABLE':
        // Use fallback or show error to user
        showErrorMessage('Service temporarily unavailable')
        break
      default:
        console.error('Unexpected error:', error)
    }
  }
} catch (err) {
  console.error('Network error:', err)
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Rate Limiting

### Default Limits
- **Authenticated users:** 100 requests per minute
- **Anonymous users:** 20 requests per minute
- **Story generation:** 10 requests per minute
- **Image generation:** 5 requests per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Handling Rate Limits
```typescript
const response = await fetch(apiUrl, options)

if (response.status === 429) {
  const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0')
  const waitTime = resetTime - Date.now()
  
  console.log(`Rate limited. Retry after ${waitTime}ms`)
  await new Promise(resolve => setTimeout(resolve, waitTime))
  
  // Retry request
  return fetch(apiUrl, options)
}
```

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)

---

## Related Documentation

### Core Documentation
- 📘 [Master System Guide](./MASTER_SYSTEM_GUIDE.md) - Complete architecture overview
- 📊 [Operations Guide](./OPERATIONS_GUIDE.md) - Implementation roadmap
- 💻 [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical standards
- 🏠 [Documentation Hub](./README.md) - Central navigation

### Function Documentation
- 📡 [Function Reference Registry](./FUNCTION_REFERENCE_REGISTRY_2025.md) - Detailed function specs
- 🔧 [Edge Functions README](../supabase/functions/README.md) - Deployment manifest

### Integration Guides
- 🏗️ [Integration Guide](./INTEGRATION_GUIDE.md) - Frontend-backend patterns
- 🚨 [Master Errors Document](./MASTER_ERRORS_TO_FIX.md) - Troubleshooting

---

**Document Status:** ✅ Complete and Current  
**Next Review:** 2025-10-06  
**Maintained By:** Engineering Team  
**Version:** 1.0

[↑ Back to Top](#api-reference---edge-functions) | [📋 TOC](#table-of-contents)
