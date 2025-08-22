// PHASE 4 & 5: Cultural Text Tracking System
// Tracks African-American text through the entire pipeline to ensure preservation

export class CulturalTextTracker {
  static trackingData = new Map();
  
  /**
   * PHASE 4: Track African-American text at pipeline entry
   */
  static trackTextEntry(sessionId, pageNumber, text, source = 'unknown') {
    const key = `${sessionId}_${pageNumber}`;
    
    // Detect African-American related terms
    const culturalPatterns = [
      /African[\s-]American/gi,
      /Black\s+(girl|boy|child)/gi,
      /dark\s+skin/gi,
      /brown\s+skin/gi,
      /afro/gi,
      /braids/gi,
      /natural\s+hair/gi
    ];
    
    const foundTerms = [];
    culturalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundTerms.push(...matches);
      }
    });
    
    if (foundTerms.length > 0) {
      this.trackingData.set(key, {
        sessionId,
        pageNumber,
        source,
        foundTerms,
        originalLength: text.length,
        timestamp: new Date(),
        pipeline: [
          { stage: source, termsFound: foundTerms, timestamp: new Date() }
        ]
      });
      
      console.log(`🎯 PHASE 4: Cultural text entry tracked - ${source}:`, {
        sessionId,
        pageNumber,
        termsFound: foundTerms.length,
        terms: foundTerms
      });
    }
    
    return foundTerms;
  }
  
  /**
   * PHASE 4: Track text at pipeline stage
   */
  static trackPipelineStage(sessionId, pageNumber, text, stage) {
    const key = `${sessionId}_${pageNumber}`;
    const existing = this.trackingData.get(key);
    
    if (!existing) {
      // Start tracking if not already started
      return this.trackTextEntry(sessionId, pageNumber, text, stage);
    }
    
    // Check for term preservation
    const culturalPatterns = [
      /African[\s-]American/gi,
      /Black\s+(girl|boy|child)/gi,
      /dark\s+skin/gi,
      /brown\s+skin/gi,
      /afro/gi,
      /braids/gi,
      /natural\s+hair/gi
    ];
    
    const currentTerms = [];
    culturalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        currentTerms.push(...matches);
      }
    });
    
    // Update tracking data
    existing.pipeline.push({
      stage,
      termsFound: currentTerms,
      textLength: text.length,
      timestamp: new Date()
    });
    
    // Check for term loss
    const originalCount = existing.foundTerms.length;
    const currentCount = currentTerms.length;
    
    if (currentCount < originalCount) {
      console.warn(`⚠️ PHASE 4: Cultural term loss detected at ${stage}:`, {
        sessionId,
        pageNumber,
        originalTerms: originalCount,
        currentTerms: currentCount,
        lostTerms: originalCount - currentCount,
        stage
      });
    } else {
      console.log(`✅ PHASE 4: Cultural terms preserved at ${stage}:`, {
        sessionId,
        pageNumber,
        termsFound: currentCount,
        stage
      });
    }
    
    return currentTerms;
  }
  
  /**
   * PHASE 5: Get tracking report for session
   */
  static getTrackingReport(sessionId, pageNumber) {
    const key = `${sessionId}_${pageNumber}`;
    const data = this.trackingData.get(key);
    
    if (!data) {
      return { tracked: false, message: 'No cultural text tracking found' };
    }
    
    const report = {
      tracked: true,
      sessionId: data.sessionId,
      pageNumber: data.pageNumber,
      originalTerms: data.foundTerms,
      pipelineStages: data.pipeline.length,
      finalStage: data.pipeline[data.pipeline.length - 1],
      termPreservation: data.pipeline.map(stage => ({
        stage: stage.stage,
        termsCount: stage.termsFound ? stage.termsFound.length : 0,
        timestamp: stage.timestamp
      }))
    };
    
    console.log(`📊 PHASE 5: Cultural text tracking report:`, report);
    return report;
  }
  
  /**
   * PHASE 5: Clear tracking data for session
   */
  static clearSession(sessionId) {
    let cleared = 0;
    for (const [key] of this.trackingData.entries()) {
      if (key.startsWith(`${sessionId}_`)) {
        this.trackingData.delete(key);
        cleared++;
      }
    }
    
    console.log(`🧹 PHASE 5: Cleared ${cleared} cultural tracking entries for session ${sessionId}`);
    return cleared;
  }
}