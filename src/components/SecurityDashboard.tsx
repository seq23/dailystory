import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { SecurityMonitor } from '@/utils/monitoring';
import { Shield, AlertTriangle, Activity, Download, Trash2 } from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'security' | 'performance' | 'error' | 'user';
  event: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [criticalEvents, setCriticalEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { getSecurityEvents, getCriticalEvents, exportEvents, clearEvents } = useSecurityMonitoring();

  useEffect(() => {
    const refreshEvents = () => {
      setEvents(getSecurityEvents());
      setCriticalEvents(getCriticalEvents());
    };

    refreshEvents();
    const interval = setInterval(refreshEvents, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [getSecurityEvents, getCriticalEvents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExport = () => {
    const data = exportEvents();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clearEvents();
    setEvents([]);
    setCriticalEvents([]);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Shield className="h-4 w-4 mr-2" />
        Security Monitor
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-background border rounded-lg shadow-lg z-50">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Security Monitor</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription>
            Real-time security event monitoring
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Critical Events Alert */}
          {criticalEvents.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {criticalEvents.length} critical security event(s) detected
              </AlertDescription>
            </Alert>
          )}

          {/* Security Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-bold">{events.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-bold text-destructive">{criticalEvents.length}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4" />
              <span className="font-medium">Recent Events</span>
            </div>
            
            <ScrollArea className="h-40">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No security events recorded
                </div>
              ) : (
                <div className="space-y-2">
                  {events.slice(-10).reverse().map((event) => (
                    <div key={event.id} className="p-2 border rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                          {event.severity}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <div className="font-medium">{event.type}: {event.event}</div>
                      {event.data && Object.keys(event.data).length > 0 && (
                        <div className="text-muted-foreground mt-1">
                          {JSON.stringify(event.data, null, 0).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};