import React, { useEffect, useState } from "react";
// Removed: import { audioSyncService } from "@/services/audioSyncService";

// Small, non-intrusive debug HUD for TTS highlighting & playback
// Enable via query param: ?ttsdebug=1
export const TTSDebugOverlay: React.FC = () => {
  const [status, setStatus] = useState({ isPlaying: false, currentWordIndex: -1, totalWords: 0, contentHash: '' });

  useEffect(() => {
    const iv = setInterval(() => {
      try {
        // TODO: Replace with SimplifiedAudioEngine status
        // const st = SimplifiedAudioEngine.getInstance().getStatus();
        const st = { isPlaying: false, currentWordIndex: -1, totalWords: 0, contentHash: '' };
        setStatus(st as any);
      } catch {}
    }, 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] rounded-md border px-3 py-2 text-xs shadow-sm select-none bg-[hsl(var(--background))]/85 border-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
      <div className="font-medium">TTS Debug</div>
      <div>playing: {String(status.isPlaying)}</div>
      <div>word: {status.currentWordIndex} / {status.totalWords}</div>
      <div>hash(audio): {status.contentHash ? String(status.contentHash).slice(0, 10) : '-'}</div>
      <div>hash(ui): {typeof window !== 'undefined' && (window as any).__pageContentHash ? String((window as any).__pageContentHash).slice(0,10) : '-'}</div>
      <div>mismatch: {typeof window !== 'undefined' && status.contentHash && (window as any).__pageContentHash && status.contentHash !== (window as any).__pageContentHash ? 'YES' : 'no'}</div>
    </div>
  );
};

export default TTSDebugOverlay;
