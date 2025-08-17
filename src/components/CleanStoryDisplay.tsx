
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordHighlighting } from '@/hooks/useWordHighlighting';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import type { UserInfo, SessionStats } from '@/types';

// Props for the CleanStoryDisplay component
interface CleanStoryDisplayProps {
  userInfo?: UserInfo;
  isPremium?: boolean;
  onSessionEnded?: (stats: SessionStats) => void;
  onHome?: () => void;
  onUpgrade?: () => void;
  onNewStory?: () => void;
  readingAsName?: string;
  story?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  onNext?: () => void;
  showNext?: boolean;
  onImageGenerate?: (base64: string, storyId: string, pageNumber: number) => void;
  currentPage?: number;
  totalPages?: number;
  storyTitle?: string;
}

const CleanStoryDisplay = ({ 
  userInfo,
  isPremium = false,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory,
  readingAsName,
  story = "Welcome to your story reader!",
  onBack,
  onRefresh,
  onNext,
  showNext = false,
  onImageGenerate,
  currentPage = 1,
  totalPages = 1,
  storyTitle = "Story"
}: CleanStoryDisplayProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [storyId] = useState(() => uuidv4());
  const audioEngine = SimpleAudioEngine.getInstance();

  // Audio highlighting integration
  const { 
    onWordHighlight, 
    currentHighlightedWord, 
    clearHighlighting 
  } = useWordHighlighting(story, isAudioPlaying);

  // Split story into words for highlighting
  const words = story.split(/\s+/);

  // Handle audio highlighting coordination
  const handleWordHighlight = useCallback((wordIndex: number) => {
    console.log(`📍 CleanStoryDisplay: Highlighting word ${wordIndex}`);
    onWordHighlight(wordIndex);
  }, [onWordHighlight]);

  // Toggle audio and handle speech synthesis
  const toggleAudio = useCallback(async () => {
    if (!story) return;

    setIsAudioPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        console.log('🎤 Starting audio playback');
        audioEngine.playText({
          text: story,
          voiceId: 'alloy',
          onWordBoundary: (wordIndex: number) => {
            handleWordHighlight(wordIndex);
          },
          onEnd: () => {
            console.log('🎤 Audio playback ended');
            setIsAudioPlaying(false);
            clearHighlighting();
          }
        }).catch(console.error);
      } else {
        console.log('🛑 Stopping audio playback');
        audioEngine.stop();
        clearHighlighting();
      }
      return newState;
    });
  }, [story, handleWordHighlight, clearHighlighting]);

  // Generate image based on story content
  const handleImageGeneration = useCallback(async () => {
    if (!story || !onImageGenerate) return;

    setIsImageLoading(true);
    try {
      // Mock image generation for now
      const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      onImageGenerate(mockBase64, storyId, currentPage);
      toast.success(t('image_generated', 'Image generated successfully!'));
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(t('image_generation_failed', 'Image generation failed'));
    } finally {
      setIsImageLoading(false);
    }
  }, [story, onImageGenerate, storyId, currentPage, t]);

  // Create a shareable link for the current story
  const handleShare = useCallback(() => {
    const baseUrl = window.location.origin;
    const storyRoute = `/story/${storyId}`;
    const fullUrl = `${baseUrl}${storyRoute}`;
    setShareableLink(fullUrl);
    setIsShareModalOpen(true);
  }, [storyId]);

  // Function to copy the shareable link to the clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareableLink);
    toast.success(t('link_copied', 'Link copied to clipboard!'));
    setIsShareModalOpen(false);
  }, [shareableLink, t]);

  // useEffect to clear highlighting when the component mounts or story changes
  useEffect(() => {
    clearHighlighting();
  }, [story, clearHighlighting]);

  // Ensure audio is stopped when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      audioEngine.stop();
      setIsAudioPlaying(false);
      clearHighlighting();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [audioEngine, clearHighlighting]);

  return (
    <div className="flex flex-col h-full">
      {/* Story Content */}
      <div className="flex-grow overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{storyTitle}</h1>
        <div className="text-gray-800">
          {words.map((word, index) => (
            <span
              key={index}
              className={index === currentHighlightedWord ? 'bg-yellow-200' : ''}
            >
              {word}{index < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <Button onClick={onBack || onHome}>{t('back', 'Back')}</Button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Button 
            variant={isAudioPlaying ? 'destructive' : 'default'}
            onClick={toggleAudio}
          >
            {isAudioPlaying ? t('stop', 'Stop') : t('play', 'Play')}
          </Button>
          {onImageGenerate && (
            <Button 
              disabled={isImageLoading} 
              onClick={handleImageGeneration}
            >
              {isImageLoading ? t('generating', 'Generating...') : t('generate_image', 'Generate Image')}
            </Button>
          )}
          <Button onClick={handleShare}>{t('share', 'Share')}</Button>
          {showNext && onNext && (
            <Button onClick={onNext}>{t('next', 'Next')}</Button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <AlertDialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('share_story', 'Share Story')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('share_this_story_with_friends', 'Share this story with friends')}
              <div className="mt-4">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={copyToClipboard}>
              {t('copy_link', 'Copy Link')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmation', 'Confirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('are_you_sure_you_want_to_refresh', 'Are you sure you want to refresh?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelRef}>
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onRefresh}>
              {t('refresh', 'Refresh')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CleanStoryDisplay;
