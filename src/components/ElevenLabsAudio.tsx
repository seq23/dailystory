import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Square, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserInfo } from "@/types";

interface ElevenLabsAudioProps {
  text: string;
  userInfo: UserInfo;
  isPremium?: boolean;
  onUpgrade?: () => void;
  currentPage?: number;
  totalPages?: number;
  isExtendedPage?: boolean; // True if this page was added beyond the original 10
}

export const ElevenLabsAudio = ({ 
  text, 
  userInfo, 
  isPremium = false, 
  onUpgrade, 
  currentPage = 0, 
  totalPages = 1,
  isExtendedPage = false 
}: ElevenLabsAudioProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playedPages, setPlayedPages] = useState<Set<number>>(new Set()); // Track which pages have been played
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Free users get 1 audio play per page up to 10 pages, no audio for extended pages
  const maxFreePages = 10;
  const hasPlayedCurrentPage = playedPages.has(currentPage);
  const isWithinFreeLimit = currentPage < maxFreePages;
  const canUseAudio = isPremium || (!hasPlayedCurrentPage && isWithinFreeLimit && !isExtendedPage);

  const playAudio = async () => {
    if (!canUseAudio) {
      // Only show notification when free limit is reached (played all 10 pages)
      if (playedPages.size >= maxFreePages && !isPremium) {
        toast({
          title: "🎵 Free Limit Reached",
          description: "You've used all 10 free audio plays! Upgrade to Premium for unlimited audio on all pages.",
          variant: "default",
          duration: 4000,
        });
        onUpgrade?.();
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Call our Supabase edge function with correct URL
      const voice = getVoiceForUser(userInfo);
      const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
      const model = isNativeEnglishSpeaker ? "eleven_turbo_v2" : "eleven_multilingual_v2";
      
      const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: isPremium ? text.slice(0, 1000) : text.slice(0, 500), // Premium users get longer text
          voice: voice,
          model: model
        })
      });

      if (!response.ok) throw new Error('Failed to generate audio');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Mark page as played (no notification)
      if (!isPremium) {
        setPlayedPages(prev => new Set([...prev, currentPage]));
      }
      
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Audio Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const getVoiceForUser = (userInfo: UserInfo) => {
    // Select voice based on user preferences and language
    const age = userInfo.age;
    const isGirl = userInfo.avatar?.type === 'girl';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    // Use natural voices for native English speakers, multilingual voices for others
    if (isNativeEnglishSpeaker) {
      // Most natural English voices for native speakers
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
      } else if (age <= 12) {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "nPczCjzI2devNBz1zQrb"; // Jessica or Brian (very natural)
      } else {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "onwK4e9ZLuTAKqWW03F9"; // Jessica or Daniel (most natural)
      }
    } else {
      // Multilingual voices for non-native speakers
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
      } else if (age <= 12) {
        return isGirl ? "XB0fDUnXU5powFXDhCwa" : "N2lVS1w4EtoT3dr4eOWO"; // Charlotte or Callum
      } else {
        return isGirl ? "9BWtsMINqrJLrRacOk9x" : "CwhRBWXzGAHq8TQ4Fs17"; // Aria or Roger
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading || (!canUseAudio && !isPremium)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isLoading ? t("audioReading.generating", "Generating...") : isPlaying ? t("audioReading.stop", "Stop") : t("audioReading.playAudio", "Play Audio")}
      </Button>

      {!isPremium && (
        <div className="flex items-center gap-2">
          {!canUseAudio && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onUpgrade} variant="outline" size="sm">
                    {t("audioReading.upgrade", "Upgrade")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("audioReading.upgradeTooltip", "Upgrade to Premium for unlimited audio plays")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
};