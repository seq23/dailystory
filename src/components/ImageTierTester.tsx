import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { Sparkles, Zap, Network, Search, Camera, RefreshCw } from 'lucide-react';

interface TestResult {
  tier: string;
  success: boolean;
  imageURL?: string;
  details: {
    processingTime?: number;
    requestId?: string;
    error?: string;
    // AI Scene Creator specific
    sceneGenerationOnly?: boolean;
    primaryScene?: string;
    aiSchema?: any;
    setting?: string;
    action?: string;
    mood?: string;
    pose?: string;
    // Routing specific
    realRoutingFlow?: boolean;
    fallbackReason?: string;
    routingCascade?: string[];
    avatarAnalysis?: {
      completeness: number;
      presentFields: string[];
      missingFields: string[];
      isComplete: boolean;
    };
    // Force Tier specific
    fullPromptFlow?: boolean;
    forcedTier?: string;
    routingMetadata?: any;
    tier?: string;
    enhancementLevel?: string;
    provider?: string;
    templateComplexity?: string;
    // Connectivity specific
    successfulConnections?: number;
    totalEndpoints?: number;
    endpointResults?: any[];
  };
}

export const ImageTierTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testStoryText, setTestStoryText] = useState(
    "Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies."
  );

  // Mock user info for testing - intentionally incomplete for fallback testing
  const mockUserInfo = {
    name: 'Emma',
    age: 8,
    // Missing: culturalProfile, nativeLanguage - this will trigger 2.5C routing
  };

  // Test AI Scene Creator (scene generation only, no image)
  const testAISceneCreator = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🎬 Testing AI Scene Creator only (no image generation)', {
        storyText: testStoryText.substring(0, 100)
      });

      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: {
          storyText: testStoryText,
          userInfo: mockUserInfo,
          pageNumber: 1,
          sessionId: crypto.randomUUID()
        }
      });

      const processingTime = Date.now() - startTime;
      
      DebugLogger.log('image', '✅ AI Scene Creator test completed', {
        success: response.data?.success,
        processingTime,
        hasAiSchema: !!response.data?.aiSchema
      });

      setResults([{
        tier: 'ai-scene-creator',
        success: !response.error && response.data?.success,
        imageURL: null, // No image generation - scene only
        details: {
          processingTime,
          requestId: response.data?.requestId,
          aiSchema: response.data?.aiSchema,
          primaryScene: response.data?.aiSchema?.primaryScene,
          setting: response.data?.aiSchema?.setting,
          action: response.data?.aiSchema?.action,
          mood: response.data?.aiSchema?.mood,
          pose: response.data?.aiSchema?.pose,
          sceneGenerationOnly: true,
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ AI Scene Creator test failed', { error });
      setResults([{
        tier: 'ai-scene-creator-error',
        success: false,
        imageURL: null,
        details: { error: error.message, sceneGenerationOnly: true }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Force Tier 1 (Full Prompt) - Complete Tier 1 flow with photo
  const forceTier1FullPrompt = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🎯 Forcing complete Tier 1 flow (AI scene + image generation)', {
        forceTier: 'tier-1'
      });

      const startTime = Date.now();
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText: testStoryText,
          userInfo: mockUserInfo,
          pageNumber: 1,
          sessionId: crypto.randomUUID(),
          forceTier: 'tier-1' // Force complete Tier 1 flow
        }
      });

      const processingTime = Date.now() - startTime;
      
      DebugLogger.log('image', '✅ Force Tier 1 (Full Prompt) completed', {
        success: response.data?.success,
        processingTime,
        tier: response.data?.tier,
        hasImage: !!response.data?.imageURL
      });

      setResults([{
        tier: 'tier-1-full',
        success: !response.error && response.data?.success,
        imageURL: response.data?.imageURL,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          tier: response.data?.tier,
          enhancementLevel: response.data?.enhancementLevel,
          provider: response.data?.provider,
          forcedTier: 'tier-1',
          fullPromptFlow: true,
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Force Tier 1 (Full Prompt) failed', { error });
      setResults([{
        tier: 'tier-1-full-error',
        success: false,
        imageURL: null,
        details: { error: error.message, forcedTier: 'tier-1', fullPromptFlow: true }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug Real Routing - Shows actual orchestration flow with detailed fallback reasons
  const debugRealRouting = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🔍 Testing real routing with current user data', {
        userInfo: mockUserInfo
      });

      const startTime = Date.now();
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText: testStoryText,
          userInfo: mockUserInfo,
          pageNumber: 1,
          sessionId: crypto.randomUUID()
        }
      });

      const processingTime = Date.now() - startTime;
      
      DebugLogger.log('image', '✅ Real routing test completed', {
        success: response.data?.success,
        processingTime,
        tier: response.data?.tier,
        routingMetadata: response.data?.routingMetadata
      });

      // Analyze avatar completeness for detailed feedback
      const avatarAnalysis = analyzeAvatarCompleteness(mockUserInfo);

      setResults([{
        tier: response.data?.tier || 'unknown',
        success: !response.error && response.data?.success,
        imageURL: response.data?.imageURL,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          routingMetadata: response.data?.routingMetadata,
          avatarAnalysis,
          routingCascade: generateRoutingCascade(response.data?.routingMetadata, avatarAnalysis),
          fallbackReason: generateFallbackReason(response.data?.routingMetadata, avatarAnalysis),
          realRoutingFlow: true,
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Real routing test failed', { error });
      setResults([{
        tier: 'routing-error',
        success: false,
        imageURL: null,
        details: { error: error.message, realRoutingFlow: true }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for enhanced routing analysis
  const analyzeAvatarCompleteness = (userInfo: any) => {
    const requiredFields = ['name', 'culturalProfile', 'nativeLanguage', 'age', 'skinTone', 'hairColor'];
    const presentFields = requiredFields.filter(field => userInfo?.[field] && userInfo[field].toString().trim().length > 0);
    const missingFields = requiredFields.filter(field => !userInfo?.[field] || userInfo[field].toString().trim().length === 0);
    
    return {
      completeness: presentFields.length / requiredFields.length,
      presentFields,
      missingFields,
      isComplete: missingFields.length === 0
    };
  };

  const generateRoutingCascade = (routingMetadata: any, avatarAnalysis: any) => {
    const cascade = [];
    
    if (avatarAnalysis.completeness >= 0.8) {
      cascade.push('✅ Avatar Complete → Attempted Tier 1');
      cascade.push('✅ High Quality Data → Considered Tier 2.5A/2.5B');
    } else {
      cascade.push('❌ Avatar Incomplete → Skipped Tier 1');
      cascade.push('❌ Insufficient Data → Skipped Tier 2.5A/2.5B');
      cascade.push('✅ Fallback Logic → Routed to Tier 2.5C/2.5D');
    }
    
    if (routingMetadata?.executedTier) {
      cascade.push(`🎯 Final Route → Tier ${routingMetadata.executedTier}`);
    }
    
    return cascade;
  };

  const generateFallbackReason = (routingMetadata: any, avatarAnalysis: any) => {
    if (avatarAnalysis.missingFields.length > 0) {
      return `Avatar incomplete (missing: ${avatarAnalysis.missingFields.join(', ')})`;
    }
    
    if (routingMetadata?.fallbackReason) {
      return routingMetadata.fallbackReason;
    }
    
    return 'Standard routing applied';
  };

  // Force specific tier tests
  const forceTier = async (tier: string) => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', `🎯 Forcing tier ${tier}`, { tier });

      const startTime = Date.now();
      
      // Determine function based on tier
      const functionMap: { [key: string]: string } = {
        '2.5A': 'runware-template-ab',
        '2.5B': 'runware-template-ab', 
        '2.5C': 'runware-template-cd',
        '2.5D': 'runware-template-cd'
      };

      const templateMap: { [key: string]: string } = {
        '2.5A': 'A',
        '2.5B': 'B',
        '2.5C': 'C', 
        '2.5D': 'D'
      };

      const response = await supabase.functions.invoke(functionMap[tier], {
        body: {
          storyText: testStoryText,
          userInfo: mockUserInfo,
          templateComplexity: templateMap[tier],
          pageNumber: 1,
          sessionId: crypto.randomUUID()
        }
      });

      const processingTime = Date.now() - startTime;
      
      DebugLogger.log('image', `✅ Force Tier ${tier} completed`, {
        success: response.data?.success,
        processingTime,
        hasImage: !!response.data?.imageURL
      });

      setResults([{
        tier: `tier-${tier}-forced`,
        success: !response.error && response.data?.success,
        imageURL: response.data?.imageURL,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          tier: response.data?.tier,
          templateComplexity: templateMap[tier],
          forcedTier: tier,
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', `❌ Force Tier ${tier} failed`, { error });
      setResults([{
        tier: `tier-${tier}-error`,
        success: false,
        imageURL: null,
        details: { error: error.message, forcedTier: tier }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connectivity
  const testConnectivity = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🌐 Testing connectivity to all endpoints');
      
      const endpoints = [
        'ai-visual-scene-creator',
        'runware-generate-image', 
        'runware-template-ab',
        'runware-template-cd'
      ];

      const startTime = Date.now();
      const connectivityResults = await Promise.allSettled(
        endpoints.map(async endpoint => {
          try {
            const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'}`
              }
            });
            return { endpoint, success: true, status: response.status };
          } catch (error) {
            return { endpoint, success: false, error: error.message };
          }
        })
      );

      const processingTime = Date.now() - startTime;
      const successfulConnections = connectivityResults.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      setResults([{
        tier: 'connectivity-test',
        success: successfulConnections > 0,
        imageURL: null,
        details: {
          processingTime,
          successfulConnections,
          totalEndpoints: endpoints.length,
          endpointResults: connectivityResults.map(result => 
            result.status === 'fulfilled' ? result.value : { error: result.reason }
          )
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Connectivity test failed', { error });
      setResults([{
        tier: 'connectivity-error',
        success: false,
        imageURL: null,
        details: { error: error.message }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Tier Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Story Text</label>
            <Textarea
              value={testStoryText}
              onChange={(e) => setTestStoryText(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter story text for testing..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={testAISceneCreator}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Test AI Scene Creator
            </Button>
            
            <Button
              onClick={forceTier1FullPrompt}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary"
            >
              <Camera className="h-4 w-4" />
              Force Tier 1 (Full Prompt)
            </Button>
            
            <Button
              onClick={debugRealRouting}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Debug Real Routing
            </Button>
            
            <Button
              onClick={() => forceTier('2.5A')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5A
            </Button>
            
            <Button
              onClick={() => forceTier('2.5B')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5B
            </Button>
            
            <Button
              onClick={() => forceTier('2.5C')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5C
            </Button>
            
            <Button
              onClick={() => forceTier('2.5D')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5D
            </Button>
            
            <Button
              onClick={testConnectivity}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              Test Connectivity
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Running test...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.tier}</span>
                      <span className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.success ? "✅" : "❌"}
                      </span>
                    </div>
                    {result.details.processingTime && (
                      <span className="text-sm text-muted-foreground">
                        {result.details.processingTime}ms
                      </span>
                    )}
                  </div>

                  {result.imageURL && (
                    <div className="mb-4">
                      <img 
                        src={result.imageURL} 
                        alt="Generated test image" 
                        className="max-w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {result.details.requestId && (
                      <div className="text-sm">
                        <span className="font-medium">Request ID:</span> {result.details.requestId}
                      </div>
                    )}
                    
                    {/* Enhanced AI Scene Creator Details */}
                    {result.details.sceneGenerationOnly && (
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">Scene Generation Only (No Image)</span>
                      </div>
                    )}
                    {result.details.primaryScene && (
                      <div className="text-sm">
                        <span className="font-medium">Primary Scene:</span>
                        <div className="text-xs mt-1 bg-blue-50 p-2 rounded">{result.details.primaryScene}</div>
                      </div>
                    )}
                    {result.details.aiSchema && (
                      <div className="text-sm">
                        <span className="font-medium">AI Schema Details:</span>
                        <div className="text-xs mt-1 space-y-1">
                          {result.details.setting && <div><strong>Setting:</strong> {result.details.setting}</div>}
                          {result.details.action && <div><strong>Action:</strong> {result.details.action}</div>}
                          {result.details.mood && <div><strong>Mood:</strong> {result.details.mood}</div>}
                          {result.details.pose && <div><strong>Pose:</strong> {result.details.pose}</div>}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Routing Analysis */}
                    {result.details.realRoutingFlow && (
                      <div className="text-sm">
                        <span className="font-medium text-purple-600">Real Routing Analysis</span>
                      </div>
                    )}
                    {result.details.fallbackReason && (
                      <div className="text-sm">
                        <span className="font-medium">Fallback Reason:</span>
                        <div className="text-xs mt-1 bg-yellow-50 p-2 rounded text-yellow-800">{result.details.fallbackReason}</div>
                      </div>
                    )}
                    {result.details.routingCascade && (
                      <div className="text-sm">
                        <span className="font-medium">Routing Cascade:</span>
                        <div className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          {result.details.routingCascade.map((step: string, index: number) => (
                            <div key={index} className="mb-1">{step}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.details.avatarAnalysis && (
                      <div className="text-sm">
                        <span className="font-medium">Avatar Completeness:</span>
                        <div className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          <div>Score: {Math.round(result.details.avatarAnalysis.completeness * 100)}%</div>
                          <div>Present: {result.details.avatarAnalysis.presentFields.join(', ')}</div>
                          {result.details.avatarAnalysis.missingFields.length > 0 && (
                            <div className="text-red-600">Missing: {result.details.avatarAnalysis.missingFields.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Forced Tier Indicator */}
                    {result.details.fullPromptFlow && (
                      <div className="text-sm">
                        <span className="font-medium text-green-600">Complete Tier 1 Flow (Forced)</span>
                      </div>
                    )}
                    
                    {result.details.routingMetadata && !result.details.realRoutingFlow && (
                      <div className="text-sm">
                        <span className="font-medium">Routing Metadata:</span>
                        <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details.routingMetadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.details.error && (
                      <div className="text-sm">
                        <span className="font-medium text-red-600">Error:</span>
                        <div className="text-red-600 text-xs mt-1">{result.details.error}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};