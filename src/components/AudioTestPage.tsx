import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AudioTestPage = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'failed' | 'testing'>>({});

  const updateResult = (test: string, result: 'pending' | 'success' | 'failed' | 'testing') => {
    setTestResults(prev => ({ ...prev, [test]: result }));
  };

  const test1_BasicAudio = async () => {
    updateResult('basic', 'testing');
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A note
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      updateResult('basic', 'success');
      toast({ title: "✅ Basic Audio", description: "Device can play basic audio" });
    } catch (error) {
      updateResult('basic', 'failed');
      toast({ title: "❌ Basic Audio Failed", description: String(error) });
    }
  };

  const test2_SpeechSynthesis = async () => {
    updateResult('speech', 'testing');
    try {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }

      // Cancel any existing speech
      speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));

      const utterance = new SpeechSynthesisUtterance('Hello, this is a test');
      utterance.rate = 0.8;
      utterance.volume = 1.0;

      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        await new Promise(resolve => {
          speechSynthesis.onvoiceschanged = resolve;
          setTimeout(resolve, 1000);
        });
      }

      return new Promise<void>((resolve, reject) => {
        utterance.onstart = () => {
          updateResult('speech', 'success');
          toast({ title: "✅ Speech Synthesis", description: "Browser speech is working" });
          resolve();
        };
        
        utterance.onerror = (event) => {
          updateResult('speech', 'failed');
          toast({ title: "❌ Speech Failed", description: `Error: ${event.error}` });
          reject(new Error(event.error));
        };

        utterance.onend = () => resolve();

        speechSynthesis.speak(utterance);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
          updateResult('speech', 'failed');
          toast({ title: "❌ Speech Timeout", description: "Speech took too long" });
          reject(new Error('Timeout'));
        }, 5000);
      });
    } catch (error) {
      updateResult('speech', 'failed');
      toast({ title: "❌ Speech Synthesis Failed", description: String(error) });
    }
  };

  const test3_OpenAITTS = async () => {
    updateResult('openai', 'testing');
    try {
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: {
          text: 'Testing OpenAI text to speech',
          voice: 'nova',
          speed: 0.7
        }
      });

      if (error) throw new Error(error.message);
      if (!data?.audioContent) throw new Error('No audio data received');

      // Convert base64 to blob and play
      const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.preload = 'auto';

      return new Promise<void>((resolve, reject) => {
        audio.onloadeddata = () => {
          toast({ title: "📡 OpenAI Audio", description: "Audio file loaded successfully" });
        };

        audio.oncanplaythrough = () => {
          audio.play().then(() => {
            updateResult('openai', 'success');
            toast({ title: "✅ OpenAI TTS", description: "High-quality audio is working!" });
            resolve();
          }).catch(reject);
        };

        audio.onerror = () => {
          updateResult('openai', 'failed');
          toast({ title: "❌ OpenAI Playback Failed", description: "Could not play OpenAI audio" });
          reject(new Error('Audio playback failed'));
        };

        audio.onended = () => resolve();

        // Timeout after 10 seconds
        setTimeout(() => {
          updateResult('openai', 'failed');
          toast({ title: "❌ OpenAI Timeout", description: "OpenAI audio took too long" });
          reject(new Error('Timeout'));
        }, 10000);
      });
    } catch (error) {
      updateResult('openai', 'failed');
      toast({ title: "❌ OpenAI TTS Failed", description: String(error) });
    }
  };

  const test4_TranslationAudio = async () => {
    updateResult('translation', 'testing');
    try {
      // Test translation with audio
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: {
          word: 'hello',
          targetLanguage: 'es',
          context: 'greeting'
        }
      });

      if (error) throw new Error(error.message);
      if (!data?.translation) throw new Error('No translation received');

      const translationText = data.translation;
      
      // Try to speak the translation
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));

        const utterance = new SpeechSynthesisUtterance(translationText);
        utterance.rate = 0.7;
        utterance.lang = 'es';

        return new Promise<void>((resolve, reject) => {
          utterance.onstart = () => {
            updateResult('translation', 'success');
            toast({ 
              title: "✅ Translation Audio", 
              description: `Speaking: "${translationText}"` 
            });
          };
          
          utterance.onerror = (event) => {
            updateResult('translation', 'failed');
            toast({ title: "❌ Translation Audio Failed", description: `Error: ${event.error}` });
            reject(new Error(event.error));
          };

          utterance.onend = () => resolve();

          speechSynthesis.speak(utterance);

          setTimeout(() => {
            speechSynthesis.cancel();
            updateResult('translation', 'failed');
            toast({ title: "❌ Translation Timeout", description: "Translation audio took too long" });
            reject(new Error('Timeout'));
          }, 8000);
        });
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      updateResult('translation', 'failed');
      toast({ title: "❌ Translation Test Failed", description: String(error) });
    }
  };

  const runAllTests = async () => {
    try {
      await test1_BasicAudio();
      await new Promise(resolve => setTimeout(resolve, 500));
      await test2_SpeechSynthesis();
      await new Promise(resolve => setTimeout(resolve, 500));
      await test3_OpenAITTS();
      await new Promise(resolve => setTimeout(resolve, 500));
      await test4_TranslationAudio();
    } catch (error) {
      // Individual tests handle their own errors
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500">✅ Working</Badge>;
      case 'failed': return <Badge variant="destructive">❌ Failed</Badge>;
      case 'testing': return <Badge variant="secondary">🔄 Testing...</Badge>;
      default: return <Badge variant="outline">⏳ Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔊 Audio Diagnosis Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Let's find out exactly what's wrong with audio on your device
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                1. Basic Audio Test
                {getStatusBadge(testResults.basic || 'pending')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tests if your device can play any audio at all
              </p>
              <Button onClick={test1_BasicAudio} variant="outline" className="w-full">
                Test Basic Audio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                2. Speech Synthesis
                {getStatusBadge(testResults.speech || 'pending')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tests browser's built-in text-to-speech
              </p>
              <Button onClick={test2_SpeechSynthesis} variant="outline" className="w-full">
                Test Speech
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                3. OpenAI TTS
                {getStatusBadge(testResults.openai || 'pending')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tests high-quality AI-generated audio
              </p>
              <Button onClick={test3_OpenAITTS} variant="outline" className="w-full">
                Test OpenAI Audio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                4. Translation Audio
                {getStatusBadge(testResults.translation || 'pending')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tests the full translation + audio pipeline
              </p>
              <Button onClick={test4_TranslationAudio} variant="outline" className="w-full">
                Test Translation
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={runAllTests} size="lg" className="bg-blue-600 hover:bg-blue-700">
            🧪 Run All Tests
          </Button>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">📱 Mobile Audio Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Make sure your device volume is turned up</li>
            <li>• Ensure you're not in silent mode</li>
            <li>• Try using headphones</li>
            <li>• Close other apps that might be using audio</li>
            <li>• Make sure Safari/Chrome has microphone permission</li>
          </ul>
        </div>
      </div>
    </div>
  );
};