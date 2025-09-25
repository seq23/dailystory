/**
 * Content Generation Detector
 * Tracks when story/image/TTS operations are running to pause health checks for performance
 */

import { DebugLogger } from '@/services/DebugLogger';

class ContentGenerationDetectorService {
  private static instance: ContentGenerationDetectorService;
  private activeOperations = new Set<string>();
  private listeners: ((isGenerating: boolean) => void)[] = [];

  private constructor() {}

  static getInstance(): ContentGenerationDetectorService {
    if (!ContentGenerationDetectorService.instance) {
      ContentGenerationDetectorService.instance = new ContentGenerationDetectorService();
    }
    return ContentGenerationDetectorService.instance;
  }

  /**
   * Mark an operation as started
   */
  startOperation(operationType: 'story' | 'image' | 'tts', operationId: string): void {
    const fullId = `${operationType}-${operationId}`;
    const wasGenerating = this.isGenerating();
    
    this.activeOperations.add(fullId);
    
    if (!wasGenerating && this.isGenerating()) {
      DebugLogger.log('performance', `Content generation started: ${operationType}`, { operationId });
      this.notifyListeners(true);
    }
  }

  /**
   * Mark an operation as completed
   */
  endOperation(operationType: 'story' | 'image' | 'tts', operationId: string): void {
    const fullId = `${operationType}-${operationId}`;
    const wasGenerating = this.isGenerating();
    
    this.activeOperations.delete(fullId);
    
    if (wasGenerating && !this.isGenerating()) {
      DebugLogger.log('performance', `Content generation ended: ${operationType}`, { operationId });
      this.notifyListeners(false);
    }
  }

  /**
   * Check if any content generation is currently active
   */
  isGenerating(): boolean {
    return this.activeOperations.size > 0;
  }

  /**
   * Get active operations for debugging
   */
  getActiveOperations(): string[] {
    return Array.from(this.activeOperations);
  }

  /**
   * Subscribe to generation state changes
   */
  onGenerationChange(listener: (isGenerating: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(isGenerating: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isGenerating);
      } catch (error) {
        DebugLogger.error('performance', 'Content generation listener error', error);
      }
    });
  }

  /**
   * Clear all operations (useful for cleanup)
   */
  clearAll(): void {
    const wasGenerating = this.isGenerating();
    this.activeOperations.clear();
    
    if (wasGenerating) {
      DebugLogger.log('performance', 'All content generation operations cleared');
      this.notifyListeners(false);
    }
  }
}

// Export singleton instance
export const ContentGenerationDetector = ContentGenerationDetectorService.getInstance();

// Helper functions for easy tracking
export const trackContentGeneration = {
  story: {
    start: (id: string) => ContentGenerationDetector.startOperation('story', id),
    end: (id: string) => ContentGenerationDetector.endOperation('story', id)
  },
  image: {
    start: (id: string) => ContentGenerationDetector.startOperation('image', id),
    end: (id: string) => ContentGenerationDetector.endOperation('image', id)
  },
  tts: {
    start: (id: string) => ContentGenerationDetector.startOperation('tts', id),
    end: (id: string) => ContentGenerationDetector.endOperation('tts', id)
  }
};