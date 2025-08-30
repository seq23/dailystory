import { WandSparkles, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageMixingLoadingProps {
  className?: string;
}

export function ImageMixingLoading({ className }: ImageMixingLoadingProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <WandSparkles className="w-8 h-8 text-primary animate-spin" />
        <Palette className="w-6 h-6 text-accent animate-bounce" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Mixing up the perfect image...</p>
    </div>
  );
}