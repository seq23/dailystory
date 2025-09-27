import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

export const InfrastructureDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResult('');
    
    try {
      DebugLogger.log('performance', 'Running infrastructure diagnostic');
      
      // Test the main image orchestrator function health with version check
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        method: 'GET'
      });
      
      if (error) {
        setResult(`❌ Infrastructure diagnostic failed: ${error.message}\nNote: This might indicate a stale deployment being tested.`);
        return;
      }
      
      if (data?.status === 'healthy') {
        const env = data.environment || {};
        const timestamp = new Date(data.timestamp);
        const timeDiff = Date.now() - timestamp.getTime();
        const isRecent = timeDiff < 300000; // 5 minutes
        
        setResult(`✅ Infrastructure diagnostic completed successfully
Environment: OpenAI ${env.openaiApiKeyPresent ? '✅' : '❌'}, Runware ${env.runwareApiKeyPresent ? '✅' : '❌'}, Supabase ${env.supabaseServiceRolePresent ? '✅' : '❌'}
Service: ${data.service} | Timestamp: ${data.timestamp}
Deployment Status: ${isRecent ? '🟢 Current' : '🟡 May be stale'} (${Math.round(timeDiff/1000)}s ago)`);
      } else {
        setResult(`⚠️ Infrastructure check completed with issues: ${data?.message || 'Service not healthy'}`);
      }
    } catch (error) {
      DebugLogger.error('performance', 'Diagnostic error', error);
      setResult(`❌ Infrastructure test failed: ${error.message}\nTip: Check if functions are properly deployed and not using stale cached versions.`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔧 Infrastructure Diagnostic</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          size="sm"
          className="w-full mb-2"
        >
          {isRunning ? 'Running Diagnostic...' : 'Run Infrastructure Test'}
        </Button>
        {result && (
          <div className="text-xs p-2 bg-muted rounded whitespace-pre-line">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};