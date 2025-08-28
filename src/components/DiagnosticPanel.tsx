import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosticTool } from '@/utils/diagnostics';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import type { UserInfo } from '@/types';

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
      console.log('🔍 Running full diagnostic...');
      await DiagnosticTool.runFullDiagnostic();
      setResults(prev => [...prev, '✅ Full diagnostic completed']);

      // Test 2: Direct story generation
      console.log('🔍 Testing direct story generation...');
      const storyResult = await NetflixStyleStoryService.generateCompleteStory(userInfo);
      setResults(prev => [...prev, `📖 Story generation result: ${storyResult.content.length} pages`]);
      setResults(prev => [...prev, `📝 First page: ${storyResult.content[0]?.substring(0, 100)}...`]);

    } catch (error) {
      console.error('Diagnostic failed:', error);
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