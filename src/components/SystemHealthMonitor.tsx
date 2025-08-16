import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useApiCache } from '@/hooks/useApiCache';

interface SystemHealth {
  performance: 'good' | 'warning' | 'critical';
  memory: 'good' | 'warning' | 'critical';
  cache: 'good' | 'warning' | 'critical';
  errors: string[];
  recommendations: string[];
}

export function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealth>({
    performance: 'good',
    memory: 'good', 
    cache: 'good',
    errors: [],
    recommendations: []
  });
  const { measureLoadTime, getMemoryUsage } = usePerformanceMonitor();
  const { clear: clearCache } = useApiCache();

  useEffect(() => {
    const checkSystemHealth = () => {
      const recommendations: string[] = [];
      const errors: string[] = [];
      
      // Check performance
      const loadTime = measureLoadTime();
      let performanceStatus: 'good' | 'warning' | 'critical' = 'good';
      
      if (loadTime > 3000) {
        performanceStatus = 'critical';
        errors.push('Slow page load detected');
        recommendations.push('Consider enabling browser caching');
      } else if (loadTime > 1500) {
        performanceStatus = 'warning';
        recommendations.push('Page load could be faster');
      }
      
      // Check memory
      const memory = getMemoryUsage();
      let memoryStatus: 'good' | 'warning' | 'critical' = 'good';
      
      if (memory) {
        const usagePercent = (memory.used / memory.limit) * 100;
        if (usagePercent > 80) {
          memoryStatus = 'critical';
          errors.push('High memory usage detected');
          recommendations.push('Clear cache and reload page');
        } else if (usagePercent > 60) {
          memoryStatus = 'warning';
          recommendations.push('Monitor memory usage');
        }
      }
      
      setHealth({
        performance: performanceStatus,
        memory: memoryStatus,
        cache: 'good', // Simplified for now
        errors,
        recommendations
      });
    };

    checkSystemHealth();
    // Disabled auto-refresh to prevent unwanted page refreshes
    // const interval = setInterval(checkSystemHealth, 30000);
    
    // return () => clearInterval(interval);
  }, [measureLoadTime, getMemoryUsage]);

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600'; 
      case 'critical': return 'text-red-600';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  if (health.errors.length === 0 && health.recommendations.length === 0) {
    return null; // Only show when there are issues
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">System Health</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(health.performance)}
          <span className={`text-sm ${getStatusColor(health.performance)}`}>
            Performance
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(health.memory)}
          <span className={`text-sm ${getStatusColor(health.memory)}`}>
            Memory
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(health.cache)}
          <span className={`text-sm ${getStatusColor(health.cache)}`}>
            Cache
          </span>
        </div>
      </div>
      
      {health.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {health.errors.map((error, i) => (
                <div key={i} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {health.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recommendations:</h4>
          {health.recommendations.map((rec, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {rec}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}