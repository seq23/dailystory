import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { createOpenAITTSService } from '@/services/textToSpeechService';
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
  const [ttsService] = useState(() => createOpenAITTSService());
  const [words, setWords] = useState<string[]>([]);
  const [audioSpeed, setAudioSpeed] = useState(userInfo.nativeLanguage === 'en' ? 1.0 : 0.8);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false); // Track if audio has been played
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Split text into words for highlighting
    const textWords = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    setWords(textWords);
  }, [text]);

  const startReading = async () => {
    if (!isEnabled || isPlaying || hasPlayedAudio) return;
    
    try {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      // Calculate timing for word highlighting
      const totalWords = words.length;
      const estimatedDuration = text.length * 100; // Rough estimate in ms
      const wordsPerSecond = totalWords / (estimatedDuration / 1000);
      const wordInterval = 1000 / wordsPerSecond / audioSpeed;

      // Start TTS  
      await ttsService.speakText(text, { speed: audioSpeed });

      // Mark audio as played for free users
      setHasPlayedAudio(true);

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
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const adjustSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    // Note: If audio is playing, user needs to restart to use new speed
    if (isPlaying) {
      stopReading();
    }
    // Reset the played state when speed changes so they can try the new speed
    if (hasPlayedAudio) {
      setHasPlayedAudio(false);
    }
  };

  // Reset hasPlayedAudio when text changes (new page)
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, [text]);

  if (!isEnabled) {
    return (
      <div className="text-center text-gray-500 py-2">
        <p className="text-sm">Add your OpenAI API key to enable audio reading</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-3 bg-blue-50 rounded-lg border">
      {/* Audio Button */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <Button
            onClick={startReading}
            disabled={isPlaying || hasPlayedAudio}
            variant="outline"
            size="sm"
            className={`rounded-full hover:bg-blue-100 transition-colors ${
              hasPlayedAudio ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-4 h-4" />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {hasPlayedAudio ? 'Audio used (1x per page for free users)' : 
             isPlaying ? 'Audio playing...' : 'Play audio reading'}
          </div>
        </div>
        
        {/* Status indicator */}
        {hasPlayedAudio && (
          <span className="text-xs text-orange-600 font-medium">
            ✓ Audio used
          </span>
        )}
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600 mr-2">Speed:</span>
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
      
      {/* Status and upgrade prompt */}
      {isPlaying && (
        <div className="text-xs text-blue-600 font-medium">
          🎵 Playing audio... ({currentWordIndex + 1}/{words.length})
        </div>
      )}
      
      {hasPlayedAudio && (
        <div className="text-center mt-1">
          <div className="text-xs text-orange-600 mb-1">
            🎧 Free users get 1 audio per page
          </div>
          <div className="text-xs text-gray-600">
            Want unlimited audio? 
            <button className="ml-1 text-blue-600 hover:text-blue-800 underline font-medium">
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};