import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap, Cable, ArrowRight, Bug, DollarSign, Calculator, Volume2, AlertCircle, Activity, Image as ImageIcon,
} from 'lucide-react';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { supabase } from '@/integrations/supabase/client';

import { DebugDataViewer } from '@/components/DebugDataViewer';
import { SpendSummary } from '@/components/testing/SpendSummary';
import { TestRunCostReadout } from '@/components/testing/TestRunCostReadout';
import { ForecastPanel } from '@/components/testing/ForecastPanel';
import { SystemHealthPanel } from '@/components/testing/SystemHealthPanel';
import { ImageGenerationTester } from '@/components/testing/ImageGenerationTester';
import { useCostAnalytics } from '@/hooks/useCostAnalytics';

import { VoiceCatalogTester } from '@/components/VoiceCatalogTester';
import { AudioE2ETestingPanel } from '@/components/AudioE2ETestingPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { errorSuppressionManager } from '@/utils/errorSuppressionManager';

const LoggingHealthCheck = () => {
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  
  const checkHealth = async () => {
    setChecking(true);
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('image_generation_debug')
        .select('*', { count: 'exact', head: true });
      
      // Get most recent log
      const { data, error } = await supabase
        .from('image_generation_debug')
        .select('created_at, session_id, tier')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) {
        const age = Date.now() - new Date(data.created_at).getTime();
        const ageMinutes = Math.floor(age / 60000);
        
        setHealth({
          totalRecords: count || 0,
          mostRecent: data,
          ageMinutes,
          isActive: ageMinutes < 60
        });
      }
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Database Logging Health
        </h3>
        <Button 
          onClick={checkHealth} 
          disabled={checking}
          variant="outline"
          size="sm"
        >
          {checking ? 'Checking...' : 'Check Now'}
        </Button>
      </div>
      
      {health && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            {health.isActive ? (
              <Badge variant="default" className="bg-green-600">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Total Records:</span> {health.totalRecords}
          </div>
          <div>
            <span className="text-muted-foreground">Most Recent Log:</span> {health.ageMinutes} minutes ago
          </div>
          <div className="text-xs text-muted-foreground">
            Session: <code className="bg-muted px-1 rounded">{health.mostRecent.session_id}</code>
          </div>
        </div>
      )}
      
      {health && !health.isActive && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No logs in last hour - database logging may be disabled
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default function PromptTesting() {
  const [searchParams] = useSearchParams();
  const isDebugMode = searchParams.get('debug') === '1';
  const analytics = useCostAnalytics(isDebugMode);

  // Initialize error suppression for cleaner console
  useEffect(() => {
    if (!isDebugMode) {
      errorSuppressionManager.enable();
    }
    
    return () => {
      errorSuppressionManager.disable();
    };
  }, [isDebugMode]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start mb-6">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-fun font-bold text-foreground mb-2">
                Time2Read Testing Console
                {isDebugMode && (
                  <span className="ml-3 text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                    Debug Mode Active
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                Live tests against the real story, image and narration systems — plus what they have
                cost so far and what they will cost at scale.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Link to="/template-testing">
                <Button variant="outline" className="flex items-center gap-2">
                  Template Testing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {!isDebugMode && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Spend, forecast and log tabs are hidden. Add <code>?debug=1</code> to the URL to open
              the full console (admin account required for cost data).
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={isDebugMode ? 'spend' : 'story'} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            {isDebugMode && (
              <>
                <TabsTrigger value="spend" className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Spend
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> Forecast
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="story" className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Story generation
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Images
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio & voice
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1.5">
              <Cable className="w-4 h-4" /> Health
            </TabsTrigger>
            {isDebugMode && (
              <TabsTrigger value="logs" className="flex items-center gap-1.5">
                <Bug className="w-4 h-4" /> Logs
              </TabsTrigger>
            )}
          </TabsList>

          {isDebugMode && (
            <TabsContent value="spend" className="space-y-6">
              <ErrorBoundary>
                <SpendSummary analytics={analytics} />
              </ErrorBoundary>
              <ErrorBoundary>
                <TestRunCostReadout />
              </ErrorBoundary>
            </TabsContent>
          )}

          {isDebugMode && (
            <TabsContent value="forecast" className="space-y-6">
              <ErrorBoundary>
                <ForecastPanel analytics={analytics} />
              </ErrorBoundary>
            </TabsContent>
          )}

          <TabsContent value="story" className="space-y-6">
            <ErrorBoundary>
              <StoryPromptTester />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ErrorBoundary>
              <ImageGenerationTester />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <ErrorBoundary>
              <VoiceCatalogTester />
            </ErrorBoundary>
            {isDebugMode && (
              <ErrorBoundary>
                <AudioE2ETestingPanel />
              </ErrorBoundary>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <ErrorBoundary>
              <SystemHealthPanel />
            </ErrorBoundary>
          </TabsContent>

          {isDebugMode && (
            <TabsContent value="logs" className="space-y-6">
              <LoggingHealthCheck />
              <ErrorBoundary>
                <DebugDataViewer />
              </ErrorBoundary>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}