/**
 * The voice-to-text handler (supabase/functions/voice-to-text/index.ts wires the live parts):
 * the sign-in guard, the free read-aloud count (./readAloudAllowance.ts), then Whisper.
 * Plain TypeScript with injected parts, so vitest runs the real handler
 * (src/test/guards/read-aloud-server-limit.test.ts).
 */
import type { CostEntry } from "./costLogger.ts";
import { checkReadAloud, type ReadAloudDeps } from "./readAloudAllowance.ts";
import { spokenCommandOnly } from "./storyVoiceCommands.ts";
import { VOICE_COMMAND_PROMPTS, commandTranscript, voiceCommandLanguage } from "./voiceCommandPrompt.ts";

export interface VoiceToTextDeps {
  /** guardCallWithCors(req, 'voice-to-text', …) in production. */
  guard(req: Request): Promise<{ caller: { kind: string; id?: string } | null; refused: Response | null }>;
  /** The free read-aloud count's parts, built per request. */
  readAloud(): ReadAloudDeps;
  /** POST a form to OpenAI's /v1/audio/transcriptions. */
  transcribe(form: FormData): Promise<Response>;
  logCost(entry: CostEntry): void;
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  while (position < base64String.length) {
    const binaryChunk = atob(base64String.slice(position, position + chunkSize));
    const bytes = new Uint8Array(binaryChunk.length);
    for (let i = 0; i < binaryChunk.length; i++) bytes[i] = binaryChunk.charCodeAt(i);
    chunks.push(bytes);
    position += chunkSize;
  }
  const result = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

function audioExtension(type: string): string {
  if (type.includes("mp4")) return "mp4";
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
  if (type.includes("wav")) return "wav";
  if (type.includes("aac")) return "aac";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}

export async function handleVoiceToText(req: Request, deps: VoiceToTextDeps, cors: Record<string, string>): Promise<Response> {
  const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", ...extra } });

  // Paid call, signed-in accounts only: a child's voice is sent to OpenAI only from an
  // account with parental consent on record (risk rule R-KID-02), so a guest pass is
  // refused here, not just hidden in the UI (./paidCallGuard.ts).
  const { caller, refused } = await deps.guard(req);
  if (refused) return refused;

  try {
    const { audio, mimeType, mode, language, sentence, timeZone } = await req.json();
    // The story page's spoken commands (storyVoiceCommands.ts): a short clip in the child's
    // UI language, a prompt with no command word in it (Whisper echoes its prompt on
    // silence), and no second pronunciation pass.
    const isCommand = mode === "command";
    const commandLanguage = isCommand ? voiceCommandLanguage(language) : null;
    const commandPrompt = isCommand ? VOICE_COMMAND_PROMPTS[commandLanguage ?? "en"] : "";

    if (!audio) throw new Error("No audio data provided");

    // Read-aloud practice (every clip that is not a story-page command) from a signed-in
    // account: counted here before the paid call. Premium is read from subscribers, never
    // from the request. The count's used/limit go back with the transcript.
    let practice: { used: number; limit: number } | null = null;
    if (!isCommand && caller?.kind === "user" && caller.id) {
      const decision = await checkReadAloud(caller.id, sentence, timeZone, deps.readAloud());
      if (decision.allowed === false) {
        return json(decision.body, decision.status, decision.status === 503 ? { "Retry-After": "60" } : {});
      }
      practice = (decision as Extract<typeof decision, { allowed: true }>).practice;
    }

    const binaryAudio = processBase64Chunks(audio);
    const inferredType = typeof mimeType === "string" && mimeType.length > 0 ? mimeType : "audio/webm";
    const blob = new Blob([binaryAudio], { type: inferredType });
    const ext = audioExtension(inferredType);

    const formData = new FormData();
    formData.append("file", blob, `audio.${ext}`);
    formData.append("model", "whisper-1");
    if (isCommand) {
      formData.append("prompt", commandPrompt);
      if (commandLanguage) formData.append("language", commandLanguage);
    }
    const response = await deps.transcribe(formData);
    if (!response.ok) throw new Error(`OpenAI API error: ${await response.text()}`);
    const result = await response.json();

    // Whisper pricing: $0.006/min, estimate from audio size (~16KB/sec for webm)
    const estimatedMinutes = Math.max(0.1, (binaryAudio.length / (1024 * 1024)) * 4);
    const whisperCost = estimatedMinutes * 0.006;
    const cost = (operationType: string): CostEntry => ({
      sessionId: "voice-to-text",
      provider: "openai",
      operationType,
      modelUsed: "whisper-1",
      cost: whisperCost,
      apiEndpoint: "/v1/audio/transcriptions",
      pricingModel: "per_minute",
      quantityUsed: Math.round(estimatedMinutes * 100) / 100,
      unitCost: 0.006,
    });
    deps.logCost(cost("speech_to_text"));

    // For pronunciation analysis, also make a verbose request if available
    let detailedResult: any = null;
    if (!isCommand) {
      try {
        const verbose = new FormData();
        verbose.append("file", blob, `audio.${ext}`);
        verbose.append("model", "whisper-1");
        verbose.append("response_format", "verbose_json");
        const verboseResponse = await deps.transcribe(verbose);
        if (verboseResponse.ok) {
          detailedResult = await verboseResponse.json();
          deps.logCost(cost("speech_to_text_verbose"));
        }
      } catch (error) {
        console.warn("Failed to get detailed transcription:", error);
      }
    }

    // A command clip that only echoes the prompt is nothing said; a command clip answers
    // with a command or nothing, never a free transcript.
    const text = isCommand ? spokenCommandOnly(commandTranscript(result.text, commandPrompt)) : result.text;
    const responseData: any = { text, originalText: text, practice };
    if (detailedResult) {
      responseData.segments = detailedResult.segments;
      responseData.words = detailedResult.words;
      responseData.confidence = detailedResult.segments?.[0]?.avg_logprob ? Math.exp(detailedResult.segments[0].avg_logprob) : 0.8;
    }
    return json(responseData);
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
}
