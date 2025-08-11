import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

interface VoiceCommandsProps {
  agentId?: string; // If not provided, we allow user to enter one
}

const CHARLOTTE = 'XB0fDUnXU5powFXDhCwa';

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ agentId: initialAgentId }) => {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string>(() => initialAgentId || (localStorage.getItem('eleven_agent_id') || ''));
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Map agent tools -> app actions
  const engine = useMemo(() => SimpleAudioEngine.getInstance(), []);
  const clientTools = useMemo(() => ({
    play: async () => {
      const text = (window as any).__lastNarrationText || (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      if (!text) return 'no_text';
      await engine.playText({ text, contentHash: hash });
      return 'ok';
    },
    stop: async () => { engine.stop(); return 'ok'; },
    next: async () => { window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'next' } })); return 'ok'; },
    previous: async () => { window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'prev' } })); return 'ok'; },
  }), [engine]);

  const conversation = useConversation({
    clientTools,
    overrides: {
      tts: { voiceId: CHARLOTTE },
    },
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onError: (e) => console.error('VoiceCommands error', e),
  });

  // Persist agentId
  useEffect(() => {
    try { if (agentId) localStorage.setItem('eleven_agent_id', agentId); } catch {}
  }, [agentId]);

  const start = useCallback(async () => {
    if (!agentId) {
      toast({ title: 'Missing agentId', description: 'Enter your ElevenLabs agent ID first.', variant: 'destructive' });
      return;
    }
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body: { agentId } });
      if (error) throw new Error(error.message || 'Failed to get signed URL');
      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url) throw new Error('No signed URL returned');
      const id = await (conversation as any).startSession({ url });
      console.log('Started ElevenLabs conversation:', id);
      toast({ title: 'Voice connected', description: 'Say a command: "play", "stop", "next", "previous".' });
    } catch (e: any) {
      console.error('Start voice failed', e);
      toast({ title: 'Voice error', description: e?.message || 'Could not start voice session', variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  }, [agentId, conversation, toast]);

  const stop = useCallback(async () => {
    try { await (conversation as any).endSession(); } catch {}
    setConnected(false);
  }, [conversation]);

  return (
    <div className="flex items-center gap-2">
      {!initialAgentId && (
        <Input
          placeholder="Enter ElevenLabs agentId"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="w-64"
        />
      )}
      {!connected ? (
        <Button onClick={start} disabled={connecting}>{connecting ? 'Connecting…' : 'Start Voice'}</Button>
      ) : (
        <Button variant="secondary" onClick={stop}>End Voice</Button>
      )}
    </div>
  );
};

export default VoiceCommands;
