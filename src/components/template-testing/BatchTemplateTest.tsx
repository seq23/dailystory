import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Download, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import type { UserInfo, DifficultyLevel } from '@/types';

interface BatchResult {
  level: string;
  success: boolean;
  error?: string;
  result?: any;
  duration: number;
  sceneExtracted?: boolean;
  imageTier?: string;          // Which tier generated images (kept for backward compatibility)
  imageUrl?: string;           // Actual image URL (kept for backward compatibility)
  ccsFailed?: boolean;          // Did CCS fail? (kept for backward compatibility)
  ccsFailureReason?: string;    // Why did CCS fail? (kept for backward compatibility)
  imageTiers?: Array<{         // NEW: Array of tier test results
    tier: string;
    imageUrl: string;
    testMode: string;
    ccsFailed?: boolean;
    ccsFailureReason?: string;
    processingTime?: number;
    edgeFunction?: string;
    actualTierReturned?: string;
  }>;
}

const ALL_LEVELS: { value: string; label: string }[] = [
  { value: 'beginner', label: 'Beginner (Level 0)' },
  { value: 'easy', label: 'Easy (Level 1)' },
  { value: 'medium', label: 'Medium (Level 2)' },
  { value: 'hard', label: 'Hard (Level 3)' },
  { value: 'expert', label: 'Expert (Level 4)' },
  { value: 'grade6', label: 'Grade 6' },
  { value: 'grade7', label: 'Grade 7' },
  { value: 'grade8', label: 'Grade 8' },
  { value: 'grade9', label: 'Grade 9' },
  { value: 'grade10', label: 'Grade 10' },
];

export function BatchTemplateTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const { generateStory } = useTemplateService();

  const baseUserInfo: UserInfo = {
    name: 'TestUser',
    age: 8,
    grade: '3',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    hobbies: 'playing games',
    favoriteFood: 'pizza',
    specialRequest: 'adventure with magic',
    difficultyLevel: 'easy', // Will be overridden
  };

  const runBatchTest = async () => {
    // Mock Complete CCS for Tier 2.5A
    const mockFullCCS = {
      characterSeed: {
        primaryCharacter: {
          name: baseUserInfo.name,
          age: baseUserInfo.age,
          skinTone: "light",
          hairColor: "brown",
          hairStyle: "short curly",
          eyeColor: "brown"
        }
      },
      culturalBundle: {
        culturalContext: "Western",
        appropriateImagery: ["playground", "school", "park"]
      },
      latestClothing: {
        outfit: "blue t-shirt and jeans"
      },
      coloredObjects: ["red backpack", "yellow ball"],
      mainCharacterAppearance: "young child with brown hair",
      secondaryCharacters: [],
      sessionSetting: "outdoor adventure",
      structuredAvatarData: {
        skinTone: "light",
        hairColor: "brown",
        eyeColor: "brown"
      },
      secondaryCharacterSeeds: [],
      detectedAnimals: [],
      tier1Complete: true,
      ccsMethodsRun: ["characterSeed", "culturalBundle", "latestClothing"],
      source: 'test_mock'
    };

    // Mock Partial CCS for Tier 2.5B
    const mockPartialCCS = {
      characterSeed: mockFullCCS.characterSeed,
      culturalBundle: null,
      coloredObjects: null,
      mainCharacterAppearance: null,
      secondaryCharacters: [],
      sessionSetting: "",
      latestClothing: null,
      structuredAvatarData: null,
      secondaryCharacterSeeds: [],
      detectedAnimals: [],
      tier1Complete: false,
      ccsMethodsRun: [],
      source: 'test_partial'
    };

    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const batchResults: BatchResult[] = [];

    for (let i = 0; i < ALL_LEVELS.length; i++) {
      const level = ALL_LEVELS[i];
      setCurrentLevel(level.label);
      setProgress((i / ALL_LEVELS.length) * 100);

      const startTime = Date.now();
      try {
        const userInfo = {
          ...baseUserInfo,
          difficultyLevel: level.value as DifficultyLevel,
        };

        const result = await generateStory(userInfo);
        const duration = Date.now() - startTime;

        // Check for scene extraction from result metadata (with safe access)
        const metadata = result?.metadata as any;
        const sceneExtracted = metadata?.sceneExtracted || false;

        // Define 7-Tier Test Configuration
        const tierTests = [
          {
            name: 'Direct Mode (Frontend)',
            testMode: 'direct-frontend',
            edgeFunction: 'runware-template-cd',
            payload: (basePayload: any) => ({
              ...basePayload,
              templateComplexity: 'C',
              test: true
            })
          },
          {
            name: 'Direct Mode (Orchestrator)',
            testMode: 'direct-orchestrator',
            edgeFunction: 'runware-generate-image',
            payload: (basePayload: any) => ({
              ...basePayload,
              directMode: true,
              test: true
            })
          },
          {
            name: 'Tier 1 (AI Generation)',
            testMode: 'tier1',
            edgeFunction: 'runware-generate-image',
            payload: (basePayload: any) => ({
              ...basePayload,
              skipDirectlyToTier: '1',
              test: true
            })
          },
          {
            name: 'Tier 2.5A (Full CCS)',
            testMode: '2.5A',
            edgeFunction: 'runware-template-ab',
            payload: (basePayload: any) => ({
              ...basePayload,
              templateComplexity: 'A',
              precomputedCCS: mockFullCCS,
              test: true
            })
          },
          {
            name: 'Tier 2.5B (Partial CCS)',
            testMode: '2.5B',
            edgeFunction: 'runware-template-ab',
            payload: (basePayload: any) => ({
              ...basePayload,
              templateComplexity: 'B',
              precomputedCCS: mockPartialCCS,
              test: true
            })
          },
          {
            name: 'Tier 2.5C (Nuclear Hardcoded)',
            testMode: '2.5C',
            edgeFunction: 'runware-template-cd',
            payload: (basePayload: any) => ({
              ...basePayload,
              templateComplexity: 'C',
              test: true
            })
          },
          {
            name: 'Tier 2.5D (Emergency)',
            testMode: '2.5D',
            edgeFunction: 'runware-template-cd',
            payload: (basePayload: any) => ({
              pageText: basePayload.pageText,
              storyText: basePayload.storyText,
              userInfo: {
                name: basePayload.userInfo.name,
                age: basePayload.userInfo.age,
                interests: basePayload.userInfo.interests
              },
              sessionId: `batch-test-2.5d-${Date.now()}`,
              pageNumber: 1,
              templateComplexity: 'D',
              emergencyMode: true,
              test: true
            })
          }
        ];

        const imageTiers: BatchResult['imageTiers'] = [];
        let primaryImageUrl: string | null = null;
        let primaryImageTier = 'UNKNOWN';
        let primaryCcsFailed = false;
        let primaryCcsFailureReason = '';

        if (result?.pages && result.pages.length > 0) {
          // Base payload shared by all tier tests
          const basePayload = {
            pageText: result.pages[0],
            storyText: result.pages.join(' '),
            userInfo: userInfo,
            pageNumber: 1,
            isGuestUser: false,
            difficultyLevel: level.value
          };

          for (const tierTest of tierTests) {
            const tierStartTime = Date.now();
            try {
              const sessionId = crypto.randomUUID();
              const { supabase } = await import('@/integrations/supabase/client');
              
              console.log(`🧪 [BATCH] Testing ${tierTest.name} for ${level.label}`);
              
              // Build tier-specific payload
              const tierPayload = tierTest.payload({
                ...basePayload,
                sessionId
              });
              
              // Call the specific edge function for this tier
              const imageResponse = await supabase.functions.invoke(tierTest.edgeFunction, {
                body: tierPayload
              });
              
              const tierDuration = Date.now() - tierStartTime;
              
              if (!imageResponse.error && imageResponse.data) {
                const imageUrl = imageResponse.data.imageURL || 
                               imageResponse.data.image_url || 
                               imageResponse.data.imageUrl ||
                               imageResponse.data.url;
                
                const actualTier = imageResponse.data.tier || 
                                 imageResponse.data.usedTier || 
                                 tierTest.testMode;
                
                let tierCcsFailed = false;
                let tierCcsFailureReason = '';
                
                // Check CCS status from metadata
                if (imageResponse.data.metadata?.ccsMethodStatus) {
                  const ccsMethodStatus = imageResponse.data.metadata.ccsMethodStatus;
                  const hasCcsFailure = Object.values(ccsMethodStatus).some(status => 
                    status === 'failed' || String(status).includes('fallback')
                  );
                  if (hasCcsFailure) {
                    tierCcsFailed = true;
                    tierCcsFailureReason = 'CCS method failed per metadata';
                  }
                }
                
                // Tier 2.5D specific validation
                if (tierTest.testMode === '2.5D') {
                  const prompt = imageResponse.data.positivePrompt || '';
                  if (!prompt.toLowerCase().includes('sorry')) {
                    console.warn(`⚠️ Tier 2.5D prompt missing "SORRY" theme`);
                  }
                }
                
                // Store first successful image as primary (for backward compatibility)
                if (!primaryImageUrl) {
                  primaryImageUrl = imageUrl;
                  primaryImageTier = actualTier;
                  primaryCcsFailed = tierCcsFailed;
                  primaryCcsFailureReason = tierCcsFailureReason;
                }
                
                imageTiers.push({
                  tier: `${tierTest.name} → ${actualTier}`,
                  imageUrl: imageUrl || '',
                  testMode: tierTest.testMode,
                  ccsFailed: tierCcsFailed,
                  ccsFailureReason: tierCcsFailureReason,
                  processingTime: tierDuration,
                  edgeFunction: tierTest.edgeFunction,
                  actualTierReturned: actualTier
                });
                
                console.log(`✅ ${tierTest.name} generated in ${tierDuration}ms (returned: ${actualTier})`);
              } else {
                console.warn(`⚠️ ${tierTest.name} generation failed:`, imageResponse.error);
                imageTiers.push({
                  tier: `${tierTest.name} → FAILED`,
                  imageUrl: '',
                  testMode: tierTest.testMode,
                  ccsFailed: true,
                  ccsFailureReason: imageResponse.error?.message || 'Generation failed',
                  processingTime: tierDuration,
                  edgeFunction: tierTest.edgeFunction,
                  actualTierReturned: 'ERROR'
                });
              }
            } catch (imgError) {
              const tierDuration = Date.now() - tierStartTime;
              console.error(`❌ Error testing ${tierTest.name}:`, imgError);
              imageTiers.push({
                tier: `${tierTest.name} → ERROR`,
                imageUrl: '',
                testMode: tierTest.testMode,
                ccsFailed: true,
                ccsFailureReason: imgError instanceof Error ? imgError.message : 'Unknown error',
                processingTime: tierDuration,
                edgeFunction: tierTest.edgeFunction,
                actualTierReturned: 'ERROR'
              });
            }
          }
        }

        const imageTier = primaryImageTier;
        const imageUrl = primaryImageUrl;
        const ccsFailed = primaryCcsFailed;
        const ccsFailureReason = primaryCcsFailureReason;

        batchResults.push({
          level: level.label,
          success: true,
          result,
          duration,
          sceneExtracted,
          imageTier,        // Primary tier (for backward compatibility)
          imageUrl,         // Primary image URL (for backward compatibility)
          ccsFailed,        // Primary CCS status (for backward compatibility)
          ccsFailureReason, // Primary failure reason (for backward compatibility)
          imageTiers,       // NEW: All tier test results
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        batchResults.push({
          level: level.label,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        });
      }

      setResults([...batchResults]);
    }

    setProgress(100);
    setCurrentLevel('');
    setIsRunning(false);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `template-batch-test-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const avgDuration = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length) : 0;
  const sceneExtractionCount = results.filter(r => r.sceneExtracted).length;
  const ccsFailureCount = results.filter(r => r.ccsFailed).length;
  const tier1Count = results.filter(r => r.imageTier === 'TIER_1').length;
  const tier1DegradedCount = results.filter(r => r.imageTier === 'TIER_1' && r.ccsFailed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Batch Template Test</CardTitle>
          <CardDescription>
            Test all 9 difficulty levels simultaneously to validate the complete template system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runBatchTest} 
              disabled={isRunning}
              className="min-w-32"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Batch Test
                </>
              )}
            </Button>

            {results.length > 0 && !isRunning && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing: {currentLevel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{successCount}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{failureCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{avgDuration}ms</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{sceneExtractionCount}/{results.length}</div>
                <div className="text-sm text-muted-foreground">Scene Extracted</div>
              </div>
            </div>
          )}

          {ccsFailureCount > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-destructive">Character Consistency Service Failures Detected</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {ccsFailureCount} of {results.length} tests experienced CCS failures.
                    {tier1DegradedCount > 0 && (
                      <> {tier1DegradedCount} Tier 1 attempts generated images but without character consistency.</>
                    )}
                  </div>
                  <div className="text-xs text-destructive/80 mt-2">
                    💥 Root Cause: .maybeSingle() not supported in vendor bundle @supabase/supabase-js v2.57.4
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="font-medium">{result.level}</div>
                      {result.error && (
                        <div className="text-sm text-destructive">{result.error}</div>
                      )}
                      {result.success && result.result && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            Generated {result.result.pages?.length || 0} pages • 
                            Scene: {result.sceneExtracted ? '✅' : '❌'}
                          </div>
                          {result.imageTiers && result.imageTiers.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <div className="text-sm font-medium">Tier Testing Results ({result.imageTiers.length} paths tested):</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {result.imageTiers.map((tierResult, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`border rounded-lg p-2 ${
                                      tierResult.ccsFailed ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      {/* Tier Name */}
                                      <div className="text-xs font-medium truncate" title={tierResult.tier}>
                                        {tierResult.tier.split(' → ')[0]}
                                      </div>
                                      
                                      {/* Edge Function Badge */}
                                      {tierResult.edgeFunction && (
                                        <Badge variant="outline" className="text-xs truncate w-full">
                                          {tierResult.edgeFunction}
                                        </Badge>
                                      )}
                                      
                                      {/* Image */}
                                      {tierResult.imageUrl ? (
                                        <img 
                                          src={tierResult.imageUrl} 
                                          alt={tierResult.tier}
                                          className="w-full h-28 object-cover rounded border"
                                          title={`Generated in ${tierResult.processingTime}ms`}
                                        />
                                      ) : (
                                        <div className="w-full h-28 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground border border-dashed">
                                          No image
                                        </div>
                                      )}
                                      
                                      {/* Processing Time */}
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {tierResult.processingTime}ms
                                      </div>
                                      
                                      {/* Actual Tier Returned */}
                                      {tierResult.actualTierReturned && (
                                        <div className="text-xs">
                                          <span className="font-medium">Returned:</span>{' '}
                                          <Badge variant={tierResult.ccsFailed ? 'destructive' : 'default'} className="text-xs">
                                            {tierResult.actualTierReturned}
                                          </Badge>
                                        </div>
                                      )}
                                      
                                      {/* CCS Failure Warning */}
                                      {tierResult.ccsFailed && (
                                        <div className="text-xs text-destructive flex items-start gap-1">
                                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span className="break-words">{tierResult.ccsFailureReason}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {result.duration}ms
                    </Badge>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}