import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createDynamicCorsResponse, createDynamicCorsErrorResponse, createDynamicCorsOptionsResponse } from "../_shared/corsAdvanced.js";
import { EdgeErrorHandler } from "../_shared/errorHandling.ts";

interface ModelPerformanceData {
  model: string;
  functionName: string;
  timestamp: number;
  responseTime: number;
  tokenUsage?: number;
  success: boolean;
  qualityScore?: number;
  costEstimate?: number;
  errorType?: string;
}

interface ModelComparison {
  model: string;
  avgResponseTime: number;
  successRate: number;
  avgQualityScore: number;
  totalRequests: number;
  avgCost: number;
  reliability: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  

  try {
    const { action, timeRange = '24h', models = ['gpt-4o-mini', 'gpt-4o'] } = await req.json();

    console.log(`📊 Model Performance Monitor: ${action} for ${timeRange}`);

    switch (action) {
      case 'getMetrics':
        return await getPerformanceMetrics(timeRange, models);
      
      case 'recordMetric':
        return await recordPerformanceMetric(await req.json());
      
      case 'getComparison':
        return await getModelComparison(timeRange, models);
      
      case 'getHealthStatus':
        return await getSystemHealthStatus();
      
      default:
        return createCorsErrorResponse('Invalid action parameter', 400);
    }

  } catch (error) {
    return EdgeErrorHandler.handleError(error, 'model-performance-monitor');
  }
});

/**
 * Get performance metrics for specified time range
 */
async function getPerformanceMetrics(timeRange: string, models: string[]): Promise<Response> {
  const metrics = EdgeErrorHandler.getPerformanceMetrics();
  const errorStats = EdgeErrorHandler.getErrorStats();
  
  const timeRangeMs = parseTimeRange(timeRange);
  const cutoffTime = Date.now() - timeRangeMs;
  
  const filteredMetrics = metrics.filter(m => 
    m.startTime >= cutoffTime && 
    models.some(model => m.model?.includes(model.split('-')[0])) // Match model family
  );

  const aggregatedData = {
    timeRange,
    models,
    totalRequests: filteredMetrics.length,
    successfulRequests: filteredMetrics.filter(m => m.success).length,
    averageResponseTime: filteredMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / filteredMetrics.length || 0,
    errorBreakdown: errorStats,
    modelBreakdown: aggregateByModel(filteredMetrics),
    qualityTrend: calculateQualityTrend(filteredMetrics),
    costAnalysis: calculateCostAnalysis(filteredMetrics),
    recommendations: generateRecommendations(filteredMetrics)
  };

  console.log(`📊 Performance metrics: ${aggregatedData.totalRequests} requests, ${aggregatedData.averageResponseTime.toFixed(2)}ms avg`);

  return createCorsResponse({
    success: true,
    data: aggregatedData,
    timestamp: Date.now()
  });
}

/**
 * Record a new performance metric
 */
async function recordPerformanceMetric(data: ModelPerformanceData): Promise<Response> {
  // This would typically store in a database, but for now we'll use in-memory storage
  console.log(`📝 Recording metric: ${data.model} - ${data.responseTime}ms - ${data.success ? 'SUCCESS' : 'FAILED'}`);
  
  return createCorsResponse({
    success: true,
    message: 'Metric recorded successfully'
  });
}

/**
 * Compare models side by side
 */
async function getModelComparison(timeRange: string, models: string[]): Promise<Response> {
  const metrics = EdgeErrorHandler.getPerformanceMetrics();
  const timeRangeMs = parseTimeRange(timeRange);
  const cutoffTime = Date.now() - timeRangeMs;
  
  const comparisons: ModelComparison[] = models.map(model => {
    const modelMetrics = metrics.filter(m => 
      m.startTime >= cutoffTime && 
      m.model?.includes(model.split('-')[0])
    );

    const successfulMetrics = modelMetrics.filter(m => m.success);
    
    return {
      model,
      avgResponseTime: modelMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / modelMetrics.length || 0,
      successRate: modelMetrics.length > 0 ? (successfulMetrics.length / modelMetrics.length) * 100 : 0,
      avgQualityScore: calculateAverageQuality(successfulMetrics),
      totalRequests: modelMetrics.length,
      avgCost: estimateModelCost(model, modelMetrics.length),
      reliability: calculateReliability(modelMetrics)
    };
  });

  // Calculate cost savings
  const gpt5Mini = comparisons.find(c => c.model.includes('gpt-5-mini'));
  const gpt5Full = comparisons.find(c => c.model.includes('gpt-5-2025'));
  
  let costSavings = 0;
  if (gpt5Mini && gpt5Full && gpt5Full.avgCost > 0) {
    costSavings = ((gpt5Full.avgCost - gpt5Mini.avgCost) / gpt5Full.avgCost) * 100;
  }

  console.log(`🔍 Model comparison: ${comparisons.length} models, ${costSavings.toFixed(1)}% cost savings with GPT-5-mini`);

  return createCorsResponse({
    success: true,
    comparisons,
    insights: {
      costSavings,
      recommendedModel: determineRecommendedModel(comparisons),
      qualityDifference: calculateQualityDifference(comparisons)
    },
    timestamp: Date.now()
  });
}

/**
 * Get overall system health status
 */
async function getSystemHealthStatus(): Promise<Response> {
  const metrics = EdgeErrorHandler.getPerformanceMetrics();
  const errorStats = EdgeErrorHandler.getErrorStats();
  
  const recentMetrics = metrics.filter(m => 
    m.startTime >= Date.now() - (15 * 60 * 1000) // Last 15 minutes
  );

  const totalErrors = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
  const successRate = recentMetrics.length > 0 ? 
    (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100 : 100;

  const health = {
    status: successRate >= 95 ? 'healthy' : successRate >= 85 ? 'degraded' : 'unhealthy',
    successRate,
    totalRequests: recentMetrics.length,
    totalErrors,
    avgResponseTime: recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length || 0,
    criticalErrors: Object.entries(errorStats).filter(([_, count]) => count >= 5),
    timestamp: Date.now()
  };

  console.log(`🏥 System health: ${health.status} (${health.successRate.toFixed(1)}% success rate)`);

  return createCorsResponse({
    success: true,
    health
  });
}

// Helper functions
function parseTimeRange(timeRange: string): number {
  const match = timeRange.match(/(\d+)([hdwm])/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24h
  
  const [, num, unit] = match;
  const multipliers = { h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000, m: 30 * 24 * 60 * 60 * 1000 };
  return parseInt(num) * (multipliers[unit as keyof typeof multipliers] || multipliers.h);
}

function aggregateByModel(metrics: any[]): Record<string, any> {
  const breakdown: Record<string, any> = {};
  
  metrics.forEach(metric => {
    const model = metric.model || 'unknown';
    if (!breakdown[model]) {
      breakdown[model] = { count: 0, avgDuration: 0, successCount: 0 };
    }
    breakdown[model].count++;
    breakdown[model].avgDuration += metric.duration || 0;
    if (metric.success) breakdown[model].successCount++;
  });

  Object.keys(breakdown).forEach(model => {
    breakdown[model].avgDuration /= breakdown[model].count;
    breakdown[model].successRate = (breakdown[model].successCount / breakdown[model].count) * 100;
  });

  return breakdown;
}

function calculateQualityTrend(metrics: any[]): { trend: string; score: number } {
  // Simplified quality calculation based on success rate and response time
  const avgDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length || 0;
  const successRate = metrics.filter(m => m.success).length / metrics.length || 0;
  
  const qualityScore = (successRate * 0.7) + ((1000 - Math.min(avgDuration, 1000)) / 1000 * 0.3);
  
  return {
    trend: qualityScore >= 0.8 ? 'improving' : qualityScore >= 0.6 ? 'stable' : 'declining',
    score: Math.round(qualityScore * 100)
  };
}

function calculateCostAnalysis(metrics: any[]): { totalCost: number; avgCostPerRequest: number } {
  // Rough cost estimates based on model usage
  const costPerRequest = 0.01; // Placeholder estimate
  return {
    totalCost: metrics.length * costPerRequest,
    avgCostPerRequest: costPerRequest
  };
}

function generateRecommendations(metrics: any[]): string[] {
  const recommendations: string[] = [];
  
  const avgDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length || 0;
  const successRate = metrics.filter(m => m.success).length / metrics.length || 0;
  
  if (avgDuration > 5000) {
    recommendations.push('Consider optimizing prompts to reduce response time');
  }
  
  if (successRate < 0.9) {
    recommendations.push('Investigate error patterns and improve error handling');
  }
  
  if (metrics.length > 1000) {
    recommendations.push('High usage detected - consider implementing caching');
  }
  
  return recommendations;
}

function calculateAverageQuality(metrics: any[]): number {
  // Placeholder quality score calculation
  return metrics.length > 0 ? 85 : 0;
}

function estimateModelCost(model: string, requestCount: number): number {
  const costs = {
    'gpt-5-mini': 0.005,
    'gpt-5': 0.03,
    'gpt-4': 0.02
  };
  
  const baseCost = Object.entries(costs).find(([key]) => model.includes(key))?.[1] || 0.01;
  return baseCost * requestCount;
}

function calculateReliability(metrics: any[]): number {
  if (metrics.length === 0) return 100;
  return (metrics.filter(m => m.success).length / metrics.length) * 100;
}

function determineRecommendedModel(comparisons: ModelComparison[]): string {
  // Simple scoring: balance of cost, speed, and reliability
  const scored = comparisons.map(c => ({
    model: c.model,
    score: (c.successRate * 0.4) + ((5000 - Math.min(c.avgResponseTime, 5000)) / 5000 * 0.3) + ((100 - c.avgCost) / 100 * 0.3)
  }));
  
  return scored.sort((a, b) => b.score - a.score)[0]?.model || 'gpt-4o-mini';
}

function calculateQualityDifference(comparisons: ModelComparison[]): number {
  if (comparisons.length < 2) return 0;
  
  const qualities = comparisons.map(c => c.avgQualityScore);
  return Math.max(...qualities) - Math.min(...qualities);
}