# System Integration Guide

## Overview
This guide covers the technical integration patterns, service interactions, and implementation details for the AI Story Generation System's 38 Supabase functions and frontend services.

## Frontend Service Architecture

### Core Service Hierarchy
```
StoryGenerationOrchestrator
├── LiveGenerationService (Premium AI)
├── EnhancedFallbackManager (Template System)  
├── EnhancedPostProcessor (Grammar & Consistency)
├── CharacterConsistencyService (Visual Continuity)
├── PlaceholderValidationService (Data Validation)
└── DifficultyLevelMapper (Level Translation)
```

### Service Integration Patterns

#### Primary Generation Flow
```typescript
// Story generation orchestration
class StoryGenerationOrchestrator {
  async generatePage(request: StoryRequest): Promise<StoryPage> {
    try {
      // Tier 1: Premium AI generation
      if (await this.isPremiumAvailable(request.userId)) {
        return await LiveGenerationService.generatePage(request);
      }
      
      // Tier 2: Enhanced template fallback
      return await EnhancedFallbackManager.generatePage(request);
    } catch (error) {
      // Tier 3: Nuclear fallback with guaranteed success
      return await this.generateNuclearFallback(request);
    }
  }
}
```

#### Service Composition Pattern
```typescript
// Composed service interaction
const processStoryContent = async (pages: string[], userInfo: UserInfo) => {
  // Step 1: Initialize character context
  await CharacterConsistencyService.initializeContext(userInfo, sessionId);
  
  // Step 2: Process pages through grammar pipeline
  const processedPages = await EnhancedPostProcessor.processStoryContent(
    pages, 
    userInfo, 
    sessionId
  );
  
  // Step 3: Validate and ensure consistency
  const validationResults = await PlaceholderValidationService.validate(
    processedPages,
    userInfo
  );
  
  return {
    pages: processedPages,
    validation: validationResults,
    consistency: await CharacterConsistencyService.getReport(sessionId)
  };
}
```

## Supabase Function Integration

### Function Call Patterns

#### Standard Function Invocation
```typescript
// Primary AI story enhancement
const enhanceStory = async (storyData: StoryRequest) => {
  const { data, error } = await supabase.functions.invoke('ai-story-enhancer', {
    body: {
      storyText: storyData.content,
      userInfo: storyData.userInfo,
      sessionId: storyData.sessionId,
      pageNumber: storyData.pageNumber
    }
  });
  
  if (error) {
    throw new Error(`Story enhancement failed: ${error.message}`);
  }
  
  return data;
}
```

#### Image Generation Integration
```typescript
// Multi-tier image generation
const generateStoryImage = async (imageRequest: ImageRequest) => {
  try {
    // Tier 1: Premium Runware generation
    return await supabase.functions.invoke('runware-generate-image', {
      body: {
        positivePrompt: imageRequest.prompt,
        userInfo: imageRequest.userInfo,
        pageNumber: imageRequest.pageNumber,
        sessionId: imageRequest.sessionId
      }
    });
  } catch (error) {
    console.log('Runware failed, falling back to OpenAI');
    
    // Tier 3: OpenAI DALL-E fallback
    return await supabase.functions.invoke('openai-image', {
      body: {
        positivePrompt: imageRequest.prompt,
        quality: 'high',
        style: 'vivid',
        userInfo: imageRequest.userInfo
      }
    });
  }
}
```

### Error Handling Patterns

#### Graceful Degradation
```typescript
class ServiceErrorHandler {
  static async handleServiceError(error: any, context: string) {
    // Log error for debugging
    console.error(`Service error in ${context}:`, error);
    
    // Determine fallback strategy
    switch (context) {
      case 'ai-enhancement':
        return this.fallbackToTemplates();
      case 'image-generation':
        return this.fallbackToSimpleImage();
      case 'grammar-processing':
        return this.basicGrammarFallback();
      default:
        throw new Error(`Unhandled service error in ${context}`);
    }
  }
  
  private static async fallbackToTemplates() {
    console.log('AI unavailable, using template system');
    return EnhancedFallbackManager.getRandomTemplate();
  }
}
```

#### Retry Logic with Exponential Backoff
```typescript
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`Retry attempt ${attempt} after ${delay}ms delay`);
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## State Management Integration

### Session Management
```typescript
interface SessionState {
  sessionId: string;
  userId: string;
  currentPage: number;
  storyContext: StoryContext;
  characterSeeds: CharacterSeed[];
  userPreferences: UserInfo;
  generationMode: 'premium' | 'template' | 'fallback';
}

class SessionManager {
  private state: SessionState;
  
  async initializeSession(userId: string, userInfo: UserInfo) {
    this.state = {
      sessionId: generateSessionId(),
      userId,
      currentPage: 0,
      storyContext: await this.buildInitialContext(userInfo),
      characterSeeds: [],
      userPreferences: userInfo,
      generationMode: await this.determineGenerationMode(userId)
    };
    
    return this.state.sessionId;
  }
  
  async updateSessionContext(newContext: Partial<StoryContext>) {
    this.state.storyContext = { ...this.state.storyContext, ...newContext };
    await this.persistSessionState();
  }
}
```

### Real-Time State Updates
```typescript
// WebSocket integration for real-time updates
class RealTimeStoryUpdater {
  private ws: WebSocket;
  
  async connectToStorySession(sessionId: string) {
    this.ws = new WebSocket(`wss://your-websocket-endpoint/${sessionId}`);
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleStoryUpdate(update);
    };
  }
  
  private handleStoryUpdate(update: StoryUpdate) {
    switch (update.type) {
      case 'page-generated':
        this.updateStoryDisplay(update.page);
        break;
      case 'character-updated':
        CharacterConsistencyService.updateCharacter(update.character);
        break;
      case 'generation-status':
        this.updateLoadingState(update.status);
        break;
    }
  }
}
```

## Data Flow Orchestration

### Request Processing Pipeline
```typescript
class RequestPipeline {
  private stages = [
    this.validateInput,
    this.enrichUserContext,
    this.determineGenerationStrategy,
    this.processStoryGeneration,
    this.applyPostProcessing,
    this.validateOutput,
    this.cacheResults
  ];
  
  async process(request: StoryRequest): Promise<StoryResponse> {
    let context = { request, intermediate: {} };
    
    for (const stage of this.stages) {
      context = await stage.call(this, context);
    }
    
    return context.response;
  }
  
  private async validateInput(context: ProcessingContext) {
    const validation = await PlaceholderValidationService.validateUserData(
      context.request.userInfo
    );
    
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }
    
    return context;
  }
  
  private async determineGenerationStrategy(context: ProcessingContext) {
    const strategy = await this.selectOptimalStrategy(context.request);
    context.intermediate.strategy = strategy;
    return context;
  }
}
```

### Parallel Processing Optimization
```typescript
// Concurrent service calls for performance
const generateStoryPageOptimized = async (request: StoryRequest) => {
  // Start multiple operations in parallel
  const [
    storyContent,
    imageGeneration,
    characterConsistency,
    culturalContext
  ] = await Promise.allSettled([
    generateStoryContent(request),
    generateStoryImage(request),
    validateCharacterConsistency(request.sessionId),
    applyCulturalContext(request.userInfo)
  ]);
  
  // Combine results with error handling
  return {
    content: storyContent.status === 'fulfilled' ? storyContent.value : null,
    image: imageGeneration.status === 'fulfilled' ? imageGeneration.value : null,
    consistency: characterConsistency.status === 'fulfilled' ? characterConsistency.value : null,
    cultural: culturalContext.status === 'fulfilled' ? culturalContext.value : null,
    errors: [storyContent, imageGeneration, characterConsistency, culturalContext]
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason)
  };
}
```

## Authentication & Security Integration

### JWT Token Management
```typescript
class AuthenticationService {
  private token: string | null = null;
  
  async getAuthenticatedSupabaseClient() {
    if (!this.token || this.isTokenExpired()) {
      await this.refreshToken();
    }
    
    return supabase.auth.setSession({
      access_token: this.token,
      refresh_token: await this.getRefreshToken()
    });
  }
  
  async callSecureFunction(functionName: string, payload: any) {
    const client = await this.getAuthenticatedSupabaseClient();
    
    return client.functions.invoke(functionName, {
      body: payload,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Client-Info': 'story-generator-app'
      }
    });
  }
}
```

### Input Sanitization Pipeline
```typescript
class SecurityValidator {
  static sanitizeUserInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeUserInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeUserInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
  
  private static sanitizeString(str: string): string {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .slice(0, 1000); // Limit length
  }
}
```

## Performance Monitoring Integration

### Service Performance Tracking
```typescript
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  
  async measureServiceCall<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      this.recordSuccess(serviceName, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordError(serviceName, performance.now() - startTime, error);
      throw error;
    }
  }
  
  private recordSuccess(service: string, duration: number) {
    const metric = this.getOrCreateMetric(service);
    metric.totalCalls++;
    metric.successfulCalls++;
    metric.totalDuration += duration;
    metric.averageDuration = metric.totalDuration / metric.totalCalls;
  }
  
  getPerformanceReport(): PerformanceReport {
    return {
      services: Array.from(this.metrics.entries()).map(([name, metric]) => ({
        serviceName: name,
        averageResponseTime: metric.averageDuration,
        successRate: metric.successfulCalls / metric.totalCalls,
        totalCalls: metric.totalCalls
      }))
    };
  }
}
```

### Real-Time Monitoring Dashboard
```typescript
class MonitoringDashboard {
  async getSystemHealth(): Promise<SystemHealth> {
    const [
      supabaseFunctions,
      templateLibrary,
      grammarProcessor,
      characterService
    ] = await Promise.all([
      this.checkSupabaseFunctions(),
      this.checkTemplateLibrary(),
      this.checkGrammarProcessor(),
      this.checkCharacterService()
    ]);
    
    return {
      overallStatus: this.calculateOverallStatus([
        supabaseFunctions,
        templateLibrary,
        grammarProcessor,
        characterService
      ]),
      services: {
        supabaseFunctions,
        templateLibrary,
        grammarProcessor,
        characterService
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

## Testing Integration Patterns

### Service Integration Tests
```typescript
describe('Story Generation Integration', () => {
  test('should generate story with full pipeline', async () => {
    // Setup test user data
    const testUser = createTestUserInfo();
    const sessionId = 'test-session-123';
    
    // Mock external services
    mockSupabaseFunction('ai-story-enhancer', mockAIResponse);
    mockSupabaseFunction('runware-generate-image', mockImageResponse);
    
    // Execute full pipeline
    const result = await StoryGenerationOrchestrator.generatePage({
      userInfo: testUser,
      sessionId,
      pageNumber: 1,
      content: 'Test story content'
    });
    
    // Verify results
    expect(result.content).toBeDefined();
    expect(result.image).toBeDefined();
    expect(result.grammarScore).toBeGreaterThan(0.8);
  });
  
  test('should fallback gracefully on service failure', async () => {
    // Simulate service failures
    mockSupabaseFunction('ai-story-enhancer', () => Promise.reject(new Error('AI service down')));
    
    const result = await StoryGenerationOrchestrator.generatePage({
      userInfo: createTestUserInfo(),
      sessionId: 'test-session-456',
      pageNumber: 1,
      content: 'Test story content'
    });
    
    // Should still return valid story via fallback
    expect(result.content).toBeDefined();
    expect(result.source).toBe('template-fallback');
  });
});
```

This integration guide provides the technical foundation for implementing, maintaining, and extending the AI Story Generation System while ensuring robust service interactions and graceful error handling across all components.