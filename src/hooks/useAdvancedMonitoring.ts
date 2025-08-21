import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Get all monitoring data from backend
      const { data } = await supabase.functions.invoke('get-monitoring-data');
      
      if (data?.success) {
        setMonitoringData(data.data);
      }
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