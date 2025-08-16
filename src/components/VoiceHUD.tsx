import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Loader2, CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
// Lightweight persistent HUD that listens for custom events:
//  - 'voice:status' => { status: 'idle'|'listening'|'processing' }
//  - 'voice:level'  => { level: number 0..1 }
// Beeps on transitions for clear feedback.

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'connected' | 'connecting' | 'failed';

export const VoiceHUD: React.FC = () => {
  const { isMobileOrTablet } = useIsMobile();
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [level, setLevel] = useState(0);
  const prevStatus = useRef<VoiceStatus>('idle');
  const lastBeepAt = useRef<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return sessionStorage.getItem('t2r_voice_hud_collapsed') === '1'; } catch { return false; }
  });
  const handleStop = () => { try { window.dispatchEvent(new CustomEvent('voice:stop')); } catch {} };
  const toggleCollapse = () => setCollapsed((c) => !c);

  // Simple beep synth
  const audioContextRef = useRef<AudioContext | null>(null);
  const ensureCtx = async () => {
    if (!audioContextRef.current) {
      try {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new Ctor();
      } catch (e) {
        console.warn('VoiceHUD: AudioContext not available');
      }
    }
    return audioContextRef.current;
  };
  const beep = async (freq = 880, durationMs = 120, vol = 0.08) => {
    const ctx = await ensureCtx();
    if (!ctx) return;
    try { await (ctx as any).resume?.(); } catch {}
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = vol;
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  };

  useEffect(() => {
    if (!isMobileOrTablet) return;
    const onStatus = (e: any) => {
      const next = (e?.detail?.status || 'idle') as VoiceStatus;
      setStatus(next);
      // Beep on transitions
      if (prevStatus.current !== next) {
        const now = Date.now();
        if (now - lastBeepAt.current > 600) {
          if (next === 'listening') { try { ensureCtx().then(ctx => (ctx as any)?.resume?.()).catch(() => {}); } catch {} beep(1200, 120, 0.06); }
          if (next === 'idle' && prevStatus.current !== 'idle') beep(600, 90, 0.05);
          lastBeepAt.current = now;
        }
      }
      prevStatus.current = next;
    };
    const onLevel = (e: any) => {
      const l = Math.max(0, Math.min(1, Number(e?.detail?.level ?? 0)));
      setLevel(l);
    };
    window.addEventListener('voice:status', onStatus as EventListener);
    window.addEventListener('voice:level', onLevel as EventListener);
    return () => {
      window.removeEventListener('voice:status', onStatus as EventListener);
      window.removeEventListener('voice:level', onLevel as EventListener);
      try { audioContextRef.current?.close(); } catch {}
      audioContextRef.current = null;
    };
  }, [isMobileOrTablet]);

  // One-time resume on first user gesture (helps iOS/tablets)
  useEffect(() => {
    if (!isMobileOrTablet) return;
    const resume = async () => {
      const ctx = await ensureCtx();
      try { await (ctx as any)?.resume?.(); } catch {}
    };
    window.addEventListener('pointerdown', resume, { once: true, passive: true } as any);
    return () => window.removeEventListener('pointerdown', resume as any);
  }, [isMobileOrTablet]);

  // Persist collapsed state
  useEffect(() => {
    try { sessionStorage.setItem('t2r_voice_hud_collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  // ESC to stop
  useEffect(() => {
    if (!isMobileOrTablet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        try { window.dispatchEvent(new CustomEvent('voice:stop')); } catch {}
      }
    };
    window.addEventListener('keydown', onKey as any);
    return () => window.removeEventListener('keydown', onKey as any);
  }, [isMobileOrTablet]);

  // Hide on desktop and when idle
  if (!isMobileOrTablet) return null;
  if (status === 'idle') return null;

  const meterWidth = Math.round(100 * (0.1 + 0.9 * level));

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[350] w-[92%] max-w-lg bottom-[calc(88px+env(safe-area-inset-bottom))] sm:bottom-[calc(104px+env(safe-area-inset-bottom))] md:bottom-[calc(152px+env(safe-area-inset-bottom))] lg:bottom-[calc(172px+env(safe-area-inset-bottom))]"
    >
      {collapsed ? (
        <button
          aria-label="Expand voice HUD"
          className="rounded-full border border-border bg-card/95 backdrop-blur shadow-lg w-11 h-11 flex items-center justify-center active:scale-[0.98]"
          onClick={toggleCollapse}
        >
          <Mic className={`w-5 h-5 ${status === 'listening' ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden />
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status === 'listening' ? 'bg-primary/10' : 'bg-muted'}`} aria-hidden>
            <Mic className={`w-5 h-5 ${status === 'listening' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {status === 'listening' && 'Listening...'}
              {status === 'processing' && 'Processing...'}
              {status === 'speaking' && 'Speaking...'}
              {status === 'connected' && 'Voice Assistant Ready'}
              {status === 'connecting' && 'Connecting...'}
            </div>
            {status === 'listening' ? (
              <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-100"
                  style={{ width: `${meterWidth}%` }}
                  aria-label="Microphone level"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing your command
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {status === 'processing' && (
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" aria-hidden />
            )}
            <button
              aria-label="Collapse voice HUD"
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={toggleCollapse}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              aria-label="Stop listening"
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={handleStop}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </aside>
  );
};

export default VoiceHUD;
