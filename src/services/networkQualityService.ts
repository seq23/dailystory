export class NetworkQualityService {
  private static cache: { isOnline: boolean; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  
  static async checkNetworkState(): Promise<boolean> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.isOnline;
    }
    
    const isOnline = await this.performNetworkCheck();
    this.cache = { isOnline, timestamp: Date.now() };
    
    return isOnline;
  }
  
  private static async performNetworkCheck(): Promise<boolean> {
    let attempt = 0;
    const maxRetries = 3;
    const baseDelay = 1000;
    
    while (attempt < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Try primary health endpoint first
        const response = await fetch(`${window.location.origin}/api/health`, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return true;
        }
        
        // SUPABASE FALLBACK: If health endpoint failed, try backend check
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            const supabaseCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: 'HEAD',
              signal: controller.signal
            });
            if (supabaseCheck.ok) {
              console.info('Health endpoint failed but Supabase reachable');
              return true;
            }
          }
        } catch (supabaseError) {
          // Supabase also unreachable, continue to retry loop
        }
        
        return false;
      } catch (error) {
        attempt++;
        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // GRACEFUL DEGRADATION: Check browser's online status first
    if (!navigator.onLine) {
      console.warn('Browser reports offline - respecting navigator.onLine');
      return false;
    }

    // If browser says online but health checks failed, cautiously assume online
    console.info('Health checks failed but browser reports online - optimistic fallback');
    return true;
  }
  
  static clearCache(): void {
    this.cache = null;
    sessionStorage.removeItem('networkQualityCache');
  }
}