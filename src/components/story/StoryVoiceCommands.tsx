import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { VoiceCommandController, type VoiceCommandControllerHandle } from '@/components/VoiceCommandController';
import { parseStoryVoiceCommand, type StoryVoiceCommand } from '@/lib/voice/storyVoiceCommands';

/**
 * The story page's microphone: tap, say "next page", "go back", "read to me" or
 * "stop", and the reader does it. One clip per tap; it ends on silence (or 7 s).
 */
export function StoryVoiceCommands({ onCommand, className }: {
  onCommand: (command: StoryVoiceCommand) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const vcRef = useRef<VoiceCommandControllerHandle | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const hint = t('reader.voice.hint', 'Say “next page”, “go back”, “read to me” or “stop”.');

  useEffect(() => {
    const onStatus = (e: Event) => {
      const next = (e as CustomEvent<{ status?: string; system?: string }>).detail;
      // The Buddy conversation (ElevenLabs) reports on the same channel; it is not this button.
      if (next?.system) return;
      if (next?.status === 'listening' || next?.status === 'processing' || next?.status === 'idle') setStatus(next.status);
    };
    window.addEventListener('voice:status', onStatus);
    return () => window.removeEventListener('voice:status', onStatus);
  }, []);

  const handleTranscript = (transcript: string) => {
    const command = parseStoryVoiceCommand(transcript);
    if (!command) {
      toast({ title: t('reader.voice.notUnderstood', 'I didn’t catch that'), description: hint, duration: 3000 });
      return;
    }
    onCommand(command);
  };

  const handleError = (kind: 'microphone' | 'service') => {
    setStatus('idle');
    toast({
      title: kind === 'microphone'
        ? t('reader.voice.micBlocked', 'The microphone is off')
        : t('reader.voice.unavailable', 'Voice commands are not working right now'),
      description: kind === 'microphone'
        ? t('reader.voice.micBlockedHelp', 'Allow the microphone for this site in the browser settings, then tap the microphone again.')
        : t('reader.voice.unavailableHelp', 'The page buttons still work.'),
      duration: 4000,
    });
  };

  const toggle = () => {
    if (status === 'listening') { vcRef.current?.stop(); return; }
    if (status === 'processing') return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      handleError('microphone');
      return;
    }
    toast({ title: t('reader.voice.listening', 'Listening…'), description: hint, duration: 2500 });
    void vcRef.current?.start();
  };

  const label = status === 'listening'
    ? t('reader.voice.stopListening', 'Stop listening')
    : t('reader.voice.button', 'Voice commands');

  return (
    <>
      <Button
        type="button"
        variant={status === 'listening' ? 'default' : 'outline'}
        size="icon"
        onClick={toggle}
        aria-label={label}
        aria-pressed={status === 'listening'}
        title={`${label}. ${hint}`}
        data-testid="story-voice-commands"
        className={cn('h-11 w-11 shrink-0 rounded-full', status === 'listening' && 'animate-pulse', className)}
      >
        {status === 'processing'
          ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          : status === 'listening'
            ? <MicOff className="h-5 w-5" aria-hidden />
            : <Mic className="h-5 w-5" aria-hidden />}
      </Button>
      <VoiceCommandController ref={vcRef} headless onCommand={handleTranscript} onError={handleError} />
    </>
  );
}

export default StoryVoiceCommands;
