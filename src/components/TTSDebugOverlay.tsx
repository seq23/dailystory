import React, { useEffect, useState } from "react";
import { audioSyncService } from "@/services/audioSyncService";

// Small, non-intrusive debug HUD for TTS highlighting & playback
// Enable via query param: ?ttsdebug=1
export const TTSDebugOverlay: React.FC = () => {
  const [status, setStatus] = useState({ isPlaying: false, currentWordIndex: -1, totalWords: 0 });

  useEffect(() => {
    const iv = setInterval(() => {
      try {
        const st = audioSyncService.getPlaybackStatus();
        setStatus(st);
      } catch {}
    }, 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] rounded-md border px-3 py-2 text-xs shadow-sm select-none bg-[hsl(var(--background))]/85 border-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
      <div className="font-medium">TTS Debug</div>
      <div>playing: {String(status.isPlaying)}</div>
      <div>word: {status.currentWordIndex} / {status.totalWords}</div>
    </div>
  );
};

export default TTSDebugOverlay;
