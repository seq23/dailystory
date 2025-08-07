import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useIsMobile } from '@/hooks/use-mobile';

interface SecurityEvent {
  type: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [criticalEvents, setCriticalEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useIsMobile();
  
  const { getEvents, getCriticalEvents, exportEvents, clearEvents } = useSecurityMonitoring();

  useEffect(() => {
    const refreshEvents = () => {
      setEvents(getEvents());
      setCriticalEvents(getCriticalEvents());
    };

    refreshEvents();
    const interval = setInterval(refreshEvents, 5000);
    return () => clearInterval(interval);
  }, [getEvents, getCriticalEvents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleExport = () => {
    const dataStr = exportEvents();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-events-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
        size={isMobile ? "icon" : "sm"}
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 z-50 ${isMobile ? 'left-4' : 'right-4'}`}
        title="Security Dashboard"
      >
        <Shield className="h-4 w-4" />
        {criticalEvents.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full">
            <span className="text-xs text-white">{criticalEvents.length}</span>
          </div>
        )}
        {!isMobile && <span className="ml-2">Security Dashboard</span>}
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 z-50 ${isMobile ? 'left-4 w-80 max-w-[calc(100vw-32px)]' : 'right-4 w-96'} max-h-96 overflow-hidden shadow-lg`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Monitor
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Critical Alerts */}
        {criticalEvents.length > 0 && (
          <div className="bg-destructive/10 p-2 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {criticalEvents.length} Critical Event{criticalEvents.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Total Events: {events.length}</div>
          <div>Critical: {criticalEvents.length}</div>
        </div>

        {/* Recent Events */}
        <div className="max-h-32 overflow-y-auto space-y-1">
          {events.slice(0, 10).map((event, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-1 bg-muted/30 rounded">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge variant={getSeverityColor(event.severity)} className="text-xs px-1 py-0">
                  {event.severity}
                </Badge>
                <span className="truncate">{event.type}</span>
              </div>
              <span className="text-muted-foreground ml-2">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};