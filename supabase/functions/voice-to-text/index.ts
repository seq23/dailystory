import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle health check and CORS preflight
  const healthCorsResponse = handleHealthAndCors(req);
  if (healthCorsResponse) return healthCorsResponse;

  

  try {
    const { audio, mimeType } = await req.json();

    if (!audio) {
      throw new Error("No audio data provided");
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);

    // Prepare form data
    const formData = new FormData();
    const inferredType = typeof mimeType === "string" && mimeType.length > 0 ? mimeType : "audio/webm";
    const blob = new Blob([binaryAudio], { type: inferredType });
    const ext = inferredType.includes("mp4")
      ? "mp4"
      : inferredType.includes("mpeg") || inferredType.includes("mp3")
      ? "mp3"
      : inferredType.includes("wav")
      ? "wav"
      : inferredType.includes("aac")
      ? "aac"
      : inferredType.includes("ogg")
      ? "ogg"
      : "webm";
    formData.append("file", blob, `audio.${ext}`);
    formData.append("model", "whisper-1");

    // Send to OpenAI with detailed response format
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();

    // For pronunciation analysis, also make a verbose request if available
    let detailedResult = null;
    try {
      const verboseFormData = new FormData();
      verboseFormData.append("file", blob, `audio.${ext}`);
      verboseFormData.append("model", "whisper-1");
      verboseFormData.append("response_format", "verbose_json");
      
      const verboseResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        },
        body: verboseFormData,
      });

      if (verboseResponse.ok) {
        detailedResult = await verboseResponse.json();
      }
    } catch (error) {
      console.warn("Failed to get detailed transcription:", error);
    }

    const responseData: any = { 
      text: result.text,
      originalText: result.text // Basic fallback
    };

    // Include detailed data if available
    if (detailedResult) {
      responseData.segments = detailedResult.segments;
      responseData.words = detailedResult.words;
      responseData.confidence = detailedResult.segments?.[0]?.avg_logprob ? 
        Math.exp(detailedResult.segments[0].avg_logprob) : 0.8;
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
