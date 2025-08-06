import MobileSessionManager from './mobileSessionManager';

interface SessionPageData {
  totalPagesViewed: number;
  maxPageReached: number;
  sessionStartTime: number;
  lastPageTime: number;
}

export class SessionPageTracker {
  private static readonly STORAGE_KEY = 'session_page_tracker';
  private static readonly FREE_TRIAL_PAGE_LIMIT = 90;
  
  /**
   * Initialize or get current session page data
   */
  private static getSessionData(): SessionPageData {
    const stored = MobileSessionManager.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse session page data:', error);
      }
    }
    
    // Initialize new session
    const newSession: SessionPageData = {
      totalPagesViewed: 0,
      maxPageReached: 0,
      sessionStartTime: Date.now(),
      lastPageTime: Date.now()
    };
    
    this.saveSessionData(newSession);
    return newSession;
  }
  
  /**
   * Save session data
   */
  private static saveSessionData(data: SessionPageData): void {
    MobileSessionManager.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  
  /**
   * Track navigation to a page (only counts forward movement)
   */
  static trackPageNavigation(newPageIndex: number): void {
    const sessionData = this.getSessionData();
    
    // Only count if we're moving to a new highest page (1-based page numbering)
    const pageNumber = newPageIndex + 1; // Convert from 0-based index to 1-based page number
    if (pageNumber > sessionData.maxPageReached) {
      const newPagesViewed = pageNumber - sessionData.maxPageReached;
      sessionData.totalPagesViewed += newPagesViewed;
      sessionData.maxPageReached = pageNumber;
      sessionData.lastPageTime = Date.now();
      
      this.saveSessionData(sessionData);
      
      console.log(`📊 Page Tracker: Navigated to page ${pageNumber}, viewed ${newPagesViewed} new pages. Total: ${sessionData.totalPagesViewed}/${this.FREE_TRIAL_PAGE_LIMIT}`);
    } else {
      console.log(`📊 Page Tracker: Navigated to page ${pageNumber} (already viewed), no count change. Total: ${sessionData.totalPagesViewed}/${this.FREE_TRIAL_PAGE_LIMIT}`);
    }
  }
  
  /**
   * Track when new pages are added to story (REMOVED - prevents double counting)
   */
  static trackPagesAdded(pagesAdded: number): void {
    // No longer tracking pages added to prevent double counting
    // Only trackPageNavigation should increment the counter
    console.log(`📊 Page Tracker: ${pagesAdded} pages added to story (not counted - only navigation counts)`);
  }
  
  /**
   * Check if user has reached the free trial limit
   */
  static hasReachedLimit(): boolean {
    const sessionData = this.getSessionData();
    return sessionData.totalPagesViewed >= this.FREE_TRIAL_PAGE_LIMIT;
  }
  
  /**
   * Get current page count and limit info
   */
  static getPageInfo(): {
    pagesViewed: number;
    maxPages: number;
    remainingPages: number;
    isNearLimit: boolean;
    hasReachedLimit: boolean;
  } {
    const sessionData = this.getSessionData();
    const remainingPages = Math.max(0, this.FREE_TRIAL_PAGE_LIMIT - sessionData.totalPagesViewed);
    
    return {
      pagesViewed: sessionData.totalPagesViewed,
      maxPages: this.FREE_TRIAL_PAGE_LIMIT,
      remainingPages,
      isNearLimit: sessionData.totalPagesViewed >= 75, // Warning at 75 pages
      hasReachedLimit: sessionData.totalPagesViewed >= this.FREE_TRIAL_PAGE_LIMIT
    };
  }
  
  /**
   * Reset session (start new session)
   */
  static resetSession(): void {
    MobileSessionManager.removeItem(this.STORAGE_KEY);
    console.log('📊 Page Tracker: Session reset');
  }
  
  /**
   * Get session duration
   */
  static getSessionDuration(): number {
    const sessionData = this.getSessionData();
    return Date.now() - sessionData.sessionStartTime;
  }
  
  /**
   * Get session summary for analytics
   */
  static getSessionSummary(): {
    totalPages: number;
    sessionDuration: number;
    averageTimePerPage: number;
    maxPageReached: number;
  } {
    const sessionData = this.getSessionData();
    const duration = this.getSessionDuration();
    
    return {
      totalPages: sessionData.totalPagesViewed,
      sessionDuration: duration,
      averageTimePerPage: sessionData.totalPagesViewed > 0 ? duration / sessionData.totalPagesViewed : 0,
      maxPageReached: sessionData.maxPageReached
    };
  }
}