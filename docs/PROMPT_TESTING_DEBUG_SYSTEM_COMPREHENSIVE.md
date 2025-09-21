# Prompt Testing & Debug System Comprehensive Guide

## 🧪 **Debug System Access**

### **Primary Access Point**
- **URL**: `/prompt-testing?debug=1`
- **Activation**: `debug=1` query parameter enables all debug features
- **Location**: `src/pages/PromptTesting.tsx`

### **Debug Mode Features**
```typescript
// From src/pages/PromptTesting.tsx
export const PromptTesting = () => {
  const [searchParams] = useSearchParams();
  const isDebugMode = searchParams.get('debug') === '1';

  useEffect(() => {
    if (isDebugMode) {
      window.errorSuppressionManager?.disableErrorSuppression();
      console.log("🐛 Debug mode enabled - Error suppression disabled");
    } else {
      window.errorSuppressionManager?.enableErrorSuppression();
    }
  }, [isDebugMode]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Story Generation Testing</h1>
        {isDebugMode && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            Debug Mode Active
          </Badge>
        )}
      </div>
      
      {/* Debug-only components */}
      {isDebugMode && (
        <>
          <ErrorBoundary fallback={<div>DebugDataViewer Error</div>}>
            <DebugDataViewer />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div>Analytics Dashboard Error</div>}>
            <AnalyticsDashboard />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div>Advanced Monitoring Error</div>}>
            <AdvancedMonitoringDashboard />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div>ImageTierTester Error</div>}>
            <ImageTierTester />
          </ErrorBoundary>
        </>
      )}
    </div>
  );
};
```

## **ImageTierTester Component**

<lov-mermaid>
graph TD
    A[ImageTierTester Component] --> B[Connectivity Tests]
    A --> C[Individual Tier Tests]
    A --> D[Batch Testing]
    A --> E[Performance Analysis]
    
    B --> B1[Health Check Endpoint]
    B --> B2[API Key Status]
    B --> B3[Network Connectivity]
    
    C --> C1[Tier 1: AI Scene Creator]
    C --> C2[Tier 2.5A: Premium Template]
    C --> C3[Tier 2.5B: Basic Template]  
    C --> C4[Tier 2.5C: Nuclear Template]
    C --> C5[Tier 2.5D: Emergency Template]
    
    D --> D1[Test All Tiers]
    D --> D2[Success Rate Tracking]
    D --> D3[Error Categorization]
    
    E --> E1[Response Time Metrics]
    E --> E2[Failure Pattern Analysis]
    E --> E3[Performance Graphs]
</lov-mermaid>

### **Test Configuration Interface**
```typescript
// From ImageTierTester component interface
interface TierTestConfig {
  testPrompt: string;
  characterDetails: {
    skinTone: string;
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
  };
  sessionId: string;
  pageNumber: number;
  timeout: number;
  retryAttempts: number;
}

const defaultTestConfig: TierTestConfig = {
  testPrompt: "A young adventurer discovers a magical crystal in an enchanted forest clearing, surrounded by glowing mushrooms and fairy lights.",
  characterDetails: {
    skinTone: "medium",
    hairColor: "brown", 
    hairStyle: "curly",
    eyeColor: "brown"
  },
  sessionId: `test-${Date.now()}`,
  pageNumber: 1,
  timeout: 30000,
  retryAttempts: 2
};
```

### **Individual Tier Testing**
```typescript
// Actual tier testing implementation
const testTier1 = async (config: TierTestConfig) => {
  setTier1Status('testing');
  const startTime = Date.now();
  
  try {
    const response = await supabase.functions.invoke('ai-visual-scene-creator', {
      body: {
        storyText: config.testPrompt,
        pageNumber: config.pageNumber,
        characterDetails: config.characterDetails,
        sessionId: config.sessionId
      }
    });
    
    const processingTime = Date.now() - startTime;
    
    if (response.error) {
      setTier1Result({
        success: false,
        error: response.error.message,
        processingTime,
        timestamp: new Date().toISOString()
      });
      setTier1Status('failed');
    } else {
      setTier1Result({
        success: true,
        data: response.data,
        processingTime,
        timestamp: new Date().toISOString()
      });
      setTier1Status('passed');
    }
  } catch (error) {
    setTier1Result({
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    setTier1Status('failed');
  }
};
```

### **Batch Testing Implementation**
```typescript
// Run all tiers sequentially with success rate tracking
const runBatchTests = async () => {
  setBatchTesting(true);
  const results = [];
  
  const tiers = [
    { name: 'Tier 1', function: 'ai-visual-scene-creator', test: testTier1 },
    { name: 'Tier 2.5A', function: 'runware-template-ab', test: testTier25A },
    { name: 'Tier 2.5B', function: 'runware-template-ab', test: testTier25B },
    { name: 'Tier 2.5C', function: 'runware-template-cd', test: testTier25C },
    { name: 'Tier 2.5D', function: 'runware-template-cd', test: testTier25D }
  ];
  
  for (const tier of tiers) {
    console.log(`🧪 Testing ${tier.name}...`);
    await tier.test(testConfig);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  // Calculate success rates
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length) * 100;
  
  setBatchResults({
    totalTests: results.length,
    successful: successCount,
    failed: results.length - successCount,
    successRate: successRate.toFixed(1),
    results
  });
  
  setBatchTesting(false);
};
```

### **Connectivity Testing**
```typescript
// Health check and API connectivity testing
const testConnectivity = async () => {
  setConnectivityTesting(true);
  const tests = [];
  
  // Test each function's health endpoint
  const functions = [
    'runware-generate-image',
    'ai-visual-scene-creator', 
    'runware-template-ab',
    'runware-template-cd'
  ];
  
  for (const functionName of functions) {
    try {
      const response = await fetch(`/functions/v1/${functionName}`, {
        method: 'GET', // Health check endpoint
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      tests.push({
        function: functionName,
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: response.headers.get('response-time') || 'unknown'
      });
    } catch (error) {
      tests.push({
        function: functionName,
        status: 'error',
        error: error.message
      });
    }
  }
  
  setConnectivityResults(tests);
  setConnectivityTesting(false);
};
```

## **PromptTestingEnhancement Component**

### **Dry-Run Testing**
```typescript
// From src/components/PromptTestingEnhancement.tsx
const testEnhancedPrompts = async (retryCount = 0) => {
  setIsLoading(true);
  setTestResult(null);
  
  try {
    const response = await supabase.functions.invoke('runware-generate-image', {
      body: {
        // Test data for dry-run mode
        storyText: "Emma discovers a hidden garden behind her grandmother's cottage. The garden is filled with flowers that glow in different colors when touched.",
        pageNumber: 1,
        sessionId: `test-${Date.now()}`,
        characterDetails: {
          skinTone: "light",
          hairColor: "blonde",
          hairStyle: "pigtails",
          eyeColor: "blue"
        },
        dryRun: true, // Enable dry-run mode
        testMode: true
      }
    });

    if (response.error) {
      // Handle specific retry scenarios  
      if (response.error.message?.includes('Rate limit') && retryCount < 2) {
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => testEnhancedPrompts(retryCount + 1), (retryCount + 1) * 2000);
        return;
      }
      
      throw new Error(response.error.message);
    }

    setTestResult(response.data);
  } catch (error) {
    console.error('Prompt testing error:', error);
    setTestResult({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    setIsLoading(false);
  }
};
```

### **Test Result Display**
```typescript
// Actual test result rendering
{testResult && (
  <div className="space-y-4">
    {testResult.success ? (
      <Badge variant="default" className="bg-green-500">
        Test Passed ✓
      </Badge>
    ) : (
      <Badge variant="destructive">
        Test Failed ✗
      </Badge>
    )}
    
    {testResult.originalPrompt && (
      <div>
        <h4 className="font-semibold mb-2">Original Story Text:</h4>
        <p className="text-sm bg-muted p-3 rounded">
          {testResult.originalPrompt}
        </p>
      </div>
    )}
    
    {testResult.enhancedPrompt && (
      <div>
        <h4 className="font-semibold mb-2">Enhanced AI Prompt:</h4>
        <p className="text-sm bg-blue-50 p-3 rounded border">
          {testResult.enhancedPrompt}
        </p>
      </div>
    )}
    
    {testResult.templateStructure && (
      <div>
        <h4 className="font-semibold mb-2">Template Structure:</h4>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
          {JSON.stringify(testResult.templateStructure, null, 2)}
        </pre>
      </div>
    )}
  </div>
)}
```

## **Debug Data Viewer**

### **Image Generation Debug Display**
```typescript
// Last 6 image generation attempts with full metadata
const displayImageGenerationDebug = (debugData) => {
  return debugData.slice(-6).map((entry, index) => (
    <Card key={index} className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            Request ID: {entry.request_id}
          </Badge>
          <Badge variant={entry.success ? "default" : "destructive"}>
            {entry.success ? "Success" : "Failed"}
          </Badge>
        </div>
        
        <div className="text-sm space-y-1">
          <p><strong>Session:</strong> {entry.session_id}</p>
          <p><strong>Processing Time:</strong> {entry.processing_time}ms</p>
          <p><strong>Tier Used:</strong> {entry.tier_used}</p>
          <p><strong>Template Type:</strong> {entry.template_type}</p>
        </div>
        
        {entry.prompts && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">View Prompts</summary>
            <pre className="mt-2 bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(entry.prompts, null, 2)}
            </pre>
          </details>
        )}
        
        {entry.error_details && (
          <div className="text-red-600 text-sm">
            <strong>Error:</strong> {entry.error_details}
          </div>
        )}
      </div>
    </Card>
  ));
};
```

## **Advanced Testing Features**

### **Timeout Testing**
```typescript
// Test with different timeout values
const timeoutTests = [
  { name: "Fast (5s)", timeout: 5000 },
  { name: "Normal (15s)", timeout: 15000 },
  { name: "Extended (30s)", timeout: 30000 },
  { name: "Maximum (60s)", timeout: 60000 }
];

const runTimeoutTests = async () => {
  for (const test of timeoutTests) {
    const config = { ...testConfig, timeout: test.timeout };
    console.log(`⏱️ Testing with ${test.name} timeout...`);
    await testTier1(config);
  }
};
```

### **Error Categorization**
```typescript
// Categorize errors for analysis
const categorizeError = (error: string) => {
  if (error.includes('timeout')) return 'TIMEOUT';
  if (error.includes('rate limit')) return 'RATE_LIMIT';
  if (error.includes('API key')) return 'AUTH_ERROR';
  if (error.includes('network')) return 'NETWORK_ERROR';
  if (error.includes('schema')) return 'VALIDATION_ERROR';
  return 'UNKNOWN_ERROR';
};

const trackErrorPatterns = (results) => {
  const errorCounts = {};
  results.forEach(result => {
    if (!result.success) {
      const category = categorizeError(result.error);
      errorCounts[category] = (errorCounts[category] || 0) + 1;
    }
  });
  return errorCounts;
};
```

### **Real vs Forced Routing Testing**
```typescript
// Test both normal routing and forced tier routing
const testRoutingBehavior = async () => {
  // Normal routing (let orchestrator decide)
  const normalResult = await supabase.functions.invoke('runware-generate-image', {
    body: { ...testConfig }
  });
  
  // Forced Tier 1 routing
  const forcedTier1 = await supabase.functions.invoke('ai-visual-scene-creator', {
    body: { ...testConfig }
  });
  
  // Forced Nuclear routing  
  const forcedNuclear = await supabase.functions.invoke('runware-template-cd', {
    body: { ...testConfig }
  });
  
  console.log("🔀 Routing comparison:", {
    normal: normalResult.data?.tier_used,
    forcedTier1: forcedTier1.data?.tier_used,
    forcedNuclear: forcedNuclear.data?.tier_used
  });
};
```

## **Performance Analysis Dashboard**

<lov-mermaid>
graph LR
    A[Performance Metrics] --> B[Response Times]
    A --> C[Success Rates]
    A --> D[Error Patterns]
    A --> E[Tier Usage Stats]
    
    B --> B1[Min/Max/Average]
    B --> B2[95th Percentile]
    B --> B3[Trend Analysis]
    
    C --> C1[Per-Tier Success]
    C --> C2[Overall Success]
    C --> C3[Success Over Time]
    
    D --> D1[Error Categories]
    D --> D2[Failure Points]
    D --> D3[Recovery Patterns]
    
    E --> E1[Tier 1 Usage %]
    E --> E2[Fallback Usage %]
    E --> E3[Nuclear Usage %]
</lov-mermaid>

### **Live Performance Monitoring**
```typescript
// Real-time performance tracking
const trackPerformance = (tierName: string, startTime: number, success: boolean) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const perfData = {
    tier: tierName,
    duration,
    success,
    timestamp: endTime
  };
  
  // Store in session for analysis
  const existing = JSON.parse(sessionStorage.getItem('tier-performance') || '[]');
  existing.push(perfData);
  
  // Keep only last 100 entries
  if (existing.length > 100) {
    existing.splice(0, existing.length - 100);
  }
  
  sessionStorage.setItem('tier-performance', JSON.stringify(existing));
  
  // Update dashboard
  updatePerformanceDashboard(existing);
};
```

---
*Last Updated: September 21, 2025*  
*Debug System Status: All testing tools operational*
