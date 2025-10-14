import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Cable, ArrowRight, Bug, BarChart3, Brain, Layers, Volume2, AlertCircle, Activity } from 'lucide-react';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { supabase } from '@/integrations/supabase/client';

import { RunwareConnectionTest } from '@/components/RunwareConnectionTest';
import { ApiKeyDiagnostic } from '@/components/ApiKeyDiagnostic';
import { DebugDataViewer } from '@/components/DebugDataViewer';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

import { VoiceCatalogTester } from '@/components/VoiceCatalogTester';
import { ImageTierTester } from '@/components/ImageTierTester';
import { AudioE2ETestingPanel } from '@/components/AudioE2ETestingPanel';
// AudioPlaybackTester integrated into UnifiedDebugMonitor
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
                Story Generation Testing
                {isDebugMode && (
                  <span className="ml-3 text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                    Debug Mode Active
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                Comprehensive testing suite for AI story generation, validation, and infrastructure
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

        {/* Test Sections */}
        <div className="space-y-8">
          {/* Debug Data Viewer - Only show when debug=1 */}
          {isDebugMode && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Bug className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Debug Data Viewer</h2>
                </div>
                <LoggingHealthCheck />
                <DebugDataViewer />
              </section>

              <Separator />

              {/* Analytics Dashboard */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
                </div>
                <AnalyticsDashboard />
              </section>

              <Separator />


              {/* Image Tier Testing */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Image Tier Testing</h2>
                </div>
                <ErrorBoundary>
                  <ImageTierTester />
                </ErrorBoundary>
              </section>

              <Separator />

              {/* Audio E2E Testing - Real User Flow Testing */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Audio E2E Testing</h2>
                  
                </div>
                <ErrorBoundary>
                  <AudioE2ETestingPanel />
                </ErrorBoundary>
              </section>

              <Separator />

              {/* Audio testing now integrated into UnifiedDebugMonitor */}
            </>
          )}

          {/* Advanced Comprehensive Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Advanced Testing Suite</h2>
            </div>
            
            <ErrorBoundary>
              <StoryPromptTester />
            </ErrorBoundary>
          </section>

          <Separator />

          {/* Voice Catalog Testing */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Voice Catalog Testing</h2>
            </div>
            <ErrorBoundary>
              <VoiceCatalogTester />
            </ErrorBoundary>
          </section>

          <Separator />

          {/* Infrastructure Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cable className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Infrastructure Testing</h2>
            </div>
            <div className="space-y-6">
              <ErrorBoundary>
                <ApiKeyDiagnostic />
              </ErrorBoundary>
              <ErrorBoundary>
                <RunwareConnectionTest />
              </ErrorBoundary>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}