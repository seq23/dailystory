import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Zap, Cable, ArrowRight, Bug, BarChart3, TrendingUp, Brain, Layers } from 'lucide-react';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { RunwareConnectionTest } from '@/components/RunwareConnectionTest';
import { DebugDataViewer } from '@/components/DebugDataViewer';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AdvancedMonitoringDashboard } from '@/components/AdvancedMonitoringDashboard';
import { VoiceCatalogTester } from '@/components/VoiceCatalogTester';
import { ImageTierTester } from '@/components/ImageTierTester';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { errorSuppressionManager } from '@/utils/errorSuppression';

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

              {/* Advanced Monitoring Dashboard */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Advanced Monitoring</h2>
                </div>
                <AdvancedMonitoringDashboard />
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
            <ErrorBoundary>
              <RunwareConnectionTest />
            </ErrorBoundary>
          </section>
        </div>
      </div>
    </div>
  );
}