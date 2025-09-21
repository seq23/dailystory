# Image Generation Logging & Debug Data

## 🗄️ **Database Logging Architecture**

### **image_generation_debug Table Schema**
```sql
-- Actual table structure from database
CREATE TABLE image_generation_debug (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  page_number INTEGER,
  story_text TEXT,
  character_details JSONB,
  prompts JSONB,
  responses JSONB,
  tier_used TEXT,
  template_type TEXT,
  processing_time INTEGER,
  success BOOLEAN DEFAULT false,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Automatic cleanup function (7-day retention)
CREATE OR REPLACE FUNCTION cleanup_image_generation_debug_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM image_generation_debug 
  WHERE created_at < now() - interval '7 days';
  
  -- Also enforce 6-per-session limit
  WITH ranked_logs AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) as rn
    FROM image_generation_debug
  )
  DELETE FROM image_generation_debug
  WHERE id IN (
    SELECT id FROM ranked_logs WHERE rn > 6
  );
END;
$$ LANGUAGE plpgsql;
```

### **Data Retention Policy**
- **Retention Period**: 7 days automatic cleanup
- **Session Limit**: Maximum 6 logs per session_id
- **Cleanup Schedule**: Runs every 24 hours via scheduled function
- **Total Storage**: Approximately 1000 recent logs maximum

## **Log Collection Points**

<lov-mermaid>
graph TD
    A[Frontend Request] --> B[runware-generate-image Orchestrator]
    B --> C[Log: Request Started]
    C --> D{Route Decision}
    
    D -->|Tier 1| E[ai-visual-scene-creator]
    D -->|Nuclear| F[runware-template-cd]
    
    E --> G[Log: AI Scene Response]
    G --> H[runware-template-ab]
    H --> I[Log: Template Generated]
    
    F --> J[Log: Nuclear Template]
    
    I --> K[Log: Success/Failure]
    J --> K
    K --> L[Frontend Receives Response]
    L --> M[Log: Frontend Processing]
    
    style C fill:#e1f5fe
    style G fill:#e1f5fe  
    style I fill:#e1f5fe
    style J fill:#e1f5fe
    style K fill:#e1f5fe
    style M fill:#e1f5fe
</lov-mermaid>

### **Logging Implementation Examples**

#### **Orchestrator Logging (runware-generate-image)**
```typescript
// From actual orchestrator implementation
const logDebugData = async (debugData) => {
  try {
    await supabase.from('image_generation_debug').insert({
      session_id: debugData.sessionId,
      request_id: debugData.requestId,
      page_number: debugData.pageNumber,
      story_text: debugData.storyText?.substring(0, 1000), // Truncate for storage
      character_details: debugData.characterDetails,
      prompts: {
        original: debugData.originalPrompt,
        enhanced: debugData.enhancedPrompt,
        template_prompt: debugData.templatePrompt
      },
      responses: {
        ai_response: debugData.aiResponse,
        template_response: debugData.templateResponse,
        final_result: debugData.finalResult
      },
      tier_used: debugData.tierUsed,
      template_type: debugData.templateType,
      processing_time: debugData.processingTime,
      success: debugData.success,
      error_details: debugData.error
    });
    
    console.log(`📊 [DEBUG-LOG] Logged generation attempt: ${debugData.requestId}`);
  } catch (error) {
    console.error('Failed to log debug data:', error);
  }
};

// Usage in orchestrator
const requestId = `REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
const startTime = Date.now();

try {
  // ... image generation logic
  
  await logDebugData({
    sessionId,
    requestId,
    pageNumber,
    storyText,
    characterDetails,
    originalPrompt: storyText,
    enhancedPrompt: aiEnhancedPrompt,
    templatePrompt: finalGeneratedPrompt,
    aiResponse: aiSceneData,
    templateResponse: templateResult,
    finalResult: imageUrl,
    tierUsed: "2.5A",
    templateType: "premium-template",
    processingTime: Date.now() - startTime,
    success: true
  });
} catch (error) {
  await logDebugData({
    sessionId,
    requestId,
    pageNumber,
    storyText,
    error: error.message,
    processingTime: Date.now() - startTime,
    success: false
  });
}
```

#### **Tier-Specific Logging**
```typescript
// AI Scene Creator logging
const logAISceneAttempt = async (request, response, success) => {
  console.log(`🤖 [AI-SCENE] ${success ? 'SUCCESS' : 'FAILED'}: ${request.requestId}`);
  console.log(`🤖 [AI-SCENE] Processing time: ${response.processingTime}ms`);
  console.log(`🤖 [AI-SCENE] Model used: ${response.model}`);
  
  if (success) {
    console.log(`🤖 [AI-SCENE] Scene data:`, {
      primaryScene: response.data.primaryScene,
      setting: response.data.setting,
      mood: response.data.mood
    });
  } else {
    console.log(`🤖 [AI-SCENE] Error: ${response.error}`);
  }
};

// Template service logging
const logTemplateGeneration = async (templateTier, prompt, result) => {
  console.log(`🎨 [TEMPLATE-${templateTier}] Generating with prompt length: ${prompt.length}`);
  console.log(`🎨 [TEMPLATE-${templateTier}] Character consistency: ${result.characterSeed ? 'YES' : 'NO'}`);
  console.log(`🎨 [TEMPLATE-${templateTier}] Template sections: ${result.templateSections}`);
  
  if (result.success) {
    console.log(`🎨 [TEMPLATE-${templateTier}] Generated image URL: ${result.imageUrl.substring(0, 50)}...`);
  } else {
    console.log(`🎨 [TEMPLATE-${templateTier}] Generation failed: ${result.error}`);
  }
};
```

## **Debug Console Integration**

### **imageDebugConsole.ts Implementation**
```typescript
// From src/utils/imageDebugConsole.ts
export class ImageDebugConsoleClass {
  /**
   * Get comprehensive debug information
   */
  static getDebugInfo(): ImageDebugInfo | null {
    try {
      const sessionData = sessionStorage.getItem('currentSessionId');
      const stableSessionData = sessionStorage.getItem('stableSessionId');
      const currentPage = sessionStorage.getItem('currentPage');
      const pageImages = sessionStorage.getItem('pageImages');
      
      // Get ImageLoadingManager statistics
      const loadingStats = ImageLoadingManager.getStats();
      
      // Get cache information from EnhancedImageCache
      const cacheStats = {
        totalImages: EnhancedImageCache.getStats().totalImages,
        cacheSize: EnhancedImageCache.getStats().cacheSize,
        hitRate: EnhancedImageCache.getStats().hitRate
      };
      
      return {
        sessionIds: {
          current: sessionData,
          stable: stableSessionData
        },
        currentPage: currentPage ? parseInt(currentPage) : null,
        pageImages: pageImages ? JSON.parse(pageImages) : {},
        loadingManager: {
          activeLoads: loadingStats.activeLoads,
          recentFailures: loadingStats.recentFailures,
          globalFailures: loadingStats.globalFailures
        },
        cache: cacheStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get debug info:', error);
      return null;
    }
  }

  /**
   * Check for session ID mismatches that could cause image loading issues
   */
  static checkSessionMismatch(): void {
    const debugInfo = this.getDebugInfo();
    if (!debugInfo) return;

    console.group('🔍 Session Mismatch Analysis');
    
    const { current, stable } = debugInfo.sessionIds;
    
    if (current !== stable) {
      console.warn('⚠️ SESSION MISMATCH DETECTED!');
      console.log('Current Session ID:', current);
      console.log('Stable Session ID:', stable);
      console.log('This mismatch could cause image loading failures.');
      
      // Check if this affects current page images
      if (debugInfo.pageImages && debugInfo.currentPage) {
        const currentPageImage = debugInfo.pageImages[debugInfo.currentPage];
        if (currentPageImage) {
          console.log('Current page image URL:', currentPageImage.substring(0, 50) + '...');
          console.log('Checking if URL contains session ID...');
          
          if (currentPageImage.includes(current) || currentPageImage.includes(stable)) {
            console.log('✅ Image URL contains a session ID - this is good');
          } else {
            console.warn('⚠️ Image URL does not contain session ID - potential cache miss');
          }
        }
      }
    } else {
      console.log('✅ Session IDs match - no mismatch detected');
      console.log('Session ID:', current);
    }
    
    console.groupEnd();
  }

  /**
   * Inspect cache contents for a specific session
   */
  static inspectCache(sessionId?: string): void {
    const targetSession = sessionId || sessionStorage.getItem('stableSessionId');
    
    if (!targetSession) {
      console.warn('No session ID provided and no stable session found');
      return;
    }
    
    console.group(`🗂️ Cache Inspection: ${targetSession}`);
    
    // Get cached images for this session
    const cachedImages = EnhancedImageCache.getImagesForSession(targetSession);
    
    if (cachedImages.length === 0) {
      console.log('No cached images found for this session');
    } else {
      console.log(`Found ${cachedImages.length} cached images:`);
      cachedImages.forEach((image, index) => {
        console.log(`${index + 1}. Page ${image.pageNumber}: ${image.url.substring(0, 50)}...`);
        console.log(`   Cached at: ${new Date(image.cachedAt).toLocaleString()}`);
        console.log(`   Cache key: ${image.cacheKey}`);
      });
    }
    
    console.groupEnd();
  }

  /**
   * Generate comprehensive debug report
   */
  static getFullReport(): void {
    console.group('📋 FULL IMAGE DEBUG REPORT');
    
    const debugInfo = this.getDebugInfo();
    if (debugInfo) {
      console.log('📊 Current State:', debugInfo);
    }
    
    this.checkSessionMismatch();
    this.inspectCache();
    
    // Show ImageLoadingManager stats
    const stats = ImageLoadingManager.getStats();
    console.group('🔄 Loading Manager Stats');
    console.log('Active loads:', stats.activeLoads);
    console.log('Recent failures:', stats.recentFailures);
    console.log('Global failures:', stats.globalFailures);
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Make available globally for console debugging
declare global {
  interface Window {
    imageDebug: typeof ImageDebugConsoleClass;
  }
}

window.imageDebug = ImageDebugConsoleClass;
```

### **Console Debugging Commands**
```javascript
// Available in browser console
window.imageDebug.getFullReport();      // Complete debug overview
window.imageDebug.checkSessionMismatch(); // Check for session ID issues
window.imageDebug.inspectCache();       // View cached images
window.imageDebug.clearCurrentCache();  // Clear current session cache
```

## **Frontend Debug Integration**

### **Debug Panel Display**
```typescript
// From src/components/ImageDebugPanel.tsx
export const ImageDebugPanel: React.FC<ImageDebugPanelProps> = ({
  currentPage,
  storyText,
  currentImageUrl,
  imageStyle,
  isGenerating,
  onRegenerateImage,
  imageMetadata
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.get('debug') === '1';

  if (!isDebugMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700"
      >
        🐛 Debug {isVisible ? '▼' : '▲'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-xl p-4">
          <h3 className="font-bold mb-3">Image Debug Info</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Current Page:</strong> {currentPage}
            </div>
            
            <div>
              <strong>Story Analysis:</strong>
              <div className="text-xs bg-gray-100 p-2 rounded">
                {storyText ? analyzeStoryText(storyText) : 'No story text'}
              </div>
            </div>
            
            <div>
              <strong>Current Image:</strong>
              {currentImageUrl ? (
                <div>
                  <div className="text-xs break-all">{currentImageUrl}</div>
                  <div className="text-xs text-gray-600">Style: {imageStyle}</div>
                </div>
              ) : (
                'No image loaded'
              )}
            </div>
            
            <div>
              <strong>Generation Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                isGenerating ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {isGenerating ? 'Generating...' : 'Ready'}
              </span>
            </div>
            
            {imageMetadata && (
              <div>
                <strong>Image Metadata:</strong>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <div>Tier: {imageMetadata.tier}</div>
                  <div>Template: {imageMetadata.templateType}</div>
                  <div>Processing: {imageMetadata.processingTime}ms</div>
                  {imageMetadata.fallbackUsed && (
                    <div className="text-orange-600">Fallback Used</div>
                  )}
                </div>
              </div>
            )}
            
            {onRegenerateImage && (
              <button
                onClick={onRegenerateImage}
                className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
              >
                🔄 Regenerate Image
              </button>
            )}
            
            <div className="text-xs text-gray-500 border-t pt-2">
              💡 Check browser console for detailed logs
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## **Log Analysis & Metrics**

### **Query Examples for Analysis**
```sql
-- Most common failure points
SELECT tier_used, COUNT(*) as failure_count
FROM image_generation_debug 
WHERE success = false 
  AND created_at > now() - interval '24 hours'
GROUP BY tier_used
ORDER BY failure_count DESC;

-- Average processing times by tier
SELECT tier_used, 
       AVG(processing_time) as avg_time,
       MIN(processing_time) as min_time,
       MAX(processing_time) as max_time,
       COUNT(*) as total_requests
FROM image_generation_debug 
WHERE success = true
  AND created_at > now() - interval '7 days'
GROUP BY tier_used;

-- Success rates by template type
SELECT template_type,
       COUNT(*) as total,
       SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
       ROUND(
         SUM(CASE WHEN success THEN 1 ELSE 0 END)::decimal / COUNT(*) * 100, 
         2
       ) as success_rate_percent
FROM image_generation_debug
WHERE created_at > now() - interval '7 days'
GROUP BY template_type;

-- Error pattern analysis
SELECT error_details,
       COUNT(*) as occurrences,
       tier_used,
       template_type
FROM image_generation_debug
WHERE success = false
  AND created_at > now() - interval '24 hours'
GROUP BY error_details, tier_used, template_type
ORDER BY occurrences DESC;
```

### **Performance Monitoring Dashboard Data**
```typescript
// Real-time metrics collection
const collectPerformanceMetrics = async () => {
  const metrics = await supabase
    .from('image_generation_debug')
    .select(`
      tier_used,
      template_type,
      processing_time,
      success,
      created_at
    `)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
    
  return {
    totalRequests: metrics.data?.length || 0,
    successRate: metrics.data ? 
      (metrics.data.filter(m => m.success).length / metrics.data.length * 100) : 0,
    averageProcessingTime: metrics.data ?
      metrics.data.filter(m => m.success)
        .reduce((sum, m) => sum + m.processing_time, 0) / 
        metrics.data.filter(m => m.success).length : 0,
    tierDistribution: metrics.data ?
      metrics.data.reduce((dist, m) => {
        dist[m.tier_used] = (dist[m.tier_used] || 0) + 1;
        return dist;
      }, {}) : {}
  };
};
```

---
*Last Updated: September 21, 2025*  
*Logging Status: All collection points active, 7-day retention enforced*