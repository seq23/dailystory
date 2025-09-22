/**
 * Cache Inspector Panel - Debug Component
 * Provides real-time cache inspection and debugging tools
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, RefreshCw, Trash2, Bug } from 'lucide-react';
import { CacheDebugger } from '@/utils/CacheDebugger';
import { ManagedTimers } from '@/utils/TimerManager';

interface CacheInspectorPanelProps {
  userId?: string;
  sessionId?: string;
  currentStoryId?: string;
  isVisible?: boolean;
}

export const CacheInspectorPanel: React.FC<CacheInspectorPanelProps> = ({
  userId,
  sessionId,
  currentStoryId,
  isVisible = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheData, setCacheData] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refreshCacheData = () => {
    const inspection = CacheDebugger.inspectAllCaches(userId, sessionId);
    setCacheData(inspection);
    setLastRefresh(new Date());
  };

  const [autoRefresh, setAutoRefresh] = useState(false);

  // EMERGENCY FIX: Auto-refresh disabled by default, manual refresh only
  useEffect(() => {
    if (isOpen) {
      // Initial data load only - no auto-refresh to prevent resource exhaustion
      refreshCacheData();
      
      // REMOVED: Auto-refresh completely disabled to prevent ERR_INSUFFICIENT_RESOURCES
      // Previously: const interval = setInterval(refreshCacheData, 30000);
    }
  }, [isOpen, userId, sessionId]);

  const clearAllCaches = () => {
    CacheDebugger.clearAllCachesWithLogging('manual-debug-clear', sessionId);
    ManagedTimers.setTimeout(refreshCacheData, 500, 'CacheInspectorPanel');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-background/95 backdrop-blur border-border">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4" />
                Cache Inspector
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* Control Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={refreshCacheData} 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={clearAllCaches} 
                      size="sm" 
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Auto-refresh Control - REMOVED to prevent resource exhaustion */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Manual refresh only (prevents connection overload)</span>
                  </div>
                </div>

                {/* Session Info */}
                <div className="text-xs space-y-1">
                  <div><strong>User ID:</strong> {userId || 'guest'}</div>
                  <div><strong>Session ID:</strong> {sessionId ? sessionId.substring(0, 20) + '...' : 'None'}</div>
                  <div><strong>Story ID:</strong> {currentStoryId ? currentStoryId.substring(0, 20) + '...' : 'None'}</div>
                  <div><strong>Last Refresh:</strong> {lastRefresh.toLocaleTimeString()}</div>
                </div>

                {cacheData && (
                  <>
                    {/* Image Cache Status */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Image Cache</h4>
                      <div className="text-xs space-y-1">
                        <div>Total Images: {cacheData.imageCacheStatus.totalImages}</div>
                        <div>Storage Usage: {Math.round(cacheData.imageCacheStatus.storageUsage / 1024)}KB</div>
                        <div>Sessions:</div>
                        {Object.entries(cacheData.imageCacheStatus.sessions).map(([sessionId, count]) => (
                          <div key={sessionId} className="ml-2">
                            {sessionId.substring(0, 15)}...: {String(count)} images
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Cache Status */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Session Cache</h4>
                      <div className="text-xs space-y-1">
                        <div>Has Cached Sessions: {cacheData.sessionCacheStatus.hasCachedSessions ? 'Yes' : 'No'}</div>
                        <div>Sessions: {cacheData.sessionCacheStatus.sessions.length}</div>
                      </div>
                    </div>

                    {/* Storage Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Storage Breakdown</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>SessionStorage:</strong></div>
                        <div className="ml-2">Total Keys: {cacheData.storageBreakdown.sessionStorage.totalKeys}</div>
                        <div className="ml-2">Image Cache: {cacheData.storageBreakdown.sessionStorage.imageCache}</div>
                        
                        <div><strong>LocalStorage:</strong></div>
                        <div className="ml-2">Total Keys: {cacheData.storageBreakdown.localStorage.totalKeys}</div>
                        <div className="ml-2">Story Keys: {cacheData.storageBreakdown.localStorage.storyKeys}</div>
                      </div>
                    </div>

                    {/* Cache Keys Preview */}
                    {cacheData.imageCacheStatus.keys.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Recent Cache Keys</h4>
                        <div className="text-xs max-h-24 overflow-y-auto space-y-1">
                          {cacheData.imageCacheStatus.keys.slice(0, 3).map((key: string, index: number) => (
                            <div key={index} className="font-mono break-all">
                              {key.substring(0, 40)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};