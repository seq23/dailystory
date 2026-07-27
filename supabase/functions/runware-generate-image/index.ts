/**
 * runware-generate-image — story page illustrations.
 *
 * ONE path:
 *   page text -> scene distiller -> prompt assembly -> Runware -> image URL
 *
 * There is no tier cascade. If this function fails, the client shows the
 * static "images not working" illustration (ImageFallbackService). That is the
 * only fallback, and it is deliberate: every former tier called the same
 * Runware endpoint with the same model, so they all failed together anyway.
 *
 * Contract
 *   POST { pageText, sessionId, pageNumber, userInfo, previousScene? }
 *   200  { success: true,  imageURL, scene, sceneSource, seed, prompt }
 *   200  { success: false, error }        <- client falls back to static image
 */

import {
  buildImagePrompt,
  type ImageUserInfo,
} from '../_shared/imagePrompt.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const PROMPT_BUILD = 'ancestry-locks-v1';
const RUNWARE_ENDPOINT = 'https://api.runware.ai/v1';
const RUNWARE_MODEL = 'runware:100@1';
const RUNWARE_TIMEOUT_MS = 25000;
const COST_PER_IMAGE_USD = 0.0013;

interface RequestPayload {
  pageText?: string;
  sessionId?: string;
  pageNumber?: number;
  userInfo?: ImageUserInfo;
  previousScene?: string;
}

// ---------------------------------------------------------------------------
// Runware
// ---------------------------------------------------------------------------

async function callRunware(
  positivePrompt: string,
  negativePrompt: string,
  seed: number,
): Promise<string> {
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) throw new Error('RUNWARE_API_KEY not configured');

  // One retry. Anything beyond that is worse for the reader than a placeholder.
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RUNWARE_TIMEOUT_MS);

    try {
      const response = await fetch(RUNWARE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify([
          { taskType: 'authentication', apiKey: apiKey.trim() },
          {
            taskType: 'imageInference',
            taskUUID: crypto.randomUUID(),
            positivePrompt,
            negativePrompt,
            width: 1024,
            height: 1024,
            model: RUNWARE_MODEL,
            numberResults: 1,
            outputFormat: 'WEBP',
            steps: 25,
            CFGScale: 8,
            seed,
          },
        ]),
      });

      if (!response.ok) {
        throw new Error(`Runware HTTP ${response.status}`);
      }

      const result = await response.json();
      const image = result?.data?.find(
        (item: { taskType?: string }) => item.taskType === 'imageInference',
      );

      if (!image?.imageURL) {
        const apiError = result?.errors?.[0]?.message ?? 'no imageURL in response';
        throw new Error(`Runware: ${apiError}`);
      }

      return image.imageURL as string;
    } catch (error) {
      lastError = error;
      console.warn(`Runware attempt ${attempt} failed:`, (error as Error).message);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Runware failed');
}

// ---------------------------------------------------------------------------
// Telemetry (best-effort, never blocks or fails the request)
// ---------------------------------------------------------------------------

async function getServiceClient(): Promise<any | null> {
  try {
    const { createClient } = await import(
      '../_vendor/supabase-js@2.57.4.bundle.mjs'
    );
    return createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  } catch (error) {
    console.warn('Supabase client unavailable, skipping telemetry:', error);
    return null;
  }
}

async function logAttempt(entry: {
  sessionId: string;
  userId: string | null;
  pageNumber: number;
  success: boolean;
  imageUrl?: string;
  positivePrompt?: string;
  negativePrompt?: string;
  failureReason?: string;
  processingTimeMs: number;
  sceneSource?: string;
}): Promise<void> {
  try {
    const client = await getServiceClient();
    if (!client) return;

    await client.from('image_generation_debug').insert({
      session_id: entry.sessionId,
      user_id: entry.userId,
      page_number: entry.pageNumber,
      tier: 'single',
      status: entry.success ? 'success' : 'failed',
      edge_function: 'runware-generate-image',
      positive_prompt: entry.positivePrompt?.slice(0, 2000) ?? null,
      negative_prompt: entry.negativePrompt?.slice(0, 2000) ?? null,
      image_url: entry.imageUrl ?? null,
      success: entry.success,
      failure_reason: entry.failureReason ?? null,
      processing_time_ms: entry.processingTimeMs,
      context: { sceneSource: entry.sceneSource ?? null },
    });

    if (entry.success) {
      await client.from('cost_tracking').insert({
        session_id: entry.sessionId,
        user_id: entry.userId,
        input_tokens: 0,
        output_tokens: 0,
        cost: COST_PER_IMAGE_USD,
        model_used: RUNWARE_MODEL,
        operation_type: 'image_generation',
        provider: 'runware',
        api_endpoint: 'v1/imageInference',
        pricing_model: 'images',
        quantity_used: 1,
        unit_cost: COST_PER_IMAGE_USD,
      });
    }
  } catch (error) {
    console.warn('Telemetry write failed (non-fatal):', error);
  }
}

async function resolveUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;
    const client = await getServiceClient();
    if (!client) return null;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await client.auth.getUser(token);
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  // Health check: reports the real contract of this function. No generation,
  // no cost. Used by the /prompt-testing console.
  if (req.method === 'GET') {
    return json({
      status: 'healthy',
      contract: 'POST { pageText, sessionId, pageNumber, userInfo, previousScene? }',
      model: RUNWARE_MODEL,
      costPerImageUsd: COST_PER_IMAGE_USD,
      hasRunwareApiKey: !!Deno.env.get('RUNWARE_API_KEY'),
      hasLovableApiKey: !!Deno.env.get('LOVABLE_API_KEY'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      timestamp: new Date().toISOString(),
    });
  }

  let payload: RequestPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' });
  }

  const pageText = (payload.pageText ?? '').trim();
  const sessionId = payload.sessionId ?? 'unknown-session';
  const pageNumber = payload.pageNumber ?? 1;
  const user: ImageUserInfo = payload.userInfo ?? {};

  if (!pageText) {
    return json({ success: false, error: 'pageText is required' });
  }

  const userId = await resolveUserId(req);

  try {
    const built = await buildImagePrompt({
      pageText,
      previousScene: payload.previousScene,
      user,
      sessionId,
      lovableApiKey: Deno.env.get('LOVABLE_API_KEY'),
    });

    console.log(
      `[image] page ${pageNumber} scene(${built.sceneSource}): ${built.scene}`,
    );

    const imageURL = await callRunware(
      built.positivePrompt,
      built.negativePrompt,
      built.seed,
    );

    await logAttempt({
      sessionId,
      userId,
      pageNumber,
      success: true,
      imageUrl: imageURL,
      positivePrompt: built.positivePrompt,
      negativePrompt: built.negativePrompt,
      processingTimeMs: Date.now() - startedAt,
      sceneSource: built.sceneSource,
    });

    return json({
      success: true,
      imageURL,
      scene: built.scene,
      sceneSource: built.sceneSource,
      seed: built.seed,
      prompt: built.positivePrompt,
      provider: 'runware',
      model: RUNWARE_MODEL,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    console.error('[image] generation failed:', message);

    await logAttempt({
      sessionId,
      userId,
      pageNumber,
      success: false,
      failureReason: message,
      processingTimeMs: Date.now() - startedAt,
    });

    // 200 with success:false — the client always has the static fallback and
    // must never surface an error page to a child mid-story.
    return json({ success: false, error: message });
  }
});