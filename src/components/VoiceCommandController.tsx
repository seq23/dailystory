import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from "@/services/DebugLogger";
import { startSpeechMeter, type SpeechMeter } from "@/lib/voice/speechMeter";

/**
 * The story page's microphone, with no UI of its own (StoryVoiceCommands is the
 * button). One clip per tap: it ends after ~0.8 s of quiet following speech, or
 * at 7 s, and is sent to voice-to-text in command mode.
 *
 * - A clip in which nothing was heard is never sent (Whisper invents text for silence).
 * - Tapping stop discards the clip.
 * - Unmounting (the child leaves the story) stops the microphone at once, and a
 *   transcript that comes back afterwards is never acted on.
 */

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export type VoiceCommandStatus = 'idle' | 'listening' | 'processing';

export interface VoiceCommandControllerProps {
  /** What was heard, lower-cased; the caller decides what it means (src/lib/voice/storyVoiceCommands.ts). "" = nothing heard. */
  onCommand?: (transcript: string) => void;
  /** The microphone was refused, or the speech service did not answer. */
  onError?: (kind: 'microphone' | 'service') => void;
  onStatus?: (status: VoiceCommandStatus) => void;
  /** The UI language (i18n code); voice-to-text keeps it only when it is one of ours. */
  language?: string;
}

export interface VoiceCommandControllerHandle {
  start: () => Promise<void>;
  stop: () => void;
}

const QUIET_AFTER_SPEECH_MS = 800;
const MAX_CLIP_MS = 7000;

const MIME_TYPES = [
  "audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4",
  "audio/mpeg", "audio/aac", "audio/ogg;codecs=opus", "audio/ogg",
];

function supportedMimeType(): string {
  if (typeof MediaRecorder === "undefined" || !("isTypeSupported" in MediaRecorder)) return "";
  return MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export const VoiceCommandController = forwardRef<VoiceCommandControllerHandle, VoiceCommandControllerProps>(
  ({ onCommand, onError, onStatus, language }, ref) => {
    // The recorder's stop handler runs seconds after start: read the caller's latest props then.
    const props = useRef({ onCommand, onError, onStatus, language });
    props.current = { onCommand, onError, onStatus, language };

    const disposedRef = useRef(false);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const meterRef = useRef<SpeechMeter | null>(null);
    const maxTimerRef = useRef<number | null>(null);
    const startingRef = useRef(false);

    const setStatus = (s: VoiceCommandStatus) => { if (!disposedRef.current) props.current.onStatus?.(s); };

    const releaseMic = () => {
      meterRef.current?.stop();
      meterRef.current = null;
      if (maxTimerRef.current != null) clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* already stopped */ }
      streamRef.current = null;
    };

    // manual = the child tapped stop, or left the page: the clip is discarded.
    const finish = useCallback((manual: boolean) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state !== 'recording') { releaseMic(); return; }
      (recorder as MediaRecorder & { __discard?: boolean }).__discard = manual;
      releaseMic();
      try { recorder.stop(); } catch (e) { DebugLogger.warn('audio', 'voice command: stop failed', e); }
    }, []);

    const start = useCallback(async () => {
      if (disposedRef.current || startingRef.current || recorderRef.current?.state === 'recording') return;
      startingRef.current = true;
      try {
        try {
          const { CharlotteVoiceService } = await import('@/services/CharlotteVoiceService');
          const narrator = CharlotteVoiceService.getInstance();
          if (narrator.getStatus().isPlaying) narrator.stop();
        } catch (e) {
          DebugLogger.warn('audio', 'voice command: could not pause the narrator', e);
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
        } catch (e) {
          DebugLogger.warn('audio', 'voice command: microphone refused', e);
          if (!disposedRef.current) props.current.onError?.('microphone');
          return;
        }
        // Left the page while the permission prompt was open.
        if (disposedRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        // Speech heard? null = no level meter on this browser, so we cannot tell; send the clip.
        const clip = startSpeechMeter(stream, { quietAfterSpeechMs: QUIET_AFTER_SPEECH_MS, onQuietAfterSpeech: () => finish(false) });
        meterRef.current = clip;

        const supported = supportedMimeType();
        const mimeType = supported || "audio/webm";
        const recorder = new MediaRecorder(stream, supported ? { mimeType } : undefined);
        recorderRef.current = recorder;
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = async () => {
          const discard = (recorder as MediaRecorder & { __discard?: boolean }).__discard === true;
          if (recorderRef.current === recorder) recorderRef.current = null;
          releaseMic();
          if (discard || disposedRef.current) { setStatus('idle'); return; }
          if (clip.heard === false) {
            // Nothing was said: tell the child, send nothing.
            setStatus('idle');
            props.current.onCommand?.('');
            return;
          }
          setStatus('processing');
          try {
            const audio = await blobToBase64(new Blob(chunks, { type: mimeType }));
            if (disposedRef.current) return;
            const { data, error } = await supabase.functions.invoke("voice-to-text", {
              body: { audio, mimeType, mode: "command", language: props.current.language },
            });
            if (disposedRef.current) return;
            if (error) {
              DebugLogger.error('network', 'voice command: voice-to-text failed', error);
              props.current.onError?.('service');
            } else {
              props.current.onCommand?.(String(data?.text || "").toLowerCase().trim());
            }
          } catch (err) {
            DebugLogger.error('audio', 'voice command: processing failed', err);
            if (!disposedRef.current) props.current.onError?.('service');
          } finally {
            setStatus('idle');
          }
        };

        recorder.start();
        setStatus('listening');
        maxTimerRef.current = window.setTimeout(() => finish(false), MAX_CLIP_MS);
      } catch (e) {
        DebugLogger.error('audio', 'voice command: could not start', e);
        releaseMic();
        if (!disposedRef.current) props.current.onError?.('service');
      } finally {
        startingRef.current = false;
      }
    }, [finish]);

    const stop = useCallback(() => finish(true), [finish]);

    useImperativeHandle(ref, () => ({ start, stop }), [start, stop]);

    // A hard stop from elsewhere (the narrator coordinator, Escape).
    useEffect(() => {
      window.addEventListener('voice:stop', stop);
      return () => window.removeEventListener('voice:stop', stop);
    }, [stop]);

    // Leaving the story page: microphone off now, pending clip dropped.
    useEffect(() => {
      disposedRef.current = false;
      return () => {
        disposedRef.current = true;
        finish(true);
      };
    }, [finish]);

    return null;
  },
);

VoiceCommandController.displayName = 'VoiceCommandController';

export default VoiceCommandController;
