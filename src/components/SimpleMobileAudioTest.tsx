import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Play, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react';

export const SimpleMobileAudioTest = () => {
  const { toast } = useToast();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'pending'>>({
    audioContext: 'pending',
    speechSynthesis: 'pending',
    userInteraction: 'pending'
  });
  const audioContextRef = useRef<AudioContext | null>(null);

  const updateTest = (test: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [test]: result }));
  };

  const enableAudio = async () => {
    try {
      // Step 1: Create audio context with user interaction
      updateTest('userInteraction', 'pass');
      toast({ title: "✅ User interaction detected" });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      updateTest('audioContext', 'pass');
      toast({ title: "✅ Audio context created" });

      // Step 2: Test if speech synthesis is available
      if ('speechSynthesis' in window) {
        updateTest('speechSynthesis', 'pass');
        toast({ title: "✅ Speech synthesis available" });
      } else {
        updateTest('speechSynthesis', 'fail');
        toast({ title: "❌ Speech synthesis not available" });
      }

      setAudioEnabled(true);
      toast({ 
        title: "🎉 Audio Setup Complete!", 
        description: "Your device is ready for audio",
        duration: 3000
      });

    } catch (error) {
      updateTest('audioContext', 'fail');
      toast({ 
        title: "❌ Audio Setup Failed", 
        description: String(error),
        duration: 5000
      });
    }
  };

  const testBeep = async () => {
    if (!audioContextRef.current) {
      toast({ title: "⚠️ Enable audio first" });
      return;
    }

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);

      toast({ 
        title: "🔊 Beep Test", 
        description: "You should hear a short beep sound",
        duration: 3000
      });

    } catch (error) {
      toast({ 
        title: "❌ Beep failed", 
        description: String(error)
      });
    }
  };

  const testSpeech = async () => {
    if (!('speechSynthesis' in window)) {
      toast({ title: "❌ Speech not supported" });
      return;
    }

    try {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance("Testing mobile audio");
      utterance.rate = 0.8;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        toast({ title: "🗣️ Speech started" });
      };

      utterance.onend = () => {
        toast({ title: "✅ Speech completed" });
      };

      utterance.onerror = (event) => {
        toast({ 
          title: "❌ Speech error", 
          description: event.error
        });
      };

      speechSynthesis.speak(utterance);

    } catch (error) {
      toast({ 
        title: "❌ Speech failed", 
        description: String(error)
      });
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔧 Simple Mobile Audio Test
          </h1>
          <p className="text-gray-600">
            Simplified test for mobile audio functionality
          </p>
        </header>

        <div className="space-y-6">
          {/* Diagnostics */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Audio Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User Interaction</span>
                  {getStatusIcon(testResults.userInteraction)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Audio Context</span>
                  {getStatusIcon(testResults.audioContext)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Speech Synthesis</span>
                  {getStatusIcon(testResults.speechSynthesis)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enable Button */}
          {!audioEnabled ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VolumeX className="w-5 h-5" />
                  Step 1: Initialize Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={enableAudio} className="w-full bg-orange-600 hover:bg-orange-700">
                  🎵 Initialize Audio System
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Ready ✅
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button onClick={testBeep} variant="outline" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Test Beep Sound
                  </Button>
                  <Button onClick={testSpeech} variant="outline" className="w-full">
                    🗣️ Test Speech
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📱 Mobile Audio Tips:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Turn off silent mode (check side switch)</li>
                <li>• Increase volume with volume buttons</li>
                <li>• Close other audio apps</li>
                <li>• Try with/without headphones</li>
                <li>• Use Safari browser (not Chrome)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};