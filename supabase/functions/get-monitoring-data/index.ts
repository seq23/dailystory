import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Import backend monitoring services
const { characterConsistency } = await import('../_shared/UnifiedCharacterConsistency.js');

serve(async (req) => {
  console.log(`🔍 Monitoring Data Request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    // Gather all monitoring data from backend services
    const characterSeeds = characterConsistency.getActiveCharacterSeeds();
    
    // Simulate performance metrics (in real implementation, this would come from actual monitoring)
    const performanceMetrics = {
      cacheStats: {
        hitRate: 0.85,
        totalRequests: 1500,
        cacheHits: 1275,
        cacheMisses: 225
      },
      biasAnalysis: {
        averageScore: 87.5,
        commonIssues: [
          'Cultural diversity could be improved in story generation',
          'Character consistency needs attention in longer stories'
        ]
      },
      generationStats: {
        totalGenerations: 1247,
        averageLatency: 850,
        successRate: 0.96
      }
    };
    
    // Simulate A/B testing data
    const activeTests = [
      {
        id: 'character-consistency-v2',
        name: 'Enhanced Character Consistency',
        status: 'running',
        participants: 150,
        conversionRate: 0.73
      },
      {
        id: 'cultural-representation-fix',
        name: 'Improved Cultural Logic',
        status: 'running', 
        participants: 200,
        conversionRate: 0.81
      }
    ];
    
    // Simulate cultural metrics
    const culturalMetrics = {
      totalGenerations: 1247,
      culturalDistribution: {
        'african-american': 23,
        'hispanic-latino': 19,
        'asian': 18,
        'european-american': 17,
        'multicultural': 15,
        'other': 8
      },
      biasScore: 87.5,
      culturalBalance: 0.85,
      activeIssues: performanceMetrics.biasAnalysis.commonIssues.length,
      topIssues: performanceMetrics.biasAnalysis.commonIssues
    };

    console.log(`📊 Retrieved monitoring data - Character seeds: ${characterSeeds.total}, Performance: ${performanceMetrics.generationStats.successRate}`);

    return createCorsResponse({
      success: true,
      data: {
        performanceMetrics,
        characterSeeds,
        activeTests,
        culturalMetrics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get monitoring data:', error);
    
    return createCorsErrorResponse(
      `Failed to retrieve monitoring data: ${error.message}`,
      500
    );
  }
});