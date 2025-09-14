import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Zap, Settings, Target, Layers, ArrowRight, AlertTriangle, Bug } from 'lucide-react';
import type { SkinTone, AvatarType, LanguageCode } from '@/types';

interface TierTestResult {
  tier: string;
  success: boolean;
  imageUrl?: string;
  processingTime: number;
  error?: string;
  metadata?: any;
  enhancementDetails?: any;
  templateComplexity?: string;
  routingMetadata?: {
    attemptedTier: string;
    executedTier: string;
    fallbackReason?: string;
    skippedTiers: string[];
    routingDecisions: string[];
    binaryValidation: string;
    avatarCompleteness: string;
    avatarIdentity?: {
      complete: boolean;
      missingFields: string[];
      provided: string[];
    };
  };
}

interface TestConfig {
  storyText: string;
  userName: string;
  characterName: string;
  age: number;
  sessionId: string;
  skinTone: SkinTone;
  avatarType: AvatarType;
  nativeLanguage: LanguageCode;
}

export function ImageTierTester() {
  const [config, setConfig] = useState<TestConfig>({
    storyText: 'Maya discovers a magical garden behind her school where flowers sing beautiful melodies and butterflies paint rainbows in the air.',
    userName: 'TestUser',
    characterName: 'Maya',
    age: 8,
    sessionId: `test-${Date.now()}`,
    skinTone: 'medium',
    avatarType: 'girl',
    nativeLanguage: 'en'
  });

  const [results, setResults] = useState<TierTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [connectivityStatus, setConnectivityStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [connectivityResult, setConnectivityResult] = useState<any>(null);

  const testConnectivity = async () => {
    const requestId = `REQ-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`🔍 [${requestId}] Starting connectivity diagnostics with GET health checks...`);
    
    setConnectivityStatus('testing');
    setConnectivityResult(null);
    
    try {
      const startTime = Date.now();
      
      const healthChecks = [
        { name: 'AI Visual Scene Creator', endpoint: 'ai-visual-scene-creator' },
        { name: 'Runware Image Orchestrator', endpoint: 'runware-generate-image' },
        { name: 'Runware Template AB', endpoint: 'runware-template-ab' },
        { name: 'Runware Template CD', endpoint: 'runware-template-cd' }
      ];

      console.log(`🔧 [${requestId}] Testing ${healthChecks.length} endpoints via GET...`);

      const results = await Promise.allSettled(
        healthChecks.map(async ({ name, endpoint }) => {
          try {
            console.log(`🩺 [${requestId}] GET health check: ${name} (${endpoint})`);
            
            const response = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${endpoint}`, {
              method: 'GET',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
              }
            });

            const data = await response.json();
            
            let statusDetail = '';
            let keyStatus = '';
            
            if (response.ok) {
              if (endpoint === 'ai-visual-scene-creator' && data.openaiApiKeyPresent !== undefined) {
                keyStatus = ` (OpenAI: ${data.openaiApiKeyPresent ? '✓' : '✗'})`;
              } else if (endpoint === 'runware-generate-image' && data.api_keys) {
                const openai = data.api_keys.openai_configured ? '✓' : '✗';
                const runware = data.api_keys.runware_configured ? '✓' : '✗';
                keyStatus = ` (OpenAI: ${openai}, Runware: ${runware})`;
              } else if ((endpoint === 'runware-template-ab' || endpoint === 'runware-template-cd') && data.runwareApiKeyPresent !== undefined) {
                keyStatus = ` (Runware: ${data.runwareApiKeyPresent ? '✓' : '✗'})`;
              }
              
              statusDetail = `healthy${keyStatus}`;
            } else {
              statusDetail = `non-2xx (${response.status})`;
            }
            
            console.log(`✅ [${requestId}] ${name}: ${statusDetail}`);
            
            return { 
              name, 
              endpoint, 
              status: 'success',
              reachable: true,
              statusDetail,
              result: response.ok ? data : { status: response.status, error: data },
              error: response.ok ? null : { message: `HTTP ${response.status}` }
            };
          } catch (error) {
            console.error(`❌ [${requestId}] ${name}: Health check failed`, {
              error: error instanceof Error ? error.message : 'Unknown error',
              endpoint
            });
            
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            
            return { 
              name, 
              endpoint, 
              status: 'failed',
              reachable: false,
              statusDetail: 'unreachable',
              result: null,
              error: { message: errorMsg }
            };
          }
        })
      );

      const processingTime = Date.now() - startTime;
      const reachable = results.filter(r => r.status === 'fulfilled' && r.value.reachable).length;
      const healthy = results.filter(r => r.status === 'fulfilled' && r.value.statusDetail.includes('healthy')).length;
      const total = results.length;
      
      const connectivityData = {
        healthChecks: results.map((result) => ({
          ...healthChecks[results.indexOf(result)],
          status: result.status === 'fulfilled' ? 'completed' : 'failed',
          result: result.status === 'fulfilled' ? result.value : { error: result.reason }
        })),
        summary: {
          total,
          reachable,
          healthy,
          unhealthy: reachable - healthy,
          unreachable: total - reachable,
          processingTime
        }
      };

      setConnectivityResult({
        data: connectivityData,
        error: null
      });

      if (reachable === total) {
        setConnectivityStatus('success');
      } else if (reachable > 0) {
        setConnectivityStatus('success');
      } else {
        setConnectivityStatus('failed');
      }
      
      const connectivityResultForList: TierTestResult = {
        tier: 'Connectivity Test',
        success: reachable > 0,
        imageUrl: undefined,
        processingTime,
        error: reachable === 0 ? 'All endpoints unreachable' : undefined,
        metadata: { healthy, reachable, total }
      };
      
      setResults(prev => [connectivityResultForList, ...prev]);
      return reachable > 0;
      
    } catch (err) {
      console.error('Connectivity test exception:', err);
      setConnectivityStatus('failed');
      setConnectivityResult({
        data: null,
        error: { message: err instanceof Error ? err.message : 'Unknown connectivity error' }
      });
      
      const connectivityResultForList: TierTestResult = {
        tier: 'Connectivity Test',
        success: false,
        imageUrl: undefined,
        processingTime: 0,
        error: err instanceof Error ? err.message : 'Unknown connectivity error'
      };
      
      setResults(prev => [connectivityResultForList, ...prev]);
      return false;
    }
  };

  const testTier = async (tierType: string, templateComplexity?: string): Promise<TierTestResult> => {
    const requestId = `REQ-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    
    try {
      console.log(`🧪 [${requestId}] Testing ${tierType}${templateComplexity ? ` (${templateComplexity})` : ''}`, {
        config,
        requestId,
        timestamp: new Date().toISOString()
      });
      
      let result;
      
      // Build proper userInfo object that functions expect
      const userInfo = {
        name: config.characterName,
        age: config.age,
        userName: config.userName,
        avatar: {
          type: config.avatarType,
          skinTone: config.skinTone
        },
        nativeLanguage: config.nativeLanguage
      };

      if (tierType === 'Debug Real Routing') {
        // Test the actual orchestration flow - this is what happens in reality
        console.log(`🎯 [${requestId}] Testing Real Orchestration Flow via runware-generate-image...`);
        result = await Promise.race([
          supabase.functions.invoke('runware-generate-image', {
            body: {
              pageText: config.storyText,
              userInfo: userInfo,
              sessionId: config.sessionId,
              storyId: `story-${config.sessionId}`,
              pageNumber: 1,
              requestId
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`[${requestId}] Request timeout after 90s`)), 90000)
          )
        ]);
      } else if (tierType === 'Avatar Debug Mode') {
        // Test with incomplete avatar to trigger fallback
        const incompleteUserInfo = {
          name: config.characterName,
          age: config.age,
          userName: config.userName,
          avatar: {
            type: config.avatarType,
            skinTone: config.skinTone
          },
          // Missing nativeLanguage to trigger incomplete avatar
        };
        
        console.log(`🎯 [${requestId}] Testing Avatar Debug Mode with incomplete avatar...`);
        result = await Promise.race([
          supabase.functions.invoke('runware-generate-image', {
            body: {
              pageText: config.storyText,
              userInfo: incompleteUserInfo,
              sessionId: config.sessionId,
              storyId: `story-${config.sessionId}`,
              pageNumber: 1,
              requestId
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`[${requestId}] Request timeout after 90s`)), 90000)
          )
        ]);
      } else if (tierType === 'Force Tier 1 (AI Scene)') {
        // Test AI visual scene creator function directly
        console.log(`🎯 [${requestId}] Calling ai-visual-scene-creator...`);
        result = await Promise.race([
          supabase.functions.invoke('ai-visual-scene-creator', {
            body: {
              storyText: config.storyText,
              userInfo: userInfo,
              avatarIdentity: userInfo,
              sessionId: config.sessionId,
              requestId
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`[${requestId}] Request timeout after 60s`)), 60000)
          )
        ]);
      } else if (tierType.startsWith('Force Tier 2.5')) {
        // Route to appropriate template function based on complexity
        const isAdvanced = templateComplexity === 'C' || templateComplexity === 'D';
        const functionName = isAdvanced ? 'runware-template-cd' : 'runware-template-ab';
        
        console.log(`🎯 [${requestId}] Calling ${functionName} with complexity ${templateComplexity}...`);
        result = await Promise.race([
          supabase.functions.invoke(functionName, {
            body: {
              storyText: config.storyText,
              userInfo: userInfo,
              avatarIdentity: userInfo,
              templateComplexity: templateComplexity || 'A',
              requestId
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`[${requestId}] Request timeout after 60s`)), 60000)
          )
        ]);
      } else if (tierType === 'Force Tier 4') {
        // Use local placeholder - no backend dependency
        console.log(`🎯 [${requestId}] Generating local placeholder for Tier 4...`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        result = {
          data: {
            success: true,
            imageURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3NGZmIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+VGllciA0IFBsYWNlaG9sZGVyPC90ZXh0Pgo8dGV4dCB4PSIyNTYiIHk9IjI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY5NzU4NyIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkxvY2FsIEdlbmVyYXRpb248L3RleHQ+Cjwvc3ZnPgo=',
            metadata: {
              tier: 4,
              source: 'local-placeholder',
              generated: new Date().toISOString()
            }
          }
        };
      }

      const processingTime = Date.now() - startTime;
      
      console.log(`📊 [${requestId}] ${tierType} Response Analysis:`, {
        processingTime,
        hasData: !!result?.data,
        hasError: !!result?.error,
        dataKeys: result?.data ? Object.keys(result.data) : [],
        success: result?.data?.success,
        imageUrl: result?.data?.imageURL || result?.data?.imageUrl,
        errorMessage: result?.error?.message || result?.data?.error,
        tierType,
        templateComplexity: templateComplexity || 'none',
        routingMetadata: !!result?.data?.routingMetadata
      });
      
      if (result?.data?.success) {
        console.log(`✅ [${requestId}] ${tierType} Success:`, {
          success: result.data.success,
          imagePresent: !!(result.data.imageURL || result.data.imageUrl),
          processingTime,
          metadata: !!result.data.metadata,
          routingMetadata: !!result.data.routingMetadata
        });
        
        return {
          tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
          success: true,
          imageUrl: result.data.imageURL || result.data.imageUrl,
          processingTime,
          metadata: result.data.metadata,
          enhancementDetails: result.data.enhancementDetails,
          templateComplexity,
          routingMetadata: result.data.routingMetadata
        };
      } else {
        let errorDetail;
        if (result?.error) {
          const errorMsg = result.error.message || '';
          if (errorMsg.includes('Failed to send a request')) {
            errorDetail = `Function Boot Error: ${errorMsg}`;
          } else if (errorMsg.includes('non-2xx status code')) {
            errorDetail = `Function Error Response: ${errorMsg}`;
          } else if (errorMsg.includes('timeout')) {
            errorDetail = `Timeout Error: ${errorMsg}`;
          } else {
            errorDetail = `Network Error: ${errorMsg}`;
          }
        } else if (result?.data?.error) {
          errorDetail = `Function Error: ${result.data.error}`;
        } else if (result?.data) {
          errorDetail = `Invalid Response: ${JSON.stringify(result.data).substring(0, 200)}`;
        } else {
          errorDetail = 'No response received';
        }
        
        console.error(`🔍 [${requestId}] Detailed Error Analysis for ${tierType}:`, {
          processingTime,
          error: errorDetail,
          result,
          tierType,
          templateComplexity
        });
        
        return {
          tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
          success: false,
          imageUrl: undefined,
          processingTime,
          error: errorDetail,
          templateComplexity,
          routingMetadata: result?.data?.routingMetadata
        };
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [${requestId}] Exception in ${tierType}:`, error);
      
      return {
        tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
        success: false,
        imageUrl: undefined,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        templateComplexity
      };
    }
  };

  const runTierTest = async (tierType: string, templateComplexity?: string) => {
    setIsLoading(true);
    setActiveTest(tierType);
    
    try {
      console.log(`🚀 Starting ${tierType} test...`);
      
      const result = await testTier(tierType, templateComplexity);
      
      console.log(`✅ ${tierType} test completed:`, {
        success: result.success,
        processingTime: result.processingTime,
        hasImage: !!result.imageUrl,
        error: result.error
      });
      
      setResults(prev => [result, ...prev]);
    } catch (error) {
      console.error(`❌ ${tierType} test failed:`, error);
      
      const errorResult: TierTestResult = {
        tier: tierType,
        success: false,
        imageUrl: undefined,
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
      
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsLoading(false);
      setActiveTest(null);
    }
  };

  const clearResults = () => {
    setResults([]);
    setConnectivityResult(null);
    setConnectivityStatus('idle');
  };

  const renderRoutingFlow = (result: TierTestResult) => {
    if (!result.routingMetadata) return null;

    const { attemptedTier, executedTier, fallbackReason, skippedTiers, routingDecisions, binaryValidation, avatarCompleteness, avatarIdentity } = result.routingMetadata;

    return (
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Routing Flow Analysis
        </h4>
        
        {/* Main Routing Flow */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{attemptedTier}</Badge>
          <ArrowRight className="w-4 h-4" />
          <Badge variant={executedTier === attemptedTier ? "default" : "destructive"}>
            {executedTier}
          </Badge>
          {fallbackReason && (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">{fallbackReason}</span>
            </>
          )}
        </div>

        {/* Avatar Debug Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <h5 className="font-medium mb-2">Avatar Validation</h5>
            <div className="flex items-center gap-2">
              <Badge variant={binaryValidation === 'COMPLETE' ? 'default' : 'destructive'}>
                {binaryValidation}
              </Badge>
              <span className="text-sm text-muted-foreground">{avatarCompleteness}</span>
            </div>
            
            {avatarIdentity && avatarIdentity.provided && avatarIdentity.missingFields && (
              <div className="mt-2 text-sm">
                <div className="text-green-600">
                  Provided: {avatarIdentity.provided.join(', ')}
                </div>
                {avatarIdentity.missingFields.length > 0 && (
                  <div className="text-red-600">
                    Missing: {avatarIdentity.missingFields.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h5 className="font-medium mb-2">Routing Decisions</h5>
            <div className="space-y-1">
              {routingDecisions?.map((decision, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {decision}
                </div>
              )) || (
                <div className="text-sm text-muted-foreground">
                  No routing decisions recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skipped Tiers */}
        {skippedTiers && skippedTiers.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Skipped Tiers</h5>
            <div className="flex flex-wrap gap-2">
              {skippedTiers.map((tier, index) => (
                <Badge key={index} variant="secondary">
                  {tier} - SKIPPED
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Image Generation Tier Testing & Debugging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="story-text">Story Text</Label>
              <Textarea
                id="story-text"
                placeholder="Enter story text to test..."
                value={config.storyText}
                onChange={(e) => setConfig(prev => ({ ...prev, storyText: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="character-name">Character Name</Label>
                  <Input
                    id="character-name"
                    value={config.characterName}
                    onChange={(e) => setConfig(prev => ({ ...prev, characterName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="user-name">User Name</Label>
                  <Input
                    id="user-name"
                    value={config.userName}
                    onChange={(e) => setConfig(prev => ({ ...prev, userName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="3"
                    max="17"
                    value={config.age}
                    onChange={(e) => setConfig(prev => ({ ...prev, age: parseInt(e.target.value) || 8 }))}
                  />
                </div>
                
                <div>
                  <Label>Skin Tone</Label>
                  <Select value={config.skinTone} onValueChange={(value: SkinTone) => setConfig(prev => ({ ...prev, skinTone: value }))}>
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
                  <Label>Language</Label>
                  <Select value={config.nativeLanguage} onValueChange={(value: LanguageCode) => setConfig(prev => ({ ...prev, nativeLanguage: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Avatar Type</Label>
                <RadioGroup value={config.avatarType} onValueChange={(value: AvatarType) => setConfig(prev => ({ ...prev, avatarType: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boy" id="boy" />
                    <Label htmlFor="boy">Boy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="girl" id="girl" />
                    <Label htmlFor="girl">Girl</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-answer" id="prefer-not-to-answer" />
                    <Label htmlFor="prefer-not-to-answer">Prefer not to answer</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Real Orchestration Debug Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Real Orchestration Debugging
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => runTierTest('Debug Real Routing')}
                disabled={isLoading}
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Debug Real Routing</div>
                    <div className="text-sm opacity-70">Shows actual tier cascade & fallback reasons</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Avatar Debug Mode')}
                disabled={isLoading}
                variant="secondary"
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Avatar Debug Mode</div>
                    <div className="text-sm opacity-70">Test incomplete avatar routing behavior</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Force Tier Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Force Tier Tests (Bypass Routing)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={() => runTierTest('Force Tier 1 (AI Scene)')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 1 (AI Scene)' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 1</div>
                    <div className="text-sm opacity-70">AI Scene Creator</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Force Tier 2.5A', 'A')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 2.5A' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 2.5A</div>
                    <div className="text-sm opacity-70">Template AB (A)</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Force Tier 2.5B', 'B')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 2.5B' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 2.5B</div>
                    <div className="text-sm opacity-70">Template AB (B)</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Force Tier 2.5C', 'C')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 2.5C' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 2.5C</div>
                    <div className="text-sm opacity-70">Template CD (C)</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Force Tier 2.5D', 'D')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 2.5D' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 2.5D</div>
                    <div className="text-sm opacity-70">Template CD (D)</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTierTest('Force Tier 4')}
                disabled={isLoading}
                variant="outline"
                className={`h-auto p-3 ${activeTest === 'Force Tier 4' ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Force Tier 4</div>
                    <div className="text-sim opacity-70">Local Placeholder</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Connectivity Test */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">System Connectivity</h3>
              <p className="text-sm text-muted-foreground">Test API key configuration and function availability</p>
            </div>
            <Button onClick={testConnectivity} disabled={isLoading} variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              Test Connectivity
            </Button>
          </div>

          {/* Clear Results */}
          <div className="flex justify-end">
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
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
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <h4 className="font-semibold">{result.tier}</h4>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {result.processingTime}ms
                    </div>
                  </div>

                  {result.error && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {result.error}
                    </div>
                  )}

                  {result.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={result.imageUrl} 
                        alt="Generated" 
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}

                  {renderRoutingFlow(result)}
                  
                  {result.metadata && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}