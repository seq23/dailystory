import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  data?: any;
}

export const SecurityMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { handleError, getEvents, getCriticalEvents, exportEvents, clearEvents } = useSecurityMonitoring();

  useEffect(() => {
    // Monitor for CSP violations
    const handleCSPViolation = (event: any) => {
      const alert: SecurityAlert = {
        id: crypto.randomUUID(),
        type: 'csp_violation',
        severity: 'high',
        message: `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI}`,
        timestamp: Date.now(),
        data: {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber
        }
      };
      
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
      
      // Log using available methods from useSecurityMonitoring
      handleError(new Error(`CSP violation: ${event.violatedDirective}`), {
        componentStack: JSON.stringify(alert.data)
      });
    };

    // Monitor for unauthorized access attempts (using existing fetch override from useSecurityMonitoring)
    // Note: Fetch monitoring is handled by useSecurityMonitoring hook to avoid conflicts

    // Monitor for suspicious console access
    const monitorConsoleAccess = () => {
      if (process.env.NODE_ENV === 'production') {
        const originalLog = console.log;
        console.log = (...args) => {
          // Check for potential data extraction attempts
          const message = args.join(' ');
          if (message.includes('password') || message.includes('token') || message.includes('secret')) {
            const alert: SecurityAlert = {
              id: crypto.randomUUID(),
              type: 'suspicious_console_access',
              severity: 'high',
              message: 'Suspicious console access detected',
              timestamp: Date.now(),
              data: { args: args.length }
            };
            
            setAlerts(prev => [alert, ...prev.slice(0, 9)]);
            
            // Log using available methods from useSecurityMonitoring  
            handleError(new Error('Suspicious console access detected'), {
              componentStack: 'Console monitoring'
            });
          }
          
          originalLog(...args);
        };
      }
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    monitorConsoleAccess();

    // Cleanup
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, [handleError]);

  // Show security monitor only in development or with debug parameter
  const urlParams = new URLSearchParams(window.location.search);
  const shouldShow = process.env.NODE_ENV === 'development' || urlParams.has('debug') && urlParams.get('debug')?.includes('security');

  if (!shouldShow) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          title="Security Monitor"
        >
          <Shield className="h-5 w-5" />
          {alerts.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {alerts.length}
            </Badge>
          )}
        </button>
      ) : (
        <Card className="w-96 max-h-[500px] overflow-hidden shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No security alerts</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                        {getSeverityIcon(alert.severity)}
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};