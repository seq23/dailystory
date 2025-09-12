# API Documentation

## 🚨 Edge Function Usage Warning

**CRITICAL**: All edge functions must be called responsibly due to quota management. Prefer manual triggers over automatic polling.

## 📡 Edge Functions Overview

Time2Read uses 47+ edge functions for various services. Below are the key categories and usage guidelines.

## 🎯 Story Generation APIs

### `generate-adaptive-story`
**Purpose**: Main story generation endpoint for both guest and premium users

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('generate-adaptive-story', {
  body: {
    userInfo: { age: 8, interests: ['animals'] },
    storyMode: 'netflix' | 'live',
    pageNumber: 1, // For live generation
    expectedPages: 12 | 999 // Guest vs Premium
  }
});
```

**Response**:
```json
{
  "success": true,
  "content": "Story content...",
  "pageNumber": 1,
  "isComplete": false,
  "metadata": {
    "generationTime": 3.2,
    "tokenUsage": 450,
    "fallbackUsed": false
  }
}
```

**Rate Limits**: 
- Guests: 1 request per 5 seconds
- Premium: 1 request per 2 seconds

### `process-story-content`
**Purpose**: Post-processing for grammar, placeholders, and content sanitization

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('process-story-content', {
  body: {
    rawContent: "Story with {{placeholder}}",
    userInfo: { name: "Alex" },
    processingMode: 'full' | 'minimal'
  }
});
```

## 🖼️ Image Generation APIs

### `runware-generate-image`
**Purpose**: Primary image generation using Runware Flux models

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('runware-generate-image', {
  body: {
    prompt: "A friendly dragon in a magical forest",
    characterSeed: "dragon-123",
    styleFramework: "children-book",
    dimensions: { width: 1024, height: 1024 }
  }
});
```

**Models Available**:
- `runware:100@1` (Flux Schnell - Fast)
- `runware:101@1` (Flux Dev - Quality)
- `runware:200@1` (Flux Pro - Premium)

### `dalle-generate-image`
**Purpose**: Fallback image generation using OpenAI DALL-E 3

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('dalle-generate-image', {
  body: {
    prompt: "Enhanced prompt for DALL-E",
    size: "1024x1024",
    quality: "standard" | "hd"
  }
});
```

## 👤 User Management APIs

### `check-premium-status`
**Purpose**: Verify user's subscription status and capabilities

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('check-premium-status');
```

**Response**:
```json
{
  "isPremium": true,
  "subscriptionTier": "pro",
  "capabilities": {
    "unlimitedStories": true,
    "storySaving": true,
    "magicWand": true,
    "dismissibleTimer": true
  },
  "usage": {
    "storiesGenerated": 15,
    "imagesGenerated": 45,
    "monthlyLimit": 500
  }
}
```

### `update-user-profile`
**Purpose**: Update user preferences and profile information

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('update-user-profile', {
  body: {
    preferences: {
      ageGroup: "6-8",
      interests: ["animals", "adventure"],
      difficulty: "medium"
    }
  }
});
```

## 📊 Monitoring APIs (⚠️ Use Manual Refresh Only)

### `get-monitoring-data`
**Purpose**: Comprehensive system monitoring data

**⚠️ WARNING**: Do not use auto-polling. Manual refresh only due to quota concerns.

**Usage**:
```typescript
// ✅ CORRECT - Manual trigger only
const handleManualRefresh = async () => {
  const { data } = await supabase.functions.invoke('get-monitoring-data');
};

// ❌ NEVER - Auto-polling disabled due to quota burn
// setInterval(() => invoke('get-monitoring-data'), 60000);
```

**Response**:
```json
{
  "success": true,
  "data": {
    "performanceMetrics": {
      "avgStoryGenTime": 3.2,
      "avgImageGenTime": 5.1,
      "cacheHitRate": 0.84
    },
    "characterSeeds": {
      "active": 15,
      "cached": 42
    },
    "activeTests": [],
    "culturalMetrics": {
      "languageDistribution": { "en": 0.78, "es": 0.15 }
    }
  }
}
```

### `system-health-check`
**Purpose**: Basic system health verification

**Usage**:
```typescript
// Manual health check only
const { data } = await supabase.functions.invoke('system-health-check');
```

## 🔄 Session Management APIs

### `track-user-activity`
**Purpose**: Privacy-conscious activity tracking

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('track-user-activity', {
  body: {
    activity: 'story_completed',
    metadata: {
      pageCount: 6,
      duration: 320,
      userType: 'guest'
    }
  }
});
```

### `get-usage-stats`
**Purpose**: User-specific usage statistics

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('get-usage-stats');
```

**Response**:
```json
{
  "currentSession": {
    "duration": 1200,
    "storiesViewed": 3,
    "pagesViewed": 18
  },
  "totalUsage": {
    "storiesGenerated": 45,
    "totalTime": 28800,
    "favoriteThemes": ["animals", "space"]
  }
}
```

## 🛡️ Security & Validation

### Authentication Headers
All API calls require proper authentication:
```typescript
// Headers automatically handled by Supabase client
const { data } = await supabase.functions.invoke('function-name', {
  body: requestData
});
```

### Rate Limiting
Function-specific rate limits enforced:
- **Story Generation**: 1 req/5sec (guest), 1 req/2sec (premium)
- **Image Generation**: 1 req/10sec (guest), 1 req/5sec (premium)
- **Monitoring**: Manual only (no automatic rate limits)
- **User Management**: 1 req/30sec per user

### Error Handling
Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Please wait before making another request",
    "retryAfter": 5000
  }
}
```

## 🔧 Development Guidelines

### Local Testing
```bash
# Start Supabase locally (optional)
supabase start

# Deploy functions for testing
supabase functions deploy function-name
```

### Edge Function Best Practices
1. **Always add CORS headers**
2. **Implement proper error handling**
3. **Use conservative timeouts** (30s max)
4. **Add comprehensive logging**
5. **Monitor usage carefully**

### Emergency Protocols
If edge function usage approaches limits:
1. **Disable all auto-polling immediately**
2. **Switch monitoring to manual-only mode**
3. **Increase polling intervals to 5+ minutes**
4. **Document usage patterns and optimize**

## 📚 Integration Examples

### Complete Story Generation Flow
```typescript
const generateStory = async (userType: 'guest' | 'premium') => {
  try {
    // Check user status
    const { data: status } = await supabase.functions.invoke('check-premium-status');
    
    // Generate story based on user type
    const storyMode = userType === 'guest' ? 'netflix' : 'live';
    const expectedPages = userType === 'guest' ? 12 : 999;
    
    const { data: story } = await supabase.functions.invoke('generate-adaptive-story', {
      body: { storyMode, expectedPages, pageNumber: 1 }
    });
    
    // Process content
    const { data: processed } = await supabase.functions.invoke('process-story-content', {
      body: { rawContent: story.content, processingMode: 'full' }
    });
    
    // Generate image
    const { data: image } = await supabase.functions.invoke('runware-generate-image', {
      body: { 
        prompt: `Illustration for: ${processed.content.substring(0, 100)}...`,
        styleFramework: 'children-book'
      }
    });
    
    return { story: processed, image };
    
  } catch (error) {
    console.error('Story generation failed:', error);
    // Implement fallback logic
  }
};
```

### Monitoring Dashboard (Manual Refresh)
```typescript
const MonitoringDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const { data: monitoring } = await supabase.functions.invoke('get-monitoring-data');
      setData(monitoring);
    } catch (error) {
      console.error('Monitoring refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ✅ Manual refresh only - no useEffect with intervals
  return (
    <div>
      <Button onClick={handleManualRefresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </Button>
      {data && <MonitoringDisplay data={data} />}
    </div>
  );
};
```

---

**Last Updated**: January 2025  
**Version**: 3.0 (Emergency Throttling Edition)  
**API Status**: Production Ready with Usage Controls ✅