/**
 * Shared fire-and-forget cost logger for all edge functions.
 * Usage:
 *   import { logCost } from '../_shared/costLogger.ts';
 *   logCost(supabaseClient, { ... });
 *
 * Never throws. Never blocks. Logs errors to console only.
 */

export interface CostEntry {
  sessionId: string;
  provider: 'openai' | 'runware' | 'elevenlabs' | 'resend';
  operationType: string;
  modelUsed: string;
  cost: number;
  inputTokens?: number;
  outputTokens?: number;
  apiEndpoint?: string;
  pricingModel?: string;
  quantityUsed?: number;
  unitCost?: number;
  userId?: string | null;
}

export function logCost(supabase: any, entry: CostEntry): void {
  if (!supabase) return;
  supabase.from('cost_tracking').insert({
    session_id: entry.sessionId,
    user_id: entry.userId ?? null,
    provider: entry.provider,
    operation_type: entry.operationType,
    model_used: entry.modelUsed,
    cost: entry.cost,
    input_tokens: entry.inputTokens ?? 0,
    output_tokens: entry.outputTokens ?? 0,
    api_endpoint: entry.apiEndpoint ?? null,
    pricing_model: entry.pricingModel ?? 'tokens',
    quantity_used: entry.quantityUsed ?? 0,
    unit_cost: entry.unitCost ?? 0,
  }).then(() => {}).catch((e: any) => console.warn('💰 Cost log failed:', e?.message));
}

/**
 * Estimate OpenAI chat cost based on model and tokens.
 * Returns cost in USD.
 */
export function estimateOpenAIChatCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.003, output: 0.006 },
    'gpt-4': { input: 0.03, output: 0.06 },
  };
  const p = pricing[model] || pricing['gpt-4o-mini'];
  return (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
}
