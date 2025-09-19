import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download, CheckCircle, XCircle, Database, HardDrive } from 'lucide-react';
import { DebugGateway } from '@/services/DebugGateway';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';

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
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
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

  const downloadDebugData = () => {
    if (!debugData) return;
    
    const dataStr = JSON.stringify(debugData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `debug-data-${debugData.sessionId}-${Date.now()}.json`;
    
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
            Session Debug Data Retriever
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                placeholder="e.g., guest_1758140018361 or premium_1758140018361 or live-first-Jasmine-1756943063321"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDebugData()}
              />
            </div>
            <Button onClick={fetchDebugData} disabled={isLoading}>
              {isLoading ? 'Fetching...' : 'Fetch Debug Data'}
            </Button>
          </div>

          {lastError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Error Details:</p>
              <p className="text-xs text-destructive/80 mt-1">{lastError}</p>
            </div>
          )}

          {debugData && (
            <div className="space-y-2">
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {debugData.dataSource === 'database' ? (
                    <Database className="w-3 h-3" />
                  ) : (
                    <HardDrive className="w-3 h-3" />
                  )}
                  Source: {debugData.dataSource || 'Unknown'}
                </Badge>
                <Badge variant="secondary">
                  {debugData.totalEntries} entries found
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
              
              {debugData.debugInfo && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <div>Database: {debugData.debugInfo.dbEntriesFound} entries | Memory: {debugData.debugInfo.memoryEntriesFound} entries</div>
                  <div>Session Manager: {debugData.debugInfo.sessionManagerAvailable ? '✅' : '❌'} | Environment: {debugData.debugInfo.environmentCheck.supabaseUrl && debugData.debugInfo.environmentCheck.serviceRoleKey ? '✅' : '❌'}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}