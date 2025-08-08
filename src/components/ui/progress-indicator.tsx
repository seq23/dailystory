import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown } from 'lucide-react';

interface ProgressIndicatorProps {
  pagesViewed: number;
  maxPages: number;
  isNearLimit: boolean;
  hasReachedLimit: boolean;
  isPremium?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  pagesViewed,
  maxPages,
  isNearLimit,
  hasReachedLimit,
  isPremium = false,
  className = ""
}) => {
  if (isPremium) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Crown className="h-4 w-4 text-amber-500" />
        <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200">
          Unlimited Pages
        </Badge>
      </div>
    );
  }

  const progressPercentage = Math.min((pagesViewed / maxPages) * 100, 100);
  const remainingPages = Math.max(0, maxPages - pagesViewed);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Pages explored: {pagesViewed}/{maxPages}
        </span>
        {isNearLimit && !hasReachedLimit && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs">{remainingPages} remaining</span>
          </div>
        )}
        {hasReachedLimit && (
          <Badge variant="destructive" className="text-xs">
            Limit Reached
          </Badge>
        )}
      </div>
      
      <Progress 
        value={progressPercentage} 
        className={`h-2 ${
          hasReachedLimit 
            ? "[&>*]:bg-destructive" 
            : isNearLimit 
              ? "[&>*]:bg-amber-500" 
              : ""
        }`}
      />
      
      {isNearLimit && !hasReachedLimit && (
        <p className="text-xs text-amber-600">
          You're approaching the free trial limit. Consider upgrading for unlimited reading!
        </p>
      )}
      
      {hasReachedLimit && (
        <p className="text-xs text-destructive">
          Free trial session ended. Upgrade to premium for unlimited reading!
        </p>
      )}
    </div>
  );
};