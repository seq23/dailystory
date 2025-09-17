import { AlertCircle, Loader2, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { DebugLogger } from "@/services/DebugLogger";

interface ImageGenerationStatusProps {
  isGenerating: boolean;
  isBatchGenerating: boolean;
  batchProgress?: string;
  hasImages: boolean;
  isNetworkAvailable: boolean;
  lastError?: string;
  layout?: "classic" | "modern" | "split";
  showLayoutInfo?: boolean;
}

export const ImageGenerationStatusIndicator = ({
  isGenerating,
  isBatchGenerating,
  batchProgress,
  hasImages,
  isNetworkAvailable,
  lastError,
  layout = "modern",
  showLayoutInfo = false
}: ImageGenerationStatusProps) => {
  // Debug status changes for better troubleshooting
  React.useEffect(() => {
    DebugLogger.log('image', 'IMAGE STATUS DEBUG', { 
      isGenerating, 
      isBatchGenerating, 
      hasImages, 
      isNetworkAvailable, 
      lastError: lastError ? lastError.substring(0, 100) : null,
      layout
    });
  }, [isGenerating, isBatchGenerating, hasImages, isNetworkAvailable, lastError, layout]);

  // Don't show anything if everything is working normally
  if (!isGenerating && !isBatchGenerating && hasImages && isNetworkAvailable && !lastError) {
    return null;
  }

  // Network issues
  if (!isNetworkAvailable) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          No internet connection. Images will be generated when connection is restored.
        </AlertDescription>
      </Alert>
    );
  }

  // Generation in progress
  if (isGenerating || isBatchGenerating) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          {isBatchGenerating 
            ? `Generating story illustrations... ${batchProgress || ''}`
            : 'Creating illustration for this page...'
          }
        </AlertDescription>
      </Alert>
    );
  }

  // Error state
  if (lastError) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Image generation temporarily unavailable. Your story continues without illustrations.
        </AlertDescription>
      </Alert>
    );
  }

  // No images but service available
  if (!hasImages && isNetworkAvailable) {
    const isClassicLayout = layout === "classic";
    const message = isClassicLayout 
      ? "In Classic mode, tap 'Generate illustration' to create images for your story pages."
      : "Ready to generate illustrations for your story pages automatically.";
    
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          {message}
          {showLayoutInfo && isClassicLayout && (
            <div className="mt-1 text-xs text-muted-foreground">
              Switch to Modern layout for automatic image generation.
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};