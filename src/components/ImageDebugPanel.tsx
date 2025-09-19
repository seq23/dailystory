import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface ImageDebugPanelProps {
  currentPage: number;
  currentStoryText: string;
  currentImage: string | undefined;
  pageImages: Record<number, string>;
  isGeneratingImage: boolean;
  onRegenerateImage?: () => void;
  imageMetadata?: {
    specificTier?: string;
    templateType?: string;
    tierPath?: string[];
    enhancementLevel?: string;
    processingTime?: number;
    emergencyFallback?: boolean;
    attemptedTiers?: string[];
    fallbackReason?: string;
  };
}

export const ImageDebugPanel: React.FC<ImageDebugPanelProps> = ({
  currentPage,
  currentStoryText,
  currentImage,
  pageImages,
  isGeneratingImage,
  onRegenerateImage,
  imageMetadata
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastBackendLogs, setLastBackendLogs] = useState<any[]>([]);

  // Check if debug mode is enabled
  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  // EMERGENCY FIX: Disabled auto-polling to prevent resource exhaustion
  useEffect(() => {
    if (!isDebugMode || !isVisible) return;

    const checkBackendLogs = () => {
      // Look for tier success messages in console logs
      const logs = (window as any).__BACKEND_ORCHESTRATOR_LOGS__ || [];
      setLastBackendLogs(logs.slice(-5)); // Last 5 logs
    };

    // Load once on visibility change, no auto-refresh to prevent connection exhaustion
    checkBackendLogs();
    
    // NO AUTO-POLLING - manual refresh only to prevent ERR_INSUFFICIENT_RESOURCES
    // Previously: const interval = setInterval(checkBackendLogs, 10000);
    // return () => clearInterval(interval);
  }, [isDebugMode, isVisible]);

  if (!isDebugMode) return null;

  const analyzeContent = (text: string) => {
    const lowerText = text.toLowerCase();
    return {
      hasMultipleCharacters: lowerText.includes('friends') || lowerText.includes('together') || lowerText.includes('with'),
      mentionsPark: lowerText.includes('park') || lowerText.includes('playground'),
      isPlayingScene: lowerText.includes('play') || lowerText.includes('playing'),
      characterName: text.match(/([A-Z][a-z]+)\s/)?.[1] || 'Unknown'
    };
  };

  const contentAnalysis = analyzeContent(currentStoryText);
  const expectedScene = contentAnalysis.hasMultipleCharacters && contentAnalysis.mentionsPark 
    ? 'Multiple children playing in park'
    : contentAnalysis.isPlayingScene 
    ? 'Playing scene'
    : 'Character scene';

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">🔍 Image Debug Panel</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="h-6 w-6 p-0"
            >
              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        {isVisible && (
          <CardContent className="pt-0 space-y-3 text-xs">
            {/* Current Page Info */}
            <div>
              <div className="font-medium mb-1">📄 Page {currentPage + 1}</div>
              <div className="bg-muted p-2 rounded text-xs">
                "{currentStoryText.substring(0, 100)}..."
              </div>
            </div>

            {/* Content Analysis */}
            <div>
              <div className="font-medium mb-1">🎯 Expected Scene</div>
              <Badge variant={contentAnalysis.hasMultipleCharacters ? "default" : "secondary"}>
                {expectedScene}
              </Badge>
              <div className="mt-1 space-y-1">
                <div>👥 Multiple chars: {contentAnalysis.hasMultipleCharacters ? '✅' : '❌'}</div>
                <div>🏞️ Park setting: {contentAnalysis.mentionsPark ? '✅' : '❌'}</div>
                <div>🎮 Playing action: {contentAnalysis.isPlayingScene ? '✅' : '❌'}</div>
              </div>
            </div>

            {/* Current Image Status */}
            <div>
              <div className="font-medium mb-1">🖼️ Current Image</div>
              {currentImage ? (
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-1">Has Image</Badge>
                  <div className="text-xs text-muted-foreground">
                    URL: {currentImage.substring(0, 40)}...
                  </div>
                  <div className="text-xs">
                    Style: {currentImage.includes('anime') ? '🎨 Anime' : 
                           currentImage.includes('cartoon') ? '🎨 Cartoon' : 
                           currentImage.includes('realistic') ? '🎨 Realistic' : '🎨 Unknown'}
                  </div>
                </div>
              ) : (
                <Badge variant="destructive">No Image</Badge>
              )}
            </div>

            {/* Generation Status */}
            <div>
              <div className="font-medium mb-1">⚡ Generation Status</div>
              <Badge variant={isGeneratingImage ? "default" : "secondary"}>
                {isGeneratingImage ? "🔄 Generating..." : "✅ Ready"}
              </Badge>
            </div>

            {/* All Pages Overview */}
            <div>
              <div className="font-medium mb-1">📊 All Pages ({Object.keys(pageImages).length} images)</div>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({length: Math.max(10, Object.keys(pageImages).length + 5)}).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded text-center text-xs flex items-center justify-center ${
                      i === currentPage 
                        ? 'bg-primary text-primary-foreground' 
                        : pageImages[i] 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            {onRegenerateImage && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRegenerateImage}
                disabled={isGeneratingImage}
                className="w-full"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate Image
              </Button>
            )}

            {/* Tier Information */}
            {imageMetadata && (
              <div>
                <div className="font-medium mb-1">🎯 Tier Information</div>
                <div className="space-y-1">
                  {imageMetadata.specificTier && (
                    <div className="flex justify-between">
                      <span>Tier:</span>
                      <Badge variant={imageMetadata.emergencyFallback ? "destructive" : "default"}>
                        {imageMetadata.specificTier}
                      </Badge>
                    </div>
                  )}
                  {imageMetadata.templateType && (
                    <div className="text-xs bg-muted p-1 rounded">
                      📋 {imageMetadata.templateType}
                    </div>
                  )}
                  {imageMetadata.tierPath && (
                    <div className="text-xs">
                      🛤️ Path: {imageMetadata.tierPath.join(' → ')}
                    </div>
                  )}
                  {imageMetadata.processingTime && (
                    <div className="text-xs">
                      ⏱️ Time: {imageMetadata.processingTime}ms
                    </div>
                  )}
                  {imageMetadata.enhancementLevel && (
                    <div className="text-xs">
                      ✨ Level: {imageMetadata.enhancementLevel}
                    </div>
                  )}
                  {imageMetadata.emergencyFallback && (
                    <Badge variant="destructive" className="text-xs">
                      🚨 Emergency Fallback
                    </Badge>
                  )}
                  {imageMetadata.fallbackReason && (
                    <div className="text-xs text-yellow-600">
                      ⚠️ Reason: {imageMetadata.fallbackReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Console Instructions */}
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              💡 Check browser console for detailed tier logs and processing information
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};