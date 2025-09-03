import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandlingManager, type ErrorContext } from '@/services/errorHandlingManager';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // Show toast when max retries reached
  useEffect(() => {
    if (isMaxRetriesReached) {
      toast({
        title: "Story System Resting",
        description: "Our story system is taking a rest! Please try again in a few minutes, or let us know if you need help!",
        duration: 5000,
      });
    }
  }, [isMaxRetriesReached, toast]);

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
          
          // EMERGENCY DIAGNOSTIC: Log response structure
          console.log('🔍 DIAGNOSTIC: Response keys:', Object.keys(data || {}));
          console.log('🔍 DIAGNOSTIC: Pages property:', data?.pages);
          console.log('🔍 DIAGNOSTIC: Pages length:', data?.pages?.length);
          console.log('🔍 DIAGNOSTIC: Response type:', typeof data);

          // Check for successful response based on actual template service format
          if (!data.pages || data.pages.length === 0) {
            console.error('🚨 EMERGENCY: No pages in response!', { 
              hasData: !!data, 
              hasPages: !!data?.pages, 
              pagesLength: data?.pages?.length,
              fullResponse: data 
            });
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
        // Phase 2: Apply centralized grammar processing via process-story-content
        let finalResult = response.data;
        
        try {
          console.log('🔄 Applying centralized grammar processing...');
          
          const { data: processResult, error: processError } = await supabase.functions.invoke('process-story-content', {
            body: {
              pages: response.data.pages || [],
              userInfo: userInfo as UserInfo,
              sessionId: 'template-generation-' + Date.now()
            }
          });

          if (processError) {
            console.warn('⚠️ Grammar processing failed, using raw pages:', processError);
          } else if (processResult?.success && processResult?.processedPages) {
            finalResult = {
              ...response.data,
              pages: processResult.processedPages,
              metadata: {
                ...response.data.metadata,
                grammarProcessingMetadata: processResult.processingMetadata
              }
            };
            console.log('✅ Grammar processing successful:', processResult.processingMetadata);
          }
        } catch (processError) {
          console.warn('⚠️ Grammar processing failed, using raw pages:', processError);
        }

        setResult(finalResult);
        setRetryCount(0);
        setIsMaxRetriesReached(false);
        return finalResult;
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