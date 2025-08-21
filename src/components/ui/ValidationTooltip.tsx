import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Shield, HelpCircle } from 'lucide-react';

interface ValidationTooltipProps {
  isValid: boolean;
  errors?: string[];
  hasCoppaViolation?: boolean;
  children: React.ReactNode;
}

export const ValidationTooltip: React.FC<ValidationTooltipProps> = ({
  isValid,
  errors = [],
  hasCoppaViolation = false,
  children
}) => {
  if (isValid || errors.length === 0) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
              <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 bg-background border border-destructive/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
              {hasCoppaViolation ? <Shield className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{hasCoppaViolation ? "Privacy Alert" : "Content Issue"}</span>
            </div>
            
            {errors.map((error, index) => (
              <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {error}
              </div>
            ))}
            
            {hasCoppaViolation && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  <span>Why can't I use this?</span>
                </div>
                <p className="mt-1">
                  This helps protect children's privacy online. Try using different words that don't include personal information.
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};