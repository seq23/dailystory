import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cleanChildrensTextForSpeech } from "@/utils/contextualPronunciation";
import type { UserInfo } from "@/types";

interface ElevenLabsAudioProps {
  text: string;
  userInfo: UserInfo;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const ElevenLabsAudio = ({ text, userInfo, isPremium = false, onUpgrade }: ElevenLabsAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsedFree, setHasUsedFree] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Free users get 1 ElevenLabs audio per session
  const canUseAudio = isPremium || !hasUsedFree;

  const playAudio = async () => {
    if (!canUseAudio) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium for unlimited high-quality voice audio!",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Apply contextual preprocessing for better pronunciation
      const processedText = cleanChildrensTextForSpeech(text);
      const textToSend = isPremium ? processedText : processedText.slice(0, 500); // Limit for free users
      
      // Call our Supabase edge function
      const response = await fetch('https://cpzeuogomaixamrtnnmj.functions.supabase.co/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          voice: getVoiceForUser(userInfo),
          model: "eleven_multilingual_v2"
        })
      });

      if (!response.ok) throw new Error('Failed to generate audio');
      
      const data = await response.json();
      
      // Create audio blob from base64 response
      const base64Audio = data.audioContent;
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
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
      
      // Mark free usage
      if (!isPremium) {
        setHasUsedFree(true);
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
    // Select voice based on user preferences
    const age = userInfo.age;
    const isGirl = userInfo.avatar?.type === 'girl';
    
    if (age <= 8) {
      return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam (young voices)
    } else if (age <= 12) {
      return isGirl ? "XB0fDUnXU5powFXDhCwa" : "N2lVS1w4EtoT3dr4eOWO"; // Charlotte or Callum
    } else {
      return isGirl ? "9BWtsMINqrJLrRacOk9x" : "CwhRBWXzGAHq8TQ4Fs17"; // Aria or Roger
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
        {isLoading ? "Generating..." : isPlaying ? "Stop" : "Play Audio"}
      </Button>

      {!isPremium && (
        <div className="flex items-center gap-2">
          <Badge variant={canUseAudio ? "secondary" : "destructive"} className="text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Premium Voice
          </Badge>
          {!canUseAudio && (
            <Button onClick={onUpgrade} variant="outline" size="sm">
              Upgrade
            </Button>
          )}
        </div>
      )}
      
      {!isPremium && hasUsedFree && (
        <p className="text-xs text-gray-500">
          Premium: Unlimited high-quality voices
        </p>
      )}
    </div>
  );
};