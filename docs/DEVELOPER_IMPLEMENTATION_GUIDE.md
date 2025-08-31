# Developer Implementation Guide - Story Generation System

## Quick Start

### **Current System Overview**
The story generation system uses a 4-tier architecture with 2-attempt AI generation. All new implementations should use the unified bundle-based approach.

```typescript
// Frontend: Use the unified hook
import { useUnifiedStoryGeneration } from '@/hooks/useUnifiedStoryGeneration';

const { generateStory, isGenerating, error } = useUnifiedStoryGeneration();

// Generate a story (handles entire pipeline automatically)
const result = await generateStory(userInfo, {
  sessionType: 'premium',
  pageNumber: 1,
  existingStory: previousContent
});
```

## **Implementation Patterns**

### **1. Frontend Story Generation**
```typescript
// DON'T: Call edge function directly
const response = await supabase.functions.invoke('generate-adaptive-story', {
  body: { userInfo, preferences }
});

// DO: Use the unified service
const result = await StoryGenerationService.generateStory(userInfo, {
  sessionType: 'premium',
  pageNumber: 1
});
```

### **2. Bundle Creation Pattern**
```typescript
// The service handles 4-layer resolution automatically:
const bundle: StoryGenerationBundle = {
  storyContent: resolvedPrompt,  // All placeholders resolved
  systemSettings: {
    gradeLevel: convertedGradeLevel,
    sessionType,
    vocabularyIntegration,      // From VocabularyService
    themeIntent                 // From extractThemeIntent()
  }
};
```

### **3. Vocabulary Integration**
```typescript
// Vocabulary is automatically integrated - no manual handling needed
const vocabularyData = await VocabularyService.fetchAllVocabulary(userInfo);
// This is included in bundle creation automatically

// For tracking vocabulary encounters (optional):
await VocabularyTrackingService.logEncounter(word, definition, complexity);
```

## **Key Components Deep Dive**

### **StoryGenerationService**
**Location**: `src/services/storyGenerationService.ts`

#### **Main Method: generateStory()**
```typescript
static async generateStory(
  userInfo: UserInfo, 
  config: { 
    sessionType?: 'free' | 'premium'; 
    pageNumber?: number; 
    existingStory?: string; 
  }
): Promise<StoryGenerationResult>
```

#### **4-Layer Priority System Implementation**
```typescript
private static resolveAllPlaceholders(
  userInfo: UserInfo,
  vocabularyIntegration: VocabularyIntegration,
  themeIntent: ThemeIntent
): string {
  // Layer 1: Essential user information (highest priority)
  let resolvedContent = applyEssentialUserInfo(baseContent, userInfo);
  
  // Layer 2: Theme intent integration
  resolvedContent = applyThemeIntent(resolvedContent, themeIntent);
  
  // Layer 3: Vocabulary requirements
  resolvedContent = applyVocabularyIntegration(resolvedContent, vocabularyIntegration);
  
  // Layer 4: Creative seeds and fallbacks (lowest priority)
  resolvedContent = applyCreativeSeeds(resolvedContent);
  
  return resolvedContent;
}
```

### **Streamlined Handler**
**Location**: `supabase/functions/generate-adaptive-story/streamlined-handler.ts`

#### **2-Attempt Generation Pattern**
```typescript
export async function generateWithOpenAI(prompt: string, bundle: StreamlinedBundle): Promise<string> {
  const models = ['gpt-4.1-2025-04-14', 'gpt-4o-mini'];
  
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const model = models[attempt - 1];
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: enhancedPrompt },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: tokenBudget  // Note: newer models use max_completion_tokens
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed with ${models[attempt - 1]}:`, error);
      if (attempt === 2) throw error;
    }
  }
}
```

### **Vocabulary Integration Patterns**
**Location**: `src/services/vocabularyTrackingService.ts`

#### **Silent Failure Implementation**
```typescript
static async logEncounter(word: string, definition: string, complexity?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Only track for authenticated users

    // Database operations...
  } catch (e) {
    console.warn('Failed to log vocabulary encounter', e);
    // Silent failure - never throw errors that would block story generation
  }
}
```

## **Error Handling Patterns**

### **Graceful Degradation**
```typescript
// Frontend error handling
try {
  const result = await StoryGenerationService.generateStory(userInfo, config);
  return result;
} catch (error) {
  // System automatically attempts fallbacks at edge function level
  // Frontend should handle final failure gracefully
  return {
    success: false,
    error: 'Story generation temporarily unavailable',
    fallbackContent: getEmergencyContent()
  };
}
```

### **Edge Function Error Recovery**
```typescript
// Built into streamlined-handler.ts
try {
  // Primary AI generation attempt
  const content = await generateWithOpenAI(prompt, bundle);
  return { success: true, content };
} catch (error) {
  // Automatic model fallback already attempted
  console.error('❌ STREAMLINED: Generation failed:', error.message);
  return { success: false, error: error.message };
}
```

## **Performance Optimization**

### **Bundle Size Optimization**
```typescript
// DO: Pre-process everything on frontend
const optimizedBundle = {
  storyContent: resolveAllPlaceholders(baseContent, context), // ~1-2KB
  systemSettings: minimizeSettings(settings)
};

// DON'T: Send raw user data to edge function
const bloatedPayload = {
  userInfo: fullUserProfile,     // Large object
  templates: allTemplates,       // Massive arrays
  vocabulary: entireVocabSet     // Thousands of words
};
```

### **Async Patterns**
```typescript
// Vocabulary tracking doesn't block story generation
const generateStory = async (userInfo, config) => {
  const result = await generateStoryContent(userInfo, config);
  
  // Fire and forget - don't await
  VocabularyTrackingService.logEncounter(word, definition).catch(console.warn);
  
  return result;
};
```

## **Testing Patterns**

### **Unit Testing Components**
```typescript
// Test the service layer
describe('StoryGenerationService', () => {
  it('should create valid bundles', () => {
    const userInfo = mockUserInfo();
    const bundle = StoryGenerationService.createBundle(userInfo);
    expect(bundle.storyContent).toContain(userInfo.userName);
    expect(bundle.systemSettings.gradeLevel).toBeGreaterThan(0);
  });
});

// Test vocabulary integration
describe('VocabularyTrackingService', () => {
  it('should handle unauthenticated users gracefully', async () => {
    // Should not throw even when user is not logged in
    await expect(VocabularyTrackingService.logEncounter('test', 'definition')).resolves.not.toThrow();
  });
});
```

### **Integration Testing**
```typescript
// Test the complete pipeline
describe('Story Generation Pipeline', () => {
  it('should generate stories end-to-end', async () => {
    const userInfo = validUserInfo();
    const result = await StoryGenerationService.generateStory(userInfo, {
      sessionType: 'premium'
    });
    
    expect(result.success).toBe(true);
    expect(result.story).toBeDefined();
    expect(result.story[0].text).toContain(userInfo.userName);
  });
});
```

## **Common Pitfalls & Solutions**

### **1. Direct Edge Function Calls**
```typescript
// ❌ WRONG: Bypassing the 4-tier system
const result = await supabase.functions.invoke('generate-adaptive-story', {
  body: { prompt: 'raw prompt' }
});

// ✅ CORRECT: Using the unified system
const result = await StoryGenerationService.generateStory(userInfo, config);
```

### **2. Blocking on Vocabulary Operations**
```typescript
// ❌ WRONG: Blocking story generation
try {
  await VocabularyTrackingService.logEncounter(word, definition);
  return await generateStory();
} catch (vocabError) {
  throw vocabError; // This breaks story generation!
}

// ✅ CORRECT: Non-blocking vocabulary tracking
const storyResult = await generateStory();
VocabularyTrackingService.logEncounter(word, definition).catch(console.warn);
return storyResult;
```

### **3. Missing Error Boundaries**
```typescript
// ❌ WRONG: Unhandled errors crash the UI
const MyComponent = () => {
  const result = await generateStory(userInfo);
  return <div>{result.story[0].text}</div>; // Crashes if result.story is undefined
};

// ✅ CORRECT: Proper error handling
const MyComponent = () => {
  try {
    const result = await generateStory(userInfo);
    if (!result.success || !result.story) {
      return <ErrorFallback />;
    }
    return <div>{result.story[0].text}</div>;
  } catch (error) {
    return <ErrorFallback error={error} />;
  }
};
```

## **Debug Patterns**

### **Frontend Debugging**
```typescript
// Enable verbose logging in development
const debugStoryGeneration = async (userInfo, config) => {
  console.log('🚀 Starting story generation:', { userInfo, config });
  
  const result = await StoryGenerationService.generateStory(userInfo, config);
  
  console.log('📊 Generation result:', {
    success: result.success,
    storyLength: result.story?.[0]?.text?.length,
    processingTime: result.metadata?.processingTime,
    model: result.metadata?.model
  });
  
  return result;
};
```

### **Edge Function Debugging**
```typescript
// Built-in logging in streamlined-handler.ts
console.log('🎯 STREAMLINED: Processing lean bundle');
console.log(`🤖 AI Attempt 1/2 using ${model}: {
  gradeLevel: ${gradeLevel},
  tokenBudget: ${tokenBudget},
  qualityFirst: true,
  hasTargetVocabulary: ${hasTargetVocabulary}
}`);
```

## **Extension Points**

### **Adding New AI Models**
```typescript
// Extend the model array in streamlined-handler.ts
const models = [
  'gpt-4.1-2025-04-14',    // Primary
  'gpt-4o-mini',           // Current fallback
  'gpt-5-nano-2025-08-07' // New fallback option
];
```

### **Custom Vocabulary Integration**
```typescript
// Extend VocabularyTrackingService
class CustomVocabularyTracker extends VocabularyTrackingService {
  static async logComplexEncounter(word: string, context: string, difficulty: number) {
    // Enhanced tracking logic
    await super.logEncounter(word, this.extractDefinition(context), difficulty.toString());
  }
}
```

### **Theme Intent Extensions**
```typescript
// Extend theme extraction in themeIntent.ts
export function extractAdvancedThemeIntent(userInfo: UserInfo): ExtendedThemeIntent {
  const baseIntent = extractThemeIntent(userInfo);
  
  return {
    ...baseIntent,
    emotionalTone: this.extractEmotionalTone(userInfo.specialRequest),
    complexityLevel: this.analyzeComplexity(userInfo.specialRequest),
    narrativePacing: this.determinePacing(userInfo.gradeLevel)
  };
}
```

---

## **Quick Reference**

### **Most Common Operations**
```typescript
// Generate a story (complete pipeline)
const result = await StoryGenerationService.generateStory(userInfo, config);

// Track vocabulary (non-blocking)
VocabularyTrackingService.logEncounter(word, definition).catch(console.warn);

// Extract theme intent from user input
const themeIntent = extractThemeIntent(userInfo);

// Use the unified hook in components
const { generateStory, isGenerating, error } = useUnifiedStoryGeneration();
```

### **Key Files to Understand**
1. `src/services/storyGenerationService.ts` - Frontend orchestration
2. `supabase/functions/generate-adaptive-story/streamlined-handler.ts` - AI generation
3. `src/hooks/useUnifiedStoryGeneration.ts` - React integration
4. `src/services/vocabularyTrackingService.ts` - Vocabulary tracking

### **Performance Targets**
- Bundle size: <2KB processed content
- Generation time: 2-10 seconds
- Success rate: >95% with fallback
- Vocabulary tracking: >90% for authenticated users