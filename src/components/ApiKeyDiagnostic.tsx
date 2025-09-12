import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export const ApiKeyDiagnostic: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isResettingCircuitBreaker, setIsResettingCircuitBreaker] = useState(false);

  const addResult = (status: DiagnosticResult['status'], message: string, details?: any) => {
    const newResult: DiagnosticResult = {
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const checkApiKey = async () => {
    setIsChecking(true);
    setResults([]);
    
    addResult('warning', '🔍 Starting comprehensive API key diagnostics...');
    
    try {
      // Test 1: Orchestrator health check with secrets presence
      addResult('warning', '🔧 Testing orchestrator health and secrets presence...');
      const { data: healthData, error: healthError } = await supabase.functions.invoke('runware-generate-image', {
        method: 'GET'
      });
      
      if (healthError) {
        addResult('error', `❌ Orchestrator health check failed: ${healthError.message}`, healthError);
      } else {
        const env = healthData.environment || {};
        addResult('success', '✅ Orchestrator is healthy', healthData);
        addResult(env.runwareApiKeyPresent ? 'success' : 'error', 
          `${env.runwareApiKeyPresent ? '✅' : '❌'} RUNWARE_API_KEY: ${env.runwareApiKeyPresent ? 'Present' : 'Missing'} (${env.runwareKeyLength || 0} chars)`);
        addResult(env.openaiApiKeyPresent ? 'success' : 'warning', 
          `${env.openaiApiKeyPresent ? '✅' : '⚠️'} OPENAI_API_KEY: ${env.openaiApiKeyPresent ? 'Present' : 'Missing'} (${env.openaiKeyLength || 0} chars)`);
        addResult(env.supabaseServiceRolePresent ? 'success' : 'error', 
          `${env.supabaseServiceRolePresent ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY: ${env.supabaseServiceRolePresent ? 'Present' : 'Missing'}`);
      }

      // Test 2: WebSocket authentication test
      addResult('warning', '🔐 Testing Runware WebSocket authentication...');
      const { data: wsTest, error: wsError } = await supabase.functions.invoke('system-diagnostics?operation=test-runware-api');
      
      if (wsError) {
        addResult('error', `❌ WebSocket auth test failed: ${wsError.message}`, wsError);
      } else {
        if (wsTest.success && wsTest.authenticationSuccessful) {
          addResult('success', '✅ Runware WebSocket authentication successful', wsTest);
        } else {
          addResult('error', '❌ Runware WebSocket authentication failed', wsTest);
        }
      }

      // Test 3: Individual tier testing
      addResult('warning', '🎯 Testing individual image generation tiers...');
      
      const tiers = [
        { name: 'Tier 1 (AI Visual Scene Creator)', function: 'ai-visual-scene-creator', body: { diagnostic: 'tier_health_check' } },
        { name: 'Tier 2.5 (Runware Simple)', function: 'runware-simple-fallback', body: { diagnostic: 'tier_health_check' } }
      ];

      for (const tier of tiers) {
        try {
          const { data: tierData, error: tierError } = await supabase.functions.invoke(tier.function, {
            body: tier.body
          });
          
          if (tierError) {
            addResult('warning', `⚠️ ${tier.name} - ${tierError.message}`, tierError);
          } else {
            addResult('success', `✅ ${tier.name} - Healthy`, tierData);
          }
        } catch (err) {
          addResult('error', `❌ ${tier.name} - Test failed: ${err.message}`, err);
        }
      }

      addResult('success', '🎉 Diagnostic complete! Check results above for any issues.');
      
    } catch (error) {
      console.error('Diagnostic error:', error);
      addResult('error', `❌ Diagnostic test failed: ${error.message}`, error);
    } finally {
      setIsChecking(false);
    }
  };

  const forceTier25Test = async () => {
    setIsChecking(true);
    
    try {
      addResult('warning', '🎯 Testing Tier 2.5 in isolation...');
      
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: 'A happy child playing in a colorful playground',
          userInfo: { name: 'Test', age: 8, ethnicity: 'diverse' },
          sessionId: 'test-session',
          pageNumber: 1,
          forceTier: 2.5
        }
      });
      
      if (error) {
        addResult('error', `❌ Tier 2.5 isolated test failed: ${error.message}`, error);
      } else if (data.success && data.imageURL) {
        addResult('success', `✅ Tier 2.5 isolated test successful - Used: ${data.usedTier}`, data);
      } else {
        addResult('error', '❌ Tier 2.5 test returned no image URL', data);
      }
    } catch (error) {
      addResult('error', `❌ Tier 2.5 test failed: ${error.message}`, error);
    } finally {
      setIsChecking(false);
    }
  };

  const resetCircuitBreaker = async () => {
    setIsResettingCircuitBreaker(true);
    
    try {
      addResult('warning', '🔄 Attempting to reset circuit breaker...');
      
      const { data, error } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: { diagnostic: 'reset_circuit_breaker' }
      });
      
      if (error) {
        addResult('error', `❌ Circuit breaker reset failed: ${error.message}`, error);
      } else {
        addResult('success', '✅ Circuit breaker reset successfully', data);
      }
    } catch (error) {
      addResult('error', `❌ Reset failed: ${error.message}`, error);
    } finally {
      setIsResettingCircuitBreaker(false);
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-foreground';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔑 OpenAI API Key & Service Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={checkApiKey} 
            disabled={isChecking}
            size="sm"
            className="flex-1 min-w-[120px]"
          >
            {isChecking ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
          </Button>
          <Button 
            onClick={resetCircuitBreaker} 
            disabled={isResettingCircuitBreaker || isChecking}
            size="sm"
            variant="outline"
            className="flex-1 min-w-[120px]"
          >
            {isResettingCircuitBreaker ? 'Resetting...' : 'Reset Circuit Breaker'}
          </Button>
          <Button 
            onClick={forceTier25Test} 
            disabled={isChecking}
            size="sm"
            variant="secondary"
            className="flex-1 min-w-[120px]"
          >
            {isChecking ? 'Testing...' : 'Force Tier 2.5 Test'}
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-medium">Diagnostic Results:</h4>
            {results.map((result, index) => (
              <div 
                key={index} 
                className="text-xs p-2 bg-muted rounded space-y-1"
              >
                <div className={`font-medium ${getStatusColor(result.status)}`}>
                  [{result.timestamp}] {result.message}
                </div>
                {result.details && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      View details
                    </summary>
                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
        
        {results.length === 0 && !isChecking && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            Click "Run Full Diagnostic" to test OpenAI API key configuration, circuit breaker status, and individual service tiers.
          </div>
        )}
      </CardContent>
    </Card>
  );
};