import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useWordHighlighting } from '@/hooks/useWordHighlighting';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateImage } from '@/util/imageGenerator';
import { useDebounce } from '@/hooks/useDebounce';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from 'next-i18next';
import { v4 as uuidv4 } from 'uuid';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast
} from '@chakra-ui/react';

// Props for the CleanStoryDisplay component
interface CleanStoryDisplayProps {
  story: string;
  onBack: () => void;
  onRefresh: () => void;
  onNext?: () => void;
  showNext?: boolean;
  onImageGenerate?: (base64: string, storyId: string, pageNumber: number) => void;
  currentPage?: number;
  totalPages?: number;
  storyTitle?: string;
}

const CleanStoryDisplay = ({ 
  story, 
  onBack, 
  onRefresh, 
  onNext, 
  showNext, 
  onImageGenerate,
  currentPage = 1,
  totalPages = 1,
  storyTitle = "Story"
}: CleanStoryDisplayProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { speak, speaking, cancel } = useSpeechSynthesis();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [storyId, setStoryId] = useLocalStorage('storyId', uuidv4());
  const { prompt } = usePromptGenerator(story, storyTitle);
  const { imageSize } = useSettings();
  const toast = useToast();

  // Audio highlighting integration
  const { 
    onWordHighlight, 
    currentHighlightedWord, 
    clearHighlighting 
  } = useWordHighlighting(story, isAudioPlaying);

  // Split story into words for highlighting
  const words = story.split(/\s+/);

  // useRef for debounced values
  const debouncedStory = useDebounce(story, 500);
  const debouncedPrompt = useDebounce(prompt, 500);

  // Toggle audio and handle speech synthesis
  const toggleAudio = useCallback(() => {
    if (!story) return;

    setIsAudioPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        console.log('🎤 Starting speech synthesis');
        speak({ 
          text: story, 
          onBoundary: (event) => {
            if (event.name === 'word') {
              const wordIndex = event.charIndex ? story.substring(0, event.charIndex).split(/\s+/).length : 0;
              handleWordHighlight(wordIndex);
            }
          },
          onEnd: () => {
            console.log('🎤 Speech synthesis ended');
            setIsAudioPlaying(false);
            clearHighlighting();
          }
        });
      } else {
        console.log('🛑 Stopping speech synthesis');
        cancel();
        clearHighlighting();
      }
      return newState;
    });
  }, [story, speak, cancel, clearHighlighting, handleWordHighlight]);

  // Generate image based on story content
  const handleImageGeneration = useCallback(async () => {
    if (!story || !onImageGenerate) return;

    setIsImageLoading(true);
    try {
      const base64 = await generateImage(debouncedPrompt, imageSize);
      if (base64) {
        onImageGenerate(base64, storyId, currentPage);
      } else {
        toast({
          title: t('image_generation_failed'),
          description: t('please_try_again'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: t('image_generation_failed'),
        description: t('please_check_your_api_key'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImageLoading(false);
    }
  }, [story, onImageGenerate, debouncedPrompt, imageSize, storyId, currentPage, toast, t]);

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
    toast({
      title: t('link_copied'),
      description: t('share_the_story'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsShareModalOpen(false);
  }, [shareableLink, toast, t]);

  // Handle audio highlighting coordination
  const handleWordHighlight = useCallback((wordIndex: number) => {
    console.log(`📍 CleanStoryDisplay: Highlighting word ${wordIndex}`);
    onWordHighlight(wordIndex);
  }, [onWordHighlight]);

  // useEffect to clear highlighting when the component mounts or story changes
  useEffect(() => {
    clearHighlighting();
  }, [story, clearHighlighting]);

  // Ensure audio is stopped when navigating away
  useEffect(() => {
    const handleRouteChange = () => {
      cancel();
      setIsAudioPlaying(false);
      clearHighlighting();
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [cancel, router, clearHighlighting]);

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
        <Button onClick={onBack}>{t('back')}</Button>
         <span>
            {currentPage} / {totalPages}
          </span>
        <div className="flex gap-2">
          <Button 
            isLoading={speaking} 
            colorScheme={isAudioPlaying ? 'red' : 'blue'} 
            onClick={toggleAudio}
          >
            {isAudioPlaying ? t('stop') : t('play')}
          </Button>
          <Button isLoading={isImageLoading} onClick={handleImageGeneration}>{t('generate_image')}</Button>
          <Button onClick={handleShare}>{t('share')}</Button>
          {showNext && <Button onClick={onNext}>{t('next')}</Button>}
        </div>
      </div>

      {/* Share Modal */}
      {/* <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareableLink={shareableLink}
        onCopy={copyToClipboard}
      /> */}
      <AlertDialog
        isOpen={isShareModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsShareModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('share_story')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('share_this_story_with_friends')}
              <div className="mt-4">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsShareModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button colorScheme="blue" onClick={copyToClipboard} ml={3}>
                {t('copy_link')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={openAlertDialog}
        leastDestructiveRef={cancelRef}
        onClose={() => setOpenAlertDialog(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('confirmation')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('are_you_sure_you_want_to_refresh')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setOpenAlertDialog(false)}>
                {t('cancel')}
              </Button>
              <Button colorScheme="red" onClick={onRefresh} ml={3}>
                {t('refresh')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default CleanStoryDisplay;
