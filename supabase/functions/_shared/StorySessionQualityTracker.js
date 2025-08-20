// Story Session Quality Tracker
// Monitors visual consistency and story element matching across pages

class StorySessionQualityTracker {
  static sessionQuality = new Map();
  
  static getOrCreateQualityData(sessionId) {
    if (!this.sessionQuality.has(sessionId)) {
      this.sessionQuality.set(sessionId, {
        sessionId,
        totalPages: 0,
        qualityScores: [],
        consistencyFlags: [],
        visualMatches: {
          characterConsistency: [],
          settingTransitions: [],
          objectPersistence: [],
          moodProgression: []
        },
        aiProcessingStats: {
          highQualityCount: 0,
          mediumQualityCount: 0,
          lowQualityCount: 0,
          averageScore: 0
        },
        sessionStartTime: new Date(),
        lastUpdated: new Date()
      });
    }
    return this.sessionQuality.get(sessionId);
  }
  
  static recordPageQuality(sessionId, pageNumber, qualityScore, validationResult) {
    const qualityData = this.getOrCreateQualityData(sessionId);
    
    // Record quality score
    qualityData.qualityScores.push({
      pageNumber,
      totalScore: qualityScore.totalScore,
      characterConsistency: qualityScore.characterConsistency,
      settingLogic: qualityScore.settingLogic,
      objectRelevance: qualityScore.objectRelevance,
      storyCoherence: qualityScore.storyCoherence,
      timestamp: new Date()
    });
    
    // Update processing stats
    if (qualityScore.totalScore >= 80) {
      qualityData.aiProcessingStats.highQualityCount++;
    } else if (qualityScore.totalScore >= 60) {
      qualityData.aiProcessingStats.mediumQualityCount++;
    } else {
      qualityData.aiProcessingStats.lowQualityCount++;
    }
    
    // Calculate running average
    const totalScores = qualityData.qualityScores.map(s => s.totalScore);
    qualityData.aiProcessingStats.averageScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
    
    qualityData.totalPages = Math.max(qualityData.totalPages, pageNumber);
    qualityData.lastUpdated = new Date();
    
    console.log(`📊 Quality Tracker: Page ${pageNumber} scored ${qualityScore.totalScore}/100 (Session avg: ${qualityData.aiProcessingStats.averageScore.toFixed(1)})`);
  }
  
  static flagConsistencyIssue(sessionId, pageNumber, issueType, description) {
    const qualityData = this.getOrCreateQualityData(sessionId);
    
    qualityData.consistencyFlags.push({
      pageNumber,
      issueType,
      description,
      severity: this.calculateSeverity(issueType),
      timestamp: new Date()
    });
    
    console.warn(`⚠️ Consistency Issue: Page ${pageNumber} - ${issueType}: ${description}`);
  }
  
  static calculateSeverity(issueType) {
    const severityMap = {
      'character-name-change': 'high',
      'character-appearance-change': 'high',
      'setting-contradiction': 'medium',
      'object-disappearance': 'low',
      'mood-inconsistency': 'low'
    };
    return severityMap[issueType] || 'medium';
  }
  
  static recordVisualMatch(sessionId, pageNumber, matchType, details) {
    const qualityData = this.getOrCreateQualityData(sessionId);
    
    if (!qualityData.visualMatches[matchType]) {
      qualityData.visualMatches[matchType] = [];
    }
    
    qualityData.visualMatches[matchType].push({
      pageNumber,
      details,
      timestamp: new Date()
    });
    
    console.log(`✅ Visual Match: Page ${pageNumber} - ${matchType}: ${details}`);
  }
  
  static getSessionReport(sessionId) {
    const qualityData = this.sessionQuality.get(sessionId);
    if (!qualityData) return null;
    
    const report = {
      sessionId,
      summary: {
        totalPages: qualityData.totalPages,
        averageScore: qualityData.aiProcessingStats.averageScore,
        highQualityPages: qualityData.aiProcessingStats.highQualityCount,
        mediumQualityPages: qualityData.aiProcessingStats.mediumQualityCount,
        lowQualityPages: qualityData.aiProcessingStats.lowQualityCount
      },
      qualityTrend: this.calculateQualityTrend(qualityData.qualityScores),
      consistencyIssues: qualityData.consistencyFlags.length,
      visualMatches: {
        characterConsistency: qualityData.visualMatches.characterConsistency?.length || 0,
        settingTransitions: qualityData.visualMatches.settingTransitions?.length || 0,
        objectPersistence: qualityData.visualMatches.objectPersistence?.length || 0,
        moodProgression: qualityData.visualMatches.moodProgression?.length || 0
      },
      sessionDuration: new Date() - qualityData.sessionStartTime
    };
    
    return report;
  }
  
  static calculateQualityTrend(qualityScores) {
    if (qualityScores.length < 3) return 'insufficient-data';
    
    const recent = qualityScores.slice(-3).map(s => s.totalScore);
    const early = qualityScores.slice(0, 3).map(s => s.totalScore);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
    
    if (recentAvg > earlyAvg + 10) return 'improving';
    if (recentAvg < earlyAvg - 10) return 'declining';
    return 'stable';
  }
  
  static flagQualityDrop(sessionId, currentScore, threshold = 20) {
    const qualityData = this.sessionQuality.get(sessionId);
    if (!qualityData || qualityData.qualityScores.length === 0) return;
    
    const recentScores = qualityData.qualityScores.slice(-3).map(s => s.totalScore);
    const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    if (averageRecent - currentScore > threshold) {
      this.flagConsistencyIssue(
        sessionId, 
        qualityData.totalPages + 1, 
        'quality-drop', 
        `Score dropped from ${averageRecent.toFixed(1)} to ${currentScore} (${threshold}+ point drop)`
      );
    }
  }
  
  static clearSession(sessionId) {
    this.sessionQuality.delete(sessionId);
    console.log(`🗑️ Cleared quality tracking for session: ${sessionId}`);
  }
  
  static getActiveSessionsCount() {
    return this.sessionQuality.size;
  }
  
  static getGenerationStats() {
    const allData = Array.from(this.sessionQuality.values());
    const totalScores = allData.flatMap(data => data.qualityScores.map(s => s.totalScore));
    
    return {
      activeSessions: allData.length,
      totalPagesGenerated: allData.reduce((sum, data) => sum + data.totalPages, 0),
      overallAverageScore: totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0,
      highQualityPercentage: allData.reduce((sum, data) => sum + data.aiProcessingStats.highQualityCount, 0) / Math.max(totalScores.length, 1) * 100
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorySessionQualityTracker };
}

// Make available globally
globalThis.StorySessionQualityTracker = StorySessionQualityTracker;

export { StorySessionQualityTracker };