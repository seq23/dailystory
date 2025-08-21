import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const InfrastructureDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResult('');
    
    try {
      console.log('🔍 Running infrastructure diagnostic...');
      
      const { data, error } = await supabase.functions.invoke('debug-ai-enhancer');
      
      if (error) {
        setResult(`❌ Diagnostic failed: ${error.message}`);
        return;
      }
      
      if (data?.success) {
        setResult(`✅ Infrastructure diagnostic completed successfully
Environment: OpenAI ${data.environment.openAIConfigured ? '✅' : '❌'}, Supabase ${data.environment.supabaseConfigured ? '✅' : '❌'}
Timestamp: ${data.timestamp}`);
      } else {
        setResult(`⚠️ Diagnostic completed with issues: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResult(`❌ Test failed: ${error.message}`);
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