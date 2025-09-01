import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';

interface TokenUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  timestamp: Date;
  difficulty: string;
  model: string;
}

interface TokenMonitoringProps {
  className?: string;
}

export const TokenMonitoringDashboard: React.FC<TokenMonitoringProps> = ({ className }) => {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [currentSession, setCurrentSession] = useState({
    totalTokens: 0,
    estimatedCost: 0,
    requestCount: 0
  });

  // Listen for token usage events from story generation
  useEffect(() => {
    const handleTokenUsage = (event: CustomEvent<TokenUsage>) => {
      const usage = event.detail;
      setTokenUsage(prev => [...prev.slice(-49), usage]); // Keep last 50 entries
      
      // Update session totals
      setCurrentSession(prev => ({
        totalTokens: prev.totalTokens + usage.totalTokens,
        estimatedCost: prev.estimatedCost + (usage.totalTokens * 0.000002), // Rough GPT-4 estimate
        requestCount: prev.requestCount + 1
      }));
    };

    window.addEventListener('token:usage', handleTokenUsage as EventListener);
    return () => window.removeEventListener('token:usage', handleTokenUsage as EventListener);
  }, []);

  // Calculate usage metrics
  const recentUsage = tokenUsage.slice(-10);
  const avgTokensPerRequest = recentUsage.length > 0 
    ? recentUsage.reduce((sum, u) => sum + u.totalTokens, 0) / recentUsage.length 
    : 0;

  const maxTokensPerDifficulty = {
    beginner: 90,    // 15 * 6 pages (guest limit)
    easy: 360,       // 60 * 6 pages (guest limit)
    medium: 1500,    // 250 * 6 pages (guest limit)
    hard: 2100,      // 350 * 6 pages (guest limit)
    expert: 3000     // 500 * 6 pages (guest limit)
  };

  const getUsageStatus = (tokens: number, difficulty: string) => {
    const max = maxTokensPerDifficulty[difficulty as keyof typeof maxTokensPerDifficulty] || 1000;
    const percentage = (tokens / max) * 100;
    
    if (percentage > 90) return { status: 'critical', color: 'destructive' };
    if (percentage > 75) return { status: 'warning', color: 'orange' };
    return { status: 'normal', color: 'green' };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Token Usage Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Session Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{currentSession.totalTokens.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">${currentSession.estimatedCost.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">Est. Cost</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{currentSession.requestCount}</p>
              <p className="text-sm text-muted-foreground">Requests</p>
            </div>
          </div>

          {/* Average Usage */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Avg Tokens/Request</span>
            </div>
            <Badge variant="secondary">{Math.round(avgTokensPerRequest)}</Badge>
          </div>

          {/* Recent Usage List */}
          {recentUsage.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Requests</h4>
              {recentUsage.slice(-5).reverse().map((usage, index) => {
                const usageInfo = getUsageStatus(usage.totalTokens, usage.difficulty);
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {usage.difficulty}
                      </Badge>
                      <span className="text-sm">{usage.totalTokens} tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(usage.totalTokens / (maxTokensPerDifficulty[usage.difficulty as keyof typeof maxTokensPerDifficulty] || 1000)) * 100} 
                        className="w-16 h-2" 
                      />
                      {usageInfo.status === 'critical' && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Alerts */}
          {avgTokensPerRequest > 1500 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High token usage detected. Consider optimizing prompts for efficiency.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};