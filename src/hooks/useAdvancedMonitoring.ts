import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/services/AdvancedPerformanceMonitor';
import { characterConsistency } from '@/services/UnifiedCharacterConsistency';
import { abTestingFramework } from '@/services/ABTestingFramework';

export interface MonitoringData {
  performanceMetrics: any;
  characterSeeds: any;
  activeTests: any[];
  culturalMetrics: any;
}

export function useAdvancedMonitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Gather all monitoring data
      const performanceMetrics = performanceMonitor.getMonitoringDashboard();
      const characterSeeds = characterConsistency.getActiveCharacterSeeds();
      const activeTests = abTestingFramework.getActiveTests();
      
      // Simulate cultural metrics (would come from CulturalRepresentationMonitor in real implementation)
      const culturalMetrics = {
        totalGenerations: 150,
        biasScore: 0.15,
        culturalBalance: 0.85,
        activeIssues: 2
      };

      setMonitoringData({
        performanceMetrics,
        characterSeeds,
        activeTests,
        culturalMetrics
      });
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    monitoringData,
    isLoading,
    refresh: loadMonitoringData
  };
}