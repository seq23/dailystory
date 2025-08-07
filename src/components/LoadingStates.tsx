import { Loader2, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
};

interface StoryGenerationLoadingProps {
  className?: string;
  message?: string;
}

export const StoryGenerationLoading = ({ 
  className, 
  message = "Creating your magical story..." 
}: StoryGenerationLoadingProps) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 space-y-4',
      className
    )}>
      <div className="relative">
        <BookOpen className="w-12 h-12 text-primary animate-pulse" />
        <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-bounce" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">{message}</p>
        <div className="flex items-center gap-2 justify-center">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-muted-foreground">This might take a moment...</span>
        </div>
      </div>
    </div>
  );
};

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ButtonLoading = ({ 
  isLoading, 
  children, 
  loadingText,
  className 
}: ButtonLoadingProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </div>
  );
};