import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Mic, StopCircle, Loader2 } from "lucide-react";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const KNOWN_COMMANDS = [
  "start reading",
  "pause",
  "resume",
  "next page",
  "previous page",
  "increase font",
  "decrease font",
  "open settings",
];

export interface VoiceCommandControllerProps {
  onCommand?: (command: string) => void;
  headless?: boolean;
}

export interface VoiceCommandControllerHandle {
  start: () => Promise<void>;
  stop: () => void;
}

export const VoiceCommandController = forwardRef<VoiceCommandControllerHandle, VoiceCommandControllerProps>(({ onCommand, headless = false }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle'|'listening'|'processing'>('idle');
  const [level, setLevel] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const userStoppedRef = useRef<boolean>(false);
  const startedTalkingRef = useRef<boolean>(false);
  const silenceSinceRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  const emitStatus = (s: 'idle'|'listening'|'processing') => window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: s } }));
  const emitLevel = (l: number) => window.dispatchEvent(new CustomEvent('voice:level', { detail: { level: l } }));

  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/mpeg",
      "audio/aac",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    if (typeof MediaRecorder === "undefined" || !("isTypeSupported" in MediaRecorder)) {
      return "";
    }
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = useCallback(async () => {
    try {
      // Implement mutual exclusion with audio playback
      try {
        // TODO: Replace with SimplifiedAudioEngine
        // const { SimplifiedAudioEngine } = await import('@/services/SimplifiedAudioEngine');
        // TODO: Replace with SimplifiedAudioEngine
        // const status = SimplifiedAudioEngine.getInstance().getStatus();
        const status = { isPlaying: false };
        if (status.isPlaying) {
          console.log('🛑 Voice: Audio is playing, stopping it first');
          // SimplifiedAudioEngine.getInstance().stop();
          await new Promise(r => setTimeout(r, 500)); // Wait for audio cleanup
        }
      } catch (e) {
        console.warn('Failed to check/stop audio:', e);
      }
      
      // Respect global disable flag and avoid double-starts
      if ((window as any).__t2r_vc_user_disabled === true || (window as any).__t2r_voice_force_off === true) {
        console.log('Headless VC: start ignored (user disabled/forced off)');
        return;
      }
      if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording')) {
        console.log('Headless VC: already recording');
        return;
      }

      // Mobile-specific microphone constraints for better reliability
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const constraints = isMobileDevice ? {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000, // Lower sample rate for mobile stability
          latency: 0.1
        }
      } : {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      console.log('🎤 VoiceCommandController - Device detection:', {
        isMobile: isMobileDevice,
        constraints
      });
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup analyser for live VU meter
      try {
        const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx: AudioContext = new Ctor();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128; // -1..1
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buffer.length);
          const lvl = Math.max(0, Math.min(1, rms * 2));
          setLevel(lvl);
          emitLevel(lvl);

          // Simple VAD: detect when user started speaking, then stop after ~800ms of silence
          const threshold = 0.06;
          const now = performance.now();
          if (lvl > threshold) {
            startedTalkingRef.current = true;
            silenceSinceRef.current = null;
          } else if (startedTalkingRef.current) {
            if (silenceSinceRef.current == null) {
              silenceSinceRef.current = now;
            } else if (now - silenceSinceRef.current > 800) {
              // Enough silence detected after speech -> stop
              try { stopRecording(); } catch {}
            }
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        console.warn('VoiceCommandController: analyser unavailable', e);
      }

      const supported = getSupportedMimeType();
      if (supported) mimeTypeRef.current = supported;
      const options = supported ? { mimeType: supported } : undefined;
      const recorder = new MediaRecorder(stream, options as MediaRecorderOptions);
      mediaRecorderRef.current = recorder;

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const wasManual = userStoppedRef.current === true;
          // Cleanup meter loop either way
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
          try { if (audioContextRef.current) await audioContextRef.current.close(); } catch {}
          analyserRef.current = null; audioContextRef.current = null;

          if (wasManual) {
            // User explicitly toggled OFF: skip transcription entirely
            setIsRecording(false);
            setStatus('idle'); emitStatus('idle'); emitLevel(0);
            try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
            streamRef.current = null;
            userStoppedRef.current = false;
            return;
          }

          setStatus('processing'); emitStatus('processing');

          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          const base64 = await blobToBase64(blob);
          const { data, error } = await supabase.functions.invoke("voice-to-text", {
            body: { audio: base64, mimeType: mimeTypeRef.current },
          });
          if (error) {
            console.error(error);
          } else {
            const text: string = (data?.text || "").toLowerCase();
            const found = KNOWN_COMMANDS.find((c) => text.includes(c));
            const cmd = found || text.trim();
            setLastCommand(cmd);
            onCommand?.(cmd);
          }
        } catch (err) {
          console.error("Voice command processing failed", err);
        } finally {
          setIsRecording(false);
          setStatus('idle'); emitStatus('idle'); emitLevel(0);
          try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
          streamRef.current = null;
          userStoppedRef.current = false;
        }
      };

      recorder.start();
      setIsRecording(true);
      setStatus('listening'); emitStatus('listening');

      // Initialize endpointing bookkeeping
      startedTalkingRef.current = false;
      silenceSinceRef.current = null;
      startedAtRef.current = performance.now();
      if (maxTimerRef.current) { try { clearTimeout(maxTimerRef.current); } catch {} }
      maxTimerRef.current = window.setTimeout(() => {
        try { if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') stopRecording(); } catch {}
      }, 7000);
    } catch (e) {
      console.error('Failed to start recording', e);
    }
  }, [onCommand]);

const stopRecording = useCallback(() => {
  userStoppedRef.current = true;
  try { emitStatus('idle'); emitLevel(0); } catch {}
  try { if (rafRef.current) cancelAnimationFrame(rafRef.current); } catch {}
  rafRef.current = null;
  if (maxTimerRef.current) { try { clearTimeout(maxTimerRef.current); } catch {} }
  maxTimerRef.current = null;
  startedTalkingRef.current = false;
  silenceSinceRef.current = null;
  startedAtRef.current = null;
  try { audioContextRef.current?.close(); } catch {}
  analyserRef.current = null;
  try {
    mediaRecorderRef.current?.stop();
  } catch (e) {
    console.warn('stopRecording error', e);
  }
}, []);

useImperativeHandle(ref, () => ({
  start: startRecording,
  stop: stopRecording,
}));

// Global hard stop listener (from HUD X or ESC)
useEffect(() => {
  const onStop = () => stopRecording();
  window.addEventListener('voice:stop', onStop as EventListener);
  return () => window.removeEventListener('voice:stop', onStop as EventListener);
}, [stopRecording]);

if (headless) return null as any;

return (
  <Card>
  
      <CardHeader>
        <CardTitle className="text-base">Voice commands</CardTitle>
        <CardDescription>Say things like “Start reading”, “Next page”</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button size="sm" onClick={startRecording} className="gap-2">
              <Mic className="w-4 h-4" /> Listen
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-2">
              <StopCircle className="w-4 h-4" /> Stop
            </Button>
          )}
          <div className="text-xs text-muted-foreground">Commands: {KNOWN_COMMANDS.join(", ")}</div>
        </div>

        {/* Live status + VU meter */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs">
            {status === 'listening' ? (
              <Mic className="w-3.5 h-3.5 text-primary" />
            ) : status === 'processing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {status === 'listening' ? 'Listening…' : status === 'processing' ? 'Transcribing…' : 'Idle'}
          </span>
          {status === 'listening' && (
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden>
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-100"
                style={{ width: `${Math.round(100 * (0.1 + 0.9 * level))}%` }}
              />
            </div>
          )}
        </div>

        {lastCommand && (
          <div className="flex items-center gap-2 text-sm">
            <Bot className="w-4 h-4" /> <span>Heard:</span>
            <span className="font-medium">{lastCommand}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default VoiceCommandController;
