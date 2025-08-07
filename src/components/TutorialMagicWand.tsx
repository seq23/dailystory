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
        "fixed top-20 right-4 z-50 tutorial-magic-wand",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "rounded-full p-3 shadow-xl",
        "animate-pulse",
        className
      )}
      disabled
      aria-label="Magic Wand (Tutorial)"
    >
      <Wand2 className="w-5 h-5" />
    </Button>
  );
};