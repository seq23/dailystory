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
  Clock,
  X,
  Minimize2
} from 'lucide-react';

interface DismissibleSystemStatusProps {
  className?: string;
}

export const DismissibleSystemStatus: React.FC<DismissibleSystemStatusProps> = ({ className = "" }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Check localStorage for dismissal preference
  useEffect(() => {
    const dismissed = localStorage.getItem('system-status-dismissed');
    const minimized = localStorage.getItem('system-status-minimized');
    
    if (dismissed === 'true') {
      setIsVisible(false);
    }
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  const state = { 
    systemHealth: 'healthy', 
    isLoading: false, 
    error: null, 
    performance: { 
      avgResponseTime: 120, 
      successRate: 99.5, 
      cacheHitRate: 85 
    } 
  };

  const refreshAnalytics = () => {
    setAnalytics({ 
      templateManager: { totalTemplates: 40 }, 
      performance: { summary: { totalOperations: 50 } } 
    });
    setLastUpdate(new Date());
  };

  useEffect(() => {
    refreshAnalytics();
    const interval = setInterval(refreshAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('system-status-dismissed', 'true');
  };

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    localStorage.setItem('system-status-minimized', newMinimized.toString());
  };

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

  if (!isVisible) {
    return null;
  }

  return (
    <Card className={`${className} ${getHealthColor(state.systemHealth)} border-2 transition-all duration-300 ${isMinimized ? 'h-auto' : ''}`}>
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
              onClick={handleMinimize}
              className="h-6 w-6 p-0"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <Minimize2 className={`h-3 w-3 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAnalytics}
              disabled={state.isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${state.isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {!isMinimized && (
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
                {analytics?.templateManager?.totalTemplates || 'N/A'}
              </div>
            </div>
            <div className="bg-background/50 p-2 rounded">
              <div className="font-medium">Operations</div>
              <div className="text-muted-foreground">
                {analytics?.performance?.summary?.totalOperations || 0}
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated
            </div>
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};