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
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Zap, Settings, Target, Layers } from 'lucide-react';
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
    avatarType: 'prefer-not-to-answer',
    nativeLanguage: 'en'
  });

  const [results, setResults] = useState<TierTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [connectivityStatus, setConnectivityStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const testConnectivity = async () => {
    setConnectivityStatus('testing');
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('edge-connectivity-test');
      const processingTime = Date.now() - startTime;
      
      if (error) {
        console.error('Connectivity test error:', error);
        setConnectivityStatus('failed');
        return false;
      }
      
      console.log('Connectivity test response:', data);
      setConnectivityStatus('success');
      
      // Add connectivity test to results
      const connectivityResult: TierTestResult = {
        tier: 'Connectivity Test',
        success: data?.success || false,
        imageUrl: undefined,
        processingTime,
        error: data?.success ? undefined : 'Connectivity test failed'
      };
      
      setResults(prev => [connectivityResult, ...prev]);
      return data?.success || false;
      
    } catch (err) {
      console.error('Connectivity test exception:', err);
      setConnectivityStatus('failed');
      
      const connectivityResult: TierTestResult = {
        tier: 'Connectivity Test',
        success: false,
        imageUrl: undefined,
        processingTime: 0,
        error: err instanceof Error ? err.message : 'Unknown connectivity error'
      };
      
      setResults(prev => [connectivityResult, ...prev]);
      return false;
    }
  };

  const testTier = async (tierType: string, templateComplexity?: string): Promise<TierTestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${tierType}${templateComplexity ? ` (${templateComplexity})` : ''}`, config);
      
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

      if (tierType === 'Tier 1') {
        // Test Tier 1: AI-powered visual scene creator (text-only)
        result = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            storyText: config.storyText,
            avatarIdentity: userInfo,
            sessionId: config.sessionId
          }
        });
      } else if (tierType === 'Tier 1 (Image Orchestrator)') {
        // Test Tier 1: Full image orchestrator
        result = await supabase.functions.invoke('runware-generate-image', {
          body: {
            pageText: config.storyText,
            userInfo: userInfo,
            sessionId: config.sessionId,
            pageNumber: 1
          }
        });
      } else if (tierType.startsWith('Tier 2.5')) {
        // Test specific 2.5 sub-tier
        result = await supabase.functions.invoke('runware-simple-fallback', {
          body: {
            storyText: config.storyText,
            avatarIdentity: userInfo,
            sessionId: config.sessionId,
            templateComplexity: templateComplexity || 'A',
            forceFallback: true
          }
        });
      } else if (tierType === 'Tier 4') {
        // Test SVG fallback
        result = await supabase.functions.invoke('runware-simple-fallback', {
          body: {
            storyText: config.storyText,
            avatarIdentity: userInfo,
            sessionId: config.sessionId,
            forceSVG: true
          }
        });
      }

      const processingTime = Date.now() - startTime;
      
      if (result?.data?.success) {
        console.log(`✅ ${tierType} Success:`, result.data);
        return {
          tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
          success: true,
          imageUrl: result.data.imageUrl,
          processingTime,
          metadata: result.data.metadata,
          enhancementDetails: result.data.enhancementDetails,
          templateComplexity
        };
      } else {
        console.log(`❌ ${tierType} Failed:`, result?.data || result?.error);
        return {
          tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
          success: false,
          processingTime,
          error: result?.data?.error || result?.error?.message || 'Unknown error',
          templateComplexity
        };
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ ${tierType} Exception:`, error);
      return {
        tier: tierType + (templateComplexity ? ` (${templateComplexity})` : ''),
        success: false,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        templateComplexity
      };
    }
  };

  const runSingleTest = async (tierType: string, templateComplexity?: string) => {
    setIsLoading(true);
    setActiveTest(tierType + (templateComplexity || ''));
    
    const result = await testTier(tierType, templateComplexity);
    setResults(prev => [...prev.filter(r => r.tier !== result.tier), result]);
    
    setIsLoading(false);
    setActiveTest(null);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    console.log('🚀 Starting comprehensive tier testing...');
    
    const testSequence = [
      { type: 'Tier 1' },
      { type: 'Tier 1 (Image Orchestrator)' },
      { type: 'Tier 2.5', complexity: 'A' },
      { type: 'Tier 2.5', complexity: 'B' },
      { type: 'Tier 2.5', complexity: 'C' },
      { type: 'Tier 2.5', complexity: 'D' },
      { type: 'Tier 4' }
    ];
    
    const allResults: TierTestResult[] = [];
    
    for (const test of testSequence) {
      setActiveTest(test.type + (test.complexity || ''));
      const result = await testTier(test.type, test.complexity);
      allResults.push(result);
      setResults([...allResults]);
    }
    
    console.log('✅ All tier testing complete:', allResults);
    setIsLoading(false);
    setActiveTest(null);
  };

  const clearResults = () => {
    setResults([]);
    setConnectivityStatus('idle');
    console.log('🧹 Cleared all tier test results');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Image Tier Testing Debug Panel
          <Badge variant="outline">Console Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyText">Story Text</Label>
              <Textarea
                id="storyText"
                value={config.storyText}
                onChange={(e) => setConfig(prev => ({ ...prev, storyText: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="characterName">Character Name</Label>
                  <Input
                    id="characterName"
                    value={config.characterName}
                    onChange={(e) => setConfig(prev => ({ ...prev, characterName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={config.age}
                    onChange={(e) => setConfig(prev => ({ ...prev, age: parseInt(e.target.value) || 8 }))}
                  />
                </div>
              </div>
              
              {/* Avatar Configuration */}
              <div className="space-y-3">
                <Label>Avatar Configuration</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="avatarType" className="text-sm">Avatar Type</Label>
                  <RadioGroup
                    value={config.avatarType}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, avatarType: value as AvatarType }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="boy" id="boy" />
                      <Label htmlFor="boy" className="text-sm">Boy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="girl" id="girl" />
                      <Label htmlFor="girl" className="text-sm">Girl</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer-not-to-answer" id="prefer" />
                      <Label htmlFor="prefer" className="text-sm">Neutral</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="skinTone" className="text-sm">Skin Tone</Label>
                    <Select 
                      value={config.skinTone} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, skinTone: value as SkinTone }))}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="nativeLanguage" className="text-sm">Language</Label>
                    <Select 
                      value={config.nativeLanguage} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, nativeLanguage: value as LanguageCode }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Testing Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tier Testing Controls</h3>
          
          {/* Connectivity Test */}
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={testConnectivity}
              disabled={isLoading}
              variant={connectivityStatus === 'success' ? 'default' : connectivityStatus === 'failed' ? 'destructive' : 'outline'}
              className="flex items-center gap-2"
            >
              {connectivityStatus === 'testing' ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : connectivityStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  ✓ Connected
                </>
              ) : connectivityStatus === 'failed' ? (
                <>
                  <XCircle className="w-4 h-4" />
                  ✗ Failed
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Test Connectivity
                </>
              )}
            </Button>
          </div>
          
          {/* Individual Tier Tests */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => runSingleTest('Tier 1')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {activeTest === 'Tier 1' ? <Clock className="w-4 h-4 animate-spin" /> : 'Scene Creator (Tier 1)'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 1 (Image Orchestrator)')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {activeTest === 'Tier 1 (Image Orchestrator)' ? <Clock className="w-4 h-4 animate-spin" /> : 'Tier 1 (Full)'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 2.5', 'A')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {activeTest === 'Tier 2.5A' ? <Clock className="w-4 h-4 animate-spin" /> : '2.5A'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 2.5', 'B')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {activeTest === 'Tier 2.5B' ? <Clock className="w-4 h-4 animate-spin" /> : '2.5B'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 2.5', 'C')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {activeTest === 'Tier 2.5C' ? <Clock className="w-4 h-4 animate-spin" /> : '2.5C'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 2.5', 'D')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {activeTest === 'Tier 2.5D' ? <Clock className="w-4 h-4 animate-spin" /> : '2.5D'}
            </Button>
            
            <Button
              onClick={() => runSingleTest('Tier 4')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {activeTest === 'Tier 4' ? <Clock className="w-4 h-4 animate-spin" /> : 'Tier 4'}
            </Button>
          </div>

          {/* Comprehensive Testing Controls */}
          <div className="flex gap-3">
            <Button
              onClick={runAllTests}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Test All Tiers
            </Button>
            
            <Button
              onClick={clearResults}
              disabled={isLoading}
              variant="outline"
            >
              Clear Results
            </Button>
          </div>
        </div>

        <Separator />

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results ({results.length})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <Card key={index} className={`border ${result.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {result.tier}
                      <Badge variant={result.success ? "default" : "destructive"} className="ml-auto">
                        {result.processingTime}ms
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.success && result.imageUrl && (
                      <div className="aspect-square bg-muted rounded-md overflow-hidden">
                        <img
                          src={result.imageUrl}
                          alt={`${result.tier} result`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load ${result.tier} image:`, result.imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        {result.error}
                      </div>
                    )}
                    
                    {result.metadata && (
                      <div className="text-xs text-muted-foreground">
                        <div>Enhancement: {result.metadata.enhancementLevel || 'None'}</div>
                        <div>Cultural: {result.metadata.culturalProcessing ? 'Yes' : 'No'}</div>
                        {result.templateComplexity && (
                          <div>Template: {result.templateComplexity}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}