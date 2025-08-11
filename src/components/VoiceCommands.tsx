
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

interface VoiceCommandsProps {
  agentId?: string; // If provided, will override the backend default
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
    onConnect: () => { setConnected(true); try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'connected' })); } catch {} },
    onDisconnect: () => { setConnected(false); try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'disconnected' })); } catch {} },
    onError: (e) => { console.error('VoiceCommands error', e); try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'error' })); } catch {} },
  });

  // Persist any explicitly set agentId (still supported for advanced override)
  useEffect(() => {
    try { if (agentId) localStorage.setItem('eleven_agent_id', agentId); } catch {}
  }, [agentId]);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      // Mic permission preflight (prevents silent failures on some browsers)
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permErr: any) {
        throw new Error(permErr?.message || 'Microphone permission is required to start voice');
      }

      // If an agentId is present, pass it; otherwise let the backend use the default from secrets
      const body = agentId ? { agentId } : {};
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body });
      if (error) throw new Error(error.message || 'Failed to get signed URL');

      // Some edge functions return 2xx with an error payload
      if (data && (data as any).error) throw new Error((data as any).error);

      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url || !/^wss?:\/\//.test(url)) throw new Error('Invalid signed URL returned');

      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'connecting' })); } catch {}
      const id = await (conversation as any).startSession({ url });
      console.log('Started ElevenLabs conversation:', id);
      toast({ title: 'Voice connected', description: 'Say: "read", "stop", "next", "back".' });
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'connected' })); } catch {}
    } catch (e: any) {
      console.error('Start voice failed', e);
      toast({ title: 'Voice error', description: e?.message || 'Could not start voice session', variant: 'destructive' });
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: 'error' })); } catch {}
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
      {/* Input removed: backend will use the default agent from Supabase secrets */}
      {!connected ? (
        <Button onClick={start} disabled={connecting}>{connecting ? 'Connecting…' : 'Talk to Buddy'}</Button>
      ) : (
        <Button variant="secondary" onClick={stop}>Stop Talking</Button>
      )}
    </div>
  );
};

export default VoiceCommands;
