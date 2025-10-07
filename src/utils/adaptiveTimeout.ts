/**
 * Adaptive Timeout Utility - Adjusts timeouts based on network quality
 * Uses Network Information API to detect connection speed
 */

import { DebugLogger } from '@/services/DebugLogger';

export class AdaptiveTimeout {
  /**
   * Get appropriate timeout based on current network conditions
   * @returns timeout in milliseconds
   */
  static getTTSTimeout(): number {
    // Check if Network Information API is available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      DebugLogger.log('network', 'Network Information API not available, using default 15s timeout');
      return 15000; // Default to 15s if API not available
    }

    const effectiveType = connection.effectiveType;
    
    DebugLogger.log('network', `Network type detected: ${effectiveType}`);
    
    // Adaptive timeouts based on connection quality
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        DebugLogger.log('network', 'Slow connection detected, using 30s timeout');
        return 30000; // 30s for very slow connections
      
      case '3g':
        DebugLogger.log('network', 'Medium connection detected, using 25s timeout');
        return 25000; // 25s for medium connections
      
      case '4g':
      case '5g':
      default:
        DebugLogger.log('network', 'Good connection detected, using 15s timeout');
        return 15000; // 15s for good connections (default)
    }
  }

  /**
   * Get timeout with manual override option
   * @param overrideMs - Optional manual timeout override
   * @returns timeout in milliseconds
   */
  static getTTSTimeoutWithOverride(overrideMs?: number): number {
    if (overrideMs !== undefined) {
      DebugLogger.log('network', `Using manual timeout override: ${overrideMs}ms`);
      return overrideMs;
    }
    return this.getTTSTimeout();
  }
}
