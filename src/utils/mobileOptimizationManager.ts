// Mobile Performance Optimization for Robust Anti-Repetition System
// Ensures optimal performance across all device types and screen sizes

import { useEffect, useState, useCallback } from 'react';

interface DeviceCapabilities {
  isLowEnd: boolean;
  screenSize: 'small' | 'medium' | 'large';
  connectionSpeed: 'slow' | 'fast';
  batteryOptimized: boolean;
}

interface MobileOptimizationConfig {
  enableLazyLoading: boolean;
  batchSize: number;
  cacheSize: number;
  performanceMode: 'battery' | 'performance' | 'balanced';
}

export class MobileOptimizationManager {
  private static deviceCapabilities: DeviceCapabilities | null = null;
  private static optimizationConfig: MobileOptimizationConfig | null = null;

  /**
   * Detects device capabilities and sets optimization parameters
   */
  static detectDeviceCapabilities(): DeviceCapabilities {
    if (this.deviceCapabilities) return this.deviceCapabilities;

    const userAgent = navigator.userAgent.toLowerCase();
    const isLowEnd = this.isLowEndDevice();
    const screenSize = this.getScreenSizeCategory();
    const connectionSpeed = this.getConnectionSpeed();
    
    this.deviceCapabilities = {
      isLowEnd,
      screenSize,
      connectionSpeed,
      batteryOptimized: isLowEnd || this.isBatteryOptimizationEnabled()
    };

    console.log('📱 Device capabilities detected:', this.deviceCapabilities);
    return this.deviceCapabilities;
  }

  /**
   * Gets optimized configuration for current device
   */
  static getOptimizationConfig(): MobileOptimizationConfig {
    if (this.optimizationConfig) return this.optimizationConfig;

    const capabilities = this.detectDeviceCapabilities();
    
    this.optimizationConfig = {
      enableLazyLoading: capabilities.isLowEnd || capabilities.screenSize === 'small',
      batchSize: capabilities.isLowEnd ? 3 : capabilities.screenSize === 'large' ? 10 : 6,
      cacheSize: capabilities.isLowEnd ? 50 : 200,
      performanceMode: capabilities.batteryOptimized ? 'battery' : 
                      capabilities.isLowEnd ? 'balanced' : 'performance'
    };

    console.log('⚡ Mobile optimization config:', this.optimizationConfig);
    return this.optimizationConfig;
  }

  /**
   * Optimizes template selection for mobile devices
   */
  static optimizeTemplateSelection(originalConfig: any): any {
    const optimization = this.getOptimizationConfig();
    const capabilities = this.detectDeviceCapabilities();

    return {
      ...originalConfig,
      lookbackPages: capabilities.isLowEnd ? 3 : originalConfig.lookbackPages,
      cooldownPages: capabilities.isLowEnd ? 5 : originalConfig.cooldownPages,
      enableCaching: true,
      batchProcessing: optimization.batchSize,
      lazyLoading: optimization.enableLazyLoading
    };
  }

  /**
   * Optimizes anti-repetition checks for mobile performance
   */
  static optimizeAntiRepetitionConfig(originalConfig: any): any {
    const optimization = this.getOptimizationConfig();
    const capabilities = this.detectDeviceCapabilities();

    return {
      ...originalConfig,
      enableAsyncProcessing: capabilities.isLowEnd,
      cacheSize: optimization.cacheSize,
      performanceMode: optimization.performanceMode,
      enableBackgroundSync: !capabilities.batteryOptimized
    };
  }

  // Helper methods for device detection
  private static isLowEndDevice(): boolean {
    // Check for low-end device indicators
    if ('navigator' in globalThis && 'hardwareConcurrency' in navigator) {
      if (navigator.hardwareConcurrency <= 2) return true;
    }
    
    if ('navigator' in globalThis && 'deviceMemory' in navigator) {
      if ((navigator as any).deviceMemory <= 2) return true;
    }

    // Check user agent for known low-end devices
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndIndicators = [
      'android 4', 'android 5', 'android 6',
      'iphone os 9', 'iphone os 10', 'iphone os 11',
      'chrome/5', 'chrome/6', 'chrome/7'
    ];

    return lowEndIndicators.some(indicator => userAgent.includes(indicator));
  }

  private static getScreenSizeCategory(): 'small' | 'medium' | 'large' {
    const width = window.innerWidth;
    if (width < 480) return 'small';
    if (width < 768) return 'medium';
    return 'large';
  }

  private static getConnectionSpeed(): 'slow' | 'fast' {
    if ('navigator' in globalThis && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        // Slow: 2G, slow-2g, or effective type indicating slow connection
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          return 'slow';
        }
        // Fast: 4G or higher
        if (connection.effectiveType === '4g' || connection.effectiveType === '5g') {
          return 'fast';
        }
      }
    }
    return 'fast'; // Default assumption
  }

  private static isBatteryOptimizationEnabled(): boolean {
    if ('navigator' in globalThis && 'getBattery' in navigator) {
      // This is deprecated but still useful for battery optimization
      return true; // Enable battery optimization if battery API is available
    }
    return false;
  }
}

/**
 * React hook for mobile-optimized story generation
 */
export function useMobileOptimizedStoryGeneration() {
  const [isOptimized, setIsOptimized] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);

  useEffect(() => {
    const capabilities = MobileOptimizationManager.detectDeviceCapabilities();
    setDeviceCapabilities(capabilities);
    setIsOptimized(true);
  }, []);

  const optimizeForMobile = useCallback((config: any) => {
    if (!isOptimized || !deviceCapabilities) return config;

    return {
      templateConfig: MobileOptimizationManager.optimizeTemplateSelection(config.templateConfig),
      antiRepetitionConfig: MobileOptimizationManager.optimizeAntiRepetitionConfig(config.antiRepetitionConfig),
      deviceOptimized: true,
      capabilities: deviceCapabilities
    };
  }, [isOptimized, deviceCapabilities]);

  return {
    isOptimized,
    deviceCapabilities,
    optimizeForMobile
  };
}

/**
 * Performance monitoring for mobile devices
 */
export class MobilePerformanceMonitor {
  private static metrics: any = {
    templateSelectionTimes: [],
    antiRepetitionTimes: [],
    storyGenerationTimes: [],
    memoryUsage: []
  };

  static startTiming(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(operation, duration);
      
      // Warn if operation is too slow for mobile
      const thresholds = {
        templateSelection: 50,
        antiRepetition: 100,
        storyGeneration: 500
      };
      
      const threshold = thresholds[operation as keyof typeof thresholds] || 100;
      if (duration > threshold) {
        console.warn(`⚠️ Slow ${operation}: ${duration.toFixed(1)}ms (threshold: ${threshold}ms)`);
      }
    };
  }

  private static recordMetric(operation: string, duration: number): void {
    const key = `${operation}Times`;
    if (this.metrics[key]) {
      this.metrics[key].push(duration);
      
      // Keep only last 50 measurements
      if (this.metrics[key].length > 50) {
        this.metrics[key].shift();
      }
    }
  }

  static getPerformanceReport(): any {
    const report: any = {};
    
    for (const [key, times] of Object.entries(this.metrics)) {
      if (Array.isArray(times) && times.length > 0) {
        const average = times.reduce((sum: number, time: number) => sum + time, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);
        
        report[key] = {
          average: average.toFixed(1),
          max: max.toFixed(1),
          min: min.toFixed(1),
          samples: times.length
        };
      }
    }
    
    return report;
  }

  static isPerformanceAcceptable(): boolean {
    const report = this.getPerformanceReport();
    
    // Check if average times are within acceptable ranges
    const limits = {
      templateSelectionTimes: 50,
      antiRepetitionTimes: 100,
      storyGenerationTimes: 500
    };
    
    for (const [metric, limit] of Object.entries(limits)) {
      if (report[metric] && parseFloat(report[metric].average) > limit) {
        return false;
      }
    }
    
    return true;
  }
}
