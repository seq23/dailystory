import React from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TutorialMagicWandProps {
  isVisible: boolean;
  tutorialStep?: number;
  className?: string;
}

export const TutorialMagicWand: React.FC<TutorialMagicWandProps> = ({
  isVisible,
  tutorialStep,
  className
}) => {
  if (!isVisible || tutorialStep !== 3) {
    return null;
  }

  return (
    <Button
      id="tutorial-magic-wand"
      data-id="magic-wand"
      className={cn(
        "fixed top-1/2 right-8 z-[70] tutorial-magic-wand",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
        "hover:from-amber-600 hover:to-orange-600 transition-all duration-300",
        "rounded-full p-8 shadow-2xl shadow-amber-500/60",
        "animate-pulse scale-150",
        "ring-6 ring-amber-300/60 ring-offset-4 ring-offset-background",
        "backdrop-filter-none !important",
        className
      )}
      disabled
      aria-label="Magic Wand - Generate New Story (Tutorial)"
      style={{ 
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important',
        transform: 'translateY(-50%)'
      }}
    >
      <Wand2 className="w-10 h-10" />
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-ping" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-300 rounded-full animate-ping delay-500" />
    </Button>
  );
};