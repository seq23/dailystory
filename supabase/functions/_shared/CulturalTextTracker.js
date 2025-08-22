// NEW MASTER PLAN: Direct Visual Content Tracking System  
// Tracks avatar visual descriptions through the pipeline to ensure preservation

export class CulturalTextTracker {
  static trackingData = new Map();
  
  /**
   * NEW MASTER PLAN: Track avatar visual content at pipeline entry
   */
  static trackTextEntry(sessionId, pageNumber, text, source = 'unknown') {
    const key = `${sessionId}_${pageNumber}`;
    
    // Detect avatar visual description terms
    const visualPatterns = [
      /fair skin white (boy|girl) with red hair/gi,
      /white (boy|girl) with blonde hair/gi,
      /medium skin white (boy|girl) with brown hair/gi,
      /olive skin white (boy|girl) with black hair/gi,
      /black (boy|girl)/gi,
      /cultural pride/gi,
      /heritage/gi
    ];
    
    const matches = visualPatterns.map(pattern => {
      const found = text.match(pattern) || [];
      return found.length;
    }).reduce((a, b) => a + b, 0);
    
    if (!this.trackingData.has(key)) {
      this.trackingData.set(key, {
        sessionId,
        pageNumber,
        sources: {},
        visualContentCount: 0,
        detectedTerms: []
      });
    }
    
    const data = this.trackingData.get(key);
    data.sources[source] = {
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      visualMatches: matches,
      timestamp: new Date()
    };
    data.visualContentCount += matches;
    
    if (matches > 0) {
      console.log(`🎯 CulturalTextTracker: Found ${matches} avatar visual terms in ${source} for ${key}`);
      
      // Extract specific terms that matched
      visualPatterns.forEach(pattern => {
        const found = text.match(pattern) || [];
        data.detectedTerms.push(...found);
      });
    }
    
    return data.detectedTerms;
  }
  
  /**
   * NEW MASTER PLAN: Track text at pipeline stage
   */
  static trackPipelineStage(sessionId, pageNumber, text, stage) {
    const key = `${sessionId}_${pageNumber}`;
    const existing = this.trackingData.get(key);
    
    if (!existing) {
      // Start tracking if not already started
      return this.trackTextEntry(sessionId, pageNumber, text, stage);
    }
    
    // Check for term preservation using new patterns
    const visualPatterns = [
      /fair skin white (boy|girl) with red hair/gi,
      /white (boy|girl) with blonde hair/gi,
      /medium skin white (boy|girl) with brown hair/gi,
      /olive skin white (boy|girl) with black hair/gi,
      /black (boy|girl)/gi,
      /cultural pride/gi,
      /heritage/gi
    ];
    
    const currentTerms = [];
    visualPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        currentTerms.push(...matches);
      }
    });
    
    // Update tracking data
    if (!existing.pipeline) {
      existing.pipeline = [];
    }
    
    existing.pipeline.push({
      stage,
      termsFound: currentTerms,
      textLength: text.length,
      timestamp: new Date()
    });
    
    // Check for term preservation
    const originalCount = existing.detectedTerms.length;
    const currentCount = currentTerms.length;
    
    if (currentCount < originalCount) {
      console.warn(`⚠️ NEW MASTER PLAN: Visual term loss detected at ${stage}:`, {
        sessionId,
        pageNumber,
        originalTerms: originalCount,
        currentTerms: currentCount,
        lostTerms: originalCount - currentCount,
        stage
      });
    } else {
      console.log(`✅ NEW MASTER PLAN: Visual terms preserved at ${stage}:`, {
        sessionId,
        pageNumber,
        termsFound: currentCount,
        stage
      });
    }
    
    return currentTerms;
  }
  
  /**
   * NEW MASTER PLAN: Get tracking report for session
   */
  static getTrackingReport(sessionId, pageNumber) {
    const key = `${sessionId}_${pageNumber}`;
    const data = this.trackingData.get(key);
    
    if (!data) {
      return { tracked: false, message: 'No visual content tracking found' };
    }
    
    const report = {
      tracked: true,
      sessionId: data.sessionId,
      pageNumber: data.pageNumber,
      originalTerms: data.detectedTerms,
      pipelineStages: data.pipeline?.length || 0,
      finalStage: data.pipeline?.[data.pipeline.length - 1],
      termPreservation: (data.pipeline || []).map(stage => ({
        stage: stage.stage,
        termsCount: stage.termsFound ? stage.termsFound.length : 0,
        timestamp: stage.timestamp
      }))
    };
    
    console.log(`📊 NEW MASTER PLAN: Visual content tracking report:`, report);
    return report;
  }
  
  /**
   * NEW MASTER PLAN: Clear tracking data for session
   */
  static clearSession(sessionId) {
    let cleared = 0;
    for (const [key] of this.trackingData.entries()) {
      if (key.startsWith(`${sessionId}_`)) {
        this.trackingData.delete(key);
        cleared++;
      }
    }
    
    console.log(`🧹 NEW MASTER PLAN: Cleared ${cleared} visual tracking entries for session ${sessionId}`);
    return cleared;
  }
}