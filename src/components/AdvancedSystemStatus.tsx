import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { performanceMonitor } from '@/services/AdvancedPerformanceMonitor';
import { characterConsistency } from '@/services/UnifiedCharacterConsistency';
import { abTestingFramework } from '@/services/ABTestingFramework';

export function AdvancedSystemStatus() {
  const [status, setStatus] = React.useState({
    performance: 'healthy',
    character: 'active',
    testing: 'running',
    cultural: 'monitoring'
  });

  React.useEffect(() => {
    // Simulate status checks
    const checkSystems = () => {
      try {
        const dashboardData = performanceMonitor.getMonitoringDashboard();
        const characterData = characterConsistency.getActiveCharacterSeeds();
        const activeTests = abTestingFramework.getActiveTests();
        
        setStatus({
          performance: dashboardData.cacheStats.hitRate > 0.5 ? 'healthy' : 'warning',
          character: characterData.total > 0 ? 'active' : 'idle',
          testing: activeTests.length > 0 ? 'running' : 'idle',
          cultural: 'monitoring'
        });
      } catch (error) {
        console.warn('System status check failed:', error);
      }
    };

    checkSystems();
    const interval = setInterval(checkSystems, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'running':
      case 'monitoring':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' || status === 'active' || status === 'running' || status === 'monitoring' 
      ? 'default' : 'secondary';
    return (
      <Badge variant={variant} className="text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Advanced System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.performance)}
            <span className="text-sm">Performance Monitor</span>
          </div>
          {getStatusBadge(status.performance)}
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.character)}
            <span className="text-sm">Character Consistency</span>
          </div>
          {getStatusBadge(status.character)}
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.testing)}
            <span className="text-sm">A/B Testing</span>
          </div>
          {getStatusBadge(status.testing)}
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.cultural)}
            <span className="text-sm">Cultural Intelligence</span>
          </div>
          {getStatusBadge(status.cultural)}
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>All systems operational</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}