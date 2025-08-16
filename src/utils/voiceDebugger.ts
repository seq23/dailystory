/**
 * Voice System Debug Helper
 * 
 * Provides debugging utilities for voice command systems
 */

export class VoiceDebugger {
  private static instance: VoiceDebugger;
  private logs: Array<{ timestamp: number; system: string; event: string; data?: any }> = [];
  private maxLogs = 100;

  static getInstance(): VoiceDebugger {
    if (!VoiceDebugger.instance) {
      VoiceDebugger.instance = new VoiceDebugger();
    }
    return VoiceDebugger.instance;
  }

  log(system: 'elevenlabs' | 'openai' | 'unified', event: string, data?: any) {
    const logEntry = {
      timestamp: Date.now(),
      system,
      event,
      data
    };
    
    this.logs.push(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Also log to console with emoji prefix
    const emoji = system === 'elevenlabs' ? '🎤' : system === 'openai' ? '🤖' : '🎯';
    console.log(`${emoji} [${system.toUpperCase()}] ${event}`, data || '');
  }

  getLogs(system?: string): typeof this.logs {
    if (!system) return [...this.logs];
    return this.logs.filter(log => log.system === system);
  }

  getRecentLogs(minutes = 5): typeof this.logs {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
  }

  // Debug ElevenLabs agent configuration
  checkElevenLabsConfig() {
    console.log('🔍 ElevenLabs Configuration Check:');
    console.log('1. Agent ID from localStorage:', localStorage.getItem('eleven_agent_id'));
    console.log('2. Expected client tools: play, stop, next, previous, wordHelp, speedUp, slowDown, normalSpeed');
    console.log('3. Make sure these match exactly in your ElevenLabs agent dashboard');
    console.log('4. Ensure all tools are marked as "blocking" in the dashboard');
  }

  // Debug voice command flow
  debugVoiceFlow() {
    console.log('🔍 Voice Command Flow Debug:');
    console.log('Recent voice events:', this.getRecentLogs(2));
    
    // Check if required global variables exist
    console.log('Global text content:', !!((window as any).__pageContentString));
    console.log('Global content hash:', !!((window as any).__pageContentHash));
    
    // Check event listeners
    const hasNavigationListener = !!(window as any).___reader_navigation_listener;
    console.log('Navigation event listener active:', hasNavigationListener);
  }
}

// Global debug helper
(window as any).voiceDebug = VoiceDebugger.getInstance();
