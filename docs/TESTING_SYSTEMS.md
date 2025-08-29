# Testing Systems Documentation

## Overview
Comprehensive testing and debugging systems for story generation, template validation, and service diagnostics across the entire application.

## StoryPromptTester (1,236 lines)

### Core Functionality
The StoryPromptTester provides comprehensive AI story generation testing across all difficulty levels with advanced validation and comparison capabilities.

#### Test Profiles
```typescript
const testUserProfiles: Record<string, UserInfo> = {
  beginner: { name: 'Emma', age: 4, grade: "PreK", difficultyLevel: 'beginner' },
  easy: { name: 'Alex', age: 6, grade: "K", difficultyLevel: 'easy' },
  medium: { name: 'Maya', age: 8, grade: "2nd", difficultyLevel: 'medium' },
  hard: { name: 'Jordan', age: 10, grade: "4th", difficultyLevel: 'hard' },
  expert: { name: 'Zara', age: 12, grade: "6th+", difficultyLevel: 'expert' },
  // Grade-specific expert levels
  grade6: { expertGradeLevel: '6th' },
  grade7: { expertGradeLevel: '7th' },
  grade8: { expertGradeLevel: '8th' },
  grade9: { expertGradeLevel: '9th' },
  grade10: { expertGradeLevel: '10th' }
};
```

#### Service Testing Capabilities
```typescript
interface TestResult {
  level: string;
  service: 'netflix' | 'live' | 'template';
  success: boolean;
  pages: number;
  wordCount: number;
  source: 'ai' | 'fallback' | 'emergency' | 'unknown';
  hasPageConcatenation: boolean;
  contentPreview: string;
  fullContent: string[];
  withinTokenLimits: boolean;
  responseTime?: number;
  error?: string;
  fallbackReason?: string;
  generationPath?: string[];
  emergencyContentUsed?: boolean;
  // Enhanced validation fields
  placeholderValidation?: any;
  contentIssues?: string[];
  tokenValidation?: any;
  hasEmptyContent?: boolean;
}
```

### Advanced Validation Features

#### 1. Page Concatenation Detection
```typescript
const checkPageConcatenation = (pages: string[], level: string): boolean => {
  // 1. Excessive word count (clear concatenation)
  if (pageWordCount > expectedWordLimit * 2) return true;
  
  // 2. Multiple "Page X:" markers
  if (page.includes('Page ') && page.includes('Page ', 10)) return true;
  
  // 3. Multiple disconnected sentences
  if (page.match(/\.\s+[A-Z].*\.\s+[A-Z].*\.\s+[A-Z]/g)) return true;
  
  // 4. Specific concatenation patterns from logs
  if (page.match(/, and [a-z]/g)) return true; // Unnatural grammar
  if (page.match(/technology begins behaving.*artifact/i)) return true;
  
  // 5. Excessive comma usage (concatenated details)
  const commaCount = (page.match(/,/g) || []).length;
  if (commaCount > 6 && pageWordCount < 150) return true;
  
  return false;
};
```

#### 2. Emergency Content Detection
```typescript
// Check for emergency content (rhyming educational content)
const firstPage = response.content[0] || '';
if (firstPage.includes('story machine took a little rest') || 
    firstPage.includes('story elves went to play') ||
    firstPage.includes('Try Again')) {
  result.emergencyContentUsed = true;
  result.source = 'emergency';
  result.generationPath.push('Used emergency rhyming content');
}
```

#### 3. Token Limit Validation
```typescript
// Enhanced validation - check for placeholder and content issues
if (result.fullContent && result.fullContent.length > 0) {
  result.placeholderValidation = validatePlaceholders(result.fullContent);
  result.contentIssues = checkForPlaceholderIssues(result.fullContent);
  result.tokenValidation = validatePageTokenDistribution(
    result.fullContent, 
    level as DifficultyLevel, 
    result.source === 'ai' ? 'ai' : 'template'
  );
  result.hasEmptyContent = result.wordCount === 0 || 
    result.fullContent.every(page => page.trim().length === 0);
}
```

### Test Modes
```typescript
const [testMode, setTestMode] = useState<'full' | 'ai-only' | 'live-only' | 'template-only' | 'comparison'>('full');
```

**Available Modes:**
- **Full Mode**: Tests all services across all difficulties
- **AI-Only**: Netflix and Live services only
- **Live-Only**: Live generation service testing
- **Template-Only**: Template service validation
- **Comparison**: Side-by-side service comparison

### Source Detection & Debugging
```typescript
// Enhanced logging for source detection debugging
console.log(`🔍 Netflix Service Result for ${level}:`, {
  source: response.source,
  hasContent: !!response.content,
  pageCount: response.content?.length || 0,
  contentPreview: response.content?.[0]?.substring(0, 50) + '...'
});

// Check global source tracking
const globalSource = (globalThis as any).__LAST_PAGE_SOURCE__;
result.source = globalSource || 'unknown';
```

## Template Testing Suite

### 1. QuickTemplateTest
**Purpose:** Fast template validation across difficulty levels
- Tests template loading and placeholder resolution
- Validates content length and structure
- Checks for proper difficulty scaling

### 2. SystematicWordCountTest
**Purpose:** Comprehensive word count analysis
- Tests all difficulty levels systematically
- Validates word count expectations vs actual results
- Identifies templates that don't meet length requirements

### 3. AdvancedTemplateTest
**Purpose:** Deep template analysis and validation
- Advanced placeholder testing
- Template structure validation
- Content quality assessment

### 4. BatchTemplateTest
**Purpose:** Large-scale template testing
- Tests multiple templates simultaneously
- Performance benchmarking
- Batch validation reporting

### 5. TemplateExplorer
**Purpose:** Interactive template inspection
- Browse template library (136 templates)
- Real-time template preview
- Template metadata exploration

### 6. TemplateSystemMonitor
**Purpose:** Real-time template system monitoring
- Template loading performance
- Error rate tracking
- System health monitoring

## RunwareConnectionTest

### WebSocket Diagnostic Features
```typescript
const RunwareConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    // Test 1: Basic WebSocket Connection
    const { data, error } = await supabase.functions.invoke('test-runware-debug');
    
    // Test 2: Comprehensive Diagnostic
    const { data: diagData, error: diagError } = await supabase.functions.invoke('runware-diagnostic');
  };
```

**Diagnostic Capabilities:**
- **WebSocket Connection Testing**: Verifies Runware API connectivity
- **Authentication Validation**: Tests API key and authentication
- **CSP Detection**: Identifies Content Security Policy issues
- **Comprehensive Reporting**: Detailed diagnostic results with troubleshooting

### Test Results Interface
```typescript
interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}
```

## Debug Parameters

### Query Parameter System
```typescript
// Enhanced debugging with query parameters
const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
const storyDebug = new URLSearchParams(window.location.search).get('storydebug') === 'true';
const imageDebug = new URLSearchParams(window.location.search).get('imagedebug') === 'true';
```

**Available Parameters:**
- **`?debug=1`**: General debugging mode with device detection
- **`?storydebug=true`**: Enhanced story stability and content logging
- **`?imagedebug=true`**: Detailed image loading and fallback debugging

### Console Logging System

#### Story Content Logging
```typescript
// StoryContentLogger integration
StoryContentLogger.logStoryChange('story_update', 'before', oldStory, context);
StoryContentLogger.logStoryChange('story_update', 'after', newStory, context);

// Rapid change detection
if (changeCount > 2 && timeWindow < 1000) {
  console.warn('🚨 Rapid story changes detected', { changeCount, timeWindow });
}
```

#### Service Testing Logs
```typescript
// Service test logging with emojis for easy identification
setLogs(prev => [...prev, `✅ ${service} test for ${level}: ${result.source} source, ${result.pages} pages, ${result.wordCount} words`]);
setLogs(prev => [...prev, `❌ ${service} test failed for ${level}: ${result.error}`]);
```

#### Image Loading Logs
```typescript
console.log('🖼️ ImageWithFallback: Image display error', {
  src: imageSrc,
  error: e
});

console.log('🖼️ ImageFallback: Generated SVG fallback', {
  config: finalConfig,
  dataUrlLength: dataUrl.length
});
```

## Edge Function Debug Services

### 1. debug-prompt-history
```typescript
// GET /debug-prompt-history?sessionId=xxx&limit=5
// Returns prompt history for session analysis
{
  success: true,
  sessionId,
  promptHistory,
  totalEntries: promptHistory.length,
  sessionExists: !!storyState,
  sessionInfo: {
    createdAt,
    lastUpdated,
    lastPageGenerated,
    charactersTracked: storyState.characters.size,
    objectsTracked: storyState.objects.size
  }
}
```

### 2. debug-ai-enhancer
```typescript
// Tests ai-story-enhancer function with diagnostic payload
// Checks environment variables and service availability
// Returns comprehensive diagnostic results
```

### 3. debug-recent-image-prompts
```typescript
// GET /debug-recent-image-prompts?sessionId=xxx&limit=10&tiers=1,2,3
// Returns recent image prompt data with filtering
{
  success: true,
  sessionId,
  imagePrompts: [...],
  summary: {
    totalPrompts,
    successRate,
    tierCounts,
    averageGenerationTime
  }
}
```

## Performance Monitoring

### Test Execution Metrics
```typescript
interface TestResult {
  responseTime?: number;  // Execution time tracking
  generationPath?: string[];  // Step-by-step execution logging
  error?: string;  // Error capture and reporting
}
```

### Success Rate Tracking
- **Service Comparison**: Netflix vs Live vs Template success rates
- **Difficulty Analysis**: Success rates across difficulty levels
- **Source Detection**: AI vs Fallback vs Emergency content tracking
- **Performance Benchmarking**: Response time analysis

## Integration Testing

### Cross-System Validation
- **Story-Image Synchronization**: Tests story-image coordination
- **Difficulty-Content Alignment**: Validates difficulty-appropriate content
- **Template-AI Fallback**: Tests graceful degradation paths
- **Session State Management**: Validates session persistence and recovery

### User Journey Testing
- **Complete Reading Sessions**: End-to-end session testing
- **Navigation Testing**: Page advancement and navigation validation
- **Error Recovery**: Tests system recovery from various failure states
- **Cross-Device Compatibility**: Mobile, tablet, desktop testing scenarios

## Reporting and Analysis

### Structured Test Results
```typescript
interface ServiceComparison {
  level: string;
  netflix?: TestResult;
  live?: TestResult;
  template?: TestResult;
}
```

### Visual Test Reporting
- **Real-time Progress**: Live test execution progress bars
- **Expandable Results**: Detailed test result inspection
- **Error Highlighting**: Clear error identification and categorization
- **Performance Visualization**: Response time and success rate charts

## Benefits

### 1. Development Efficiency
- **Rapid Issue Identification**: Quick detection of system problems
- **Comprehensive Coverage**: Tests all major system components
- **Automated Validation**: Reduces manual testing overhead

### 2. Quality Assurance
- **Content Quality Validation**: Ensures story content meets standards
- **Performance Monitoring**: Tracks system performance characteristics
- **Error Detection**: Identifies edge cases and failure scenarios

### 3. System Reliability
- **Continuous Monitoring**: Ongoing system health assessment
- **Regression Detection**: Identifies when changes break functionality
- **Service Availability**: Monitors external service dependencies

### 4. User Experience Optimization
- **Story Quality**: Ensures high-quality content generation
- **Performance Optimization**: Identifies and resolves bottlenecks
- **Error Recovery**: Tests and improves error handling paths

This comprehensive testing system ensures robust, reliable story generation across all scenarios while providing detailed debugging capabilities for continuous system improvement.