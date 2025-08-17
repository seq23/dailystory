import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Image } from 'lucide-react';

interface ImageGenerationErrorBoundaryProps {
  currentPage: number;
  onRetry: () => void;
  fallbackImageUrl?: string;
}

/**
 * Error boundary for image generation with retry and static fallback
 */
export const ImageGenerationErrorBoundary: React.FC<ImageGenerationErrorBoundaryProps> = ({
  currentPage,
  onRetry,
  fallbackImageUrl
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };

  if (fallbackImageUrl) {
    return (
      <div className="relative w-full h-64 bg-secondary/10 rounded-lg overflow-hidden">
        <img 
          src={fallbackImageUrl}
          alt={`Story illustration ${currentPage + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRetry}
            disabled={retryCount >= maxRetries}
            className="opacity-80 hover:opacity-100"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Generate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full h-64 flex flex-col items-center justify-center bg-secondary/5 border-dashed">
      <Image className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-48">
        {retryCount >= maxRetries 
          ? "Unable to generate illustration" 
          : "Ready to generate illustrations for your story pages"
        }
      </p>
      {retryCount < maxRetries && (
        <Button
          size="sm"
          onClick={handleRetry}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate Image
        </Button>
      )}
    </Card>
  );
};