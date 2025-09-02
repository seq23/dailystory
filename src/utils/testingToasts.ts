// Testing Toast Management for Concurrent Tests
// Provides step-by-step progress tracking with level identification

import { toast } from '@/hooks/use-toast';

export type TestStep = 
  | 'starting'
  | 'ai_generation'
  | 'ai_success' 
  | 'ai_failed'
  | 'template_fallback'
  | 'template_success'
  | 'template_failed'
  | 'validation'
  | 'repair_needed'
  | 'repair_success'
  | 'repair_failed'
  | 'final_result'
  | 'error';

export interface TestToastConfig {
  level: string;
  step: TestStep;
  message?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  source?: 'ai' | 'template' | 'emergency' | 'unknown';
}

// Store active toast IDs for cleanup
const activeToasts = new Map<string, string>();

/**
 * Show step-by-step toast for testing with level identification
 */
export const showTestToast = (config: TestToastConfig): string => {
  const { level, step, message, variant = 'default', source } = config;
  
  // Create unique toast ID for this level and step
  const toastId = `${level}-${step}`;
  
  // Dismiss previous toast for this level if exists
  const previousToastId = activeToasts.get(level);
  if (previousToastId) {
    // Don't dismiss if it's the same step (avoid flickering)
    if (previousToastId !== toastId) {
      try {
        // Previous toast will auto-dismiss due to timeout
      } catch (e) {
        console.debug('Failed to dismiss previous toast:', e);
      }
    }
  }

  let title = '';
  let description = '';
  let toastVariant: 'default' | 'destructive' = 'default';

  // Step-specific messaging with level identification
  switch (step) {
    case 'starting':
      title = `${level}: Starting generation...`;
      description = 'Initializing AI story generation';
      toastVariant = 'default';
      break;

    case 'ai_generation':
      title = `${level}: AI generating...`;
      description = 'Creating story content with AI';
      toastVariant = 'default';
      break;

    case 'ai_success':
      title = `${level}: AI generation ✅`;
      description = 'AI successfully generated content';
      toastVariant = 'default';
      break;

    case 'ai_failed':
      title = `${level}: AI failed, trying template...`;
      description = message || 'AI generation failed, falling back to template';
      toastVariant = 'destructive';
      break;

    case 'template_fallback':
      title = `${level}: Using template...`;
      description = 'Generating from template service';
      toastVariant = 'default';
      break;

    case 'template_success':
      title = `${level}: Template generation ✅`;
      description = 'Template successfully generated content';
      toastVariant = 'default';
      break;

    case 'template_failed':
      title = `${level}: Template failed`;
      description = message || 'Template generation failed, using emergency content';
      toastVariant = 'destructive';
      break;

    case 'validation':
      title = `${level}: Validating content...`;
      description = 'Checking content quality and compliance';
      toastVariant = 'default';
      break;

    case 'repair_needed':
      title = `${level}: REPAIR needed`;
      description = message || 'Content needs repair, sending back to AI';
      toastVariant = 'destructive';
      break;

    case 'repair_success':
      title = `${level}: REPAIR successful ✅`;
      description = 'AI successfully repaired content';
      toastVariant = 'default';
      break;

    case 'repair_failed':
      title = `${level}: REPAIR failed`;
      description = message || 'Repair attempt failed, using template fallback';
      toastVariant = 'destructive';
      break;

    case 'final_result':
      const sourceLabel = source === 'ai' ? 'AI Generated' : 
                         source === 'template' ? 'Template Fallback' : 
                         source === 'emergency' ? 'Emergency Content' : 
                         'Unknown Source';
      title = `${level}: Final result - ${sourceLabel}`;
      description = `Test completed using ${sourceLabel.toLowerCase()}`;
      toastVariant = source === 'ai' ? 'default' : 'destructive';
      break;

    case 'error':
      title = `${level}: Error ❌`;
      description = message || 'Test failed with error';
      toastVariant = 'destructive';
      break;

    default:
      title = `${level}: ${step}`;
      description = message || 'Test step in progress';
      break;
  }

  // Show the toast
  const result = toast({
    title,
    description,
    variant: toastVariant,
    // Don't auto-dismiss error toasts as quickly
    duration: step === 'error' || step === 'repair_failed' ? 8000 : 5000,
  });

  // Track this toast
  activeToasts.set(level, toastId);

  return result.id;
};

/**
 * Clear all toasts for a specific level
 */
export const clearLevelToasts = (level: string): void => {
  const toastId = activeToasts.get(level);
  if (toastId) {
    activeToasts.delete(level);
  }
};

/**
 * Clear all testing toasts
 */
export const clearAllTestingToasts = (): void => {
  activeToasts.clear();
};

/**
 * Show summary toast for test run completion
 */
export const showTestSummaryToast = (
  successCount: number, 
  totalCount: number, 
  duration: number
): void => {
  const success = successCount === totalCount;
  
  toast({
    title: success ? 'All Tests Completed ✅' : `Tests Completed: ${successCount}/${totalCount} ✅`,
    description: `Finished ${totalCount} tests in ${Math.round(duration)}ms`,
    variant: success ? 'default' : 'destructive',
    duration: 7000,
  });
};