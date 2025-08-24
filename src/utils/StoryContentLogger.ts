// Story Content Logging Utility for Flickering Debug
import { SecurityMonitor } from '@/utils/monitoring';

export class StoryContentLogger {
  private static sequenceNumber = 0;
  private static debugEnabled = false;
  
  private static imageDebugEnabled = false;
  private static imagePromptCache: any[] = [];
  private static lastImagePromptFetch = 0;

  static init() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Enable story debug logging if query param present
    this.debugEnabled = urlParams.has('storydebug');
    
    // PHASE 3: Enable image debug logging if query param present
    this.imageDebugEnabled = urlParams.has('imagedebug');
    
    if (this.debugEnabled) {
      console.log('[STORY-DEBUG] 🐛 Story debug logging enabled');
      // Add global export function for easy access
      (window as any).exportStoryLogs = () => this.exportStoryLogs();
    }
    
    if (this.imageDebugEnabled) {
      console.log('[IMAGE-DEBUG] 📸 Image debug logging enabled - monitoring recent prompts');
      // Add global image prompt export function
      (window as any).exportImagePrompts = () => this.exportImagePrompts();
      
      // Start auto-fetching recent image prompts
      this.startImagePromptMonitoring();
    }
  }

  static generateContentHash(content: any): string {
    const str = Array.isArray(content) ? JSON.stringify(content) : String(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  static logStoryChange(
    source: string,
    action: 'before' | 'after',
    content: any,
    additionalData: any = {}
  ) {
    const timestamp = Date.now();
    const sequence = ++this.sequenceNumber;
    const contentHash = this.generateContentHash(content);
    const contentPreview = Array.isArray(content) 
      ? `[${content.length} pages] First: ${content[0]?.substring(0, 100) || 'empty'}...`
      : String(content).substring(0, 100) + '...';

    // Get stack trace to identify caller
    const stack = new Error().stack;
    const callerLine = stack?.split('\n')[3]?.trim() || 'unknown';

    const logData = {
      sequence,
      timestamp,
      source,
      action,
      contentHash,
      contentPreview,
      caller: callerLine,
      pageCount: Array.isArray(content) ? content.length : 1,
      ...additionalData
    };

    // Log to SecurityMonitor for persistent tracking
    SecurityMonitor.logEvent(
      'user',
      'story_content_change',
      logData,
      'low'
    );

    // Enhanced console logging for immediate debugging
    if (this.debugEnabled) {
      const emoji = action === 'before' ? '⏳' : '✅';
      console.log(
        `[STORY-DEBUG] ${emoji} ${action.toUpperCase()} setStory() #${sequence}`,
        {
          source,
          contentHash,
          pageCount: Array.isArray(content) ? content.length : 1,
          preview: contentPreview,
          caller: callerLine.replace(/^at /, ''),
          ...additionalData
        }
      );
    }

    // Detect rapid consecutive changes (potential flicker)
    this.detectRapidChanges(sequence, timestamp, source);
  }

  private static lastChangeTime = 0;
  private static rapidChangeCount = 0;

  private static detectRapidChanges(sequence: number, timestamp: number, source: string) {
    const timeDiff = timestamp - this.lastChangeTime;
    
    if (timeDiff < 1000) { // Less than 1 second
      this.rapidChangeCount++;
      
      if (this.rapidChangeCount >= 2) {
        const warningData = {
          sequence,
          source,
          timeDiff,
          rapidChangeCount: this.rapidChangeCount
        };

        SecurityMonitor.logEvent(
          'performance',
          'rapid_story_changes_detected',
          warningData,
          'medium'
        );

        if (this.debugEnabled) {
          console.warn(
            `[STORY-DEBUG] ⚠️ RAPID CHANGES DETECTED! ${this.rapidChangeCount} changes in <1s`,
            warningData
          );
        }
      }
    } else {
      this.rapidChangeCount = 0; // Reset counter
    }
    
    this.lastChangeTime = timestamp;
  }

  static logStateTransition(
    transitionType: 'page_nav' | 'display_story_change' | 'loading_state',
    fromState: any,
    toState: any,
    context: string = ''
  ) {
    const logData = {
      transitionType,
      fromState,
      toState,
      context,
      timestamp: Date.now()
    };

    SecurityMonitor.logEvent(
      'user',
      'story_state_transition',
      logData,
      'low'
    );

    if (this.debugEnabled) {
      console.log(`[STORY-DEBUG] 🔄 ${transitionType.toUpperCase()}:`, logData);
    }
  }

  static exportStoryLogs() {
    const allEvents = SecurityMonitor.getEvents();
    const storyEvents = allEvents.filter(event => 
      event.event === 'story_content_change' || 
      event.event === 'story_state_transition' ||
      event.event === 'rapid_story_changes_detected'
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalEvents: storyEvents.length,
      events: storyEvents.map(event => ({
        ...event,
        readableTime: new Date(event.timestamp).toISOString()
      })),
      summary: {
        contentChanges: storyEvents.filter(e => e.event === 'story_content_change').length,
        stateTransitions: storyEvents.filter(e => e.event === 'story_state_transition').length,
        rapidChanges: storyEvents.filter(e => e.event === 'rapid_story_changes_detected').length,
      }
    };

    // Export as downloadable JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-debug-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[STORY-DEBUG] 📁 Story logs exported!', exportData.summary);
    return exportData;
  }

  static getStoryEvents() {
    return SecurityMonitor.getEvents().filter(event => 
      event.event === 'story_content_change' || 
      event.event === 'story_state_transition' ||
      event.event === 'rapid_story_changes_detected'
    );
  }

  // PHASE 3: Image Debug Monitoring System
  static startImagePromptMonitoring() {
    if (!this.imageDebugEnabled) return;
    
    console.log('[IMAGE-DEBUG] 🚀 Starting image prompt monitoring (5s intervals)');
    
    // Fetch immediately
    this.fetchRecentImagePrompts();
    
    // Set up periodic fetching
    setInterval(() => {
      this.fetchRecentImagePrompts();
    }, 5000); // Every 5 seconds
  }

  static async fetchRecentImagePrompts() {
    try {
      const supabaseUrl = "https://cpzeuogomaixamrtnnmj.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/debug-recent-image-prompts?global=true&limit=6`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.imagePromptCache = data.imagePrompts || [];
        this.lastImagePromptFetch = Date.now();
        
        // Log new prompts since last fetch
        const newPrompts = this.imagePromptCache.filter(prompt => 
          prompt.timestamp > this.lastImagePromptFetch - 10000 // Within last 10 seconds
        );
        
        newPrompts.forEach(prompt => {
          console.log(`[IMAGE-DEBUG] 📸 NEW TIER-${prompt.tier} PROMPT:`, {
            tier: prompt.tier,
            page: prompt.pageNumber,
            success: prompt.success,
            provider: prompt.provider,
            promptLength: prompt.textLengths?.enhanced || 0,
            prompt: prompt.enhancedPrompt?.substring(0, 200) + '...',
            timestamp: prompt.readableTime
          });
        });
        
        if (newPrompts.length > 0) {
          console.log(`[IMAGE-DEBUG] 📊 Recent prompts by tier:`, data.tierSummary);
          console.log(`[IMAGE-DEBUG] ✅ Success rate: ${data.successRate}`);
        }
      }
    } catch (error) {
      console.warn('[IMAGE-DEBUG] ⚠️ Failed to fetch image prompts:', error.message);
    }
  }

  static exportImagePrompts() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalPrompts: this.imagePromptCache.length,
      prompts: this.imagePromptCache,
      summary: {
        byTier: this.imagePromptCache.reduce((acc, prompt) => {
          acc[`tier${prompt.tier}`] = (acc[`tier${prompt.tier}`] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byProvider: this.imagePromptCache.reduce((acc, prompt) => {
          acc[prompt.provider] = (acc[prompt.provider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        successRate: this.imagePromptCache.length > 0 ? 
          (this.imagePromptCache.filter(p => p.success).length / this.imagePromptCache.length * 100).toFixed(1) + '%' : 'N/A'
      }
    };

    // Export as downloadable JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-prompts-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[IMAGE-DEBUG] 📁 Image prompts exported!', exportData.summary);
    return exportData;
  }

  static getRecentImagePrompts() {
    return this.imagePromptCache;
  }
}

// Initialize on module load
StoryContentLogger.init();