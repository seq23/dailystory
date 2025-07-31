import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from 'lucide-react';
import { OpenAITTSService } from '@/services/openaiTTSService';
import type { UserInfo } from '@/types';

interface InteractiveAudioReadingProps {
  text: string;
  userInfo: UserInfo;
  onWordHighlight?: (wordIndex: number) => void;
  isEnabled: boolean;
}

export const InteractiveAudioReading = ({ 
  text, 
  userInfo, 
  onWordHighlight, 
  isEnabled 
}: InteractiveAudioReadingProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [ttsService] = useState(() => new OpenAITTSService());
  const [words, setWords] = useState<string[]>([]);
  const [audioSpeed, setAudioSpeed] = useState(userInfo.nativeLanguage === 'en' ? 1.0 : 0.8);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Split text into words for highlighting
    const textWords = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    setWords(textWords);
  }, [text]);

  const startReading = async () => {
    if (!isEnabled) return;
    
    try {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      // Calculate timing for word highlighting
      const totalWords = words.length;
      const estimatedDuration = text.length * 100; // Rough estimate in ms
      const wordsPerSecond = totalWords / (estimatedDuration / 1000);
      const wordInterval = 1000 / wordsPerSecond / audioSpeed;

      // Start TTS
      const voice = userInfo.nativeLanguage === 'en' ? 'alloy' : 'nova';
      ttsService.speakText(text, { voice, speed: audioSpeed });

      // Highlight words with timing
      highlightWords(wordInterval);
      
    } catch (error) {
      console.error('Error starting audio reading:', error);
      setIsPlaying(false);
    }
  };

  const highlightWords = (interval: number) => {
    let index = 0;
    
    const highlightNext = () => {
      if (index < words.length && isPlaying) {
        setCurrentWordIndex(index);
        onWordHighlight?.(index);
        index++;
        timeoutRef.current = setTimeout(highlightNext, interval);
      } else {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
      }
    };
    
    highlightNext();
  };

  const stopReading = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    ttsService.stopCurrentAudio();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const toggleReading = () => {
    if (isPlaying) {
      stopReading();
    } else {
      startReading();
    }
  };

  const adjustSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlaying) {
      stopReading();
      // Auto-restart with new speed after brief pause
      setTimeout(() => startReading(), 100);
    }
  };

  if (!isEnabled) {
    return (
      <div className="text-center text-gray-500 py-2">
        <p className="text-sm">Add your OpenAI API key to enable audio reading</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg">
      <Button
        onClick={toggleReading}
        variant="outline"
        size="sm"
        className="rounded-full"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => adjustSpeed(0.5)}
          variant="ghost"
          size="sm"
          className={`text-xs ${audioSpeed === 0.5 ? 'bg-blue-100' : ''}`}
        >
          0.5x
        </Button>
        <Button
          onClick={() => adjustSpeed(0.8)}
          variant="ghost"
          size="sm"
          className={`text-xs ${audioSpeed === 0.8 ? 'bg-blue-100' : ''}`}
        >
          0.8x
        </Button>
        <Button
          onClick={() => adjustSpeed(1.0)}
          variant="ghost"
          size="sm"
          className={`text-xs ${audioSpeed === 1.0 ? 'bg-blue-100' : ''}`}
        >
          1x
        </Button>
      </div>

      {isPlaying && (
        <div className="text-xs text-blue-600">
          Reading... ({currentWordIndex + 1}/{words.length})
        </div>
      )}
    </div>
  );
};