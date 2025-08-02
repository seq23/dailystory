import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, Volume2, VolumeX } from 'lucide-react';

export const MobileAudioFix = () => {
  const { toast } = useToast();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const enableAudio = async () => {
    try {
      // Step 1: Request microphone permission to unlock audio
      toast({ title: "🎤 Requesting Audio Permission", description: "Please allow microphone access to enable audio" });
      
      await navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
      });

      // Step 2: Create and start audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Step 3: Play a simple test sound to fully unlock audio
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);

      setAudioEnabled(true);
      toast({ 
        title: "✅ Audio Enabled!", 
        description: "Your iPhone is now ready for audio playback",
        duration: 3000
      });

    } catch (error) {
      toast({ 
        title: "❌ Audio Setup Failed", 
        description: "Please enable microphone permission in Safari settings and try again",
        duration: 5000
      });
    }
  };

  const testTranslationAudio = async () => {
    if (!audioEnabled) {
      toast({ title: "⚠️ Enable Audio First", description: "Click 'Enable Audio' button first" });
      return;
    }

    setIsPlaying(true);
    try {
      // Get translation first
      toast({ title: "📡 Getting Translation", description: "Fetching Spanish translation..." });
      
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: {
          word: 'hello',
          targetLanguage: 'es',
          context: 'greeting'
        }
      });

      if (error) throw new Error('Translation failed');
      
      const translationText = data.translation || 'hola';
      
      toast({ 
        title: "📝 Translation Ready", 
        description: `Spanish: ${translationText}`,
        duration: 3000
      });

      // Use mobile-optimized speech synthesis
      if ('speechSynthesis' in window && audioContextRef.current) {
        // Cancel any existing speech
        speechSynthesis.cancel();
        
        // Wait for voices to load
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          await new Promise(resolve => {
            const loadVoices = () => {
              voices = speechSynthesis.getVoices();
              if (voices.length > 0) {
                speechSynthesis.removeEventListener('voiceschanged', loadVoices);
                resolve(voices);
              }
            };
            speechSynthesis.addEventListener('voiceschanged', loadVoices);
            setTimeout(() => resolve(voices), 2000); // Fallback timeout
          });
        }

        const utterance = new SpeechSynthesisUtterance(translationText);
        utterance.rate = 0.8;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'es-ES';

        // Find Spanish voice
        const spanishVoice = voices.find(voice => 
          voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
        );
        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        // Set up events
        utterance.onstart = () => {
          toast({ title: "🔊 Speaking Translation", description: "Audio is playing now!" });
        };

        utterance.onend = () => {
          setIsPlaying(false);
          toast({ title: "✅ Audio Complete", description: "Translation audio finished successfully!" });
        };

        utterance.onerror = (event) => {
          setIsPlaying(false);
          toast({ 
            title: "❌ Speech Error", 
            description: `Error: ${event.error}. Try turning up volume or using headphones.`,
            duration: 5000
          });
        };

        // Speak with immediate user interaction context
        speechSynthesis.speak(utterance);

        // Fallback timeout - but longer for mobile
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            setIsPlaying(false);
            toast({ 
              title: "⚠️ Audio Took Too Long", 
              description: "Try using headphones or checking volume settings",
              duration: 4000
            });
          }
        }, 15000); // 15 second timeout for mobile

      } else {
        throw new Error('Speech synthesis not available');
      }

    } catch (error) {
      setIsPlaying(false);
      toast({ 
        title: "❌ Translation Audio Failed", 
        description: String(error),
        duration: 4000
      });
    }
  };

  const testSimpleAudio = async () => {
    if (!audioEnabled) {
      toast({ title: "⚠️ Enable Audio First", description: "Click 'Enable Audio' button first" });
      return;
    }

    try {
      if (!audioContextRef.current) return;

      // Create a pleasant chime sound
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContextRef.current.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContextRef.current.currentTime + 0.2); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContextRef.current.currentTime + 0.4); // G5
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.6);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.6);

      toast({ 
        title: "🎵 Audio Test", 
        description: "You should hear a pleasant chime sound",
        duration: 3000
      });

    } catch (error) {
      toast({ 
        title: "❌ Simple Audio Failed", 
        description: String(error),
        duration: 4000
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📱 iPhone Audio Fix
          </h1>
          <p className="text-gray-600">
            Special mobile-optimized audio solution for your iPhone
          </p>
        </header>

        <div className="space-y-6">
          {!audioEnabled ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VolumeX className="w-5 h-5" />
                  Step 1: Enable Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  iPhones require special permission for audio. This will ask for microphone access 
                  to unlock audio playback (we won't record anything).
                </p>
                <Button onClick={enableAudio} className="w-full bg-orange-600 hover:bg-orange-700">
                  🔊 Enable Audio on iPhone
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Enabled ✅
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Great! Your iPhone audio is now ready. Try the tests below.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>🎵 Simple Audio Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test basic audio with a pleasant chime sound
              </p>
              <Button 
                onClick={testSimpleAudio} 
                disabled={!audioEnabled}
                variant="outline" 
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Test Sound
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗣️ Translation Audio Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test the full translation + speech system (translates "hello" to Spanish and speaks it)
              </p>
              <Button 
                onClick={testTranslationAudio} 
                disabled={!audioEnabled || isPlaying}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? (
                  <>🔄 Playing Audio...</>
                ) : (
                  <>🇪🇸 Test Translation Audio</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📱 iPhone Audio Tips:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure your iPhone is not in silent mode (check the switch)</li>
                <li>• Turn up your volume using the volume buttons</li>
                <li>• Try using headphones or AirPods</li>
                <li>• Make sure you're using Safari browser</li>
                <li>• Close other apps that might be using audio</li>
                <li>• If still no sound, restart Safari and try again</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};