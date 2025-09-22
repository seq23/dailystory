import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

export interface MonitoringData {
  performanceMetrics: any;
  characterSeeds: any;
  activeTests: any[];
  culturalMetrics: any;
}

export function useAdvancedMonitoring(options?: { autoRefresh?: boolean; refreshInterval?: number }) {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // EMERGENCY: Disabled auto-refresh by default to prevent edge function quota burn
  const { autoRefresh = false, refreshInterval = 300000 } = options || {}; // 5 minutes default

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Get all monitoring data from backend
      const { data } = await supabase.functions.invoke('get-monitoring-data');
      
      if (data?.success) {
        setMonitoringData(data.data);
      }
    } catch (error) {
      DebugLogger.error('performance', 'Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
    
    if (!autoRefresh) return;
    
    // Auto-refresh with configurable interval (default 60s, increased from 30s)
    const interval = setInterval(loadMonitoringData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    monitoringData,
    isLoading,
    refresh: loadMonitoringData
  };
}