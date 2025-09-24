import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleVoiceCommands } from '@/components/SimpleVoiceCommands';
import { ElevenLabsAudio, type ElevenLabsAudioHandle } from '@/components/ElevenLabsAudio';
import { Mic, Volume2, Crown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { UserInfo } from '@/types';

interface VoiceButtonTesterProps {
  userInfo: UserInfo;
  isPremium: boolean;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

export const VoiceButtonTester = ({ 
  userInfo, 
  isPremium, 
  difficulty 
}: VoiceButtonTesterProps) => {
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'listening' | 'speaking'>('idle');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<ElevenLabsAudioHandle>(null);

  // Sample text for voice command testing
  const sampleText = "This is a sample story text for testing voice commands. You can say 'pause' to stop reading, 'continue' to resume, 'read slower' or 'read faster' to change speed, and 'next page' to navigate. Try different voice commands to test the system.";

  // Listen for voice status updates
  useEffect(() => {
    const handleVoiceStatus = (event: CustomEvent) => {
      const { status } = event.detail;
      setVoiceStatus(status);
      if (status === 'connecting') {
        setConnectionAttempts(prev => prev + 1);
      }
    };

    const handleVoiceLevel = (event: CustomEvent) => {
      const { level } = event.detail;
      setVoiceLevel(Math.max(0, Math.min(1, level || 0)));
    };

    const handleVoiceCommand = (event: CustomEvent) => {
      const { command } = event.detail;
      if (command) {
        setLastCommand(command);
      }
    };

    window.addEventListener('voice:status', handleVoiceStatus as EventListener);
    window.addEventListener('voice:level', handleVoiceLevel as EventListener);
    window.addEventListener('voice:command', handleVoiceCommand as EventListener);

    return () => {
      window.removeEventListener('voice:status', handleVoiceStatus as EventListener);
      window.removeEventListener('voice:level', handleVoiceLevel as EventListener);
      window.removeEventListener('voice:command', handleVoiceCommand as EventListener);
    };
  }, []);

  const handleAudioStateChange = (playing: boolean) => {
    setIsAudioPlaying(playing);
  };

  const getStatusIcon = () => {
    switch (voiceStatus) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'connected':
      case 'listening':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'speaking':
        return <Volume2 className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      idle: 'secondary',
      connecting: 'default',
      connected: 'default',
      listening: 'default',
      speaking: 'default'
    } as const;

    return (
      <Badge variant={variants[voiceStatus]} className="flex items-center gap-1">
        {getStatusIcon()}
        {voiceStatus.charAt(0).toUpperCase() + voiceStatus.slice(1)}
      </Badge>
    );
  };

  const voiceCommands = [
    { command: '"play" or "read story"', description: 'Start reading the story' },
    { command: '"pause" or "stop"', description: 'Pause the current reading' },
    { command: '"continue" or "resume"', description: 'Resume reading from where it stopped' },
    { command: '"read slower"', description: 'Decrease reading speed' },
    { command: '"read faster"', description: 'Increase reading speed' },
    { command: '"next page"', description: 'Navigate to the next page' },
    { command: '"previous page"', description: 'Navigate to the previous page' },
    { command: '"explain [word]"', description: 'Get definition of a specific word' },
    { command: '"what does [word] mean?"', description: 'Alternative way to get word definition' },
    { command: '"repeat"', description: 'Repeat the current sentence or paragraph' }
  ];

  return (
    <div className="space-y-6">
      {/* Voice Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Commands Testing
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {!isPremium && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium Feature
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Status</label>
              <div className="p-3 bg-muted rounded-lg text-center">
                {getStatusBadge()}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Level</label>
              <div className="p-3 bg-muted rounded-lg">
                <Progress value={voiceLevel * 100} className="w-full" />
                <div className="text-xs text-center mt-1">{Math.round(voiceLevel * 100)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Attempts</label>
              <div className="p-3 bg-muted rounded-lg text-center">
                <span className="text-lg font-mono">{connectionAttempts}</span>
              </div>
            </div>
          </div>

          {lastCommand && (
            <Alert>
              <Mic className="w-4 h-4" />
              <AlertDescription>
                Last recognized command: <strong>"{lastCommand}"</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Voice Button Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Control Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Play Audio + Reading Coach buttons (ElevenLabsAudio) */}
            <div>
              <h4 className="font-medium mb-2">Story Reading Controls</h4>
              <ElevenLabsAudio
                ref={audioRef}
                text={sampleText}
                userInfo={userInfo}
                isPremium={isPremium}
                currentPage={0}
                totalPages={1}
                difficulty={difficulty}
                onAudioStateChange={handleAudioStateChange}
                contentHash="voice-test-hash-123"
              />
              <p className="text-sm text-muted-foreground mt-2">
                These are the actual "Play Audio" and "Reading Coach" buttons users see in stories
              </p>
            </div>

            {/* Voice Buddy button */}
            <div>
              <h4 className="font-medium mb-2">Voice Assistant (Buddy)</h4>
              <SimpleVoiceCommands />
              <p className="text-sm text-muted-foreground mt-2">
                This is the actual "Buddy" button that connects users to the AI voice assistant
              </p>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAudioPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm">Story Audio: {isAudioPlaying ? 'Playing' : 'Stopped'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${voiceStatus === 'listening' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm">Voice Commands: {voiceStatus === 'listening' ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-mono text-sm font-medium text-primary mb-1">
                  {cmd.command}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cmd.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Story Reading:</strong> Click "Read Story" to start audio, then try voice commands like "pause", "continue", "read faster"
            </div>
            <div>
              <strong>2. Voice Assistant:</strong> Click "Buddy" to activate the voice assistant, then try conversational commands
            </div>
            <div>
              <strong>3. Voice Commands:</strong> Test commands from the reference list above while audio is playing
            </div>
            <div>
              <strong>4. Premium Features:</strong> Switch to Guest mode to see how voice features are limited
            </div>
            <div>
              <strong>5. Status Monitoring:</strong> Watch the status indicators to see real-time connection and voice level feedback
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <strong>Note:</strong> Make sure your microphone is enabled and working. Some voice commands require the story to be playing first.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};