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
    <Card className={cn(
      "border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5",
      "shadow-lg transition-all duration-500 ease-in-out",
      "animate-fade-in",
      className
    )}>
      <CardContent className="p-6 text-center space-y-4">
        {isStoryLoading ? (
          <>
            {/* Story Loading State */}
            <div className="relative flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary animate-pulse" />
              <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary">
                Your Story Comes First! 📖
              </h3>
              <p className="text-muted-foreground font-medium">
                {currentText}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span>Creating something amazing...</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Image Loading State */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <Palette className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-accent animate-bounce" />
                </div>
              </div>
              <Heart className="w-4 h-4 text-red-400 absolute -top-1 -right-1 animate-ping" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary">
                Now Drawing Your Pictures! 🎨
              </h3>
              <p className="text-muted-foreground font-medium">
                {currentText}
              </p>
              {batchProgress && (
                <p className="text-xs text-muted-foreground">
                  {batchProgress}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span>Magic in progress...</span>
              </div>
            </div>
          </>
        )}
        
        {/* Fun encouragement */}
        <div className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
          Stories first, pictures second - that's how we make the best adventures! ✨
        </div>
      </CardContent>
    </Card>
  );
};