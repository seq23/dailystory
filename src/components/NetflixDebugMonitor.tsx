/**
 * Netflix Debug Monitor Component
 * Real-time debugging tool for Netflix "next story" AI generation failures
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NetflixRetryService } from '@/services/NetflixRetryService';
import { logger } from '@/services/LoggerService';

interface NetflixDebugLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  source: 'netflix' | 'unified' | 'edge' | 'retry';
}

export const NetflixDebugMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<NetflixDebugLog[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState<any>({});

  // Initialize console log interceptor for Netflix debugging
  useEffect(() => {
    if (!isRecording) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    const interceptLog = (level: 'info' | 'warn' | 'error', originalFn: Function) => 
      (...args: any[]) => {
        originalFn(...args);
        
        const message = args.join(' ');
        if (message.includes('Netflix') || message.includes('🎬') || message.includes('📺')) {
          const newLog: NetflixDebugLog = {
            timestamp: Date.now(),
            level,
            message,
            source: 'netflix'
          };
          
          setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
        }
      };

    console.log = interceptLog('info', originalConsole.log);
    console.warn = interceptLog('warn', originalConsole.warn);
    console.error = interceptLog('error', originalConsole.error);

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [isRecording]);

  // Update circuit breaker status
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording) {
        const status = NetflixRetryService.getCircuitBreakerStatus();
        setCircuitBreakerStatus(status);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setLogs([]);
    logger.info('Netflix Debug Monitor started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    logger.info('Netflix Debug Monitor stopped');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetCircuitBreakers = () => {
    NetflixRetryService.resetAllCircuitBreakers();
    logger.info('All circuit breakers reset');
  };

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      logs,
      circuitBreakerStatus
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netflix-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600"
        size="sm"
      >
        📺 Netflix Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96">
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              📺 Netflix Debug Monitor
              {isRecording && <Badge className="bg-red-500">Recording</Badge>}
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            {!isRecording ? (
              <Button onClick={startRecording} size="sm" className="bg-green-500 hover:bg-green-600">
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} size="sm" className="bg-red-500 hover:bg-red-600">
                Stop Recording
              </Button>
            )}
            <Button onClick={clearLogs} size="sm" variant="outline">
              Clear
            </Button>
            <Button onClick={exportLogs} size="sm" variant="outline">
              Export
            </Button>
            <Button onClick={resetCircuitBreakers} size="sm" variant="outline">
              Reset CB
            </Button>
          </div>

          {/* Circuit Breaker Status */}
          {Object.keys(circuitBreakerStatus).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium">Circuit Breakers:</div>
              {Object.entries(circuitBreakerStatus).map(([key, status]: [string, any]) => (
                <div key={key} className="text-xs flex items-center gap-2">
                  <Badge
                    className={
                      status.state === 'open' ? 'bg-red-500' :
                      status.state === 'half-open' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }
                  >
                    {status.state}
                  </Badge>
                  <span className="truncate">{key}</span>
                  <span>({status.failures})</span>
                </div>
              ))}
            </div>
          )}

          {/* Logs */}
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-xs text-gray-500 p-2">
                  {isRecording ? 'Waiting for Netflix logs...' : 'Click "Start Recording" to monitor'}
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-xs p-1 rounded border-l-2 ${
                      log.level === 'error' ? 'border-red-400 bg-red-50' :
                      log.level === 'warn' ? 'border-yellow-400 bg-yellow-50' :
                      'border-blue-400 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge
                        className={`text-xs ${
                          log.level === 'error' ? 'bg-red-500' :
                          log.level === 'warn' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                      >
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mt-1 font-mono text-xs break-words">
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="text-xs text-gray-600">
            <div>Logs: {logs.length}/50</div>
            <div>Click "Next Story" to test AI generation flow</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};