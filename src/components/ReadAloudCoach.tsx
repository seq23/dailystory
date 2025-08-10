import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mic, StopCircle, Volume2 } from "lucide-react";

interface ReadAloudCoachProps {
  targetText?: string;
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

export const ReadAloudCoach: React.FC<ReadAloudCoachProps> = ({ targetText }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");

  const defaultText =
    targetText ||
    "Luna and Max found a hidden door in the library and stepped into a world of stories.";

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

  const startRecording = useCallback(async () => {
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

        // Simple feedback vs target text
        const refWords = defaultText.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
        const saidWords = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
        const setRef = new Set(refWords);
        let hits = 0;
        saidWords.forEach((w) => {
          if (setRef.has(w)) hits += 1;
        });
        const acc = refWords.length ? Math.round((hits / refWords.length) * 100) : 0;
        setAccuracy(acc);
      } catch (err) {
        console.error("ReadAloudCoach processing failed", err);
      }
    };

    recorder.start();
    setIsRecording(true);
  }, [defaultText]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Read‑aloud coach</CardTitle>
        <CardDescription>Kids read aloud; get instant feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Target: {defaultText}</p>
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button size="sm" onClick={startRecording} className="gap-2">
              <Mic className="w-4 h-4" /> Start
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-2">
              <StopCircle className="w-4 h-4" /> Stop
            </Button>
          )}
          <Button size="sm" variant="secondary" className="gap-2" disabled>
            <Volume2 className="w-4 h-4" /> Coach tips
          </Button>
        </div>
        {transcript && (
          <div className="text-sm">
            <div className="font-medium">You said:</div>
            <p className="text-muted-foreground mt-1">{transcript}</p>
          </div>
        )}
        {accuracy !== null && (
          <div className="text-sm">
            <span className="font-medium">Match accuracy:</span> {accuracy}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadAloudCoach;
