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
      // Test 1: Basic WebSocket Connection
      console.log('🔍 Testing basic Runware WebSocket connection...');
      try {
        const { data, error } = await supabase.functions.invoke('system-diagnostics?operation=test-runware-api');
        
        if (error) {
          testResults.push({
            name: 'Basic WebSocket Test',
            status: 'error',
            message: `Connection failed: ${error.message}`,
            details: error
          });
        } else if (data?.success) {
          testResults.push({
            name: 'Basic WebSocket Test',
            status: 'success',
            message: `Connection successful. API Key: ${data.apiKeyPreview || 'Present'}`,
            details: data
          });
        } else {
          testResults.push({
            name: 'Basic WebSocket Test',
            status: 'warning',
            message: data?.message || 'Unknown response',
            details: data
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Basic WebSocket Test',
          status: 'error',
          message: `Test failed: ${error.message}`,
          details: error
        });
      }

      // Test 2: Comprehensive Diagnostic
      console.log('🔍 Running comprehensive Runware diagnostic...');
      try {
        const { data, error } = await supabase.functions.invoke('system-diagnostics?operation=runware-diagnostic');
        
        if (error) {
          testResults.push({
            name: 'Comprehensive Diagnostic',
            status: 'error',
            message: `Diagnostic failed: ${error.message}`,
            details: error
          });
        } else if (data?.success) {
          testResults.push({
            name: 'Comprehensive Diagnostic',
            status: 'success',
            message: `All tests passed. WebSocket: ${data.websocketConnection ? '✅' : '❌'}, Auth: ${data.authentication ? '✅' : '❌'}`,
            details: data
          });
        } else {
          testResults.push({
            name: 'Comprehensive Diagnostic',
            status: 'warning',
            message: data?.message || 'Diagnostic completed with issues',
            details: data
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Comprehensive Diagnostic',
          status: 'error', 
          message: `Diagnostic failed: ${error.message}`,
          details: error
        });
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