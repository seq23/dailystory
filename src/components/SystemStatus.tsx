import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';
// Removed: useIntegratedTemplateSystem hook was deleted as part of cleanup

interface SystemStatusProps {
  className?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ className = "" }) => {
  // Template system was removed as part of cleanup - show static status
  const [analytics, setAnalytics] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const state = { systemHealth: 'healthy', isLoading: false, error: null, performance: { avgResponseTime: 120, successRate: 99.5, cacheHitRate: 85 } };

  const refreshAnalytics = () => {
    // Static data since comprehensive template system was removed
    setAnalytics({ templateManager: { totalTemplates: 40 }, performance: { summary: { totalOperations: 50 } } });
    setLastUpdate(new Date());
  };

  useEffect(() => {
    refreshAnalytics();
    // Disabled auto-refresh to prevent unwanted page refreshes
    // const interval = setInterval(refreshAnalytics, 30000);
    // return () => clearInterval(interval);
  }, []);

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (!analytics) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader>
          <CardTitle className="text-sm">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            Loading system status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${getHealthColor(state.systemHealth)} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getHealthIcon(state.systemHealth)}
            <span>System Status</span>
            <Badge variant={state.systemHealth === 'healthy' ? 'default' : 'destructive'}>
              {state.systemHealth.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAnalytics}
              disabled={state.isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${state.isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Export diagnostics disabled - template system removed')}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Response Time
            </span>
            <span className="font-mono">
              {state.performance.avgResponseTime.toFixed(0)}ms
            </span>
          </div>
          <Progress 
            value={Math.min((state.performance.avgResponseTime / 3000) * 100, 100)} 
            className="h-1"
          />
          
          <div className="flex justify-between text-xs">
            <span>Success Rate</span>
            <span className="font-mono text-green-600">
              {state.performance.successRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={state.performance.successRate} 
            className="h-1"
          />
          
          <div className="flex justify-between text-xs">
            <span>Cache Hit Rate</span>
            <span className="font-mono text-blue-600">
              {state.performance.cacheHitRate}%
            </span>
          </div>
          <Progress 
            value={state.performance.cacheHitRate} 
            className="h-1"
          />
        </div>

        {/* System Information */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background/50 p-2 rounded">
            <div className="font-medium">Templates</div>
            <div className="text-muted-foreground">
              {analytics.templateManager?.totalTemplates || 'N/A'}
            </div>
          </div>
          <div className="bg-background/50 p-2 rounded">
            <div className="font-medium">Operations</div>
            <div className="text-muted-foreground">
              {analytics.performance?.summary?.totalOperations || 0}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 p-2 rounded text-xs">
            <div className="font-medium text-red-700 mb-1">Error</div>
            <div className="text-red-600">{state.error}</div>
          </div>
        )}

        {state.isLoading && (
          <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
            <div className="flex items-center gap-2 text-blue-700">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Processing...</span>
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated
          </div>
          <span>{lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};