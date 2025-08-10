import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Mic, StopCircle } from "lucide-react";

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
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({ onCommand }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");

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
        const text: string = (data?.text || "").toLowerCase();
        const found = KNOWN_COMMANDS.find((c) => text.includes(c));
        const cmd = found || text.trim();
        setLastCommand(cmd);
        onCommand?.(cmd);
      } catch (err) {
        console.error("Voice command processing failed", err);
      }
    };

    recorder.start();
    setIsRecording(true);
  }, [onCommand]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  }, []);

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
        {lastCommand && (
          <div className="flex items-center gap-2 text-sm">
            <Bot className="w-4 h-4" /> <span>Heard:</span>
            <span className="font-medium">{lastCommand}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceCommandController;
