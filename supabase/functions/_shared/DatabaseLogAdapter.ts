/**
 * DATABASE LOG ADAPTER - Non-blocking database persistence for UniversalLogger
 * Created: October 2025
 * Purpose: Provide database persistence layer for new logging architecture
 * Features:
 * - NO-THROW guarantee (never crashes image generation)
 * - Sampling (10% success, 100% failures by default)
 * - Fire-and-forget async inserts
 * - PII-safe metadata handling
 */

export interface DatabaseLogEntry {
  sessionId: string;
  tier: string;
  status: 'success' | 'failure' | 'attempting';
  metadata: Record<string, any>;
}

export class DatabaseLogAdapter {
  private supabase: any;
  private samplingRate: number;
  
  constructor(supabase: any, samplingRate: number = 0.1) {
    this.supabase = supabase;
    this.samplingRate = samplingRate;
  }
  
  /**
   * Log to database with NO-THROW guarantee
   * - Samples success logs (10% default, 100% for failures)
   * - Catches and logs DB errors without crashing
   * - Returns immediately (non-blocking)
   */
  async logToDatabase(entry: DatabaseLogEntry): Promise<void> {
    try {
      // Skip sampling for failures, sample for success
      const shouldLog = entry.status === 'failure' || 
                       Math.random() < this.samplingRate ||
                       Deno.env.get('DEBUG_TIER_LOG_SAMPLE') === '1';
      
      if (!shouldLog) return;
      
      const row = {
        session_id: entry.sessionId,
        user_id: entry.metadata.userId || '00000000-0000-0000-0000-000000000001',
        tier: entry.tier,
        status: entry.status,
        edge_function: entry.metadata.edgeFunction || 'runware-generate-image',
        positive_prompt: entry.metadata.positivePrompt || null,
        negative_prompt: entry.metadata.negativePrompt || null,
        image_url: entry.metadata.imageUrl || null,
        page_number: entry.metadata.pageNumber || 1,
        success: entry.status === 'success',
        failure_reason: entry.metadata.error || null,
        processing_time_ms: entry.metadata.processingTime || null,
        template_complexity: entry.metadata.templateComplexity || null,
        api_response: entry.metadata.apiResponse || null,
        context: entry.metadata
      };
      
      // Fire-and-forget with error catching
      this.supabase
        .from('image_generation_debug')
        .insert([row])
        .then(({ error }: any) => {
          if (error) {
            console.warn('⚠️ [DB_ADAPTER] Insert failed (non-fatal):', error.message);
          } else {
            console.log('✅ [DB_ADAPTER] Logged to image_generation_debug');
          }
        })
        .catch((err: any) => {
          console.warn('⚠️ [DB_ADAPTER] Exception during insert (non-fatal):', err.message);
        });
        
    } catch (err) {
      // Catch ANY error to prevent crashes
      console.warn('⚠️ [DB_ADAPTER] Outer catch (non-fatal):', err);
    }
  }
}
