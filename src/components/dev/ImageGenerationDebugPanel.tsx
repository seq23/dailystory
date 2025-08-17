import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Settings, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { ReaderLayout } from "@/hooks/useReaderLayout";

interface ImageGenerationDebugPanelProps {
  layout: ReaderLayout;
  hasImages: boolean;
  isGenerating: boolean;
  lastError?: string;
  onForceGenerate?: () => void;
  onClearCache?: () => void;
  onToggleAutoGeneration?: () => void;
  autoGenerationEnabled?: boolean;
}

export const ImageGenerationDebugPanel = ({
  layout,
  hasImages,
  isGenerating,
  lastError,
  onForceGenerate,
  onClearCache,
  onToggleAutoGeneration,
  autoGenerationEnabled = false
}: ImageGenerationDebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLayoutImageBehavior = (layout: ReaderLayout) => {
    switch (layout) {
      case "classic":
        return {
          behavior: "Manual only",
          description: "Images must be generated manually using the button",
          color: "bg-orange-100 text-orange-800 border-orange-200"
        };
      case "modern":
        return {
          behavior: "Auto-generation",
          description: "Images generate automatically as you read",
          color: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "split":
        return {
          behavior: "Auto-generation",
          description: "Images generate automatically in split view",
          color: "bg-green-100 text-green-800 border-green-200"
        };
    }
  };

  const behaviorInfo = getLayoutImageBehavior(layout);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 shadow-lg"
          onClick={() => setIsExpanded(true)}
        >
          <Image className="w-4 h-4" />
          Image Debug
          {lastError && <AlertTriangle className="w-3 h-3 text-destructive" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Image className="w-4 h-4" />
              Image Generation Debug
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(false)}
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Layout Behavior</div>
            <Badge className={`${behaviorInfo.color} flex items-center gap-1 w-fit mb-1`}>
              {behaviorInfo.behavior}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {behaviorInfo.description}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Has Images:</span>
                <Badge variant={hasImages ? "default" : "secondary"}>
                  {hasImages ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Generating:</span>
                <Badge variant={isGenerating ? "default" : "secondary"}>
                  {isGenerating ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Auto-Generation:</span>
                <Badge variant={autoGenerationEnabled ? "default" : "secondary"}>
                  {autoGenerationEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>

          {lastError && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Last Error</div>
              <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
                {lastError}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-muted-foreground mb-2">Actions</div>
            <div className="flex flex-col gap-2">
              {onForceGenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex items-center gap-1"
                  onClick={onForceGenerate}
                  disabled={isGenerating}
                >
                  <Zap className="w-3 h-3" />
                  Force Generate
                </Button>
              )}
              
              {onToggleAutoGeneration && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex items-center gap-1"
                  onClick={onToggleAutoGeneration}
                >
                  <RefreshCw className="w-3 h-3" />
                  {autoGenerationEnabled ? "Disable" : "Enable"} Auto
                </Button>
              )}
              
              {onClearCache && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={onClearCache}
                >
                  Clear Cache
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};