import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { Sparkles, Zap, Network, Search, Camera, RefreshCw, RotateCcw } from 'lucide-react';

interface TestResult {
  tier: string;
  success: boolean;
  imageURL?: string;
  details: {
    processingTime?: number;
    requestId?: string;
    error?: string;
    testType?: 'REAL' | 'FORCED' | 'CONNECTIVITY'; // Add test type
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
    endpointResults?: Array<{
      endpoint: string;
      success: boolean;
      status?: number;
      statusText?: string;
      error?: string;
      responseTime?: number;
      humanReadableReason?: string;
    }>;
  };
}

export const ImageTierTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testStoryText, setTestStoryText] = useState(
    "Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies."
  );

  // User Info Section - Editable fields
  const [userName, setUserName] = useState('Emma');
  const [userAge, setUserAge] = useState('8');
  const [avatarType, setAvatarType] = useState('girl');
  const [skinTone, setSkinTone] = useState('light');
  const [nativeLanguage, setNativeLanguage] = useState('en');

  // Build dynamic user info from form inputs
  const buildUserInfo = () => ({
    name: userName,
    age: parseInt(userAge) || 8,
    userName: userName,
    avatar: {
      type: avatarType,
      skinTone: skinTone
    },
    nativeLanguage: nativeLanguage,
    // Conditionally add culturalProfile for completeness
    culturalProfile: nativeLanguage !== 'en' ? nativeLanguage : undefined
  });

  // Reset function to clear results and set defaults
  const resetTester = () => {
    setResults([]);
    setTestStoryText("Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies.");
    setUserName('Emma');
    setUserAge('8');
    setAvatarType('girl');
    setSkinTone('light');
    setNativeLanguage('en');
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
          userInfo: buildUserInfo(),
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
          testType: 'REAL', // This is a real test
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ AI Scene Creator test failed', { error });
      setResults([{
        tier: 'ai-scene-creator-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          sceneGenerationOnly: true,
          testType: 'REAL'
        }
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
          userInfo: buildUserInfo(),
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
          testType: 'FORCED', // This is a forced test
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Force Tier 1 (Full Prompt) failed', { error });
      setResults([{
        tier: 'tier-1-full-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          forcedTier: 'tier-1', 
          fullPromptFlow: true,
          testType: 'FORCED'
        }
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
        userInfo: buildUserInfo()
      });

      const startTime = Date.now();
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText: testStoryText,
          userInfo: buildUserInfo(),
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
      const currentUserInfo = buildUserInfo();
      const avatarAnalysis = analyzeAvatarCompleteness(currentUserInfo);

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
          testType: 'REAL', // This is a real routing test
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Real routing test failed', { error });
      setResults([{
        tier: 'routing-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          realRoutingFlow: true,
          testType: 'REAL'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for enhanced routing analysis
  const analyzeAvatarCompleteness = (userInfo: any) => {
    const requiredFields = ['name', 'culturalProfile', 'nativeLanguage', 'age'];
    const avatarFields = ['avatar.type', 'avatar.skinTone'];
    
    // Check nested avatar fields
    const flatUserInfo = {
      ...userInfo,
      'avatar.type': userInfo?.avatar?.type,
      'avatar.skinTone': userInfo?.avatar?.skinTone
    };
    
    const allFields = [...requiredFields, ...avatarFields];
    const presentFields = allFields.filter(field => {
      const value = field.includes('.') ? flatUserInfo[field] : userInfo?.[field];
      return value && value.toString().trim().length > 0;
    });
    const missingFields = allFields.filter(field => {
      const value = field.includes('.') ? flatUserInfo[field] : userInfo?.[field];
      return !value || value.toString().trim().length === 0;
    });
    
    return {
      completeness: presentFields.length / allFields.length,
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
          userInfo: buildUserInfo(),
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
          testType: 'FORCED', // This is a forced tier test
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', `❌ Force Tier ${tier} failed`, { error });
      setResults([{
        tier: `tier-${tier}-error`,
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          forcedTier: tier,
          testType: 'FORCED'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Comprehensive connectivity test for all 4 endpoints
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
          const endpointStartTime = Date.now();
          try {
            const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
              }
            });
            
            const responseTime = Date.now() - endpointStartTime;
            let humanReadableReason = '';
            
            if (response.status === 200) {
              humanReadableReason = 'Function is healthy and responding';
            } else if (response.status === 404) {
              humanReadableReason = 'Function not found - may not be deployed';
            } else if (response.status === 503) {
              humanReadableReason = 'Service unavailable - function may be starting up';
            } else if (response.status === 500) {
              humanReadableReason = 'Internal server error - function has issues';
            } else {
              humanReadableReason = `Unexpected status: ${response.status}`;
            }
            
            return { 
              endpoint, 
              success: response.ok, 
              status: response.status,
              statusText: response.statusText,
              responseTime,
              humanReadableReason
            };
          } catch (error) {
            const responseTime = Date.now() - endpointStartTime;
            let humanReadableReason = '';
            
            if (error.message.includes('Failed to fetch')) {
              humanReadableReason = 'Network error - endpoint unreachable';
            } else if (error.message.includes('timeout')) {
              humanReadableReason = 'Request timeout - function taking too long';
            } else {
              humanReadableReason = `Connection failed: ${error.message}`;
            }
            
            return { 
              endpoint, 
              success: false, 
              error: error.message,
              responseTime,
              humanReadableReason
            };
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
          testType: 'CONNECTIVITY', // Special test type
          endpointResults: connectivityResults.map(result => 
            result.status === 'fulfilled' ? result.value : { 
              endpoint: 'unknown', 
              success: false, 
              error: result.reason?.message || 'Unknown error',
              humanReadableReason: 'Test execution failed'
            }
          )
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Connectivity test failed', { error });
      setResults([{
        tier: 'connectivity-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message,
          testType: 'CONNECTIVITY'
        }
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
          {/* User Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                👤 Prompt & User Info
                <Button
                  onClick={resetTester}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Child's name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Age</label>
                <Input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="Age"
                  min="3"
                  max="17"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar Type</label>
                <Select value={avatarType} onValueChange={setAvatarType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">Boy</SelectItem>
                    <SelectItem value="girl">Girl</SelectItem>
                    <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Tone</label>
                <Select value={skinTone} onValueChange={setSkinTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pale">Pale</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="olive">Olive</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Native Language</label>
                <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                      {/* Test Type Badge */}
                      {result.details.testType && (
                        <Badge variant={
                          result.details.testType === 'REAL' ? 'default' :
                          result.details.testType === 'FORCED' ? 'secondary' :
                          result.details.testType === 'CONNECTIVITY' ? 'outline' : 'default'
                        }>
                          {result.details.testType}
                        </Badge>
                      )}
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
                    
                    {/* Enhanced Connectivity Results */}
                    {result.details.testType === 'CONNECTIVITY' && result.details.endpointResults && (
                      <div className="text-sm">
                        <span className="font-medium">Endpoint Status Details:</span>
                        <div className="text-xs mt-2 space-y-2">
                          {result.details.endpointResults.map((endpoint: any, idx: number) => (
                            <div key={idx} className="border rounded p-2 bg-gray-50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-blue-600">{endpoint.endpoint}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant={endpoint.success ? 'default' : 'destructive'}>
                                    {endpoint.success ? 'HEALTHY' : 'FAILED'}
                                  </Badge>
                                  {endpoint.responseTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {endpoint.responseTime}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                              {endpoint.status && (
                                <div className="text-xs">
                                  <strong>HTTP Status:</strong> {endpoint.status} {endpoint.statusText}
                                </div>
                              )}
                              <div className="text-xs">
                                <strong>Status:</strong> {endpoint.humanReadableReason}
                              </div>
                              {endpoint.error && (
                                <div className="text-xs text-red-600">
                                  <strong>Error:</strong> {endpoint.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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