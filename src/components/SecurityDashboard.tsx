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
        className="fixed bottom-4 left-4 z-50 h-6 px-2 text-xs"
      >
        <Shield className="h-3 w-3 mr-1" />
        Security
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-48 max-h-[60vh] bg-background border rounded-lg shadow-lg z-50">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <CardTitle className="text-sm">Security</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-xs"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Security monitoring
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-2 p-3">
          {/* Critical Events Alert */}
          {criticalEvents.length > 0 && (
            <Alert variant="destructive" className="p-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {criticalEvents.length} critical event(s)
              </AlertDescription>
            </Alert>
          )}

          {/* Security Metrics */}
          <div className="grid grid-cols-2 gap-1">
            <div className="text-center p-1 bg-muted rounded text-xs">
              <div className="font-bold">{events.length}</div>
              <div className="text-[10px] text-muted-foreground">Events</div>
            </div>
            <div className="text-center p-1 bg-muted rounded text-xs">
              <div className="font-bold text-destructive">{criticalEvents.length}</div>
              <div className="text-[10px] text-muted-foreground">Critical</div>
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Activity className="h-3 w-3" />
              <span className="text-xs font-medium">Recent Events</span>
            </div>
            
            <ScrollArea className="h-24">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-2 text-xs">
                  No events
                </div>
              ) : (
                <div className="space-y-1">
                  {events.slice(-5).reverse().map((event) => (
                    <div key={event.id} className="p-1 border rounded text-[10px]">
                      <div className="flex items-center justify-between">
                        <Badge variant={getSeverityColor(event.severity)} className="text-[8px] px-1 py-0">
                          {event.severity}
                        </Badge>
                        <span className="text-muted-foreground text-[8px]">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <div className="font-medium text-[9px]">{event.type}: {event.event}</div>
                      {event.data && Object.keys(event.data).length > 0 && (
                        <div className="text-muted-foreground text-[8px] mt-0.5">
                          {JSON.stringify(event.data, null, 0).slice(0, 50)}...
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
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1 h-6 px-1 text-[10px]"
            >
              <Download className="h-2 w-2 mr-0.5" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1 h-6 px-1 text-[10px]"
            >
              <Trash2 className="h-2 w-2 mr-0.5" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};