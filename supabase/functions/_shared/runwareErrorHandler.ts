export interface RunwareError {
  code?: string;
  message: string;
  type: 'quota_exceeded' | 'validation_failure' | 'timeout_error' | 'connection_error' | 'api_error' | 'unknown_runware_error';
  escalation: 'TIER_4' | 'NEXT_TIER' | 'RETRY_THEN_TIER_4' | 'RETRY_THEN_NEXT_TIER';
  retry: boolean;
}

export class RunwareErrorHandler {
  static categorizeRunwareError(error: any): RunwareError {
    const message = error.message || error.toString();
    
    // Runware-specific error codes and recovery paths
    if (error.code === 'RUNWARE_QUOTA_EXCEEDED' || message.includes('quota')) {
      return { type: 'quota_exceeded', escalation: 'TIER_4', retry: false, message, code: error.code };
    }
    if (error.code === 'RUNWARE_INVALID_PROMPT' || message.includes('invalid prompt')) {
      return { type: 'validation_failure', escalation: 'NEXT_TIER', retry: false, message, code: error.code };
    }
    if (error.code === 'RUNWARE_TIMEOUT' || message.includes('timeout')) {
      return { type: 'timeout_error', escalation: 'RETRY_THEN_TIER_4', retry: true, message, code: error.code };
    }
    if (message.includes('WebSocket') || message.includes('connection')) {
      return { type: 'connection_error', escalation: 'RETRY_THEN_NEXT_TIER', retry: true, message, code: error.code };
    }
    if (message.includes('api.runware') || message.includes('Runware')) {
      return { type: 'api_error', escalation: 'TIER_4', retry: true, message, code: error.code };
    }
    
    return { type: 'unknown_runware_error', escalation: 'NEXT_TIER', retry: false, message, code: error.code };
  }
}