// Diagnostic utilities to troubleshoot API failures
import { supabase } from '@/integrations/supabase/client';

export class DiagnosticTool {
  static async checkSupabaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 DIAGNOSTIC: Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('🔍 DIAGNOSTIC: Supabase connection failed:', error);
        return false;
      }
      
      console.log('🔍 DIAGNOSTIC: Supabase connection successful');
      return true;
    } catch (error) {
      console.error('🔍 DIAGNOSTIC: Supabase connection error:', error);
      return false;
    }
  }

  static async testEdgeFunction(): Promise<boolean> {
    try {
      console.log('🔍 DIAGNOSTIC: Testing edge function accessibility...');
      
      // Test if the AI Story Enhancer edge function exists and is accessible
      const { data, error } = await supabase.functions.invoke('ai-story-enhancer', {
        body: { test: true, diagnostic: 'health_check' }
      });
      
      console.log('🔍 DIAGNOSTIC: Edge function test result:', { 
        hasData: !!data, 
        hasError: !!error,
        errorDetails: error 
      });
      
      return !error || error.message !== 'Function not found';
    } catch (error) {
      console.error('🔍 DIAGNOSTIC: Edge function test error:', error);
      return false;
    }
  }

  static logEnvironmentInfo(): void {
    console.log('🔍 DIAGNOSTIC: Environment Information', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      supabaseUrl: 'https://cpzeuogomaixamrtnnmj.supabase.co',
      hasSupabaseClient: !!supabase,
      supabaseClientMethods: Object.keys(supabase || {}),
    });
  }

  static async runFullDiagnostic(): Promise<void> {
    console.log('🔍 DIAGNOSTIC: Starting full diagnostic check...');
    
    this.logEnvironmentInfo();
    
    const supabaseOk = await this.checkSupabaseConnection();
    const edgeFunctionOk = await this.testEdgeFunction();
    
    console.log('🔍 DIAGNOSTIC: Full diagnostic results', {
      supabaseConnection: supabaseOk,
      edgeFunctionAccess: edgeFunctionOk,
      overallStatus: supabaseOk && edgeFunctionOk ? 'HEALTHY' : 'ISSUES_DETECTED'
    });
  }
}