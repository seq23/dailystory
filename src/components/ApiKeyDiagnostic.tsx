import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { DebugLogger } from '@/services/DebugLogger';

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
        const env = healthData?.environment || {};
        addResult('success', '✅ Orchestrator is healthy', healthData);
        
        // Test service role key availability for Direct Mode
        addResult('warning', '🔑 Testing SUPABASE_SERVICE_ROLE_KEY availability for Direct Mode...');
        if (env.SUPABASE_SERVICE_ROLE_KEY) {
          addResult('success', '✅ SUPABASE_SERVICE_ROLE_KEY is available - Direct Mode should work');
        } else {
          addResult('warning', '⚠️ SUPABASE_SERVICE_ROLE_KEY not found - Direct Mode may fail');
        }
        
        // Handle environment info - if missing, show warning instead of error
        if (healthData?.environment) {
          addResult(env.runwareApiKeyPresent ? 'success' : 'error', 
            `${env.runwareApiKeyPresent ? '✅' : '❌'} RUNWARE_API_KEY: ${env.runwareApiKeyPresent ? 'Present' : 'Missing'} (${env.runwareKeyLength || 0} chars)`);
          addResult(env.openaiApiKeyPresent ? 'success' : 'warning', 
            `${env.openaiApiKeyPresent ? '✅' : '⚠️'} OPENAI_API_KEY: ${env.openaiApiKeyPresent ? 'Present' : 'Missing'} (${env.openaiKeyLength || 0} chars)`);
          addResult(env.supabaseServiceRolePresent ? 'success' : 'error', 
            `${env.supabaseServiceRolePresent ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY: ${env.supabaseServiceRolePresent ? 'Present' : 'Missing'}`);
        } else {
          addResult('warning', '⚠️ Environment information not available - using system-diagnostics for detailed API key status...');
          
          // Fallback to system-diagnostics for detailed environment check
          try {
            const { data: sysData, error: sysError } = await supabase.functions.invoke('system-diagnostics?operation=runware-diagnostic', {
              method: 'GET'
            });
            
            if (sysError) {
              addResult('warning', '⚠️ Could not retrieve detailed environment status', sysError);
            } else if (sysData?.environment) {
              addResult(sysData.environment.runware_api_key ? 'success' : 'error', 
                `${sysData.environment.runware_api_key ? '✅' : '❌'} RUNWARE_API_KEY: ${sysData.environment.runware_api_key ? 'Present' : 'Missing'}`);
              addResult(sysData.environment.supabase_service_key ? 'success' : 'error', 
                `${sysData.environment.supabase_service_key ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY: ${sysData.environment.supabase_service_key ? 'Present' : 'Missing'}`);
            }
          } catch (fallbackError) {
            addResult('warning', '⚠️ Fallback diagnostic check failed', fallbackError);
          }
        }
      }

      // Test 2: Template services health check
      addResult('warning', '🔐 Testing Runware template services...');
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
            addResult('success', `✅ ${service.name} - ${data.status} (Tier ${data.tier})`, data);
          } else {
            addResult('error', `❌ ${service.name} - HTTP ${response.status}`, { status: response.status });
          }
        } catch (err) {
          addResult('error', `❌ ${service.name} - Connection failed: ${err.message}`, err);
        }
      }

      // Test 3: Individual tier testing
      addResult('warning', '🎯 Testing individual image generation tiers...');
      
      // Test 3: AI Visual Scene Creator health
      addResult('warning', '🎯 Testing AI Visual Scene Creator...');
      try {
        // Try GET health check using proper Supabase client method
        const { data: healthData, error: getError } = await supabase.functions.invoke('ai-visual-scene-creator', {
          method: 'GET'
        });

        if (!getError && healthData) {
          addResult('success', `✅ AI Visual Scene Creator - ${healthData.status || 'healthy'} (Tier ${healthData.tier || 'N/A'})`, healthData);
        } else {
          // Fallback to POST health check if GET fails
          addResult('warning', '⚠️ GET health check failed, trying POST health check...');
          
          const { data: postHealthData, error: postError } = await supabase.functions.invoke('ai-visual-scene-creator', {
            body: { diagnostic: 'health_check' }
          });
          
          if (!postError && postHealthData) {
            addResult('success', `✅ AI Visual Scene Creator (POST) - ${postHealthData.status || 'healthy'}`, postHealthData);
          } else {
            addResult('warning', `⚠️ AI Visual Scene Creator - Health check inconclusive: ${getError?.message || postError?.message || 'Unknown issue'}`, { getError, postError });
          }
        }
      } catch (err) {
        addResult('error', `❌ AI Visual Scene Creator - Test failed: ${err.message}`, err);
      }

      addResult('success', '🎉 Diagnostic complete! Check results above for any issues.');
      
    } catch (error) {
      DebugLogger.error('performance', 'Diagnostic error', error);
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

  const runTier1SmokeTest = async () => {
    setIsChecking(true);
    
    try {
      addResult('warning', '🧪 Running Tier 1 smoke test (forced)...');
      
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: "A brave child explorer discovers a magical forest filled with glowing trees and friendly creatures.",
          sessionId: generateSessionIdWithPrefix('smoke-test'),
          pageNumber: 1,
          userInfo: {
            name: "TestChild",
            gradeLevel: "3",
            avatar: { type: "child", skinTone: "medium" }
          },
          forceTier: 1
        }
      });

      if (error) {
        addResult('error', `❌ Tier 1 smoke test failed: ${error.message}`, error);
      } else if (data?.success && data?.tier === 1) {
        addResult('success', `✅ Tier 1 smoke test passed - Generated ${data.provider} image`, data);
      } else {
        addResult('warning', `⚠️ Tier 1 smoke test returned unexpected result`, data);
      }
    } catch (error) {
      addResult('error', `❌ Tier 1 smoke test error: ${error.message}`, error);
    } finally {
      setIsChecking(false);
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
          <Button 
            onClick={runTier1SmokeTest} 
            disabled={isChecking}
            size="sm"
            variant="secondary"
            className="flex-1 min-w-[120px]"
          >
            {isChecking ? 'Testing...' : 'Tier 1 Smoke Test'}
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