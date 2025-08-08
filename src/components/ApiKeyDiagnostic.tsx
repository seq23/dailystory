import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const ApiKeyDiagnostic: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<string>('');

  const checkApiKey = async () => {
    setIsChecking(true);
    setResult('');
    
    try {
      console.log('🔍 Testing OpenAI API key configuration...');
      
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: { test: true }
      });
      
      console.log('API Key Test Result:', { data, error });
      
      if (error) {
        if (error.message?.includes('OPENAI_API_KEY')) {
          setResult('❌ OpenAI API key is NOT configured in Supabase secrets');
        } else {
          setResult(`❌ API Error: ${error.message}`);
        }
      } else {
        setResult('✅ OpenAI API key is properly configured');
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔑 API Key Diagnostic</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={checkApiKey} 
          disabled={isChecking}
          size="sm"
          className="w-full mb-2"
        >
          {isChecking ? 'Checking...' : 'Test API Key'}
        </Button>
        {result && (
          <div className="text-xs p-2 bg-muted rounded">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};