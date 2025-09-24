import { DebugLogger } from '@/services/DebugLogger';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Mic, StopCircle, Volume2, RotateCcw, ChevronLeft, ChevronRight, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { charlotteVoiceService } from "@/services/CharlotteVoiceService";
import { browserTTSService } from "@/services/BrowserTTSService";
import { PronunciationAnalyzer } from "@/services/PronunciationAnalyzer";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import type { SupportedLanguage } from "@/types/multilingual";
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
  // Reading coach now works for ALL languages - no restrictions!

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
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string>("");
  const [syllableFeedback, setSyllableFeedback] = useState<Array<{word: string; syllables: string[]; feedback: string}>>([]);
  const [attempts, setAttempts] = useState(0);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  
  // NEW: Charlotte readiness and syllable display states
  const [charlotteReady, setCharlotteReady] = useState(false);
  const [charlotteIntroducing, setCharlotteIntroducing] = useState(true);
  const [wordSyllables, setWordSyllables] = useState<Record<string, string>>({});

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
    
    // NEW: Smart coach introduction with proper timing control
    const introduceCoach = async () => {
      try {
        setCharlotteIntroducing(true);
        setCharlotteReady(false);
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Let dialog settle
        const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
        const introMessage = t('coach.introduction', 'Hi! I\'m Charlotte, your reading helper! I\'ll listen as you read and help you with tricky words. Let me get ready for you...');
        
        if (userLanguage === 'en') {
          // Try Charlotte first for English users
          try {
            await charlotteVoiceService.charlotteInteractiveAudio({
              text: introMessage,
              context: 'interactive'
            });
          } catch (error) {
            // Fallback to Browser TTS if Charlotte fails
            await browserTTSService.speakCoachMessage(introMessage, userLanguage);
          }
        } else {
          // Use Browser TTS for non-English users
          await browserTTSService.speakCoachMessage(introMessage, userLanguage);
        }
        
        // Short pause, then mark Charlotte as ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCharlotteIntroducing(false);
        setCharlotteReady(true);
        
      } catch (err) {
        DebugLogger.error('audio', 'Coach introduction failed:', err);
        // Still mark as ready even if intro fails
        setCharlotteIntroducing(false);
        setCharlotteReady(true);
      }
    };
    
    introduceCoach();
  }, [loadDailyCount, userInfo?.nativeLanguage, t]);

  useEffect(() => () => mediaRecorderRef.current?.stop(), []);

  // Stop all audio - both Charlotte and browser TTS
  const stopAllAudio = useCallback(() => {
    try {
      // Stop recording if active
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      
      // Stop Charlotte's voice
      charlotteVoiceService.stop();
      
      // Stop browser TTS
      browserTTSService.stop();
      
      DebugLogger.log('audio', 'All reading coach audio stopped');
    } catch (error) {
      DebugLogger.error('audio', 'Error stopping coach audio', error);
    }
  }, []);

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

  const analyzeResult = async (reference: string, said: string, durationMs: number, confidence: number = 0.8, wordConfidences: any[] = []) => {
    // Calculate reading pace
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    const saidWords = clean(said);
    const minutes = Math.max(0.001, durationMs / 60000);
    const wpm = Math.round(saidWords.length / minutes);
    let pace = "";
    if (wpm < 70) pace = "Try reading a little faster next time";
    else if (wpm > 120) pace = "Try slowing down just a bit for clearer pronunciation";
    else pace = "Your reading pace is perfect!";

    // Use phonetic analysis for pronunciation accuracy with confidence data
    const pronunciationResult = await PronunciationAnalyzer.analyzePronunciation(
      reference, 
      said, 
      confidence,
      wordConfidences
    );

    // Extract top problematic words with priority for completely missed words
    const missedWords = pronunciationResult.mispronounced.filter(word => {
      // Prioritize words that weren't found at all in the spoken text
      const cleanSpoken = said.toLowerCase().replace(/[^a-z\s]/g, '');
      return !cleanSpoken.includes(word.toLowerCase());
    });
    const mispronounced = pronunciationResult.mispronounced.filter(word => {
      const cleanSpoken = said.toLowerCase().replace(/[^a-z\s]/g, '');
      return cleanSpoken.includes(word.toLowerCase());
    });
    // ULTRA-STRICT: Show ALL problematic words (removed 3-word cap)
    const topWordsFromAnalysis = [...missedWords, ...mispronounced];
    
    return { 
      acc: pronunciationResult.accuracy, 
      pace, 
      top: topWordsFromAnalysis,
      pronunciationFeedback: pronunciationResult.overallFeedback,
      syllableFeedback: pronunciationResult.syllableFeedback,
      phonemeErrors: pronunciationResult.phonemeErrors
    };
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
          DebugLogger.error('audio', 'ReadAloudCoach processing error', error);
          return;
        }
        const text: string = data?.text || "";
        const confidence: number = data?.confidence || 0.8;
        const wordConfidences = data?.words || [];
        setTranscript(text);

        const durationMs = Math.max(250, Date.now() - (startTsRef.current || Date.now()));
        const analysisResult = await analyzeResult(sentences[idx], text, durationMs, confidence, wordConfidences);
        const { acc, pace, top, pronunciationFeedback, syllableFeedback } = analysisResult;
        
        setPaceTip(pace);
        setPronunciationFeedback(pronunciationFeedback);
        setSyllableFeedback(syllableFeedback);
        const didPass = acc >= PASS_THRESHOLD;
        setPassed(didPass);
        if (!didPass) setTopWords(top); else setTopWords([]);

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        // Smart coach feedback - Charlotte only for English, direct calls with interpolated text
        setTimeout(async () => {
          const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
          
          try {
            if (didPass) {
              const successMessage = t('coach.feedback.success', 'Excellent reading! {{pace}} That was a perfect score!', { pace })
                .replace('{{pace}}', pace);
              
              if (userLanguage === 'en') {
                await charlotteVoiceService.charlotteAccuracyFeedback(Math.round(acc), true, pace);
              } else {
                await browserTTSService.speakCoachMessage(successMessage, userLanguage);
              }
            } else {
              let feedbackText = t('coach.feedback.tryAgain', 'Good effort! You got {{accuracy}}% correct. ', { accuracy: Math.round(acc) })
                .replace('{{accuracy}}', Math.round(acc).toString());
              
              if (top.length > 0) {
                feedbackText += t('coach.feedback.practiceWords', 'Let\'s practice these words: {{words}}. ', { words: top.join(', ') })
                  .replace('{{words}}', top.join(', '));
              }
              feedbackText += pace;
              
              if (userLanguage === 'en') {
                await charlotteVoiceService.charlotteAccuracyFeedback(Math.round(acc), false, pace);
                
                // Provide syllable coaching for problematic words with Charlotte
                if (top.length > 0) {
                  await charlotteVoiceService.charlottePracticeWords(top);
                }
              } else {
                await browserTTSService.speakCoachMessage(feedbackText, userLanguage);
              }
            }
          } catch (err) {
            DebugLogger.error('audio', 'Coach feedback failed:', err);
            // Only fallback to browser for non-English or if Charlotte completely fails
            if (userLanguage !== 'en') {
              const fallbackMessage = didPass ? 'Great job!' : `Good effort! You got ${Math.round(acc)}% correct.`;
              await browserTTSService.speakCoachMessage(fallbackMessage, userLanguage);
            }
          }
          
          // Auto-resume story audio after feedback
          setTimeout(resumeStoryIfNeeded, 500);
        }, 300);
      } catch (err) {
        DebugLogger.error('audio', 'ReadAloudCoach processing failed', err);
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
      DebugLogger.warn('audio', 'Word check failed', e);
      return false;
    }
  };

  // Per-word micro attempts tracking
  const [wordTries, setWordTries] = useState<Record<string, number>>({});
  const { isMobileOrTablet } = useIsMobile();
  
  // NEW: Enhanced syllable demo function
  const onHearCharlotteSayIt = async (word: string) => {
    try {
      const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
      const demoMessage = t('coach.syllableDemo', 'Listen to how I break down "{{word}}"', { word });
      
      if (userLanguage === 'en') {
        await charlotteVoiceService.charlotteInteractiveAudio({
          text: demoMessage,
          context: 'interactive'
        });
        await charlotteVoiceService.charlotteSyllableWord(word);
        
        // Show visual syllables and keep them visible
        const syllableBreakdown = word.split('').reduce((acc, char, i) => {
          if (i > 0 && i < word.length - 1 && Math.random() > 0.6) {
            return acc + '-' + char;
          }
          return acc + char;
        }, '');
        setWordSyllables(prev => ({ ...prev, [word]: syllableBreakdown }));
        
      } else {
        await browserTTSService.speakCoachMessage(`${demoMessage}: ${word}`, userLanguage);
      }
    } catch (err) {
      DebugLogger.error('audio', 'Syllable demo failed:', err);
    }
  };
  
  const onSayWithMe = async (w: string) => {
    const tries = wordTries[w] || 0;
    if (tries >= WORD_MICRO_ATTEMPTS) return;
    
    // Smart coach demonstrates first, then listens for user
    try {
      const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
      
      const speakCoachMessage = async (message: string) => {
        if (userLanguage === 'en') {
          // English users get Charlotte only - no browser fallback
          await charlotteVoiceService.charlotteInteractiveAudio({
            text: message,
            context: 'interactive'
          });
        } else {
          await browserTTSService.speakCoachMessage(message, userLanguage);
        }
      };
      
      const practiceMessage = t('coach.wordPractice.intro', 'Let\'s practice the word "{{word}}" together. Listen first, then you say it.', { word: w });
      await speakCoachMessage(practiceMessage);
      
      // Demonstrate the word pronunciation with Charlotte's voice
      await charlotteVoiceService.charlotteSyllableWord(w);
      
      const tryMessage = t('coach.wordPractice.yourTurn', 'Now you try saying "{{word}}"', { word: w });
      await speakCoachMessage(tryMessage);
      
    } catch (err) {
      DebugLogger.error('audio', 'Coach demonstration failed:', err);
    }
    
    const ok = await checkWordPronunciation(w);
    setWordTries((prev) => ({ ...prev, [w]: tries + 1 }));
    
    if (ok) {
      // Celebrate with coach's voice and remove from list
      setTopWords((prev) => prev.filter((x) => x !== w));
      try { 
        const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
        const successMessage = t('coach.wordPractice.success', 'Perfect! You nailed "{{word}}"! That was excellent pronunciation!', { word: w });
        if (userLanguage === 'en') {
          try {
            await charlotteVoiceService.charlotteInteractiveAudio({
              text: successMessage,
              context: 'interactive'
            });
          } catch (error) {
            await browserTTSService.speakCoachMessage(successMessage, userLanguage);
          }
        } else {
          await browserTTSService.speakCoachMessage(successMessage, userLanguage);
        }
      } catch {}
    } else {
      try {
        const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
        const remainingTries = WORD_MICRO_ATTEMPTS - (tries + 1);
        let encourageMessage: string;
        if (remainingTries > 0) {
          encourageMessage = t('coach.wordPractice.encourage', 'Almost there! You have {{tries}} more try. Let me break it down for you again.', { tries: remainingTries });
        } else {
          encourageMessage = t('coach.wordPractice.comfort', 'That\'s okay! Keep practicing "{{word}}" and you\'ll get it. Don\'t worry, it takes time!', { word: w });
        }
        
        if (userLanguage === 'en') {
          try {
            await charlotteVoiceService.charlotteInteractiveAudio({
              text: encourageMessage,
              context: 'interactive'
            });
            
            // Auto-demonstrate the word with syllables after encouragement (fulfilling Charlotte's promise)
            if (remainingTries > 0) {
              await charlotteVoiceService.charlotteSyllableWord(w);
            }
          } catch (error) {
            await browserTTSService.speakCoachMessage(encourageMessage, userLanguage);
          }
        } else {
          await browserTTSService.speakCoachMessage(encourageMessage, userLanguage);
        }
      } catch {}
    }
  };

  const currentSentence = sentences[idx] || "";

  const nextSentence = async () => {
    setTranscript("");
    setPassed(null);
    setPaceTip("");
    setTopWords([]);
    setPronunciationFeedback("");
    setSyllableFeedback([]);
    setAttempts(0);
    setWordTries({});
    const newIdx = Math.min(sentences.length - 1, idx + 1);
    setIdx(newIdx);
    
    // Smart coach introduces the new sentence
    try {
      const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
      const nextMessage = t('coach.navigation.next', 'Great! Let\'s move to the next sentence. Here it is: "{{sentence}}"', { sentence: sentences[newIdx] || "" });
      
      if (userLanguage === 'en') {
        try {
          await charlotteVoiceService.charlotteInteractiveAudio({
            text: nextMessage,
            context: 'interactive'
          });
        } catch (error) {
          await browserTTSService.speakCoachMessage(nextMessage, userLanguage);
        }
      } else {
        await browserTTSService.speakCoachMessage(nextMessage, userLanguage);
      }
    } catch {}
  };
  
  const prevSentence = async () => {
    setTranscript("");
    setPassed(null);
    setPaceTip("");
    setTopWords([]);
    setPronunciationFeedback("");
    setSyllableFeedback([]);
    setAttempts(0);
    setWordTries({});
    const newIdx = Math.max(0, idx - 1);
    setIdx(newIdx);
    
    // Smart coach introduces the previous sentence
    try {
      const userLanguage = (userInfo?.nativeLanguage || 'en') as SupportedLanguage;
      const prevMessage = t('coach.navigation.previous', 'Let\'s go back to practice this sentence: "{{sentence}}"', { sentence: sentences[newIdx] || "" });
      
      if (userLanguage === 'en') {
        try {
          await charlotteVoiceService.charlotteInteractiveAudio({
            text: prevMessage,
            context: 'interactive'
          });
        } catch (error) {
          await browserTTSService.speakCoachMessage(prevMessage, userLanguage);
        }
      } else {
        await browserTTSService.speakCoachMessage(prevMessage, userLanguage);
      }
    } catch {}
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border border-border bg-card text-card-foreground shadow-sm max-h-screen overflow-auto">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CardTitle className="text-lg sm:text-xl text-primary">🎯 Help Me Read</CardTitle>
              <CardDescription className="text-sm">Charlotte's here to help you practice!</CardDescription>
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
              <Button variant="ghost" size="icon" onClick={prevSentence} disabled={idx === 0} aria-label={t('coach.prevSentence','Previous sentence')} className="shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextSentence} disabled={idx >= sentences.length - 1} aria-label={t('coach.nextSentence','Next sentence')} className="shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
              {!isPremium && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1 shrink-0">
                  <Lock className="w-3 h-3" /> {dailyUsed}/{DAILY_FREE_LIMIT} {t('coach.today','today')}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          
          {/* SECTION 1: Words That Need Practice (Always at top, always expanded) */}
          {topWords.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                📚 Words That Need Practice
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                Let's work on these tricky words together!
              </p>
              
              <div className="space-y-4">
                {topWords.map((word) => (
                  <div key={word} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-primary mb-1">{word}</div>
                      {wordSyllables[word] && (
                        <div className="text-lg text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                          {wordSyllables[word]}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="w-full text-sm font-medium h-12" 
                        onClick={() => onHearCharlotteSayIt(word)}
                      >
                        🔊 Hear Charlotte Say It
                      </Button>
                      <Button 
                        size="lg" 
                        className="w-full text-sm font-medium h-12" 
                        onClick={() => onSayWithMe(word)} 
                        disabled={(wordTries[word] || 0) >= WORD_MICRO_ATTEMPTS}
                      >
                        🗣️ Practice With Me ({(wordTries[word] || 0)}/{WORD_MICRO_ATTEMPTS})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target sentence display */}
          <div className="text-center px-4 py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="font-bold leading-relaxed text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-200 break-words mb-2">
              {currentSentence}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">📖 Read this sentence out loud</div>
          </div>

        {/* Charlotte readiness and controls */}
        <div className="text-center space-y-4">
          {charlotteIntroducing && (
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200">
                <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                <span className="font-medium">🎙️ Charlotte is getting ready...</span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">
                Listen to Charlotte first!
              </p>
            </div>
          )}
          
          {charlotteReady && !charlotteIntroducing && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <>
                  <Button 
                    size="lg" 
                    onClick={startRecording} 
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg h-14" 
                    disabled={limitReached || attempts >= MAX_ATTEMPTS_PER_SENTENCE}
                  >
                    <Mic className="w-5 h-5 mr-2" /> 🎤 Start Reading!
                  </Button>
                  <Button size="sm" variant="destructive" onClick={stopAllAudio} className="gap-2">
                    <StopCircle className="w-4 h-4" /> Stop All Sounds
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={stopRecording} variant="outline" className="bg-red-50 border-red-300 text-red-700 font-semibold px-8 py-4 text-lg h-14">
                  <StopCircle className="w-5 h-5 mr-2" /> ⏹️ Stop Reading
                </Button>
              )}

              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => { 
                  setTranscript(""); 
                  setPassed(null); 
                  setPaceTip(""); 
                  setTopWords([]); 
                  setPronunciationFeedback(""); 
                  setSyllableFeedback([]); 
                  setWordTries({});
                  setWordSyllables({});
                }}
                disabled={isRecording || attempts >= MAX_ATTEMPTS_PER_SENTENCE}
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>

              {!isPremium && limitReached && (
                <Button size="sm" variant="outline" onClick={onUpgrade || (() => { window.location.href = '/pricing'; })}>
                  Daily limit reached — Upgrade for more!
                </Button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: How You Did (Results and feedback) */}
        {transcript && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              🎯 How You Did
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">You said:</div>
                <p className="text-gray-700 dark:text-gray-300 italic">"{transcript}"</p>
              </div>
              
              {passed !== null && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                  <div className="font-medium flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
                    <Volume2 className="w-4 h-4" />
                    Charlotte's Feedback:
                  </div>
                  {passed ? (
                    <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                      🎉 Amazing job! Perfect reading!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-orange-600 dark:text-orange-400 font-medium">
                        💪 Good try! Keep practicing - you're getting better!
                      </div>
                      {paceTip && (
                        <div className="text-blue-600 dark:text-blue-400 text-sm">
                          💡 Tip: {paceTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
