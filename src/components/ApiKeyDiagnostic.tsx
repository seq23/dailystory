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
      // Test 1: Basic API key validation via AI Story Enhancer
      addResult('warning', '🔧 Testing basic API key validation...');
      const { data: keyValidation, error: keyError } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: { test: true, diagnostic: 'key_validation' }
      });
      
      if (keyError) {
        if (keyError.message?.includes('OPENAI_API_KEY')) {
          addResult('error', '❌ OpenAI API key is NOT configured in Supabase secrets', keyError);
          return;
        } else if (keyError.message?.includes('Circuit breaker')) {
          addResult('warning', '⚠️ Circuit breaker is open - service temporarily degraded', keyError);
        } else {
          addResult('error', `❌ API Key validation failed: ${keyError.message}`, keyError);
        }
      } else {
        addResult('success', '✅ OpenAI API key is properly configured and valid', keyValidation);
      }

      // Test 2: Circuit breaker status check
      addResult('warning', '🔄 Checking circuit breaker status...');
      const { data: cbStatus, error: cbError } = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: { test: true, diagnostic: 'circuit_breaker_status' }
      });
      
      if (cbError) {
        if (cbError.message?.includes('Circuit breaker')) {
          addResult('warning', '⚠️ AI Visual Scene Creator circuit breaker is OPEN - using fallback tiers', cbError);
        } else {
          addResult('error', `❌ Circuit breaker check failed: ${cbError.message}`, cbError);
        }
      } else {
        addResult('success', '✅ AI Visual Scene Creator circuit breaker is CLOSED - service healthy', cbStatus);
      }

      // Test 3: Individual tier testing
      addResult('warning', '🎯 Testing individual image generation tiers...');
      
      const tiers = [
        { name: 'Tier 1 (AI Visual Scene Creator)', function: 'ai-visual-scene-creator' },
        { name: 'Tier 3 (OpenAI DALL-E)', function: 'openai-image' }
      ];

      for (const tier of tiers) {
        try {
          const { data: tierData, error: tierError } = await supabase.functions.invoke(tier.function, {
            body: { test: true, diagnostic: 'tier_health_check' }
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
        <div className="flex gap-2">
          <Button 
            onClick={checkApiKey} 
            disabled={isChecking}
            size="sm"
            className="flex-1"
          >
            {isChecking ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
          </Button>
          <Button 
            onClick={resetCircuitBreaker} 
            disabled={isResettingCircuitBreaker || isChecking}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isResettingCircuitBreaker ? 'Resetting...' : 'Reset Circuit Breaker'}
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