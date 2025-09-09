import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const ImageDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');

  const testTier1 = async () => {
    setIsRunning(true);
    setResult('Testing Tier 1 (runware-generate-image)...\n');
    
    try {
      console.log('🔍 Testing Tier 1 function...');
      
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: "A blue dog runs in the park",
          userInfo: { name: "Test", difficulty: "medium", avatar: "neutral" },
          sessionId: "test-session"
        }
      });
      
      if (error) {
        setResult(prev => prev + `❌ Tier 1 failed: ${error.message}\n`);
      } else {
        setResult(prev => prev + `✅ Tier 1 responded: ${JSON.stringify(data, null, 2)}\n`);
      }
    } catch (error) {
      console.error('Tier 1 test error:', error);
      setResult(prev => prev + `❌ Tier 1 test failed: ${error.message}\n`);
    }
    
    setIsRunning(false);
  };

  const testTier2_5 = async () => {
    setIsRunning(true);
    setResult('Testing Tier 2.5 (runware-simple-fallback)...\n');
    
    try {
      console.log('🔍 Testing Tier 2.5 function...');
      
      const { data, error } = await supabase.functions.invoke('runware-simple-fallback', {
        body: {
          pageText: "A blue dog runs in the park",
          userInfo: { name: "Test", difficulty: "medium", avatar: "neutral" },
          sessionId: "test-session"
        }
      });
      
      if (error) {
        setResult(prev => prev + `❌ Tier 2.5 failed: ${error.message}\n`);
      } else {
        setResult(prev => prev + `✅ Tier 2.5 responded: ${JSON.stringify(data, null, 2)}\n`);
      }
    } catch (error) {
      console.error('Tier 2.5 test error:', error);
      setResult(prev => prev + `❌ Tier 2.5 test failed: ${error.message}\n`);
    }
    
    setIsRunning(false);
  };

  const testBoth = async () => {
    setIsRunning(true);
    setResult('Testing both image generation functions...\n');
    
    await testTier1();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testTier2_5();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🖼️ Image Function Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button 
            onClick={testTier1} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            Test Tier 1
          </Button>
          <Button 
            onClick={testTier2_5} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            Test Tier 2.5
          </Button>
          <Button 
            onClick={testBoth} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Testing...' : 'Test Both Functions'}
          </Button>
        </div>
        {result && (
          <div className="text-xs p-3 bg-muted rounded font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};