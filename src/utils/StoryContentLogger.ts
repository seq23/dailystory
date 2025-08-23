// Story Content Logging Utility for Flickering Debug
import { SecurityMonitor } from '@/utils/monitoring';

export class StoryContentLogger {
  private static sequenceNumber = 0;
  private static debugEnabled = false;
  
  static init() {
    // Enable debug logging if query param present
    this.debugEnabled = new URLSearchParams(window.location.search).has('storydebug');
    if (this.debugEnabled) {
      console.log('[STORY-DEBUG] 🐛 Story debug logging enabled');
      // Add global export function for easy access
      (window as any).exportStoryLogs = () => this.exportStoryLogs();
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
}

// Initialize on module load
StoryContentLogger.init();