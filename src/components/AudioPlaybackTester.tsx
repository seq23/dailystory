import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Square, Volume2, Loader2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';

// Import audio services - these will be available from the main app
// import { SmartElevenLabsTTS } from '@/services/SmartElevenLabsTTS';
// import { InteractiveWordAudioService } from '@/services/InteractiveWordAudioService';

export const AudioPlaybackTester: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState('Hello, this is Charlotte speaking. How are you today?');
  const [testWord, setTestWord] = useState('cat');
  const [loading, setLoading] = useState(false);
  const [lastTest, setLastTest] = useState<string | null>(null);
  const { toast } = useToast();

  // Only show in debug mode
  const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=1');
  
  if (!isDebugMode) {
    return null;
  }

  const testCharlotteVoice = async () => {
    setLoading(true);
    setLastTest('Charlotte TTS');
    DebugLogger.log('audio', 'Testing Charlotte voice', { text: testText });

    try {
      // Check if CharlotteVoiceService is available (new unified service)
      if (typeof window !== 'undefined' && (window as any).__CharlotteVoiceService) {
        const charlotteService = (window as any).__CharlotteVoiceService;
        
        setIsPlaying(true);
        await charlotteService.charlotteInteractiveAudio({
          text: testText,
          context: 'conversation'
        });
        
        toast({
          title: "Charlotte Voice Test",
          description: "Audio playback completed successfully",
        });
      } else {
        throw new Error('CharlotteVoiceService not available');
      }
    } catch (error) {
      DebugLogger.error('audio', 'Charlotte voice test failed', error);
      
      toast({
        title: "Charlotte Voice Test Failed",
        description: error.message || 'Charlotte service not available',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsPlaying(false);
    }
  };

  const testInteractiveWord = async () => {
    setLoading(true);
    setLastTest('Interactive Word');
    DebugLogger.log('audio', 'Testing interactive word audio', { word: testWord });

    try {
      // Test Charlotte's unified word services
      if (typeof window !== 'undefined' && (window as any).__CharlotteVoiceService) {
        const charlotteService = (window as any).__CharlotteVoiceService;
        
        setIsPlaying(true);
        await charlotteService.charlotteHearWord(testWord);
        
        toast({
          title: "Charlotte Word Test",
          description: `Charlotte successfully pronounced "${testWord}"`,
        });
      } else {
        throw new Error('CharlotteVoiceService not available');
      }
    } catch (error) {
      DebugLogger.error('audio', 'Charlotte word test failed', error);
      
      toast({
        title: "Charlotte Word Test Failed",
        description: error.message || 'Charlotte service not available',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsPlaying(false);
    }
  };

  const testAudioCoordination = async () => {
    setLoading(true);
    setLastTest('Audio Coordination');
    DebugLogger.log('audio', 'Testing audio coordination system');

    try {
      // Test story audio vs interactive word separation
      const events = ['story:audio:start', 'charlotte:speech:request', 'audio:conflict'];
      
      events.forEach(eventType => {
        const event = new CustomEvent(eventType, { detail: { source: 'AudioPlaybackTester' } });
        window.dispatchEvent(event);
        DebugLogger.log('audio', `Dispatched ${eventType} event`);
      });
      
      toast({
        title: "Audio Coordination Test",
        description: "Audio system events dispatched successfully",
      });
    } catch (error) {
      console.error('Audio coordination test failed:', error);
      DebugLogger.error('audio', 'Audio coordination test failed', error);
      
      toast({
        title: "Audio Coordination Test Failed",
        description: error.message || 'Event system not available',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopAllAudio = () => {
    try {
      // Stop Charlotte audio (new unified service)
      if (typeof window !== 'undefined' && (window as any).__CharlotteVoiceService) {
        const charlotteService = (window as any).__CharlotteVoiceService;
        charlotteService.stop();
      }

      // Stop SimplifiedAudioEngine
      if (typeof window !== 'undefined' && (window as any).__SimplifiedAudioEngine) {
        const audioEngine = (window as any).__SimplifiedAudioEngine;
        audioEngine.stop();
      }

      // Dispatch stop events
      const stopEvent = new CustomEvent('charlotte:stop', { detail: { source: 'AudioPlaybackTester' } });
      window.dispatchEvent(stopEvent);

      setIsPlaying(false);
      DebugLogger.log('audio', 'All audio stopped via AudioPlaybackTester');
      
      toast({
        title: "Audio Stopped",
        description: "All Charlotte audio systems stopped",
      });
    } catch (error) {
      DebugLogger.error('audio', 'Failed to stop audio', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Audio Playback Tester
            <Badge variant="secondary">Debug Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Test Charlotte voice, interactive words, and audio coordination separately from the Voice Catalog System.
          </div>

          {/* Charlotte Voice Testing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Charlotte Voice (TTS)</h4>
            <div className="flex gap-2">
              <Input
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text for Charlotte to speak..."
                className="flex-1"
              />
              <Button 
                onClick={testCharlotteVoice} 
                disabled={loading || isPlaying}
                className="flex items-center gap-2"
              >
                {loading && lastTest === 'Charlotte TTS' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                Test Charlotte
              </Button>
            </div>
          </div>

          <Separator />

          {/* Interactive Word Testing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Interactive Word Audio</h4>
            <div className="flex gap-2">
              <Input
                value={testWord}
                onChange={(e) => setTestWord(e.target.value)}
                placeholder="Enter word to hear pronunciation..."
                className="flex-1"
              />
              <Button 
                onClick={testInteractiveWord} 
                disabled={loading || isPlaying}
                className="flex items-center gap-2"
              >
                {loading && lastTest === 'Interactive Word' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Hear Word
              </Button>
            </div>
          </div>

          <Separator />

          {/* Audio Coordination Testing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Audio System Coordination</h4>
            <div className="flex gap-2">
              <Button 
                onClick={testAudioCoordination}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading && lastTest === 'Audio Coordination' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test Coordination
              </Button>
              <Button 
                onClick={stopAllAudio}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop All Audio
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Tests story audio vs Charlotte voice conflict resolution and event dispatching.
            </div>
          </div>

          {/* Status Display */}
          {(loading || isPlaying) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {loading ? `Testing ${lastTest}...` : 'Playing audio...'}
                </span>
              </div>
            </div>
          )}

          {/* Service Availability Check */}
          <div className="p-3 bg-muted/50 rounded text-xs">
            <div className="font-medium mb-1">Charlotte-Centric Audio Services:</div>
            <div className="space-y-1">
              <div>
                CharlotteVoiceService: {typeof window !== 'undefined' && (window as any).__CharlotteVoiceService ? '✅ Available (Unified)' : '❌ Not Found'}
              </div>
              <div>
                SimplifiedAudioEngine: {typeof window !== 'undefined' && (window as any).__SimplifiedAudioEngine ? '✅ Available (Story)' : '❌ Not Found'}
              </div>
              <div>
                SmartElevenLabsTTS: {typeof window !== 'undefined' && (window as any).SmartElevenLabsTTS ? '✅ Available (Fallback)' : '❌ Not Found'}
              </div>
              <div>
                Event System: {typeof window !== 'undefined' && window.dispatchEvent ? '✅ Available' : '❌ Not Found'}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              🎯 Charlotte is now the unified voice for all audio: conversations, story reading, word interactions, and voice buddy.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};