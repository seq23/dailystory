/**
 * ReadingStateManager - Global state manager for tracking active reading sessions
 * Prevents unwanted auto-refresh intervals during story reading
 */
export class ReadingStateManager {
  private static isActivelyReading = false;
  private static listeners = new Set<(isReading: boolean) => void>();
  
  /**
   * Set the current reading state
   * @param isReading - Whether user is actively reading a story
   */
  static setReadingState(isReading: boolean): void {
    if (this.isActivelyReading !== isReading) {
      this.isActivelyReading = isReading;
      this.notifyListeners();
      
      // Log state changes for debugging
      if (isReading) {
        console.log('📖 Reading state: ACTIVE - Pausing non-essential intervals');
      } else {
        console.log('📖 Reading state: INACTIVE - Resuming intervals');
      }
    }
  }
  
  /**
   * Check if user is currently reading
   */
  static isReading(): boolean {
    return this.isActivelyReading;
  }
  
  /**
   * Subscribe to reading state changes
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  static subscribe(callback: (isReading: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.isActivelyReading));
  }
}
