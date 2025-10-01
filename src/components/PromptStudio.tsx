import React, { useState, useRef, useEffect } from 'react';
import { DebugLogger } from '@/services/DebugLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Play, Download, Palette, Settings, Zap, Image as ImageIcon } from 'lucide-react';
import { extractImageUrl } from '@/utils/typeGuards';
import { RunwareQualityControls } from './RunwareQualityControls';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';

interface PromptStudioState {
  positivePrompt: string;
  negativePrompt: string;
  enhancementLevel: 'minimal' | 'standard' | 'detailed';
  parameters: {
    width: number;
    height: number;
    cfgScale: number;
    steps: number;
    model: string;
    outputFormat: string;
    seed: number | null;
    numberResults: number;
  };
  userInfo: {
    name: string;
    age: number;
    avatar: {
      type: string;
      skinTone: string;
    };
  };
  difficultyLevel: string;
}

interface GenerationResult {
  success: boolean;
  imageURL?: string;
  imageURLs?: string[];
  enhancedPrompt?: string;
  analysis?: {
    originalLength: number;
    enhancedLength: number;
    optimizations: string[];
    strategy: string;
  };
  cost?: number;
  seed?: number;
  error?: string;
}

export function PromptStudio() {
  const [state, setState] = useState<PromptStudioState>({
    positivePrompt: 'A friendly girl reading a book in a cozy library',
    negativePrompt: '',
    enhancementLevel: 'standard',
    parameters: {
      width: 1024,
      height: 1024,
      cfgScale: 8,
      steps: 25,
      model: 'runware:100@1',
      outputFormat: 'WEBP',
      seed: null,
      numberResults: 1
    },
    userInfo: {
      name: 'Emma',
      age: 8,
      avatar: {
        type: 'girl',
        skinTone: 'light'
      }
    },
    difficultyLevel: 'developing'
  });

  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 });
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('wss://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/prompt-studio');
        
        ws.onopen = () => {
          DebugLogger.log('network', 'Connected to Prompt Studio WebSocket');
          setWsConnected(true);
          toast.success('Connected to Prompt Studio');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              return;
            }
            
            if (data.type === 'progress') {
              setBatchProgress({ completed: data.completed, total: data.total });
              return;
            }
            
            if (data.type === 'batch_complete') {
              setBatchProgress({ completed: 0, total: 0 });
              setIsGenerating(false);
              toast.success(`Batch generation complete! ${data.imageURLs?.length || 0} images generated`);
            }
            
            if (data.success) {
              setResults(prev => [data, ...prev]);
              if (data.imageURL) {
                toast.success('Image generated successfully!');
              }
            } else {
              toast.error(data.error || 'Generation failed');
            }
            
            if (!data.type) {
              setIsGenerating(false);
            }
            
          } catch (error) {
            DebugLogger.error('network', 'Failed to parse WebSocket message', { error });
          }
        };

        ws.onclose = () => {
          DebugLogger.log('network', 'Disconnected from Prompt Studio WebSocket, reconnecting in 3s');
          setWsConnected(false);
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        };

        ws.onerror = (error) => {
          DebugLogger.error('network', 'Prompt Studio WebSocket error', { error });
          setWsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        DebugLogger.error('network', 'Failed to connect to Prompt Studio WebSocket', { error });
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const generateSingle = () => {
    if (!wsRef.current || !wsConnected) {
      toast.error('Not connected to Prompt Studio');
      return;
    }

    setIsGenerating(true);
    
      // Convert frontend difficulty to backend for API calls
      const request = {
        type: 'generate',
        positivePrompt: state.positivePrompt,
        negativePrompt: state.negativePrompt,
        userInfo: state.userInfo,
        difficultyLevel: DifficultyLevelMapper.toBackend(state.difficultyLevel),
        parameters: state.parameters,
        enhancementLevel: state.enhancementLevel
      };

    wsRef.current.send(JSON.stringify(request));
    toast.info('Generating image...');
  };

  const generateBatch = (count: number) => {
    if (!wsRef.current || !wsConnected) {
      toast.error('Not connected to Prompt Studio');
      return;
    }

    setIsGenerating(true);
    setBatchProgress({ completed: 0, total: count });
    
    // Convert frontend difficulty to backend for API calls
    const request = {
      type: 'batch',
      positivePrompt: state.positivePrompt,
      negativePrompt: state.negativePrompt,
      userInfo: state.userInfo,
      difficultyLevel: DifficultyLevelMapper.toBackend(state.difficultyLevel),
      parameters: state.parameters,
      enhancementLevel: state.enhancementLevel,
      batchCount: count
    };

    wsRef.current.send(JSON.stringify(request));
    toast.info(`Starting batch generation of ${count} images...`);
  };

  const analyzePrompt = () => {
    if (!wsRef.current || !wsConnected) {
      toast.error('Not connected to Prompt Studio');
      return;
    }
    
    // Convert frontend difficulty to backend for API calls  
    const request = {
      type: 'analyze',
      positivePrompt: state.positivePrompt,
      userInfo: state.userInfo,
      difficultyLevel: DifficultyLevelMapper.toBackend(state.difficultyLevel),
      enhancementLevel: state.enhancementLevel
    };

    wsRef.current.send(JSON.stringify(request));
    toast.info('Analyzing prompt...');
  };

  const updateState = (updates: Partial<PromptStudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateParameters = (paramUpdates: Partial<PromptStudioState['parameters']>) => {
    setState(prev => ({
      ...prev,
      parameters: { ...prev.parameters, ...paramUpdates }
    }));
  };

  const updateUserInfo = (userUpdates: Partial<PromptStudioState['userInfo']>) => {
    setState(prev => ({
      ...prev,
      userInfo: { ...prev.userInfo, ...userUpdates }
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🎨 Prompt Studio
          </h1>
          <p className="text-muted-foreground">
            Advanced image generation testing and optimization platform
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={wsConnected ? "default" : "destructive"}>
              {wsConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isGenerating && (
              <Badge variant="secondary">
                <Zap className="w-3 h-3 mr-1" />
                Generating...
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Prompt Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="positive-prompt">Positive Prompt</Label>
                  <Textarea
                    id="positive-prompt"
                    value={state.positivePrompt}
                    onChange={(e) => updateState({ positivePrompt: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.positivePrompt.length} characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                  <Textarea
                    id="negative-prompt"
                    value={state.negativePrompt}
                    onChange={(e) => updateState({ negativePrompt: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Enhancement Level</Label>
                  <Select
                    value={state.enhancementLevel}
                    onValueChange={(value: 'minimal' | 'standard' | 'detailed') => 
                      updateState({ enhancementLevel: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty Level</Label>
                  <Select
                    value={state.difficultyLevel}
                    onValueChange={(value) => updateState({ difficultyLevel: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-reader">Pre-Reader</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="developing">Developing</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Generation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={state.parameters.width}
                      onChange={(e) => updateParameters({ width: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={state.parameters.height}
                      onChange={(e) => updateParameters({ height: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>CFG Scale: {state.parameters.cfgScale} (System standard: 8)</Label>
                  <Slider
                    value={[state.parameters.cfgScale]}
                    onValueChange={([value]) => updateParameters({ cfgScale: value })}
                    min={1}
                    max={20}
                    step={0.5}
                    className="mt-2"
                  />
                  {state.parameters.cfgScale !== 8 && (
                    <p className="text-xs text-warning mt-1">
                      ⚠️ System standard is CFG Scale 8 for consistency
                    </p>
                  )}
                </div>

                <div>
                  <Label>Steps: {state.parameters.steps} (System standard: 25)</Label>
                  <Slider
                    value={[state.parameters.steps]}
                    onValueChange={([value]) => updateParameters({ steps: value })}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  {state.parameters.steps !== 25 && (
                    <p className="text-xs text-warning mt-1">
                      ⚠️ System standard is 25 steps for optimal quality
                    </p>
                  )}
                </div>

                <div>
                  <Label>Seed (Optional)</Label>
                  <Input
                    type="number"
                    value={state.parameters.seed || ''}
                    onChange={(e) => updateParameters({ seed: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1"
                    placeholder="Random"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quality Controls */}
            <RunwareQualityControls
              currentParameters={state.parameters}
              onParametersChange={updateParameters}
              onSeedChange={(seed) => updateParameters({ seed })}
            />

            {/* Generation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={generateSingle}
                  disabled={!wsConnected || isGenerating}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Single
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => generateBatch(4)}
                    disabled={!wsConnected || isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    Batch 4x
                  </Button>
                  <Button 
                    onClick={() => generateBatch(8)}
                    disabled={!wsConnected || isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    Batch 8x
                  </Button>
                </div>

                <Button 
                  onClick={analyzePrompt}
                  disabled={!wsConnected}
                  variant="secondary"
                  className="w-full"
                >
                  Analyze Prompt
                </Button>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quality Presets</Label>
                  <div className="grid grid-cols-1 gap-1">
                    <Button
                      onClick={() => updateParameters({ cfgScale: 8, steps: 25 })}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      🎯 System Standard (8/25)
                    </Button>
                    <Button
                      onClick={() => updateParameters({ cfgScale: 6, steps: 20 })}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      🚀 Fast Mode (6/20)
                    </Button>
                    <Button
                      onClick={() => updateParameters({ cfgScale: 10, steps: 30 })}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      ⭐ Maximum Quality
                    </Button>
                  </div>
                </div>

                {batchProgress.total > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Batch Progress</span>
                      <span>{batchProgress.completed}/{batchProgress.total}</span>
                    </div>
                    <Progress 
                      value={(batchProgress.completed / batchProgress.total) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Results ({results.length})</span>
                  {results.length > 0 && (
                    <Button
                      onClick={() => setResults([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results yet. Generate your first image!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {extractImageUrl(result) && (
                            <div className="lg:w-1/3">
                              <img
                                src={extractImageUrl(result)!}
                                alt="Generated"
                                className="w-full rounded-lg"
                              />
                              <Button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = extractImageUrl(result)!;
                                  link.download = `generated-${Date.now()}.webp`;
                                  link.click();
                                }}
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )}
                          
                          <div className="lg:w-2/3 space-y-3">
                            {result.enhancedPrompt && (
                              <div>
                                <Label className="text-sm font-medium">Enhanced Prompt</Label>
                                <p className="text-sm bg-muted p-2 rounded mt-1">
                                  {result.enhancedPrompt}
                                </p>
                              </div>
                            )}
                            
                            {result.analysis && (
                              <div>
                                <Label className="text-sm font-medium">Analysis</Label>
                                <div className="text-sm space-y-1 mt-1">
                                  <p>Length: {result.analysis.originalLength} → {result.analysis.enhancedLength} chars</p>
                                  <p>Strategy: {result.analysis.strategy}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {result.analysis.optimizations.map((opt, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {opt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {result.cost && <span>Cost: ${result.cost.toFixed(4)}</span>}
                              {result.seed && <span>Seed: {result.seed}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}