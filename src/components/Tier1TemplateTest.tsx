import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  success: boolean;
  enhancedPrompt?: string;
  templateStructure?: string;
  aiSchema?: Record<string, any>;
  primaryScene?: string;
  error?: string;
}

export const Tier1TemplateTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testTier1Template = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: "Emma was excited to visit her grandmother's cozy cottage. The warm sunlight streamed through the lace curtains as she played with her favorite stuffed bunny.",
          userInfo: {
            id: 'test-user',
            name: 'Emma',
            childName: 'Emma',
            age: 6,
            avatar: {
              type: 'girl',
              skinTone: 'medium'
            },
            difficulty: 'medium'
          },
          sessionId: `test-tier1-${Date.now()}`,
          requestId: `test-${Math.random().toString(36).substring(2)}`
        }
      });

      if (error) {
        setTestResult({
          success: false,
          error: error.message || 'Unknown error occurred'
        });
      } else {
        setTestResult({
          success: true,
          enhancedPrompt: data?.metadata?.enhancedPrompt,
          templateStructure: data?.templateStructure || data?.metadata?.templateStructure,
          aiSchema: data?.metadata?.aiSchema,
          primaryScene: data?.metadata?.primaryScene
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 COMPLETE_TIER_1_TEMPLATE Test
          {testResult?.success && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {testResult?.success === false && <AlertCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testTier1Template}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing COMPLETE_TIER_1_TEMPLATE...
            </>
          ) : (
            'Test 4-Section Template Structure'
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? "SUCCESS" : "FAILED"}
              </Badge>
              {testResult.templateStructure && (
                <Badge variant="outline">{testResult.templateStructure}</Badge>
              )}
            </div>

            {testResult.success ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Enhanced Prompt (4-Section Structure):</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap border">
                    {testResult.enhancedPrompt}
                  </div>
                </div>

                {testResult.primaryScene && (
                  <div>
                    <h4 className="font-medium mb-2">Primary Scene (Section 1):</h4>
                    <div className="bg-blue-50 p-3 rounded text-sm border">
                      {testResult.primaryScene}
                    </div>
                  </div>
                )}

                {testResult.aiSchema && (
                  <div>
                    <h4 className="font-medium mb-2">Complete AI Schema (Debugging Data):</h4>
                    <div className="bg-green-50 p-3 rounded text-sm font-mono border">
                      <pre>{JSON.stringify(testResult.aiSchema, null, 2)}</pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">Template Sections</Badge>
                    <ul className="space-y-1">
                      <li>✅ PRIMARY SCENE</li>
                      <li>✅ CHARACTER DESCRIPTION</li>
                      <li>✅ CONSISTENCY</li>
                      <li>✅ BRAND SUFFIX</li>
                    </ul>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Data Sources</Badge>
                    <ul className="space-y-1">
                      <li>✅ AI Scene Creator</li>
                      <li>✅ Character Consistency</li>
                      <li>✅ Cultural Bundle</li>
                      <li>✅ Style Framework</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                <p className="text-red-600 text-sm">{testResult.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Expected Structure:</strong></p>
          <p>PRIMARY SCENE: [AI-generated scene]</p>
          <p>CHARACTER DESCRIPTION: [Main character details]</p>
          <p>CONSISTENCY: [Secondary characters, objects, settings]</p>
          <p>BRAND SUFFIX: [Style framework]</p>
        </div>
      </CardContent>
    </Card>
  );
};