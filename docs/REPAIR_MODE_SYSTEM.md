# Repair Mode System - Quality Recovery Documentation

## Overview
Advanced story repair and quality recovery system that enhances AI generation context, provides token buffers for complex repairs, and maintains narrative continuity when standard generation encounters issues.

## Repair Mode Architecture

### Repair Trigger Conditions
```typescript
interface RepairTrigger {
  condition: string;
  threshold: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const REPAIR_TRIGGERS: RepairTrigger[] = [
  {
    condition: 'content_too_short',
    threshold: 50, // words
    description: 'Generated content below minimum word count',
    severity: 'medium'
  },
  {
    condition: 'content_too_long',
    threshold: 500, // words  
    description: 'Generated content exceeds maximum length',
    severity: 'low'
  },
  {
    condition: 'narrative_inconsistency',
    threshold: 0.3, // consistency score
    description: 'Character or plot inconsistencies detected',
    severity: 'high'
  },
  {
    condition: 'vocabulary_mismatch',
    threshold: 2, // grade levels off
    description: 'Content difficulty mismatched for target grade',
    severity: 'medium'
  },
  {
    condition: 'generation_error',
    threshold: 1, // any error
    description: 'AI generation failed or returned invalid content',
    severity: 'critical'
  },
  {
    condition: 'template_fallback_needed',
    threshold: 1, // fallback triggered
    description: 'AI generation failed, template enhancement needed',
    severity: 'high'
  }
];
```

### Repair Context Enhancement
**File**: `supabase/functions/generate-adaptive-story/streamlined-handler.ts`

```typescript
interface RepairContext {
  originalContent: string;
  errorContext: string;
  repairReason: string;
  previousAttempts: number;
  qualityIssues: string[];
  targetImprovement: string;
  tokenBufferPercentage: number;
}

function buildRepairContext(
  bundle: StoryGenerationBundle,
  repairTrigger: RepairTrigger,
  previousError?: string
): RepairContext {
  const baseTokens = getTokensForGrade(bundle.systemSettings.gradeLevel);
  
  return {
    originalContent: bundle.storyContent.substring(0, 300),
    errorContext: previousError || 'Quality improvement needed',
    repairReason: repairTrigger.description,
    previousAttempts: bundle.systemSettings.repairAttempts || 0,
    qualityIssues: identifyQualityIssues(bundle.storyContent),
    targetImprovement: generateImprovementTarget(repairTrigger),
    tokenBufferPercentage: getTokenBuffer(repairTrigger.severity)
  };
}

function getTokenBuffer(severity: RepairTrigger['severity']): number {
  const bufferMap = {
    'low': 0.10,      // 10% increase
    'medium': 0.20,   // 20% increase  
    'high': 0.35,     // 35% increase
    'critical': 0.50  // 50% increase
  };
  
  return bufferMap[severity];
}
```

### Enhanced Repair Prompts
```typescript
function generateRepairPrompt(
  context: RepairContext,
  bundle: StoryGenerationBundle
): string {
  const basePrompt = `
🔧 REPAIR MODE ACTIVATED

REPAIR CONTEXT:
- Reason: ${context.repairReason}
- Previous attempts: ${context.previousAttempts}
- Quality issues identified: ${context.qualityIssues.join(', ')}
- Target improvement: ${context.targetImprovement}

ORIGINAL CONTENT PREVIEW:
${context.originalContent}...

ERROR CONTEXT:
${context.errorContext}

REPAIR INSTRUCTIONS:
1. Analyze the content quality issues listed above
2. Maintain narrative continuity and character consistency
3. Address the specific problems without losing the story's essence
4. Ensure age-appropriate content for ${bundle.systemSettings.gradeLevel} level
5. Generate improved content that resolves the identified issues

QUALITY STANDARDS FOR REPAIR:
- Minimum ${Math.floor(getTokensForGrade(bundle.systemSettings.gradeLevel) * 0.8)} words
- Consistent character names and descriptions
- Age-appropriate vocabulary and themes
- Engaging narrative flow without abrupt transitions
- Proper story structure with beginning, development, and continuation

ENHANCED CONTENT REQUEST:
${bundle.storyContent}
`;

  return basePrompt;
}
```

## Repair Operation Implementation

### Repair Mode Handler
```typescript
async function handleRepairMode(
  bundle: StoryGenerationBundle,
  repairTrigger: RepairTrigger,
  previousError?: string
): Promise<RepairResult> {
  const repairStartTime = Date.now();
  const repairContext = buildRepairContext(bundle, repairTrigger, previousError);
  
  console.log(`🔧 REPAIR MODE: ${repairTrigger.condition} (${repairTrigger.severity})`);
  console.log(`🔧 Token buffer: +${(repairContext.tokenBufferPercentage * 100).toFixed(0)}%`);
  
  // Calculate enhanced token limit with buffer
  const baseTokens = getTokensForGrade(bundle.systemSettings.gradeLevel);
  const repairTokens = Math.floor(baseTokens * (1 + repairContext.tokenBufferPercentage));
  
  // Create repair-specific bundle
  const repairBundle: StoryGenerationBundle = {
    ...bundle,
    storyContent: generateRepairPrompt(repairContext, bundle),
    systemSettings: {
      ...bundle.systemSettings,
      repairMode: true,
      repairAttempts: (bundle.systemSettings.repairAttempts || 0) + 1,
      tokenLimit: repairTokens
    }
  };
  
  try {
    // Use repair-optimized model chain
    const repairModelChain = getRepairModelChain(repairTrigger.severity);
    
    for (const [index, model] of repairModelChain.entries()) {
      try {
        console.log(`🔧 Repair Attempt ${index + 1}/${repairModelChain.length}: ${model}`);
        
        const result = await generateWithRepairEnhancement(
          model,
          repairBundle,
          repairTokens,
          repairContext
        );
        
        // Validate repair quality
        const qualityScore = await validateRepairQuality(result, repairContext);
        
        if (qualityScore.passed) {
          const repairTime = Date.now() - repairStartTime;
          console.log(`✅ Repair Success: ${model} in ${repairTime}ms (quality: ${qualityScore.score})`);
          
          // Record repair success metrics
          RepairMetrics.recordSuccess(model, index + 1, repairTime, repairTrigger, qualityScore.score);
          
          return {
            success: true,
            content: result,
            model,
            repairAttempt: index + 1,
            processingTime: repairTime,
            qualityScore: qualityScore.score,
            repairContext,
            improvements: qualityScore.improvements
          };
        } else {
          console.warn(`⚠️ Repair quality insufficient: ${qualityScore.issues.join(', ')}`);
          continue;
        }
        
      } catch (error) {
        console.warn(`⚠️ Repair attempt ${index + 1} failed: ${error.message}`);
        
        if (index === repairModelChain.length - 1) {
          throw new Error(`All repair attempts failed: ${error.message}`);
        }
        
        // Progressive delay between repair attempts
        await new Promise(resolve => setTimeout(resolve, 2000 * (index + 1)));
      }
    }
    
  } catch (error) {
    const repairTime = Date.now() - repairStartTime;
    console.error(`❌ Repair Mode failed after ${repairTime}ms: ${error.message}`);
    
    RepairMetrics.recordFailure(repairTrigger, error.message, repairTime);
    
    throw new Error(`Repair mode exhausted: ${error.message}`);
  }
}
```

### Repair Model Chain Selection
```typescript
function getRepairModelChain(severity: RepairTrigger['severity']): string[] {
  const modelChains = {
    'low': [
      'gpt-4o-mini',  // Fast repair for minor issues
      'gpt-4o'        // Fallback for simple repairs
    ],
    'medium': [
      'gpt-4o',       // Quality repair for moderate issues
      'gpt-4.1-2025-04-14', // Enhanced repair capability
      'gpt-4o-mini'   // Final fallback
    ],
    'high': [
      'gpt-4.1-2025-04-14', // High-quality repair
      'gpt-5',        // Maximum quality for complex repairs
      'gpt-4o',       // Reliable fallback
      'gpt-4o-mini'   // Guaranteed completion
    ],
    'critical': [
      'gpt-5',        // Best available for critical repairs
      'gpt-4.1-2025-04-14', // Proven performance
      'gpt-5-mini',   // Fast quality
      'gpt-4o',       // Stable generation
      'gpt-4o-mini'   // Absolute fallback
    ]
  };
  
  return modelChains[severity];
}
```

## Quality Validation & Metrics

### Repair Quality Assessment
```typescript
interface RepairQualityScore {
  passed: boolean;
  score: number; // 0-100
  improvements: string[];
  issues: string[];
  metrics: {
    wordCount: number;
    readabilityScore: number;
    narrativeConsistency: number;
    vocabularyAppropriate: boolean;
  };
}

async function validateRepairQuality(
  repairedContent: string,
  repairContext: RepairContext
): Promise<RepairQualityScore> {
  const metrics = {
    wordCount: repairedContent.split(/\s+/).length,
    readabilityScore: calculateReadabilityScore(repairedContent),
    narrativeConsistency: calculateNarrativeConsistency(repairedContent, repairContext.originalContent),
    vocabularyAppropriate: checkVocabularyAppropriateness(repairedContent, repairContext)
  };
  
  const improvements: string[] = [];
  const issues: string[] = [];
  let score = 0;
  
  // Word count validation (20 points)
  if (metrics.wordCount >= 100 && metrics.wordCount <= 400) {
    score += 20;
    improvements.push('Appropriate content length');
  } else {
    issues.push(`Word count: ${metrics.wordCount} (target: 100-400)`);
  }
  
  // Readability validation (25 points)
  if (metrics.readabilityScore >= 0.7) {
    score += 25;
    improvements.push('Good readability for target age');
  } else {
    issues.push(`Readability: ${metrics.readabilityScore.toFixed(2)} (target: 0.7+)`);
  }
  
  // Narrative consistency (30 points)
  if (metrics.narrativeConsistency >= 0.8) {
    score += 30;
    improvements.push('Strong narrative consistency');
  } else {
    issues.push(`Narrative consistency: ${metrics.narrativeConsistency.toFixed(2)} (target: 0.8+)`);
  }
  
  // Vocabulary appropriateness (25 points)
  if (metrics.vocabularyAppropriate) {
    score += 25;
    improvements.push('Age-appropriate vocabulary');
  } else {
    issues.push('Vocabulary not appropriate for grade level');
  }
  
  return {
    passed: score >= 75, // 75% minimum for repair acceptance
    score,
    improvements,
    issues,
    metrics
  };
}
```

### Repair Metrics Collection
```typescript
interface RepairMetric {
  trigger: RepairTrigger;
  model: string;
  attempt: number;
  success: boolean;
  processingTime: number;
  qualityScore?: number;
  errorMessage?: string;
  timestamp: Date;
}

class RepairMetrics {
  private static metrics: RepairMetric[] = [];
  
  static recordSuccess(
    model: string,
    attempt: number,
    processingTime: number,
    trigger: RepairTrigger,
    qualityScore: number
  ) {
    this.metrics.push({
      trigger,
      model,
      attempt,
      success: true,
      processingTime,
      qualityScore,
      timestamp: new Date()
    });
    
    console.log(`📊 Repair Success Recorded: ${model} (attempt ${attempt}, quality: ${qualityScore})`);
  }
  
  static recordFailure(
    trigger: RepairTrigger,
    errorMessage: string,
    processingTime: number
  ) {
    this.metrics.push({
      trigger,
      model: 'unknown',
      attempt: 0,
      success: false,
      processingTime,
      errorMessage,
      timestamp: new Date()
    });
  }
  
  static getRepairSuccessRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const successful = this.metrics.filter(m => m.success).length;
    return successful / this.metrics.length;
  }
  
  static getSuccessRateBySeverity(): Record<string, number> {
    const severityStats: Record<string, { success: number; total: number }> = {};
    
    this.metrics.forEach(metric => {
      const severity = metric.trigger.severity;
      if (!severityStats[severity]) {
        severityStats[severity] = { success: 0, total: 0 };
      }
      
      severityStats[severity].total++;
      if (metric.success) {
        severityStats[severity].success++;
      }
    });
    
    const rates: Record<string, number> = {};
    Object.entries(severityStats).forEach(([severity, stats]) => {
      rates[severity] = stats.total > 0 ? stats.success / stats.total : 0;
    });
    
    return rates;
  }
  
  static getAverageRepairTime(): number {
    const successfulRepairs = this.metrics.filter(m => m.success && m.processingTime > 0);
    if (successfulRepairs.length === 0) return 0;
    
    const totalTime = successfulRepairs.reduce((sum, m) => sum + m.processingTime, 0);
    return totalTime / successfulRepairs.length;
  }
}
```

## Integration with Story Generation

### Repair Mode Detection
```typescript
function shouldTriggerRepairMode(
  generationResult: any,
  bundle: StoryGenerationBundle
): RepairTrigger | null {
  // Check for generation failures
  if (!generationResult || !generationResult.success) {
    return REPAIR_TRIGGERS.find(t => t.condition === 'generation_error') || null;
  }
  
  const content = generationResult.content;
  
  // Word count validation
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 50) {
    return REPAIR_TRIGGERS.find(t => t.condition === 'content_too_short') || null;
  }
  if (wordCount > 500) {
    return REPAIR_TRIGGERS.find(t => t.condition === 'content_too_long') || null;
  }
  
  // Vocabulary level check
  const vocabularyLevel = analyzeVocabularyLevel(content);
  const targetGrade = extractGradeNumber(bundle.systemSettings.gradeLevel);
  if (Math.abs(vocabularyLevel - targetGrade) > 2) {
    return REPAIR_TRIGGERS.find(t => t.condition === 'vocabulary_mismatch') || null;
  }
  
  // Narrative consistency check
  const consistencyScore = calculateNarrativeConsistency(content, bundle.storyContent);
  if (consistencyScore < 0.3) {
    return REPAIR_TRIGGERS.find(t => t.condition === 'narrative_inconsistency') || null;
  }
  
  return null; // No repair needed
}
```

### Enhanced Generation with Repair Integration
```typescript
async function generateWithRepairCapability(
  bundle: StoryGenerationBundle
): Promise<GenerationResult> {
  try {
    // Primary generation attempt
    const primaryResult = await handleStandardGeneration(bundle);
    
    // Check if repair is needed
    const repairTrigger = shouldTriggerRepairMode(primaryResult, bundle);
    
    if (repairTrigger) {
      console.log(`🔧 Repair needed: ${repairTrigger.condition}`);
      
      // Attempt repair
      const repairResult = await handleRepairMode(bundle, repairTrigger);
      
      return {
        success: true,
        content: repairResult.content,
        model: repairResult.model,
        repaired: true,
        repairReason: repairTrigger.description,
        originalAttempt: primaryResult,
        repairAttempt: repairResult.repairAttempt
      };
    }
    
    return primaryResult;
    
  } catch (error) {
    // Critical failure - attempt emergency repair
    console.error(`❌ Generation failed: ${error.message}`);
    
    const emergencyTrigger = REPAIR_TRIGGERS.find(t => t.condition === 'generation_error');
    if (emergencyTrigger) {
      try {
        const emergencyRepair = await handleRepairMode(bundle, emergencyTrigger, error.message);
        return {
          success: true,
          content: emergencyRepair.content,
          model: emergencyRepair.model,
          repaired: true,
          emergency: true,
          repairReason: 'Emergency content recovery'
        };
      } catch (repairError) {
        console.error(`❌ Emergency repair failed: ${repairError.message}`);
        throw repairError;
      }
    }
    
    throw error;
  }
}
```

## Testing & Validation

### Repair Mode Testing Suite
```typescript
describe('Repair Mode System', () => {
  beforeEach(() => {
    RepairMetrics.clearMetrics();
  });
  
  test('should trigger repair for content too short', async () => {
    const shortContent = 'A very short story.'; // Only 4 words
    const mockBundle = createMockBundle();
    
    const repairTrigger = shouldTriggerRepairMode(
      { success: true, content: shortContent },
      mockBundle
    );
    
    expect(repairTrigger?.condition).toBe('content_too_short');
    expect(repairTrigger?.severity).toBe('medium');
  });
  
  test('should enhance content quality through repair', async () => {
    const poorContent = 'Bad story with bad grammar and short sentences.';
    const repairTrigger = REPAIR_TRIGGERS.find(t => t.condition === 'narrative_inconsistency');
    
    const repairResult = await handleRepairMode(
      createMockBundle(),
      repairTrigger!,
      'Quality issues detected'
    );
    
    expect(repairResult.success).toBe(true);
    expect(repairResult.qualityScore).toBeGreaterThan(75);
    expect(repairResult.content.length).toBeGreaterThan(poorContent.length);
  });
  
  test('should use appropriate token buffer by severity', () => {
    expect(getTokenBuffer('low')).toBe(0.10);
    expect(getTokenBuffer('medium')).toBe(0.20);
    expect(getTokenBuffer('high')).toBe(0.35);
    expect(getTokenBuffer('critical')).toBe(0.50);
  });
  
  test('should maintain >80% repair success rate', async () => {
    // Simulate 50 repair operations
    for (let i = 0; i < 50; i++) {
      try {
        await handleRepairMode(
          createMockBundle(),
          REPAIR_TRIGGERS[i % REPAIR_TRIGGERS.length]
        );
      } catch (error) {
        // Expected some failures
      }
    }
    
    const successRate = RepairMetrics.getRepairSuccessRate();
    expect(successRate).toBeGreaterThan(0.80);
  });
});
```

### Performance Benchmarking
```typescript
describe('Repair Performance', () => {
  test('should complete repairs in reasonable time', async () => {
    const startTime = Date.now();
    
    const result = await handleRepairMode(
      createMockBundle(),
      REPAIR_TRIGGERS.find(t => t.severity === 'high')!
    );
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(20000); // 20 seconds max
    expect(result.success).toBe(true);
  });
});
```

## Configuration & Monitoring

### Repair System Configuration
```typescript
const REPAIR_CONFIG = {
  MAX_REPAIR_ATTEMPTS: 3,
  REPAIR_TIMEOUT_PER_ATTEMPT: 15000,
  MINIMUM_QUALITY_SCORE: 75,
  ENABLE_EMERGENCY_REPAIR: true,
  LOG_REPAIR_DETAILS: true,
  
  // Performance targets
  TARGET_REPAIR_SUCCESS_RATE: 0.80,
  TARGET_AVERAGE_REPAIR_TIME: 12000,
  MAX_REPAIR_TIME: 30000
} as const;
```

This comprehensive Repair Mode system ensures content quality recovery and maintains narrative consistency when standard generation encounters issues, providing a robust fallback for maintaining user experience quality.