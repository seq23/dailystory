import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mic, StopCircle, Volume2, RotateCcw, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { charlotteTTS } from "@/services/charlotteTTS";
import type { UserInfo } from "@/types";
import { useTranslation } from "react-i18next";

interface ReadAloudCoachProps {
  targetText?: string;
  userInfo?: UserInfo;
  isPremium?: boolean;
  language?: string; // ISO code; coach shows only for 'en'
  onUpgrade?: () => void;
}

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

const STOPWORDS = new Set([
  "the","a","an","and","or","but","so","to","of","in","on","at","with","for","from","by","as","is","are","was","were","be","been","being","that","this","it","its","his","her","their","our","your","i","you","he","she","they","we","my","me","him","them","our","yours","ours","theirs","there","here","then","than","too","very","just","really","into","over","under","up","down","out","about","after","before","again","once"
]);

const DAILY_FREE_LIMIT = 5; // sentences/day for free users
const PASS_THRESHOLD = 80; // percent
const MAX_ATTEMPTS_PER_SENTENCE = 3;
const WORD_MICRO_ATTEMPTS = 2; // "Say it with me" tries
const SENTENCE_MAX_MS = 10_000; // 10 seconds cap
const WORD_MICRO_MS = 2_000; // 2 seconds cap

export const ReadAloudCoach: React.FC<ReadAloudCoachProps> = ({
  targetText,
  userInfo,
  isPremium = false,
  language = "en",
  onUpgrade,
}) => {
  const { t } = useTranslation();
  // Language gate
  if (language && language.toLowerCase() !== "en") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('coach.title','Read‑aloud coach')}</CardTitle>
          <CardDescription>{t('coach.englishOnlyShort','English only for now')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('coach.englishOnlyLong','This coach is available for English stories only.')}</p>
        </CardContent>
      </Card>
    );
  }

  const originalText =
    targetText ||
    "Luna and Max found a hidden door in the library and stepped into a world of stories.";

  // Split into sentences (simple heuristic)
  const sentences = useMemo(() => {
    return originalText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [originalText]);

  const [idx, setIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [passed, setPassed] = useState<boolean | null>(null);
  const [paceTip, setPaceTip] = useState<string>("");
  const [topWords, setTopWords] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const startTsRef = useRef<number>(0);
  const autoStopTORef = useRef<number | null>(null);
  const resumeStoryAfterRef = useRef(false);

  const getDailyKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const loadDailyCount = useCallback(() => {
    try {
      const key = `t2r_coach_count_${getDailyKey()}`;
      const v = localStorage.getItem(key);
      const n = v ? parseInt(v, 10) : 0;
      setDailyUsed(Number.isFinite(n) ? n : 0);
      setLimitReached(!isPremium && n >= DAILY_FREE_LIMIT);
    } catch {}
  }, [isPremium]);

  const incDailyCount = useCallback(() => {
    if (isPremium) return;
    try {
      const key = `t2r_coach_count_${getDailyKey()}`;
      const current = parseInt(localStorage.getItem(key) || "0", 10) || 0;
      const next = Math.min(9999, current + 1);
      localStorage.setItem(key, String(next));
      setDailyUsed(next);
      if (next >= DAILY_FREE_LIMIT) setLimitReached(true);
    } catch {}
  }, [isPremium]);

  const getSeenKey = () => `t2r_coach_seen_${getDailyKey()}`;
  const hasCountedSentence = (s: string) => {
    try {
      const raw = localStorage.getItem(getSeenKey());
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) && arr.includes(s);
    } catch { return false; }
  };
  const markSentenceCounted = (s: string) => {
    try {
      const key = getSeenKey();
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        if (!arr.includes(s)) arr.push(s);
        localStorage.setItem(key, JSON.stringify(arr));
      } else {
        localStorage.setItem(key, JSON.stringify([s]));
      }
    } catch {}
  };

  useEffect(() => {
    loadDailyCount();
  }, [loadDailyCount]);

  useEffect(() => () => mediaRecorderRef.current?.stop(), []);

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

  const pauseStoryIfPlaying = () => {
    try {
      const status = (window as any).__t2r_sync_status;
      const wasPlaying = !!(status && status.isPlaying);
      resumeStoryAfterRef.current = wasPlaying;
      if (wasPlaying) {
        window.dispatchEvent(new Event("audio:pause"));
      }
    } catch {}
  };

  const resumeStoryIfNeeded = () => {
    try {
      if (resumeStoryAfterRef.current) {
        window.dispatchEvent(new Event("audio:resume"));
        resumeStoryAfterRef.current = false;
      }
    } catch {}
  };

  const analyzeResult = (reference: string, said: string, durationMs: number) => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    const refWords = clean(reference);
    const saidWords = clean(said);

    const refSet = new Set(refWords);
    let hits = 0;
    saidWords.forEach((w) => { if (refSet.has(w)) hits++; });
    const acc = refWords.length ? Math.round((hits / refWords.length) * 100) : 0;

    const minutes = Math.max(0.001, durationMs / 60000);
    const wpm = Math.round(saidWords.length / minutes);
    let pace = "";
    if (wpm < 70) pace = t('coach.paceFaster','Try a little faster');
    else if (wpm > 120) pace = t('coach.paceSlower','Try a little slower');
    else pace = t('coach.paceNice','Nice pace');

    // Top content words (up to 3) that were missed
    // Exclude stopwords and simple proper names (capitalized in original text)
    const originalWords = (reference.match(/[A-Za-z']+/g) || []).filter(Boolean);
    const properNames = new Set(originalWords.filter(w => /[A-Z]/.test(w[0]) && w.length > 1).map(w => w.toLowerCase()));

    const saidSet = new Set(saidWords);
    const missing = refWords.filter(w => !saidSet.has(w));
    const candidates = missing.filter(w => !STOPWORDS.has(w) && !properNames.has(w) && w.length >= 3);
    // Prioritize by length (content words) and uniqueness
    const unique: string[] = [];
    for (const w of candidates.sort((a,b)=>b.length-a.length)) {
      if (!unique.includes(w)) unique.push(w);
      if (unique.length >= 3) break;
    }

    return { acc, pace, top: unique };
  };

  const startRecording = useCallback(async () => {
    if (limitReached) return;
    if (attempts >= MAX_ATTEMPTS_PER_SENTENCE) return;

    const sentenceToCount = sentences[idx] || "";
    if (!isPremium && sentenceToCount && !hasCountedSentence(sentenceToCount)) {
      markSentenceCounted(sentenceToCount);
      incDailyCount();
    }

    pauseStoryIfPlaying();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        if (autoStopTORef.current) { clearTimeout(autoStopTORef.current); autoStopTORef.current = null; }
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        const base64 = await blobToBase64(blob);
        const { data, error } = await supabase.functions.invoke("voice-to-text", {
          body: { audio: base64, mimeType: mimeTypeRef.current },
        });
        if (error) {
          console.error(error);
          return;
        }
        const text: string = data?.text || "";
        setTranscript(text);

        const durationMs = Math.max(250, Date.now() - (startTsRef.current || Date.now()));
        const { acc, pace, top } = analyzeResult(sentences[idx], text, durationMs);
        setPaceTip(pace);
        const didPass = acc >= PASS_THRESHOLD;
        setPassed(didPass);
        if (!didPass) setTopWords(top); else setTopWords([]);

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        // Auto-resume story audio after feedback
        setTimeout(resumeStoryIfNeeded, 450);
      } catch (err) {
        console.error("ReadAloudCoach processing failed", err);
        setTimeout(resumeStoryIfNeeded, 450);
      }
    };

    startTsRef.current = Date.now();
    recorder.start();
    setIsRecording(true);

    // Auto-stop guard at 10s
    autoStopTORef.current = window.setTimeout(() => {
      try { recorder.stop(); } catch {}
    }, SENTENCE_MAX_MS);
  }, [attempts, idx, sentences, limitReached, incDailyCount]);

  const stopRecording = useCallback(() => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
    setIsRecording(false);
  }, []);

  // Quick 2-second check for a single word
  const checkWordPronunciation = async (word: string): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supported = getSupportedMimeType();
      const options = supported ? { mimeType: supported } : undefined;
      const recorder = new MediaRecorder(stream, options as MediaRecorderOptions);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const stopAfter = window.setTimeout(() => { try { recorder.stop(); } catch {} }, WORD_MICRO_MS);
      const done = new Promise<string>((resolve) => {
        recorder.onstop = async () => {
          try { clearTimeout(stopAfter); } catch {}
          try { stream.getTracks().forEach(t=>t.stop()); } catch {}
          const blob = new Blob(chunks, { type: supported || "audio/webm" });
          const base64 = await blobToBase64(blob);
          const { data } = await supabase.functions.invoke("voice-to-text", { body: { audio: base64, mimeType: supported || "audio/webm" } });
          resolve((data?.text || "").toLowerCase());
        };
      });
      recorder.start();
      const said = (await done) || "";
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      return new RegExp(`\\b${cleanWord}\\b`).test(said);
    } catch (e) {
      console.warn("Word check failed", e);
      return false;
    }
  };

  // Per-word micro attempts tracking
  const [wordTries, setWordTries] = useState<Record<string, number>>({});
  const onSayWithMe = async (w: string) => {
    const tries = wordTries[w] || 0;
    if (tries >= WORD_MICRO_ATTEMPTS) return;
    const ok = await checkWordPronunciation(w);
    setWordTries((prev) => ({ ...prev, [w]: tries + 1 }));
    if (ok) {
      // Celebrate quickly and remove from list
      setTopWords((prev) => prev.filter((x) => x !== w));
      try { await charlotteTTS.speak(t('coach.great','Great!') ); } catch {}
    }
  };

  const currentSentence = sentences[idx] || "";

  const nextSentence = () => {
    setTranscript("");
    setPassed(null);
    setPaceTip("");
    setTopWords([]);
    setAttempts(0);
    setWordTries({});
    setIdx((i) => Math.min(sentences.length - 1, i + 1));
  };
  const prevSentence = () => {
    setTranscript("");
    setPassed(null);
    setPaceTip("");
    setTopWords([]);
    setAttempts(0);
    setWordTries({});
    setIdx((i) => Math.max(0, i - 1));
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('coach.title','Read‑aloud coach')}</CardTitle>
          <CardDescription>{t('coach.subtitle','Kids read aloud; get instant feedback')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Target sentence and navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevSentence} disabled={idx === 0} aria-label={t('coach.prevSentence','Previous sentence')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSentence} disabled={idx >= sentences.length - 1} aria-label={t('coach.nextSentence','Next sentence')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {!isPremium && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> {dailyUsed}/{DAILY_FREE_LIMIT} {t('coach.today','today')}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{t('coach.target','Target:')} {currentSentence}</p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isRecording ? (
            <Button size="sm" onClick={startRecording} className="gap-2" disabled={limitReached || attempts >= MAX_ATTEMPTS_PER_SENTENCE}>
              <Mic className="w-4 h-4" /> {t('coach.start','Start')}
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-2">
              <StopCircle className="w-4 h-4" /> {t('coach.stop','Stop')}
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => { setTranscript(""); setPassed(null); setPaceTip(""); setTopWords([]); setWordTries({}); }}
            disabled={isRecording || attempts >= MAX_ATTEMPTS_PER_SENTENCE}
          >
            <RotateCcw className="w-4 h-4" /> {t('coach.tryAgain','Try again')}
          </Button>

          {!isPremium && limitReached && (
            <Button size="sm" variant="outline" onClick={onUpgrade || (() => { window.location.href = '/pricing'; })}>
              {t('coach.limitReached','Daily limit reached — Upgrade')}
            </Button>
          )}
        </div>

        {/* Feedback */}
        {transcript && (
          <div className="text-sm space-y-2">
            <div>
              <div className="font-medium">{t('coach.youSaid','You said:')}</div>
              <p className="text-muted-foreground mt-1">{transcript}</p>
            </div>
            {passed !== null && (
              <div className="text-sm">
                <div className="font-medium">{t('coach.feedback','Feedback:')}</div>
                {passed ? (
                  <p className="text-green-600 dark:text-green-400">{t('coach.pass','Great job! You matched the sentence.')}</p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400">{t('coach.almost','Almost there—let\'s fix a few words.')}</p>
                )}
                {paceTip && <p className="text-muted-foreground mt-1">{t('coach.paceTip','Pace tip:')} {paceTip}</p>}
              </div>
            )}
          </div>
        )}

        {/* Top words coaching (only on fail) */}
        {passed === false && topWords.length > 0 && (
          <div className="text-sm space-y-2">
            <div className="font-medium">{t('coach.topWords','Top 3 words to practice:')}</div>
            <div className="flex flex-col gap-2">
              {topWords.map((w) => (
                <div key={w} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{w}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="gap-1" onClick={() => charlotteTTS.speak(w)}>
                      <Volume2 className="w-3 h-3" /> {t('coach.hearIt','Hear it')}
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => onSayWithMe(w)} disabled={(wordTries[w] || 0) >= WORD_MICRO_ATTEMPTS}>
                      {t('coach.sayWithMe','Say it with me')} ({(wordTries[w] || 0)}/{WORD_MICRO_ATTEMPTS})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground">{t('coach.privacy','We don’t store recordings. Audio is discarded after feedback.')}</p>
      </CardContent>
    </Card>
  );
};

export default ReadAloudCoach;
