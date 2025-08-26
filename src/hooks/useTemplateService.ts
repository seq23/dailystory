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

      if (functionError) {
        throw new Error(functionError.message);
      }

      console.log('Template service response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Template generation failed');
      }

      setResult(data);
      return data;
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