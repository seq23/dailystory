# Audio and Voice Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting procedures for all audio and voice-related issues, including diagnostic tools, common problems, solutions, and monitoring procedures.

## Diagnostic Tools

### Audio System Health Check
```javascript
class AudioSystemDiagnostics {
  static async runHealthCheck() {
    const results = {
      audioContext: this.checkAudioContext(),
      webAudio: this.checkWebAudioSupport(),
      permissions: await this.checkPermissions(),
      network: await this.checkNetworkConnectivity(),
      edgeFunctions: await this.checkEdgeFunctions(),
      voiceServices: await this.checkVoiceServices()
    };
    
    console.log('Audio System Health Check:', results);
    return results;
  }
  
  static checkAudioContext() {
    try {
      const audioContext = new AudioContext();
      return {
        supported: true,
        state: audioContext.state,
        sampleRate: audioContext.sampleRate,
        maxChannelCount: audioContext.destination.maxChannelCount
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message
      };
    }
  }
  
  static checkWebAudioSupport() {
    return {
      AudioContext: 'AudioContext' in window,
      webkitAudioContext: 'webkitAudioContext' in window,
      MediaDevices: 'mediaDevices' in navigator,
      getUserMedia: 'getUserMedia' in navigator.mediaDevices
    };
  }
  
  static async checkPermissions() {
    try {
      const micPermission = await navigator.permissions.query({ name: 'microphone' });
      return {
        microphone: micPermission.state,
        notifications: Notification.permission
      };
    } catch (error) {
      return {
        error: 'Permissions API not supported',
        microphone: 'unknown'
      };
    }
  }
  
  static async checkNetworkConnectivity() {
    try {
      const response = await fetch('/health-check', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return {
        online: navigator.onLine,
        serverReachable: response.ok,
        latency: Date.now() - performance.now()
      };
    } catch (error) {
      return {
        online: navigator.onLine,
        serverReachable: false,
        error: error.message
      };
    }
  }
  
  static async checkEdgeFunctions() {
    const functions = [
      'elevenlabs-tts',
      'elevenlabs-agent-signed-url',
      'openai-realtime'
    ];
    
    const results = {};
    
    for (const func of functions) {
      try {
        const { error } = await supabase.functions.invoke(func, {
          body: { health: 'check' }
        });
        
        results[func] = {
          available: !error,
          error: error?.message
        };
      } catch (err) {
        results[func] = {
          available: false,
          error: err.message
        };
      }
    }
    
    return results;
  }
  
  static async checkVoiceServices() {
    return {
      elevenLabs: await this.testElevenLabsConnection(),
      openAI: await this.testOpenAIConnection(),
      webSpeech: this.testWebSpeechAPI()
    };
  }
  
  static async testElevenLabsConnection() {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', {
        body: { test: true }
      });
      
      return {
        available: !error,
        authenticated: !!data?.signed_url
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
  
  static testWebSpeechAPI() {
    return {
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      voices: speechSynthesis?.getVoices()?.length || 0
    };
  }
}
```

### Real-time Monitoring Dashboard
```javascript
class AudioMonitoringDashboard {
  private metrics = new Map();
  private alerts = new Map();
  
  startMonitoring() {
    // Monitor audio performance
    this.monitorAudioPerformance();
    
    // Monitor network issues
    this.monitorNetworkIssues();
    
    // Monitor error rates
    this.monitorErrorRates();
    
    // Monitor user experience
    this.monitorUserExperience();
  }
  
  private monitorAudioPerformance() {
    setInterval(() => {
      const audioEngine = SimplifiedAudioEngine.getInstance();
      const status = audioEngine.getStatus();
      
      this.recordMetric('audio_engine_status', {
        isPlaying: status.isPlaying,
        currentHash: status.currentContentHash,
        timestamp: Date.now()
      });
      
      // Check for performance issues
      if (this.detectPerformanceIssues()) {
        this.raiseAlert('performance', 'Audio performance degraded');
      }
    }, 5000);
  }
  
  private monitorNetworkIssues() {
    window.addEventListener('online', () => {
      this.recordMetric('network_status', { online: true, timestamp: Date.now() });
    });
    
    window.addEventListener('offline', () => {
      this.recordMetric('network_status', { online: false, timestamp: Date.now() });
      this.raiseAlert('network', 'Network connection lost');
    });
  }
  
  private recordMetric(name: string, data: any) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const history = this.metrics.get(name);
    history.push(data);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }
  }
  
  private raiseAlert(type: string, message: string) {
    const alert = {
      type,
      message,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.alerts.set(alert.id, alert);
    
    // Dispatch alert event
    window.dispatchEvent(new CustomEvent('audio:alert', { detail: alert }));
    
    console.warn(`Audio Alert [${type}]: ${message}`);
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  getAlerts() {
    return Array.from(this.alerts.values());
  }
}
```

## Common Issues and Solutions

### 1. Audio Not Playing

#### Symptoms
- Play button clicked but no audio
- Audio loading indefinitely
- Silent playback

#### Diagnostic Steps
```javascript
const diagnoseAudioPlayback = async () => {
  console.log('🔍 Diagnosing audio playback issues...');
  
  // Check 1: Audio context state
  const audioContext = new AudioContext();
  console.log('Audio Context State:', audioContext.state);
  
  if (audioContext.state === 'suspended') {
    console.log('❌ Audio context suspended - requires user interaction');
    return { issue: 'audio_context_suspended', solution: 'user_interaction_required' };
  }
  
  // Check 2: Permissions
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone permissions granted');
  } catch (error) {
    console.log('❌ Microphone permission denied:', error);
    return { issue: 'permission_denied', solution: 'request_permissions' };
  }
  
  // Check 3: Network connectivity
  try {
    const response = await fetch('/health-check');
    if (!response.ok) {
      console.log('❌ Server unreachable');
      return { issue: 'network_error', solution: 'check_connection' };
    }
  } catch (error) {
    console.log('❌ Network error:', error);
    return { issue: 'network_error', solution: 'check_connection' };
  }
  
  // Check 4: TTS service
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text: 'test', voice: 'XB0fDUnXU5powFXDhCwa' }
    });
    
    if (error) {
      console.log('❌ TTS service error:', error);
      return { issue: 'tts_service_error', solution: 'check_api_keys' };
    }
    
    console.log('✅ TTS service working');
  } catch (error) {
    console.log('❌ TTS service failed:', error);
    return { issue: 'tts_service_error', solution: 'check_edge_functions' };
  }
  
  console.log('✅ All systems appear functional');
  return { issue: 'none', solution: 'investigate_further' };
};
```

#### Solutions
```javascript
const fixAudioPlayback = async (issue) => {
  switch (issue) {
    case 'audio_context_suspended':
      // Force audio context resume with user interaction
      const unlockAudio = () => {
        const audioContext = new AudioContext();
        audioContext.resume().then(() => {
          console.log('✅ Audio context resumed');
          document.removeEventListener('click', unlockAudio);
        });
      };
      document.addEventListener('click', unlockAudio, { once: true });
      break;
      
    case 'permission_denied':
      // Guide user to enable permissions
      alert('Please enable microphone permissions for voice features to work.');
      break;
      
    case 'network_error':
      // Activate offline fallback
      const webSpeech = new SpeechSynthesisUtterance('Network unavailable, using offline speech');
      speechSynthesis.speak(webSpeech);
      break;
      
    case 'tts_service_error':
      // Fallback to Web Speech API
      console.log('🔄 Falling back to Web Speech API');
      const fallbackSpeech = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(fallbackSpeech);
      break;
  }
};
```

### 2. Voice Commands Not Working

#### Symptoms
- Voice button not responding
- Voice not being recognized
- Commands not executing

#### Diagnostic Procedure
```javascript
const diagnoseVoiceCommands = async () => {
  console.log('🔍 Diagnosing voice command issues...');
  
  // Check microphone access
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone access granted');
  } catch (error) {
    console.log('❌ Microphone access denied:', error);
    return { issue: 'microphone_access', solution: 'enable_permissions' };
  }
  
  // Check ElevenLabs agent
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
    if (error) {
      console.log('❌ ElevenLabs agent error:', error);
      return { issue: 'elevenlabs_agent', solution: 'check_api_key' };
    }
    console.log('✅ ElevenLabs agent accessible');
  } catch (error) {
    console.log('❌ ElevenLabs agent failed:', error);
    return { issue: 'elevenlabs_agent', solution: 'activate_fallback' };
  }
  
  // Check WebSocket connectivity
  try {
    const ws = new WebSocket('wss://echo.websocket.org');
    ws.onopen = () => {
      console.log('✅ WebSocket connectivity working');
      ws.close();
    };
  } catch (error) {
    console.log('❌ WebSocket connectivity issues:', error);
    return { issue: 'websocket_blocked', solution: 'check_firewall' };
  }
  
  return { issue: 'none', solution: 'all_systems_operational' };
};
```

#### Solutions
```javascript
const fixVoiceCommands = async (issue) => {
  switch (issue) {
    case 'microphone_access':
      // Show permission request UI
      showMicrophonePermissionDialog();
      break;
      
    case 'elevenlabs_agent':
      // Activate OpenAI fallback
      console.log('🔄 Activating OpenAI Realtime fallback');
      const openAIChat = useOpenAIRealtimeChat();
      await openAIChat.connect();
      break;
      
    case 'websocket_blocked':
      // Show network troubleshooting guide
      showNetworkTroubleshootingGuide();
      break;
  }
};
```

### 3. Mobile Audio Issues

#### iOS-Specific Issues
```javascript
const diagnoseiOSAudio = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (!isIOS) return { issue: 'not_ios' };
  
  // Check iOS version
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  const version = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
  
  if (version < 13.0) {
    return { 
      issue: 'ios_version_old', 
      solution: 'update_ios',
      details: `iOS ${version} detected, recommend iOS 13+ for best audio support`
    };
  }
  
  // Check Safari constraints
  const isSafari = /Safari/.test(navigator.userAgent) && 
                   !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
  
  if (isSafari) {
    return {
      issue: 'safari_limitations',
      solution: 'apply_safari_workarounds',
      details: 'Safari has audio limitations, applying workarounds'
    };
  }
  
  return { issue: 'none' };
};

const fixiOSAudio = (issue) => {
  switch (issue) {
    case 'safari_limitations':
      // Apply Safari-specific fixes
      const audioElement = document.createElement('audio');
      audioElement.preload = 'none'; // Prevent auto-preload
      audioElement.controls = false;
      
      // Use touch events for unlocking
      const unlockiOSAudio = () => {
        audioElement.play().then(() => {
          audioElement.pause();
          console.log('✅ iOS Safari audio unlocked');
        }).catch(console.warn);
      };
      
      ['touchstart', 'touchend'].forEach(event => {
        document.addEventListener(event, unlockiOSAudio, { once: true });
      });
      break;
  }
};
```

#### Android-Specific Issues
```javascript
const diagnoseAndroidAudio = () => {
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (!isAndroid) return { issue: 'not_android' };
  
  // Check Chrome version
  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1]) : 0;
  
  if (chromeVersion < 80) {
    return {
      issue: 'chrome_version_old',
      solution: 'update_chrome',
      details: `Chrome ${chromeVersion} detected, recommend Chrome 80+ for audio features`
    };
  }
  
  // Check for low-memory devices
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory <= 2) {
    return {
      issue: 'low_memory_device',
      solution: 'optimize_for_low_memory',
      details: `Device memory: ${deviceMemory}GB - applying optimizations`
    };
  }
  
  return { issue: 'none' };
};
```

### 4. Word Highlighting Issues

#### Timing Synchronization Problems
```javascript
const diagnoseWordHighlighting = () => {
  const audioEngine = SimplifiedAudioEngine.getInstance();
  const status = audioEngine.getStatus();
  
  if (!status.isPlaying) {
    return { issue: 'audio_not_playing', solution: 'start_audio_first' };
  }
  
  // Check if word timings are available
  const wordTimings = audioEngine.getCurrentWordTimings();
  if (!wordTimings || wordTimings.length === 0) {
    return { issue: 'no_word_timings', solution: 'regenerate_with_timings' };
  }
  
  // Check timing accuracy
  const currentTime = audioEngine.getCurrentTime();
  const expectedWord = findWordAtTime(currentTime, wordTimings);
  const actualHighlighted = getCurrentHighlightedWord();
  
  if (expectedWord !== actualHighlighted) {
    return { 
      issue: 'timing_mismatch', 
      solution: 'recalibrate_timings',
      details: `Expected: ${expectedWord}, Actual: ${actualHighlighted}`
    };
  }
  
  return { issue: 'none' };
};

const fixWordHighlighting = (issue) => {
  switch (issue) {
    case 'no_word_timings':
      // Regenerate audio with timing data
      const audioEngine = SimplifiedAudioEngine.getInstance();
      audioEngine.stop();
      // Re-request with synchronized timing
      break;
      
    case 'timing_mismatch':
      // Recalibrate timing offsets
      const offset = calculateTimingOffset();
      adjustWordTimings(offset);
      break;
  }
};
```

## Error Logging and Reporting

### Comprehensive Error Logger
```javascript
class AudioErrorLogger {
  private errorBuffer: Array<any> = [];
  private maxBufferSize = 100;
  
  logError(error: Error, context: any = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        audioContextState: this.getAudioContextState(),
        networkStatus: navigator.onLine,
        ...context
      }
    };
    
    this.errorBuffer.push(errorEntry);
    
    // Maintain buffer size
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }
    
    // Log to console
    console.error('Audio Error:', errorEntry);
    
    // Send to monitoring service
    this.sendToMonitoring(errorEntry);
  }
  
  private getAudioContextState() {
    try {
      const audioContext = new AudioContext();
      return {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  private sendToMonitoring(errorEntry: any) {
    // Send to external monitoring service
    fetch('/api/audio-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorEntry)
    }).catch(err => {
      console.warn('Failed to send error to monitoring:', err);
    });
  }
  
  getErrorHistory() {
    return this.errorBuffer;
  }
  
  clearErrors() {
    this.errorBuffer = [];
  }
}

// Global error logger instance
const audioErrorLogger = new AudioErrorLogger();

// Global error handler
window.addEventListener('error', (event) => {
  if (event.filename?.includes('audio') || event.message?.toLowerCase().includes('audio')) {
    audioErrorLogger.logError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.toLowerCase().includes('audio')) {
    audioErrorLogger.logError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    });
  }
});
```

## Performance Monitoring

### Real-time Performance Tracker
```javascript
class AudioPerformanceTracker {
  private metrics = new Map();
  
  startTracking(operation: string) {
    const startTime = performance.now();
    return {
      operation,
      startTime,
      end: () => this.endTracking(operation, startTime)
    };
  }
  
  private endTracking(operation: string, startTime: number) {
    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const operationMetrics = this.metrics.get(operation);
    operationMetrics.push({
      duration,
      timestamp: Date.now()
    });
    
    // Keep only last 50 measurements
    if (operationMetrics.length > 50) {
      operationMetrics.shift();
    }
    
    // Log slow operations
    if (duration > this.getThreshold(operation)) {
      console.warn(`Slow audio operation: ${operation} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  private getThreshold(operation: string): number {
    const thresholds = {
      'tts_generation': 3000,
      'audio_load': 1000,
      'voice_recognition': 2000,
      'word_highlighting': 100
    };
    
    return thresholds[operation] || 1000;
  }
  
  getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    return Object.fromEntries(this.metrics);
  }
  
  getAverageLatency(operation: string): number {
    const operationMetrics = this.metrics.get(operation) || [];
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / operationMetrics.length;
  }
}

// Usage example
const performanceTracker = new AudioPerformanceTracker();

// In audio services
const ttsTracker = performanceTracker.startTracking('tts_generation');
// ... TTS generation code ...
const duration = ttsTracker.end();
```

## Automated Recovery Procedures

### Self-Healing Audio System
```javascript
class AudioRecoverySystem {
  private recoveryAttempts = new Map();
  private maxRecoveryAttempts = 3;
  
  async attemptRecovery(issue: string, context: any = {}) {
    const attempts = this.recoveryAttempts.get(issue) || 0;
    
    if (attempts >= this.maxRecoveryAttempts) {
      console.error(`Max recovery attempts reached for ${issue}`);
      this.escalateIssue(issue, context);
      return false;
    }
    
    this.recoveryAttempts.set(issue, attempts + 1);
    
    console.log(`Attempting recovery for ${issue} (attempt ${attempts + 1})`);
    
    try {
      const recovered = await this.executeRecovery(issue, context);
      if (recovered) {
        this.recoveryAttempts.delete(issue);
        console.log(`✅ Successfully recovered from ${issue}`);
      }
      return recovered;
    } catch (error) {
      console.error(`Recovery attempt failed for ${issue}:`, error);
      return false;
    }
  }
  
  private async executeRecovery(issue: string, context: any): Promise<boolean> {
    switch (issue) {
      case 'audio_context_suspended':
        return this.recoverAudioContext();
        
      case 'tts_service_failure':
        return this.recoverTTSService(context);
        
      case 'voice_connection_lost':
        return this.recoverVoiceConnection(context);
        
      case 'mobile_audio_locked':
        return this.recoverMobileAudio();
        
      default:
        console.warn(`No recovery procedure for ${issue}`);
        return false;
    }
  }
  
  private async recoverAudioContext(): Promise<boolean> {
    try {
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      return audioContext.state === 'running';
    } catch (error) {
      return false;
    }
  }
  
  private async recoverTTSService(context: any): Promise<boolean> {
    try {
      // Try alternative TTS provider
      const webSpeech = new SpeechSynthesisUtterance(context.text || 'Test recovery');
      speechSynthesis.speak(webSpeech);
      
      // Notify user of fallback
      window.dispatchEvent(new CustomEvent('audio:fallback', {
        detail: { message: 'Using browser speech synthesis' }
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private async recoverVoiceConnection(context: any): Promise<boolean> {
    try {
      // Attempt to reconnect
      const voiceService = context.voiceService;
      if (voiceService && typeof voiceService.reconnect === 'function') {
        await voiceService.reconnect();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  private async recoverMobileAudio(): Promise<boolean> {
    try {
      const mobileAudio = MobileAudioManager.getInstance();
      await mobileAudio.initializeMobileAudio();
      return mobileAudio.isAudioReady();
    } catch (error) {
      return false;
    }
  }
  
  private escalateIssue(issue: string, context: any) {
    // Send to monitoring service
    const escalation = {
      issue,
      context,
      timestamp: new Date().toISOString(),
      attempts: this.recoveryAttempts.get(issue)
    };
    
    console.error('Issue escalated:', escalation);
    
    // Notify user
    window.dispatchEvent(new CustomEvent('audio:service:error', {
      detail: {
        message: 'Audio service temporarily unavailable',
        canRetry: false,
        service: 'audio'
      }
    }));
  }
}
```

## User-Facing Troubleshooting

### Interactive Troubleshooting Guide
```javascript
class UserTroubleshootingGuide {
  showTroubleshootingUI() {
    const modal = document.createElement('div');
    modal.className = 'troubleshooting-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Audio Troubleshooting</h2>
        <div id="troubleshooting-steps"></div>
        <button id="run-diagnostics">Run Diagnostics</button>
        <button id="close-modal">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('run-diagnostics')?.addEventListener('click', async () => {
      await this.runInteractiveDiagnostics();
    });
    
    document.getElementById('close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
  
  async runInteractiveDiagnostics() {
    const stepsContainer = document.getElementById('troubleshooting-steps');
    if (!stepsContainer) return;
    
    const steps = [
      {
        name: 'Checking audio support',
        test: () => this.testAudioSupport(),
        fix: 'Please update your browser to the latest version'
      },
      {
        name: 'Checking permissions',
        test: () => this.testPermissions(),
        fix: 'Please enable microphone permissions in your browser settings'
      },
      {
        name: 'Checking network connectivity',
        test: () => this.testNetworkConnectivity(),
        fix: 'Please check your internet connection'
      },
      {
        name: 'Testing audio services',
        test: () => this.testAudioServices(),
        fix: 'Audio services may be temporarily unavailable'
      }
    ];
    
    for (const step of steps) {
      const stepElement = document.createElement('div');
      stepElement.className = 'diagnostic-step';
      stepElement.innerHTML = `
        <div class="step-name">${step.name}...</div>
        <div class="step-status">Running</div>
      `;
      stepsContainer.appendChild(stepElement);
      
      try {
        const result = await step.test();
        const statusElement = stepElement.querySelector('.step-status');
        
        if (result.success) {
          statusElement!.textContent = '✅ Passed';
          statusElement!.className = 'step-status success';
        } else {
          statusElement!.textContent = '❌ Failed';
          statusElement!.className = 'step-status failed';
          
          const fixElement = document.createElement('div');
          fixElement.className = 'step-fix';
          fixElement.textContent = step.fix;
          stepElement.appendChild(fixElement);
        }
      } catch (error) {
        const statusElement = stepElement.querySelector('.step-status');
        statusElement!.textContent = '❌ Error';
        statusElement!.className = 'step-status error';
      }
    }
  }
  
  private testAudioSupport() {
    return Promise.resolve({
      success: 'AudioContext' in window || 'webkitAudioContext' in window
    });
  }
  
  private async testPermissions() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async testNetworkConnectivity() {
    try {
      const response = await fetch('/health-check', { method: 'HEAD' });
      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async testAudioServices() {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text: 'test', voice: 'XB0fDUnXU5powFXDhCwa' }
      });
      return { success: !error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

This comprehensive troubleshooting guide provides systematic approaches to identify, diagnose, and resolve audio and voice issues across all platforms and use cases.
