import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserInfo } from '@/types';

interface TemplateResult {
  success: boolean;
  level?: string;
  templateCount?: number;
  pages?: string[];
  metadata?: {
    sourceSystem: string;
    templateLevel: string;
    selectedTemplate?: number;
    processingTime?: number;
    placeholdersResolved?: number;
    grammarFixesApplied?: number;
  };
  error?: string;
}

export function useTemplateService() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TemplateResult | null>(null);
  const [error, setError] = useState<string>('');

  const generateStory = async (userInfo: Partial<UserInfo>): Promise<TemplateResult> => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Calling template-service with userInfo:', userInfo);
      
      const { data, error: functionError } = await supabase.functions.invoke('template-service', {
        body: { userInfo }
      });

      console.log('Template service response:', data, 'error:', functionError);

      // Handle expected "no templates available" responses gracefully
      if (functionError && functionError.message.includes('Edge Function returned a non-2xx status code')) {
        // This might be a 404 with template unavailability info
        if (data && data.error && data.level) {
          const result = {
            success: false,
            level: data.level,
            pages: [],
            error: data.error,
            metadata: {
              sourceSystem: 'template-service',
              templateLevel: data.level,
              processingTime: 0
            }
          };
          setResult(result);
          return result;
        }
      }

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Check for successful response based on actual template service format
      if (!data.pages && !data.story) {
        throw new Error(data.error || 'Template generation failed - no content generated');
      }

      // Add success property for consistency with interface
      const formattedData = { 
        ...data, 
        success: true,
        pages: data.story || data.pages || [] // Handle both story and pages formats
      };

      setResult(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Template service error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateStory,
    isLoading,
    result,
    error,
  };
}