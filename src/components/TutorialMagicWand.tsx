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
        "fixed top-24 right-6 z-[70] tutorial-magic-wand",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
        "hover:from-amber-600 hover:to-orange-600 transition-all duration-300",
        "rounded-full p-6 shadow-xl shadow-amber-500/50",
        "animate-pulse scale-125",
        "ring-4 ring-amber-300/50 ring-offset-2 ring-offset-background",
        "backdrop-filter-none !important",
        className
      )}
      disabled
      aria-label="Magic Wand - Generate New Story (Tutorial)"
      style={{ 
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important'
      }}
    >
      <Wand2 className="w-8 h-8" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
    </Button>
  );
};