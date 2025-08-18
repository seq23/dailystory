import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Palette, Wand2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingStates";
import { cn } from "@/lib/utils";

interface KidFriendlyImageStatusProps {
  isStoryLoading: boolean;
  isStoryStable: boolean;
  isGeneratingImages: boolean;
  isBatchGenerating: boolean;
  batchProgress?: string;
  hasImages: boolean;
  className?: string;
}

const STORY_MESSAGES = [
  "Creating your magical story... ✨",
  "Adding your favorite things... 🌟",
  "Sprinkling in some magic... 🪄",
  "Almost ready for your adventure... 🎭"
];

const IMAGE_MESSAGES = [
  "Drawing your adventure... 🎨",
  "Painting beautiful scenes... 🖌️",
  "Adding colors to your story... 🌈",
  "Creating magical pictures... ✨",
  "Bringing your story to life... 🎭"
];

export const KidFriendlyImageStatus = ({
  isStoryLoading,
  isStoryStable,
  isGeneratingImages,
  isBatchGenerating,
  batchProgress,
  hasImages,
  className
}: KidFriendlyImageStatusProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showComponent, setShowComponent] = useState(false);

  // Determine if we should show the component
  useEffect(() => {
    const shouldShow = isStoryLoading || (isStoryStable && (isGeneratingImages || isBatchGenerating) && !hasImages);
    setShowComponent(shouldShow);
  }, [isStoryLoading, isStoryStable, isGeneratingImages, isBatchGenerating, hasImages]);

  // Rotate messages every 2 seconds
  useEffect(() => {
    if (!showComponent) return;

    const messages = isStoryLoading ? STORY_MESSAGES : IMAGE_MESSAGES;
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showComponent, isStoryLoading]);

  if (!showComponent) return null;

  const messages = isStoryLoading ? STORY_MESSAGES : IMAGE_MESSAGES;
  const currentText = messages[currentMessage];

  return (
    <div className={cn(
      "w-full bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4",
      "transition-all duration-300 ease-in-out animate-fade-in",
      "md:p-4", // More padding on larger screens
      className
    )}>
      <div className="flex items-center gap-3 w-full">
        {isStoryLoading ? (
          <>
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary text-sm md:text-base">Your Story Comes First! 📖</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{currentText}</p>
            </div>
          </>
        ) : (
          <>
            <Palette className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary text-sm md:text-base">Drawing Pictures! 🎨</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{currentText}</p>
              {batchProgress && (
                <p className="text-xs text-muted-foreground/70 truncate">{batchProgress}</p>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground/60 italic text-center mt-2 md:mt-3">
        Stories first, pictures second! ✨
      </div>
    </div>
  );
};