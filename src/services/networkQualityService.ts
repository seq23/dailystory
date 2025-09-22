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
        
        // Use internal health endpoint instead of external gstatic
        const response = await fetch(`${window.location.origin}/api/health`, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        return response.ok;
      } catch (error) {
        attempt++;
        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all retries failed, assume online (optimistic default)
    return true;
  }
  
  static clearCache(): void {
    this.cache = null;
    sessionStorage.removeItem('networkQualityCache');
  }
}