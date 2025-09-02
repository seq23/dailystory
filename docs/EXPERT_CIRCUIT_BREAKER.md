# Expert Circuit Breaker System - Technical Specification

## Overview
Advanced 6-attempt progressive model chain specifically designed for expert difficulty levels (grades 6-10), providing maximum quality generation with intelligent fallback mechanisms and <10 second performance targets.

## Expert Level Model Chain

### 6-Attempt Progressive Strategy
**Optimized for Quality → Reliability → Performance**

```typescript
interface ExpertModelConfig {
  model: string;
  attempt: number;
  purpose: string;
  expectedQuality: 'maximum' | 'high' | 'good' | 'reliable';
  averageTime: number; // milliseconds
  successRate: number; // percentage
}

const EXPERT_MODEL_CHAIN: ExpertModelConfig[] = [
  {
    model: \"gpt-5\",
    attempt: 1,
    purpose: \"Maximum quality generation\",
    expectedQuality: 'maximum',
    averageTime: 8000,
    successRate: 75
  },
  {
    model: \"gpt-4.1-2025-04-14\", 
    attempt: 2,
    purpose: \"High reliability with proven performance\",
    expectedQuality: 'high',
    averageTime: 6500,
    successRate: 85
  },
  {
    model: \"gpt-5-mini\",
    attempt: 3, 
    purpose: \"Fast quality generation\",
    expectedQuality: 'high',
    averageTime: 4000,
    successRate: 80
  },
  {
    model: \"gpt-4.1-2025-04-14\",
    attempt: 4,
    purpose: \"Proven fallback reliability\",
    expectedQuality: 'good',
    averageTime: 6500,
    successRate: 90
  },
  {
    model: \"gpt-4o\",
    attempt: 5,
    purpose: \"Stable generation with good quality\",
    expectedQuality: 'good', 
    averageTime: 5000,
    successRate: 95
  },
  {
    model: \"gpt-4o-mini\",
    attempt: 6,
    purpose: \"Guaranteed success fallback\",
    expectedQuality: 'reliable',
    averageTime: 3000,
    successRate: 98
  }
];
```

## Grade-Specific Configuration

### Token Limits by Expert Grade
```typescript
const EXPERT_GRADE_TOKENS: Record<ExpertGradeLevel, number> = {
  \"6th\": 1800,  // 6th grade complexity
  \"7th\": 2000,  // 7th grade complexity  
  \"8th\": 2200,  // 8th grade complexity
  \"9th\": 2400,  // 9th grade complexity
  \"10th\": 2500  // 10th grade complexity
};

function getTokensForExpertGrade(grade: ExpertGradeLevel): number {
  return EXPERT_GRADE_TOKENS[grade];
}
```

### Grade Level Cycling within Expert
```typescript
// Expert difficulty cycles through grades 6-10
function getExpertGradeLevel(baseGrade?: ExpertGradeLevel): ExpertGradeLevel {
  if (baseGrade) return baseGrade;
  
  // Cycle through expert grades for variety
  const grades: ExpertGradeLevel[] = [\"6th\", \"7th\", \"8th\", \"9th\", \"10th\"];
  const cycleIndex = Math.floor(Date.now() / (1000 * 60 * 60)) % grades.length;
  
  return grades[cycleIndex];
}
```

## API Compatibility Layer

### Model-Specific Parameter Mapping
```typescript
interface AIModelParams {
  model: string;
  messages: ChatMessage[];
  max_completion_tokens?: number; // Newer models
  max_tokens?: number;           // Legacy models
  temperature: number;
  response_format?: { type: \"text\" };
}

function getModelParams(model: string, tokenLimit: number, messages: ChatMessage[]): AIModelParams {
  const baseParams = {
    model,
    messages,
    temperature: 0.7
  };
  
  // Newer models (GPT-5, GPT-4.1) support new parameters
  if (model.includes('gpt-5') || model.includes('gpt-4.1')) {
    return {
      ...baseParams,
      max_completion_tokens: tokenLimit,
      response_format: { type: \"text\" }
    };
  }
  
  // Legacy models (GPT-4o series) use older parameters
  return {
    ...baseParams,
    max_tokens: tokenLimit
    // No response_format support
  };
}
```

### Temperature and Quality Adjustment
```typescript
function getModelTemperature(model: string, attempt: number): number {
  // Lower temperature for later attempts (more focused)
  const baseTemperature = 0.7;
  const temperatureReduction = (attempt - 1) * 0.1;
  
  // Newer models can handle slightly higher creativity
  if (model.includes('gpt-5')) {
    return Math.max(0.5, baseTemperature - temperatureReduction + 0.1);
  }
  
  return Math.max(0.3, baseTemperature - temperatureReduction);
}
```

## Circuit Breaker Implementation

### Expert Generation Handler
**File**: `supabase/functions/generate-adaptive-story/streamlined-handler.ts`
```typescript
async function handleExpertGeneration(
  bundle: StoryGenerationBundle,
  gradeLevel: ExpertGradeLevel
): Promise<GenerationResult> {
  const startTime = Date.now();
  console.log(`🎯 Expert Circuit Breaker: Starting ${gradeLevel} generation`);
  
  for (const [index, modelConfig] of EXPERT_MODEL_CHAIN.entries()) {
    const attemptStart = Date.now();
    
    try {
      console.log(`🎯 Expert Attempt ${modelConfig.attempt}/6: ${modelConfig.model} (${modelConfig.purpose})`);
      
      // Get model-specific parameters
      const tokenLimit = getTokensForExpertGrade(gradeLevel);
      const temperature = getModelTemperature(modelConfig.model, modelConfig.attempt);
      
      // Execute generation with timeout
      const result = await Promise.race([
        generateWithExpertModel(modelConfig.model, bundle, tokenLimit, temperature),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after 15s for ${modelConfig.model}`)), 15000);
        })
      ]);
      
      const attemptTime = Date.now() - attemptStart;
      console.log(`✅ Expert Success: ${modelConfig.model} in ${attemptTime}ms (attempt ${modelConfig.attempt})`);
      
      // Record success metrics
      ExpertMetrics.recordSuccess(modelConfig.model, modelConfig.attempt, attemptTime, gradeLevel);
      
      return {
        success: true,
        content: result,
        model: modelConfig.model,
        attempt: modelConfig.attempt,
        processingTime: Date.now() - startTime,
        gradeLevel,
        quality: modelConfig.expectedQuality
      };
      
    } catch (error) {
      const attemptTime = Date.now() - attemptStart;
      console.warn(`⚠️ Expert Attempt ${modelConfig.attempt} failed: ${error.message} (${attemptTime}ms)`);
      
      // Record failure metrics
      ExpertMetrics.recordFailure(modelConfig.model, modelConfig.attempt, error.message, gradeLevel);
      
      // Continue to next model unless this is the final attempt
      if (index < EXPERT_MODEL_CHAIN.length - 1) {
        // Progressive backoff delay
        const backoffDelay = Math.min(1000 * Math.pow(1.5, index), 3000);
        console.log(`⏳ Waiting ${backoffDelay}ms before next expert attempt...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
    }
  }
  
  const totalTime = Date.now() - startTime;
  console.error(`❌ Expert Circuit Breaker: All 6 attempts failed in ${totalTime}ms`);
  
  throw new Error(`Expert circuit breaker exhausted for ${gradeLevel} after ${totalTime}ms`);
}
```

### Expert-Specific AI Generation
```typescript
async function generateWithExpertModel(
  model: string,
  bundle: StoryGenerationBundle,
  tokenLimit: number,
  temperature: number
): Promise<string> {
  const messages = [
    {
      role: \"system\",
      content: `You are an expert children's story writer creating content for ${bundle.systemSettings.gradeLevel} level readers. 
      
      EXPERT QUALITY REQUIREMENTS:
      - Rich vocabulary appropriate for the grade level
      - Complex narrative structures with multiple story elements
      - Character development and emotional depth
      - Educational themes woven naturally into the story
      - Engaging dialogue and descriptive language
      
      CRITICAL: Generate exactly ${Math.floor(tokenLimit / 100)} pages of story content. Do not include titles, chapter headings, or formatting.`
    },
    {
      role: \"user\", 
      content: bundle.storyContent
    }
  ];
  
  const params = getModelParams(model, tokenLimit, messages);
  params.temperature = temperature;
  
  // Add expert-specific prompt enhancements
  if (bundle.systemSettings.vocabularyIntegration?.targetWords?.length > 0) {
    const vocabPrompt = `\n\nTarget vocabulary to incorporate naturally: ${bundle.systemSettings.vocabularyIntegration.targetWords.join(', ')}`;
    params.messages[1].content += vocabPrompt;
  }
  
  const response = await openai.chat.completions.create(params);
  
  if (!response.choices?.[0]?.message?.content) {
    throw new Error(`Empty response from ${model}`);
  }
  
  return response.choices[0].message.content.trim();
}
```

## Performance Monitoring & Analytics

### Expert Metrics Collection
```typescript
interface ExpertMetrics {
  gradeLevel: ExpertGradeLevel;
  model: string;
  attempt: number;
  success: boolean;
  processingTime: number;
  errorMessage?: string;
  timestamp: Date;
  quality?: string;
}

class ExpertAnalytics {
  private static metrics: ExpertMetrics[] = [];
  
  static recordSuccess(
    model: string, 
    attempt: number, 
    processingTime: number, 
    gradeLevel: ExpertGradeLevel
  ) {
    this.metrics.push({
      gradeLevel,
      model,
      attempt,
      success: true,
      processingTime,
      timestamp: new Date()
    });
    
    // Keep only recent metrics (last 1000 entries)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  static recordFailure(
    model: string,
    attempt: number,
    errorMessage: string,
    gradeLevel: ExpertGradeLevel
  ) {
    this.metrics.push({
      gradeLevel,
      model,
      attempt,
      success: false,
      processingTime: 0,
      errorMessage,
      timestamp: new Date()
    });
  }
  
  static getSuccessRateByModel(): Record<string, number> {
    const modelStats: Record<string, { success: number; total: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!modelStats[metric.model]) {
        modelStats[metric.model] = { success: 0, total: 0 };
      }
      
      modelStats[metric.model].total++;
      if (metric.success) {
        modelStats[metric.model].success++;
      }
    });
    
    const successRates: Record<string, number> = {};
    Object.entries(modelStats).forEach(([model, stats]) => {
      successRates[model] = stats.total > 0 ? stats.success / stats.total : 0;
    });
    
    return successRates;
  }
  
  static getAverageProcessingTimeByGrade(): Record<ExpertGradeLevel, number> {
    const gradeStats: Record<string, { total: number; sum: number }> = {};
    
    this.metrics
      .filter(m => m.success && m.processingTime > 0)
      .forEach(metric => {
        if (!gradeStats[metric.gradeLevel]) {
          gradeStats[metric.gradeLevel] = { total: 0, sum: 0 };
        }
        
        gradeStats[metric.gradeLevel].total++;
        gradeStats[metric.gradeLevel].sum += metric.processingTime;
      });
    
    const averages: Record<string, number> = {};
    Object.entries(gradeStats).forEach(([grade, stats]) => {
      averages[grade] = stats.total > 0 ? stats.sum / stats.total : 0;
    });
    
    return averages as Record<ExpertGradeLevel, number>;
  }
}
```

## Performance Targets & SLA

### Expert Level Performance Standards
```typescript
const EXPERT_PERFORMANCE_TARGETS = {
  // Time targets
  MAXIMUM_GENERATION_TIME: 10000,     // 10 seconds max
  AVERAGE_GENERATION_TIME: 7000,      // 7 seconds average
  PER_ATTEMPT_TIMEOUT: 15000,         // 15 seconds per attempt
  
  // Success rate targets  
  OVERALL_SUCCESS_RATE: 0.95,         // 95% minimum success
  FIRST_ATTEMPT_SUCCESS: 0.75,        // 75% GPT-5 success target
  SECOND_ATTEMPT_SUCCESS: 0.85,       // 85% GPT-4.1 success target
  FALLBACK_SUCCESS_RATE: 0.98,        // 98% final attempt success
  
  // Quality targets
  MINIMUM_PAGES_GENERATED: 8,         // At least 8 pages for expert
  VOCABULARY_INTEGRATION_RATE: 0.80,  // 80% vocab integration
  CONTENT_COMPLEXITY_SCORE: 0.85,     // Educational complexity
  
  // Circuit breaker thresholds
  MAX_CONSECUTIVE_FAILURES: 5,        // Circuit breaker activation
  DEGRADED_MODE_THRESHOLD: 0.80,      // Switch to degraded mode
  RECOVERY_SUCCESS_THRESHOLD: 0.90    // Exit degraded mode
} as const;
```

### Degraded Mode Operation
```typescript
interface DegradedModeConfig {
  enabled: boolean;
  triggerThreshold: number;
  recoveryThreshold: number;
  simplifiedModelChain: string[];
  reducedTokenLimits: boolean;
}

class ExpertCircuitBreakerState {
  private static degradedMode: DegradedModeConfig = {
    enabled: false,
    triggerThreshold: 0.80,
    recoveryThreshold: 0.90,
    simplifiedModelChain: [\"gpt-4o\", \"gpt-4o-mini\"],
    reducedTokenLimits: true
  };
  
  static checkDegradedMode(): boolean {
    const recentSuccessRate = ExpertAnalytics.getRecentSuccessRate(100); // Last 100 requests
    
    if (!this.degradedMode.enabled && recentSuccessRate < this.degradedMode.triggerThreshold) {
      console.warn(`🚨 Activating Expert Degraded Mode: Success rate ${recentSuccessRate} < ${this.degradedMode.triggerThreshold}`);
      this.degradedMode.enabled = true;
      return true;
    }
    
    if (this.degradedMode.enabled && recentSuccessRate > this.degradedMode.recoveryThreshold) {
      console.log(`✅ Recovering from Expert Degraded Mode: Success rate ${recentSuccessRate} > ${this.degradedMode.recoveryThreshold}`);
      this.degradedMode.enabled = false;
      return false;
    }
    
    return this.degradedMode.enabled;
  }
  
  static getEffectiveModelChain(): ExpertModelConfig[] {
    if (this.degradedMode.enabled) {
      return EXPERT_MODEL_CHAIN.filter(config => 
        this.degradedMode.simplifiedModelChain.includes(config.model)
      );
    }
    
    return EXPERT_MODEL_CHAIN;
  }
}
```

## Testing & Validation

### Circuit Breaker Testing Suite
```typescript
describe('Expert Circuit Breaker System', () => {
  beforeEach(() => {
    ExpertAnalytics.clearMetrics();
    ExpertCircuitBreakerState.reset();
  });
  
  test('should complete 6-attempt chain for 10th grade', async () => {
    const mockBundle = createMockExpertBundle('10th');
    
    // Mock all attempts to fail except the last
    const mockFailures = 5;
    mockOpenAIResponses(mockFailures);
    
    const result = await handleExpertGeneration(mockBundle, '10th');
    
    expect(result.success).toBe(true);
    expect(result.attempt).toBe(6);
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.processingTime).toBeLessThan(10000);
  });
  
  test('should respect per-attempt timeout limits', async () => {
    const mockBundle = createMockExpertBundle('8th');
    
    // Mock slow response that exceeds 15s timeout
    mockSlowOpenAIResponse(20000);
    
    await expect(
      handleExpertGeneration(mockBundle, '8th')
    ).rejects.toThrow('Timeout after 15s');
  });
  
  test('should use correct token limits for each grade', () => {
    expect(getTokensForExpertGrade('6th')).toBe(1800);
    expect(getTokensForExpertGrade('7th')).toBe(2000);
    expect(getTokensForExpertGrade('8th')).toBe(2200);
    expect(getTokensForExpertGrade('9th')).toBe(2400);
    expect(getTokensForExpertGrade('10th')).toBe(2500);
  });
  
  test('should activate degraded mode when success rate drops', async () => {
    // Simulate 20 consecutive failures
    for (let i = 0; i < 20; i++) {
      ExpertAnalytics.recordFailure('gpt-5', 1, 'Test failure', '9th');
    }
    
    const isDegraded = ExpertCircuitBreakerState.checkDegradedMode();
    expect(isDegraded).toBe(true);
    
    const effectiveChain = ExpertCircuitBreakerState.getEffectiveModelChain();
    expect(effectiveChain).toHaveLength(2); // Only gpt-4o and gpt-4o-mini
  });
});
```

### Performance Benchmarking
```typescript
describe('Expert Performance Benchmarks', () => {
  test('should generate expert content in under 10 seconds', async () => {
    const startTime = Date.now();
    const mockBundle = createMockExpertBundle('9th');
    
    const result = await handleExpertGeneration(mockBundle, '9th');
    const duration = Date.now() - startTime;
    
    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(10000);
  });
  
  test('should maintain >95% success rate over 100 requests', async () => {
    const results = [];
    
    for (let i = 0; i < 100; i++) {
      try {
        const result = await handleExpertGeneration(
          createMockExpertBundle('7th'), 
          '7th'
        );
        results.push(result.success);
      } catch (error) {
        results.push(false);
      }
    }
    
    const successRate = results.filter(Boolean).length / results.length;
    expect(successRate).toBeGreaterThan(0.95);
  });
});
```

## Configuration & Tuning

### Expert-Specific Configuration
```typescript
const EXPERT_CONFIG = {
  development: {
    ATTEMPT_TIMEOUT: 10000,        // 10s per attempt in dev
    MAX_TOTAL_TIME: 30000,         // 30s total in dev
    ENABLE_ALL_MODELS: false,      // Only stable models in dev
    LOG_VERBOSE: true              // Detailed logging in dev
  },
  
  production: {
    ATTEMPT_TIMEOUT: 15000,        // 15s per attempt in prod
    MAX_TOTAL_TIME: 60000,         // 60s total in prod  
    ENABLE_ALL_MODELS: true,       // All models available in prod
    LOG_VERBOSE: false             // Performance logging only
  }
} as const;
```

This Expert Circuit Breaker system provides robust, high-quality story generation for advanced users with comprehensive monitoring, intelligent fallbacks, and performance optimization.
