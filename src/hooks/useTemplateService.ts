import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandlingManager, type ErrorContext } from '@/services/errorHandlingManager';
import type { UserInfo } from '@/types';

interface TemplateResult {
  success: boolean;
  level?: string;
  templateCount?: number;
  pages?: string[];
  expectedPages?: number;
  metadata?: {
    sourceSystem: string;
    templateLevel: string;
    selectedTemplate?: number;
    processingTime?: number;
    placeholdersResolved?: number;
    grammarFixesApplied?: number;
    mode?: string;
    targetWordDensity?: string;
  };
  error?: string;
}

export function useTemplateService() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TemplateResult | null>(null);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isMaxRetriesReached, setIsMaxRetriesReached] = useState(false);

  const generateStory = async (userInfo: Partial<UserInfo>, mode: string = 'testing'): Promise<TemplateResult> => {
    setIsLoading(true);
    setError('');
    setResult(null);

    const context: ErrorContext = {
      component: 'TemplateService',
      action: 'generateStory',
      userInfo: userInfo as UserInfo,
      deviceInfo: {
        isMobile: /Mobile|Android|iOS/.test(navigator.userAgent),
        sessionStorageSupported: typeof Storage !== 'undefined'
      }
    };

    try {
      const response = await ErrorHandlingManager.executeWithRecovery(
        async () => {
          console.log('Calling template-service with userInfo:', userInfo);
          
          const { data, error: functionError } = await supabase.functions.invoke('template-service', {
            body: { userInfo, mode }
          });

          if (functionError) {
            throw new Error(functionError.message);
          }

          console.log('Template service response:', data);

          // Check for successful response based on actual template service format
          if (!data.pages || data.pages.length === 0) {
            throw new Error(data.error || 'Template generation failed - no pages generated');
          }

          return { ...data, success: true };
        },
        context,
        async () => {
          // Fallback: emergency content
          const emergencyContent = await ErrorHandlingManager.getEmergencyContent(userInfo as UserInfo);
          return {
            success: false,
            pages: emergencyContent,
            level: userInfo.difficultyLevel || 'easy',
            pageCount: emergencyContent.length,
            expectedPages: emergencyContent.length,
            metadata: {
              sourceSystem: 'Emergency Fallback',
              templateLevel: 'fallback',
              mode: mode,
              targetWordDensity: 'Emergency'
            }
          };
        }
      );

      if (response.success && response.data) {
        setResult(response.data);
        setRetryCount(0);
        setIsMaxRetriesReached(false);
        return response.data;
      } else if (response.fallback) {
        // Using fallback content
        setResult(response.fallback);
        setError(response.error || 'Used emergency content due to service issues');
        setIsMaxRetriesReached(true);
        return response.fallback;
      } else {
        throw new Error(response.error || 'Template generation failed');
      }
    } catch (err) {
      console.error('Template service error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);
      
      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (newRetryCount >= 3) {
        setIsMaxRetriesReached(true);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetRetryState = () => {
    setRetryCount(0);
    setIsMaxRetriesReached(false);
    setError('');
  };

  return {
    generateStory,
    isLoading,
    result,
    error,
    retryCount,
    isMaxRetriesReached,
    resetRetryState,
  };
}