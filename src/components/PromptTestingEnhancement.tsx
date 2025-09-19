import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { DebugLogger } from '@/services/DebugLogger';

export function PromptTestingEnhancement() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEnhancedPrompts = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      // Test with a simple story to verify PhaseIntegrationOrchestrator is working
      const testStory = "Emma played with her favorite blue ball in the sunny garden";
      const testUser = {
        name: 'Emma',
        age: 7,
        avatar: { type: 'girl', skinTone: 'medium' },
        nativeLanguage: 'en',
        difficulty: 'medium',
        favoriteColor: 'blue',
        favoriteAnimal: 'butterfly',
        favoriteFood: 'cookies'
      };

      DebugLogger.log('performance', 'Testing PhaseIntegrationOrchestrator in dryRun mode...');
      
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText: testStory, // Fixed: use 'storyText' instead of 'pageText'
          enhancedStoryData: { // Fixed: provide 'enhancedStoryData' structure
            userInfo: testUser,
            pageNumber: 1,
            sessionId: 'template-test-' + Date.now()
          },
          dryRun: true // This will now use PhaseIntegrationOrchestrator
        }
      });

      DebugLogger.log('performance', 'DryRun test response:', response);
      
      if (response.data?.success) {
        setTestResult({
          success: true,
          originalPrompt: response.data.metadata?.originalPrompt,
          enhancedPrompt: response.data.metadata?.enhancedPrompt,
          templateStructure: response.data.metadata?.templateStructure,
          characterConsistency: response.data.metadata?.characterConsistency,
          visualConsistency: response.data.metadata?.visualConsistency,
          promptLengths: response.data.metadata?.promptLengths
        });
      } else if (response.error?.code === 'IMPORT_SYNC_ANOMALY' && retryCount < 2) {
        // Retry for sync anomalies during cold starts
        DebugLogger.log('performance', `Import sync anomaly detected, retrying... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return testEnhancedPrompts(retryCount + 1);
      } else {
        setTestResult({
          success: false,
          error: response.error?.message || 'Test failed'
        });
      }
    } catch (error) {
      console.error('❌ Template test failed:', error);
      if (error.message?.includes('IMPORT_SYNC_ANOMALY') && retryCount < 2) {
        // Retry for sync anomalies during cold starts
        DebugLogger.log('performance', `Import sync anomaly detected in catch, retrying... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return testEnhancedPrompts(retryCount + 1);
      }
      setTestResult({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>Enhanced Prompt Testing (PhaseIntegrationOrchestrator)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
        <Button 
          onClick={() => testEnhancedPrompts()} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
            {isLoading ? 'Testing...' : 'Test Enhanced Prompts'}
          </Button>
          <Badge variant="outline">
            Tests template fixes in dryRun mode
          </Badge>
        </div>

        {testResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                {testResult.success ? 'Template fixes are active!' : 'Template fixes failed'}
              </span>
            </div>

            {testResult.success && (
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Original Prompt:</strong>
                  <div className="bg-muted p-2 rounded mt-1">
                    {testResult.originalPrompt}
                  </div>
                </div>
                
                <div>
                  <strong>Enhanced Prompt:</strong>
                  <div className="bg-muted p-2 rounded mt-1">
                    {testResult.enhancedPrompt}
                  </div>
                </div>

                {testResult.templateStructure && (
                  <div>
                    <strong>Template Structure:</strong>
                    <Badge className="ml-2">{testResult.templateStructure}</Badge>
                  </div>
                )}

                {testResult.characterConsistency && (
                  <div>
                    <strong>Character Consistency:</strong>
                    <div className="bg-muted p-2 rounded mt-1 text-xs">
                      {testResult.characterConsistency.substring(0, 200)}...
                    </div>
                  </div>
                )}

                {testResult.visualConsistency && (
                  <div>
                    <strong>Visual Consistency:</strong>
                    <div className="bg-muted p-2 rounded mt-1 text-xs">
                      {testResult.visualConsistency.substring(0, 200)}...
                    </div>
                  </div>
                )}

                {testResult.promptLengths && (
                  <div>
                    <strong>Prompt Lengths:</strong>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                      <div>Original: {testResult.promptLengths.original}</div>
                      <div>Enhanced: {testResult.promptLengths.enhanced}</div>
                      <div>Negative: {testResult.promptLengths.negative}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!testResult.success && testResult.error && (
              <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                <strong>Error:</strong> {testResult.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}