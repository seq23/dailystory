import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosticTool } from '@/utils/diagnostics';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { supabase } from '@/integrations/supabase/client';
import type { UserInfo } from '@/types';
import { DebugLogger } from '@/services/DebugLogger';

interface DiagnosticPanelProps {
  userInfo: UserInfo;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ userInfo }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      // Test 1: Full diagnostic
      DebugLogger.log('performance', 'Running full diagnostic');
      await DiagnosticTool.runFullDiagnostic();
      setResults(prev => [...prev, '✅ Full diagnostic completed']);

      // Test 2: Template service accessibility  
      DebugLogger.log('performance', 'Testing template service');
      const { data: templateTest, error: templateError } = await supabase.functions.invoke('template-service', {
        body: { 
          explore: true,
          difficulty: 'beginner'
        }
      });
      
      if (templateError) {
        setResults(prev => [...prev, `⚠️ Template service error: ${templateError.message}`]);
      } else {
        setResults(prev => [...prev, `✅ Template service accessible: ${templateTest?.templates?.length || 0} templates`]);
      }

    } catch (error) {
      DebugLogger.error('performance', 'Diagnostic failed', error);
      setResults(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 API Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
        </Button>
        
        {results.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="text-sm mb-1">
                {result}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
};