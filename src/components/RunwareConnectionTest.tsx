import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const RunwareConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [deploymentWarning, setDeploymentWarning] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setDeploymentWarning(null);
    
    const testResults: TestResult[] = [];
    const CURRENT_DEPLOYMENT = '2025-09-27T15:45:00Z';

    try {
      // Test 1: Main Orchestrator Health Check - Fixed to use direct fetch for GET requests
      DebugLogger.log('network', 'Testing main image orchestrator health...');
      try {
        const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
          }
        });
        
        if (!response.ok) {
          testResults.push({
            name: 'Main Orchestrator Health',
            status: 'error',
            message: `❌ HTTP ${response.status}: ${response.statusText}`,
            details: { status: response.status, statusText: response.statusText }
          });
        } else {
          const data = await response.json();
          if (data?.status === 'healthy') {
            const env = data.environment || {};
            
            // Check deployment version
            if (data.deployment_version && data.deployment_version !== CURRENT_DEPLOYMENT) {
              setDeploymentWarning(`Deployment may be stale: ${data.deployment_version} (expected: ${CURRENT_DEPLOYMENT})`);
            }
            
            // Build detailed status message
            const apiStatuses = [];
            if (env.hasRunwareApiKey) {
              apiStatuses.push(`Runware: ✓ (${env.runwareKeyLength} chars)`);
            } else {
              apiStatuses.push(`Runware: ❌ Missing`);
            }
            if (env.hasOpenAiApiKey) {
              apiStatuses.push(`OpenAI: ✓ (${env.openaiKeyLength} chars)`);
            } else {
              apiStatuses.push(`OpenAI: ❌ Missing`);
            }
            if (env.hasSupabaseServiceRoleKey) {
              apiStatuses.push(`Supabase: ✓`);
            } else {
              apiStatuses.push(`Supabase: ❌ Missing`);
            }
            
            const hasAllKeys = env.hasRunwareApiKey && env.hasOpenAiApiKey && env.hasSupabaseServiceRoleKey;
            
            testResults.push({
              name: 'Main Orchestrator Health',
              status: hasAllKeys ? 'success' : 'warning',
              message: `✅ ${data.tier || 'Main Service'} | ${apiStatuses.join(', ')}`,
              details: data
            });
          } else {
            testResults.push({
              name: 'Main Orchestrator Health',
              status: 'warning',
              message: data?.message || 'Service not responding properly',
              details: data
            });
          }
        }
      } catch (error) {
        testResults.push({
          name: 'Main Orchestrator Health',
          status: 'error',
          message: `Test failed: ${error.message}`,
          details: error
        });
      }

      // Test 2: Template Services Health
      DebugLogger.log('network', 'Testing Runware template services...');
      const templateServices = [
        { name: 'AB Templates', endpoint: 'runware-template-ab' },
        { name: 'CD Templates', endpoint: 'runware-template-cd' }
      ];

      for (const service of templateServices) {
        try {
          const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${service.endpoint}`, {
            method: 'GET',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Check deployment version
            if (data.deployment_version && data.deployment_version !== CURRENT_DEPLOYMENT) {
              setDeploymentWarning(prev => prev || `Some services may be stale (expected: ${CURRENT_DEPLOYMENT})`);
            }
            
            const statusMessage = `✅ ${data.status || 'healthy'} | Tier: ${data.tier || 'Not Specified'}`;
            const cacheStatus = data.handler_cached !== undefined ? ` | Handler: ${data.handler_cached ? 'Cached' : 'Fresh'}` : '';
            
            testResults.push({
              name: service.name,
              status: 'success',
              message: statusMessage + cacheStatus,
              details: data
            });
          } else {
            testResults.push({
              name: service.name,
              status: 'error',
              message: `❌ HTTP ${response.status}: ${response.statusText}`,
              details: { status: response.status, statusText: response.statusText }
            });
          }
        } catch (error) {
          testResults.push({
            name: service.name,
            status: 'error',
            message: `❌ Connection failed: ${error.message}`,
            details: error
          });
        }
      }

    } catch (error) {
      DebugLogger.error('network', 'Test suite error', error);
      testResults.push({
        name: 'Test Suite',
        status: 'error',
        message: `Test suite failed: ${error.message}`,
        details: error
      });
    } finally {
      setResults(testResults);
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '📋';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔗 Runware Service Health Check</CardTitle>
        {deploymentWarning && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
            ⚠️ {deploymentWarning}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="sm"
          className="w-full mb-4"
        >
          {isRunning ? 'Testing Services...' : 'Test Runware Services'}
        </Button>
        
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span>{getStatusIcon(result.status)}</span>
                  <span className="font-medium text-sm">{result.name}</span>
                </div>
                <div className={`text-xs ${getStatusColor(result.status)} mb-2`}>
                  {result.message}
                </div>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">View Details</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};