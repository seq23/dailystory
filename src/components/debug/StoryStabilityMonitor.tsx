// 🔒 Story Stability Monitor - Debug Component
// Provides real-time visibility into story content protection system

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StoryStabilityMonitorProps {
  isStoryContentLocked: boolean;
  isStoryStable: boolean;
  storyLength: number;
  lastGenerationTrigger: string;
  contentMutationLog: Array<{
    timestamp: string;
    trigger: string;
    action: string;
    storyLength: number;
    isLocked: boolean;
  }>;
  onUnlockContent?: () => void;
  onClearLog?: () => void;
}

export const StoryStabilityMonitor: React.FC<StoryStabilityMonitorProps> = ({
  isStoryContentLocked,
  isStoryStable,
  storyLength,
  lastGenerationTrigger,
  contentMutationLog,
  onUnlockContent,
  onClearLog
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-4 border-2 border-dashed border-yellow-400 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
          🔒 Story Stability Monitor
          <Badge variant={isStoryContentLocked ? "destructive" : "default"}>
            {isStoryContentLocked ? "LOCKED" : "UNLOCKED"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Content Status:</strong>
            <div className="mt-1 space-y-1">
              <div className={`p-1 rounded text-xs ${isStoryContentLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isStoryContentLocked ? "🔒 Protected from regeneration" : "🔓 Open for regeneration"}
              </div>
              <div className={`p-1 rounded text-xs ${isStoryStable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {isStoryStable ? "📚 Story is stable" : "⏳ Story stabilizing..."}
              </div>
            </div>
          </div>
          <div>
            <strong>Story Info:</strong>
            <div className="mt-1 space-y-1">
              <div>Pages: {storyLength}</div>
              <div>Last Trigger: <code className="text-xs bg-gray-100 px-1 rounded">{lastGenerationTrigger || 'none'}</code></div>
            </div>
          </div>
        </div>

        <div>
          <strong>Mutation Log (last 5):</strong>
          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
            {contentMutationLog.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="text-xs bg-white p-2 rounded border">
                <div className="flex justify-between items-start">
                  <span className={`font-medium ${entry.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {entry.action}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  Trigger: {entry.trigger} | Pages: {entry.storyLength}
                </div>
              </div>
            ))}
            {contentMutationLog.length === 0 && (
              <div className="text-gray-500 text-center py-2">No mutations logged</div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {onUnlockContent && (
            <Button 
              onClick={onUnlockContent} 
              size="sm" 
              variant="outline"
              className="text-xs"
              disabled={!isStoryContentLocked}
            >
              🔓 Unlock Content (Debug)
            </Button>
          )}
          {onClearLog && (
            <Button 
              onClick={onClearLog} 
              size="sm" 
              variant="ghost"
              className="text-xs"
            >
              🗑️ Clear Log
            </Button>
          )}
        </div>

        <div className="text-[10px] text-gray-500 border-t pt-2">
          This monitor shows the story content protection system status. 
          When content is LOCKED, unauthorized regeneration attempts are blocked.
        </div>
      </CardContent>
    </Card>
  );
};