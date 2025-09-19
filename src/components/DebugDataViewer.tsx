import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Download, CheckCircle, XCircle, Database, HardDrive, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { DebugGateway } from '@/services/DebugGateway';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';
import { TierCascadeViewer } from '@/components/TierCascadeViewer';

interface AIPromptData {
  sessionId: string;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
  bundle: any;
  apiResponse: any;
  success: boolean;
  attempt: number;
  model: string;
  tokenLimit: number;
  pageNumber: number;
}

interface DebugResponse {
  success: boolean;
  sessionId: string;
  type: string;
  aiPrompts: AIPromptData[];
  totalEntries: number;
  dataSource?: 'database' | 'memory';
  fullDebugData: AIPromptData[];
  debugInfo?: {
    dbEntriesFound: number;
    memoryEntriesFound: number;
    sessionManagerAvailable: boolean;
    environmentCheck: {
      supabaseUrl: boolean;
      serviceRoleKey: boolean;
    };
  };
}

export function DebugDataViewer() {
  // Only show in debug mode
  const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=1');
  
  if (!isDebugMode) {
    return null;
  }

  const [sessionId, setSessionId] = useState('');
  const [debugData, setDebugData] = useState<DebugResponse | null>(null);
  const [imageData, setImageData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('story-generation');
  const [tierCascadeData, setTierCascadeData] = useState<any[] | null>(null);
  const { toast } = useToast();

  const fetchDebugData = async () => {
    if (!sessionId.trim()) {
      const errorMsg = "Please enter a session ID to fetch debug data.";
      setLastError(errorMsg);
      toast({
        title: "Session ID Required", 
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Validate session ID format  
    const sessionIdPattern = /^(live-|netflix-|test-|guest_|premium_|session_)/;
    if (!sessionIdPattern.test(sessionId.trim())) {
      const errorMsg = "Session ID should start with 'live-', 'netflix-', 'test-', 'guest_', 'premium_', or 'session_'";
      setLastError(errorMsg);
      toast({
        title: "Invalid Session ID Format",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastError(null);
    
    DebugLogger.log('network', 'Fetching debug data for session', { sessionId: sessionId.trim() });
    
    try {
      const { data } = await DebugGateway.getPromptHistory(sessionId.trim(), 10);

      DebugLogger.log('network', 'Debug data response received', { data });

      if (!data) {
        // Show service unavailable message instead of error
        setLastError('Debug service temporarily unavailable. Try again later.');
        toast({
          title: "Service Unavailable",
          description: "Debug service temporarily unavailable. This doesn't affect app functionality.",
          variant: "default",
        });
        return;
      }

      DebugLogger.log('ui', 'Debug info retrieved', data.debugInfo);

      setDebugData(data);
      setLastError(null);

      toast({
        title: "Debug Data Retrieved",
        description: `Found ${data.totalEntries} entries from ${data.dataSource || 'unknown'} for session: ${sessionId}`,
      });

      // Log detailed debug info 
      if (data.debugInfo) {
        DebugLogger.log('ui', 'Environment check details', data.debugInfo.environmentCheck);
        DebugLogger.log('ui', 'Data sources breakdown', {
          database: data.debugInfo.dbEntriesFound,
          memory: data.debugInfo.memoryEntriesFound,
          sessionManager: data.debugInfo.sessionManagerAvailable
        });
      }

    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      DebugLogger.error('network', 'Failed to fetch debug data', err);
      
      setLastError(`Failed to retrieve debug data: ${errorMessage}`);
      
      toast({
        title: "Fetch Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImageData = async () => {
    if (!sessionId.trim()) {
      const errorMsg = "Please enter a session ID to fetch image data.";
      setLastError(errorMsg);
      toast({
        title: "Session ID Required",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastError(null);
    setImageData(null);

    try {
      const data = await DebugGateway.getRecentImagePrompts(50);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setLastError('No image generation data found');
        return;
      }

      // Handle different data structures
      const imageArray = Array.isArray(data) ? data : (data.data || []);
      
      // Filter by session if provided
      const filteredData = sessionId ? imageArray.filter((item: any) => 
        item.sessionId === sessionId || 
        (item.metadata && item.metadata.sessionId === sessionId)
      ) : imageArray;

      if (filteredData.length === 0) {
        setLastError('No image generation data found for this session ID');
        return;
      }

      setImageData(filteredData);
      setLastError(null);
      
      toast({
        title: "Image Data Retrieved",
        description: `Found ${filteredData.length} image generation entries`,
      });
    } catch (err) {
      console.error('Failed to fetch image data:', err);
      setLastError('Failed to fetch image generation data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTierCascadeData = async () => {
    if (!sessionId.trim()) {
      const errorMsg = "Please enter a session ID to fetch tier cascade data.";
      setLastError(errorMsg);
      toast({
        title: "Session ID Required",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      const { data } = await DebugGateway.getPromptHistory(sessionId.trim(), 50);
      
      if (!data || !data.fullDebugData) {
        setLastError('No tier routing data found');
        return;
      }

      // Filter for tier routing entries
      const tierRoutingLogs = data.fullDebugData.filter((item: any) => 
        item.userPrompt?.includes('TIER_ROUTING') || 
        item.model?.includes('tier-routing')
      );

      if (tierRoutingLogs.length === 0) {
        setLastError('No tier routing data found for this session');
        return;
      }

      setTierCascadeData(tierRoutingLogs);
      setLastError(null);
      
      toast({
        title: "Tier Cascade Data Retrieved",
        description: `Found ${tierRoutingLogs.length} tier routing entries`,
      });
    } catch (err) {
      console.error('Failed to fetch tier cascade data:', err);
      setLastError('Failed to fetch tier cascade data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetch = () => {
    if (activeTab === 'story-generation') {
      fetchDebugData();
    } else if (activeTab === 'image-generation') {
      fetchImageData();
    } else {
      fetchTierCascadeData();
    }
  };

  const downloadDebugData = () => {
    const dataToDownload = activeTab === 'story-generation' ? debugData : 
                          activeTab === 'image-generation' ? imageData : 
                          tierCascadeData;
    if (!dataToDownload) return;
    
    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeTab}-data-${sessionId || 'recent'}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Debug Data Viewer
            <Badge variant="secondary">Session Analysis</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="story-generation">Story Generation</TabsTrigger>
              <TabsTrigger value="image-generation" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image Generation
              </TabsTrigger>
              <TabsTrigger value="tier-cascade" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Tier Routing
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter session ID..."
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleFetch} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Fetch Data'}
                </Button>
              </div>
              
              {lastError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {lastError}
                </div>
              )}

              {(debugData || imageData || tierCascadeData) && (
                <div className="flex items-center gap-4 pt-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {activeTab === 'story-generation' ? (
                      <>
                        <Database className="w-3 h-3" />
                        Source: {debugData?.dataSource || 'Unknown'}
                      </>
                    ) : (
                      <>
                        <Image className="w-3 h-3" />
                        Image Data
                      </>
                    )}
                  </Badge>
                  <Badge variant="secondary">
                    {activeTab === 'story-generation' ? debugData?.totalEntries : 
                     activeTab === 'image-generation' ? imageData?.length :
                     tierCascadeData?.length} entries found
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadDebugData}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download JSON
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="tier-cascade">
          {tierCascadeData && tierCascadeData.length > 0 && (
            <TierCascadeViewer tierData={tierCascadeData} sessionId={sessionId} />
          )}
          
          {tierCascadeData && tierCascadeData.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No tier routing data found for session: {sessionId}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tier routing data is only available for sessions with image generation attempts.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="story-generation">
          {debugData && debugData.fullDebugData && debugData.fullDebugData.length > 0 && (
            <div className="space-y-4">
              {debugData.fullDebugData.map((prompt, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Debug Entry #{index + 1}
                        <Badge 
                          variant={prompt.success ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {prompt.success ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {prompt.success ? 'Success' : 'Failed'}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedPrompt(expandedPrompt === index ? null : index)}
                      >
                        {expandedPrompt === index ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">Page {prompt.pageNumber}</Badge>
                      <Badge variant="outline">Attempt {prompt.attempt}</Badge>
                      <Badge variant="outline">{prompt.model}</Badge>
                      <Badge variant="outline">{formatTimestamp(prompt.timestamp)}</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {expandedPrompt === index ? (
                      <div className="space-y-6">
                        {/* System Prompt */}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">System Prompt ({prompt.systemPrompt?.length || 0} chars)</h4>
                          <ScrollArea className="h-32 w-full rounded border p-2">
                            <pre className="text-xs whitespace-pre-wrap">{prompt.systemPrompt}</pre>
                          </ScrollArea>
                        </div>

                        <Separator />

                        {/* User Prompt */}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">User Prompt ({prompt.userPrompt?.length || 0} chars)</h4>
                          <ScrollArea className="h-32 w-full rounded border p-2">
                            <pre className="text-xs whitespace-pre-wrap">{prompt.userPrompt}</pre>
                          </ScrollArea>
                        </div>

                        <Separator />

                        {/* Bundle Data */}
                        {prompt.bundle && (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">
                              Complete Bundle Data 
                              {prompt.bundle?.storyContent && (
                                <Badge variant="secondary" className="ml-2">
                                  {prompt.bundle.storyContent.length} pages
                                </Badge>
                              )}
                            </h4>
                            <ScrollArea className="h-40 w-full rounded border p-2">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(prompt.bundle, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        )}

                        <Separator />

                        {/* API Response */}
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">API Response</h4>
                          <ScrollArea className="h-32 w-full rounded border p-2">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(prompt.apiResponse, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">System Prompt: </span>
                          <span className="text-sm text-muted-foreground">
                            {truncateText(prompt.systemPrompt || 'N/A')}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">User Prompt: </span>
                          <span className="text-sm text-muted-foreground">
                            {truncateText(prompt.userPrompt || 'N/A')}
                          </span>
                        </div>
                        {prompt.bundle?.storyContent && (
                          <div>
                            <span className="text-sm font-medium">Bundle: </span>
                            <span className="text-sm text-muted-foreground">
                              {prompt.bundle?.storyContent?.length || 0} pages in bundle
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {debugData && debugData.totalEntries === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No debug data found for session: {debugData.sessionId}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="image-generation">
          {imageData && imageData.length > 0 && (
            <div className="space-y-4">
              {imageData.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Image Generation #{index + 1}
                      <Badge variant="outline" className="text-xs">
                        {item.tier || 'Unknown Tier'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Session Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Session ID: </span>
                        <span className="text-muted-foreground break-all">
                          {item.sessionId || item.metadata?.sessionId || 'Not available'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Page: </span>
                        <span className="text-muted-foreground">
                          {item.pageNumber || item.metadata?.pageNumber || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Story Context */}
                    {item.storyText && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Story Text</h4>
                        <div className="p-3 bg-muted/50 rounded text-sm">
                          {item.storyText}
                        </div>
                      </div>
                    )}

                    {/* Scene Extraction */}
                    {item.sceneDescription && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Scene Extraction</h4>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                          {item.sceneDescription}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Prompt */}
                    {item.enhancedPrompt && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Enhanced Prompt</h4>
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                          {item.enhancedPrompt}
                        </div>
                      </div>
                    )}

                    {/* Template/Tier Info */}
                    {item.template && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Template Used</h4>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded text-sm">
                          {item.template} ({item.tier})
                        </div>
                      </div>
                    )}

                    {/* Negative Prompt */}
                    {item.negativePrompt && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Negative Prompt</h4>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm">
                          {item.negativePrompt}
                        </div>
                      </div>
                    )}

                    {/* Style Framework */}
                    {item.styleFramework && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Style Framework</h4>
                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm">
                          {item.styleFramework}
                        </div>
                      </div>
                    )}

                    {/* Runware Response */}
                    {item.runwareResponse && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Runware Response</h4>
                        <div className="p-3 bg-muted/50 rounded text-sm max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(item.runwareResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Generated Image */}
                    {item.imageUrl && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Generated Image</h4>
                        <img 
                          src={item.imageUrl} 
                          alt="Generated content" 
                          className="w-full max-w-md rounded border"
                        />
                      </div>
                    )}

                    {/* Raw Data */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <span>Raw Image Generation Data</span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="p-3 bg-muted/50 rounded text-sm max-h-60 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {imageData && imageData.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No image generation data found for the specified session.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}