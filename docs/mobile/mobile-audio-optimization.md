# Mobile Audio Optimization Guide

## Overview

Mobile audio requires specialized handling due to platform restrictions, battery constraints, and varying hardware capabilities. This guide covers all aspects of mobile audio optimization for iOS and Android devices.

## Core Mobile Audio Manager

### MobileAudioManager Architecture
**Location**: `src/services/mobileAudioManager.ts`

```typescript
interface MobileAudioContext {
  isInitialized: boolean;
  hasUserInteraction: boolean;
  audioFormat: 'mp3' | 'aac' | 'opus';
  networkQuality: 'high' | 'medium' | 'low';
  isLowPowerMode: boolean;
}

class MobileAudioManager {
  private static instance: MobileAudioManager;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private context: MobileAudioContext;
  
  // Singleton pattern for consistent mobile audio handling
  static getInstance(): MobileAudioManager {
    if (!MobileAudioManager.instance) {
      MobileAudioManager.instance = new MobileAudioManager();
    }
    return MobileAudioManager.instance;
  }
}
```

## Platform-Specific Optimizations

### iOS Audio Handling

#### Audio Context Management
```javascript
const initializeiOSAudio = async () => {
  // iOS requires user interaction to unlock audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  if (audioContext.state === 'suspended') {
    // Wait for user interaction
    const unlockAudio = () => {
      audioContext.resume().then(() => {
        console.log('iOS audio context unlocked');
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      });
    };
    
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  }
  
  return audioContext;
};
```

#### iOS Safari Limitations
```javascript
const handleiOSSafariConstraints = () => {
  const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                     /Safari/.test(navigator.userAgent) && 
                     !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
  
  if (isIOSSafari) {
    return {
      maxConcurrentAudio: 1, // Safari limits concurrent audio
      preferredFormat: 'aac', // Better compression for mobile
      bufferSize: 2048, // Smaller buffer for responsiveness
      enablePreloading: false // Prevent automatic preloading
    };
  }
  
  return getDefaultConfig();
};
```

### Android Audio Handling

#### Chrome Mobile Optimizations
```javascript
const initializeAndroidAudio = async () => {
  const audioContext = new AudioContext({
    sampleRate: 22050, // Lower sample rate for Android performance
    latencyHint: 'interactive'
  });
  
  // Android Chrome audio unlocking
  if (audioContext.state !== 'running') {
    const resumeAudio = async () => {
      await audioContext.resume();
      if (audioContext.state === 'running') {
        console.log('Android audio context active');
        document.removeEventListener('touchend', resumeAudio);
      }
    };
    
    document.addEventListener('touchend', resumeAudio, { once: true });
  }
  
  return audioContext;
};
```

#### Android Memory Management
```javascript
const AndroidMemoryManager = {
  maxCacheSize: 50 * 1024 * 1024, // 50MB cache limit for Android
  currentCacheSize: 0,
  
  shouldCache(audioSize) {
    return this.currentCacheSize + audioSize < this.maxCacheSize;
  },
  
  clearLRUCache() {
    // Implement LRU cache clearing for memory pressure
    const sortedCache = Array.from(audioCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Clear oldest 25% of cache
    const clearCount = Math.floor(sortedCache.length * 0.25);
    for (let i = 0; i < clearCount; i++) {
      audioCache.delete(sortedCache[i][0]);
    }
  }
};
```

## Audio Unlocking Strategies

### User Interaction Detection
```javascript
class AudioUnlocker {
  private isUnlocked = false;
  private unlockPromise: Promise<void> | null = null;
  
  async ensureUnlocked(): Promise<void> {
    if (this.isUnlocked) return;
    
    if (!this.unlockPromise) {
      this.unlockPromise = this.createUnlockPromise();
    }
    
    return this.unlockPromise;
  }
  
  private createUnlockPromise(): Promise<void> {
    return new Promise((resolve) => {
      const unlock = async () => {
        try {
          const audioContext = new AudioContext();
          const buffer = audioContext.createBuffer(1, 1, 22050);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          
          this.isUnlocked = true;
          resolve();
        } catch (error) {
          console.warn('Audio unlock failed:', error);
        }
        
        // Clean up event listeners
        ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
          document.removeEventListener(event, unlock);
        });
      };
      
      // Listen for various user interaction events
      ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
        document.addEventListener(event, unlock, { once: true });
      });
    });
  }
}
```

### Progressive Enhancement
```javascript
const initializeMobileAudioProgressively = async () => {
  // Start with minimal audio setup
  const basicSetup = await setupBasicAudio();
  
  // Enhance based on capabilities
  if (supportsWebAudio()) {
    await enhanceWithWebAudio(basicSetup);
  }
  
  if (supportsMediaSourceExtensions()) {
    await enhanceWithMSE(basicSetup);
  }
  
  return basicSetup;
};

const supportsWebAudio = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

const supportsMediaSourceExtensions = () => {
  return 'MediaSource' in window;
};
```

## Network Adaptation

### Connection Quality Detection
```javascript
class NetworkQualityDetector {
  private quality: 'high' | 'medium' | 'low' = 'medium';
  
  async detectQuality(): Promise<void> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Map connection types to quality levels
      const qualityMap = {
        'slow-2g': 'low',
        '2g': 'low', 
        '3g': 'medium',
        '4g': 'high',
        '5g': 'high'
      };
      
      this.quality = qualityMap[connection.effectiveType] || 'medium';
    }
    
    // Fallback: measure actual network speed
    await this.measureNetworkSpeed();
  }
  
  private async measureNetworkSpeed(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Download a small test file
      await fetch('/test-file-small.mp3', { cache: 'no-cache' });
      const duration = Date.now() - startTime;
      
      if (duration < 500) this.quality = 'high';
      else if (duration < 1500) this.quality = 'medium';
      else this.quality = 'low';
      
    } catch (error) {
      this.quality = 'low';
    }
  }
  
  getOptimalSettings() {
    const settings = {
      high: { bitrate: 128, format: 'mp3', bufferSize: 4096 },
      medium: { bitrate: 96, format: 'aac', bufferSize: 2048 },
      low: { bitrate: 64, format: 'opus', bufferSize: 1024 }
    };
    
    return settings[this.quality];
  }
}
```

### Adaptive Audio Quality
```javascript
const AdaptiveAudioManager = {
  async getOptimalAudioSettings() {
    const networkDetector = new NetworkQualityDetector();
    await networkDetector.detectQuality();
    
    const baseSettings = networkDetector.getOptimalSettings();
    
    // Adjust for device capabilities
    if (this.isLowEndDevice()) {
      baseSettings.bitrate = Math.min(baseSettings.bitrate, 64);
      baseSettings.bufferSize = Math.min(baseSettings.bufferSize, 1024);
    }
    
    // Adjust for battery level
    if (this.isLowBattery()) {
      baseSettings.bitrate = Math.min(baseSettings.bitrate, 48);
    }
    
    return baseSettings;
  },
  
  isLowEndDevice() {
    return navigator.hardwareConcurrency <= 2 || 
           (navigator as any).deviceMemory <= 2;
  },
  
  isLowBattery() {
    return (navigator as any).getBattery?.()?.then?.(battery => 
      battery.level < 0.2 && !battery.charging
    ) || false;
  }
};
```

## Battery Optimization

### Power-Aware Audio Processing
```javascript
class BatteryOptimizedAudio {
  private batteryInfo: any = null;
  
  async initialize() {
    if ('getBattery' in navigator) {
      this.batteryInfo = await (navigator as any).getBattery();
      this.setupBatteryMonitoring();
    }
  }
  
  private setupBatteryMonitoring() {
    if (!this.batteryInfo) return;
    
    // Monitor battery level changes
    this.batteryInfo.addEventListener('levelchange', () => {
      this.adjustForBatteryLevel();
    });
    
    // Monitor charging state changes
    this.batteryInfo.addEventListener('chargingchange', () => {
      this.adjustForChargingState();
    });
  }
  
  private adjustForBatteryLevel() {
    const level = this.batteryInfo.level;
    
    if (level < 0.15) {
      // Critical battery: minimal audio processing
      this.setAudioQuality('minimal');
    } else if (level < 0.30) {
      // Low battery: reduced quality
      this.setAudioQuality('low');
    } else {
      // Good battery: normal quality
      this.setAudioQuality('normal');
    }
  }
  
  private setAudioQuality(level: 'minimal' | 'low' | 'normal') {
    const settings = {
      minimal: { 
        disableEffects: true,
        reduceBitrate: true,
        limitConcurrency: 1,
        aggressiveCaching: false
      },
      low: {
        disableEffects: false,
        reduceBitrate: true,
        limitConcurrency: 2,
        aggressiveCaching: true
      },
      normal: {
        disableEffects: false,
        reduceBitrate: false,
        limitConcurrency: 4,
        aggressiveCaching: true
      }
    };
    
    this.applySettings(settings[level]);
  }
}
```

## Interruption Handling

### System Interruption Management
```javascript
class InterruptionManager {
  private wasPlayingBeforeInterruption = false;
  private currentAudio: HTMLAudioElement | null = null;
  
  initialize(audioElement: HTMLAudioElement) {
    this.currentAudio = audioElement;
    this.setupInterruptionHandlers();
  }
  
  private setupInterruptionHandlers() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleInterruption();
      } else {
        this.handleResumption();
      }
    });
    
    // Handle audio interruptions (calls, notifications)
    if (this.currentAudio) {
      this.currentAudio.addEventListener('pause', (event) => {
        if (!event.isTrusted) return; // Ignore programmatic pauses
        this.handleInterruption();
      });
    }
    
    // iOS-specific interruption handling
    if (this.isIOS()) {
      this.setupIOSInterruptions();
    }
  }
  
  private setupIOSInterruptions() {
    // iOS WebKit interruption events
    document.addEventListener('webkitbeginfullscreen', () => {
      this.handleInterruption();
    });
    
    document.addEventListener('webkitendfullscreen', () => {
      this.handleResumption();
    });
  }
  
  private handleInterruption() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.wasPlayingBeforeInterruption = true;
      this.currentAudio.pause();
      
      // Dispatch interruption event
      window.dispatchEvent(new CustomEvent('audio:interrupted', {
        detail: { canResume: true }
      }));
    }
  }
  
  private handleResumption() {
    if (this.wasPlayingBeforeInterruption && this.currentAudio) {
      // Small delay to ensure system is ready
      setTimeout(() => {
        this.currentAudio?.play().catch(error => {
          console.warn('Failed to resume audio:', error);
        });
        this.wasPlayingBeforeInterruption = false;
      }, 100);
      
      // Dispatch resumption event
      window.dispatchEvent(new CustomEvent('audio:resumed'));
    }
  }
  
  private isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}
```

## Performance Monitoring

### Mobile Audio Metrics
```javascript
class MobileAudioMetrics {
  private metrics = {
    unlockLatency: 0,
    audioLoadTime: 0,
    playbackErrors: 0,
    interruptions: 0,
    batteryDrain: 0
  };
  
  trackUnlockLatency(startTime: number) {
    this.metrics.unlockLatency = Date.now() - startTime;
    this.reportMetric('unlock_latency', this.metrics.unlockLatency);
  }
  
  trackAudioLoadTime(startTime: number) {
    this.metrics.audioLoadTime = Date.now() - startTime;
    this.reportMetric('audio_load_time', this.metrics.audioLoadTime);
  }
  
  trackPlaybackError(error: Error) {
    this.metrics.playbackErrors++;
    this.reportMetric('playback_error', {
      count: this.metrics.playbackErrors,
      error: error.message
    });
  }
  
  trackInterruption() {
    this.metrics.interruptions++;
    this.reportMetric('interruption', this.metrics.interruptions);
  }
  
  private reportMetric(name: string, value: any) {
    // Send to analytics service
    window.dispatchEvent(new CustomEvent('mobile:audio:metric', {
      detail: { name, value, timestamp: Date.now() }
    }));
  }
}
```

## Testing Mobile Audio

### Device Testing Strategy
```javascript
describe('Mobile Audio', () => {
  beforeEach(() => {
    // Mock mobile environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    });
  });
  
  it('should unlock audio on iOS', async () => {
    const audioManager = MobileAudioManager.getInstance();
    const unlockSpy = vi.spyOn(audioManager, 'initializeMobileAudio');
    
    // Simulate user interaction
    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    document.dispatchEvent(touchEvent);
    
    await audioManager.initializeMobileAudio();
    expect(unlockSpy).toHaveBeenCalled();
  });
  
  it('should handle interruptions gracefully', async () => {
    const interruptionManager = new InterruptionManager();
    const mockAudio = document.createElement('audio');
    interruptionManager.initialize(mockAudio);
    
    // Simulate interruption
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { value: true });
    
    expect(mockAudio.paused).toBe(true);
  });
});
```

### Performance Testing
```javascript
const MobilePerformanceTest = {
  async testAudioLatency() {
    const startTime = Date.now();
    const audio = new Audio();
    
    return new Promise((resolve) => {
      audio.addEventListener('canplaythrough', () => {
        const latency = Date.now() - startTime;
        resolve(latency);
      });
      
      audio.src = 'test-audio.mp3';
      audio.load();
    });
  },
  
  async testMemoryUsage() {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Perform audio operations
    await this.performAudioOperations();
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    return finalMemory - initialMemory;
  },
  
  async testBatteryImpact() {
    const battery = await (navigator as any).getBattery?.();
    const initialLevel = battery?.level || 1;
    
    // Run audio for test duration
    await this.runAudioTest(60000); // 1 minute
    
    const finalLevel = battery?.level || 1;
    return initialLevel - finalLevel;
  }
};
```

## Best Practices Summary

### Implementation Guidelines
1. **Always require user interaction** before attempting audio playback
2. **Implement progressive enhancement** based on device capabilities
3. **Monitor network quality** and adapt audio settings accordingly
4. **Handle interruptions gracefully** with automatic resumption
5. **Optimize for battery life** with quality adjustments
6. **Test on real devices** across different platforms and versions

### Performance Optimization
1. **Use appropriate audio formats** (AAC for iOS, Opus for Android)
2. **Implement intelligent caching** with memory constraints
3. **Minimize concurrent audio streams** on mobile devices
4. **Use Web Audio API judiciously** - fallback to HTML5 audio when needed
5. **Monitor and report metrics** for continuous improvement

### User Experience
1. **Provide clear visual feedback** during audio loading
2. **Implement retry mechanisms** for failed audio operations
3. **Respect user preferences** for data usage and battery conservation
4. **Handle edge cases** like airplane mode and low storage
5. **Maintain consistency** across different mobile browsers