import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const RunwareConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testResults: TestResult[] = [];

    try {
      // Test 1: Main Orchestrator Health Check
      console.log('🔍 Testing main image orchestrator health...');
      try {
        const { data, error } = await supabase.functions.invoke('runware-generate-image', {
          method: 'GET'
        });
        
        if (error) {
          testResults.push({
            name: 'Main Orchestrator Health',
            status: 'error',
            message: `Health check failed: ${error.message}`,
            details: error
          });
        } else if (data?.status === 'healthy') {
          const env = data.environment || {};
          testResults.push({
            name: 'Main Orchestrator Health',
            status: 'success',
            message: `✅ Healthy | Runware API: ${env.runwareApiKeyPresent ? 'Present' : 'Missing'}`,
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
      } catch (error) {
        testResults.push({
          name: 'Main Orchestrator Health',
          status: 'error',
          message: `Test failed: ${error.message}`,
          details: error
        });
      }

      // Test 2: Template Services Health
      console.log('🔍 Testing Runware template services...');
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
            testResults.push({
              name: service.name,
              status: 'success',
              message: `✅ ${data.status || 'healthy'} | Tier: ${data.tier || 'unknown'}`,
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
      console.error('Test suite error:', error);
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
        <CardTitle className="text-sm">🔌 Runware WebSocket Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="sm"
          className="w-full mb-4"
        >
          {isRunning ? 'Running Tests...' : 'Test Runware Connection'}
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