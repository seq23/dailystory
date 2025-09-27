import { useState, useRef } from 'react';
// FIX: 2025-09-20 - React object rendering error fixed by proper aiSchema property access
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { HealthCheckService } from '@/services/HealthCheckService';
import { ImageFallbackService } from '@/services/ImageFallbackService';
import { Sparkles, Zap, Network, Search, Camera, RefreshCw, RotateCcw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  tier: string;
  success: boolean;
  imageURL?: string;
  details: {
    processingTime?: number;
    requestId?: string;
    error?: string;
    probableCause?: string; // NEW: Specific probable cause instead of generic error
    errorCategory?: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'CONFIG' | 'INTERNAL' | 'UNKNOWN' | 'SUCCESS' | 'VALIDATION'; // NEW: Error categorization with validation
    healthCheck?: {
      endpoint: string;
      available: boolean;
      responseTime?: number;
      status?: number;
      triageResult?: string;
    }; // NEW: Health check results
    testType?: 'REAL' | 'FORCED' | 'CONNECTIVITY' | 'ENHANCED_CONNECTIVITY' | 'HEALTH' | 'TRIAGE' | 'TIER_1_COMPLETE_FLOW' | 'FORCED_TEMPLATE_BYPASS' | 'E2E_SIMULATION'; // Enhanced test types
    timeoutTest?: boolean;
    abortReason?: string;
    // AI Scene Creator specific
    sceneGenerationOnly?: boolean;
    primaryScene?: string;
    aiSchema?: any;
    setting?: string;
    action?: string;
    mood?: string;
    pose?: string;
    // Routing specific
    realRoutingFlow?: boolean;
    fallbackReason?: string;
    routingCascade?: string[];
    avatarAnalysis?: {
      completeness: number;
      presentFields: string[];
      missingFields: string[];
      isComplete: boolean;
    };
    // Force Tier specific
    fullPromptFlow?: boolean;
    forcedTier?: string;
    routingMetadata?: any;
    tier?: string;
    enhancementLevel?: string;
    provider?: string;
    templateComplexity?: string;
    // Prompt and template specific
    positivePrompt?: string;
    negativePrompt?: string;
    fullNegativePrompt?: string; // NEW: Complete negative prompt display
    styleFramework?: string;
    originalPrompt?: string;    // NEW: Original prompt from Tier 1
    basePrompt?: string;        // NEW: Base prompt from Tier 1
    enhancedPrompt?: string;    // NEW: Enhanced prompt from Tier 1
    fullEnhancedPrompt?: string; // NEW: Complete enhanced prompt structure
    templateStructure?: string; // NEW: Template structure indicator
    noTextIndicator?: boolean;  // NEW: Show if NO TEXT is in negative prompt
    promptLengths?: {           // NEW: Prompt length statistics
      original?: number;
      enhanced?: number;
      negative?: number;
      positive?: number;
      full?: number;
    };
    // Connectivity specific
    successfulConnections?: number;
    totalEndpoints?: number;
    endpointResults?: Array<{
      endpoint: string;
      success: boolean;
      status?: number;
      statusText?: string;
      error?: string;
      responseTime?: number;
      humanReadableReason?: string;
      timeoutTest?: boolean;
      abortReason?: string;
      probableCause?: string; // NEW: Specific cause per endpoint
      errorCategory?: string; // NEW: Category per endpoint
    }>;
    // Enhanced test result fields for step-by-step validation
    stepByStepValidation?: Array<{
      name: string;
      status: 'pending' | 'running' | 'success' | 'error';
    }>;
    schemaCompleteness?: {
      setting: boolean;
      action: boolean;
      mood: boolean;
      pose: boolean;
      completeness: number;
    };
    bypassedTiers?: string[];
    selectedFunction?: string;
    primarySceneLength?: number;
    // Debug Real Routing specific
    resultType?: string; // NEW: Result type for E2E simulation
    resultBadge?: string; // NEW: Badge type for display
    fallbackPath?: string; // NEW: Path taken for fallback
    cascadeHistory?: string[]; // NEW: History of cascade attempts
    orchestratorFailureTime?: number; // NEW: Time when orchestrator failed
    directModeTime?: number; // NEW: Time for Direct Mode attempt
    tier4Time?: number; // NEW: Time for Tier 4 attempt
    cascadeFailureHistory?: string | string[]; // NEW: History of failed tiers
    escalationPath?: string;
    tierFailureHistory?: string[]; // NEW: Tier failure history from orchestrator
    promptLength?: number;
    architecture?: string; // NEW: Architecture type (PURE_TYPESCRIPT | RECEPTIONIST_PATTERN)
    payloadStructure?: string; // NEW: Payload structure summary
    expectedArchitecture?: string; // NEW: Expected architecture type
    orchestratorGuidance?: string; // NEW: Orchestrator guidance like TRY_DIRECT_MODE
    errorType?: 'BOOT_FAILURE' | 'RUNTIME_ERROR' | 'NETWORK_ISSUE' | 'DEPLOYMENT_ISSUE'; // NEW: Error type classification
    usedTier?: string; // Tier that was actually used
    nextAction?: string; // Orchestrator guidance for next action
    recommendedAction?: string; // Orchestrator recommended action
    directMode?: boolean; // Direct Mode flag
    // Force Tier 1 Nuclear Fallback specific
    chosenPath?: string; // 'Orchestrator Mode' or 'Direct Mode'
    orchestratorHealth?: 'healthy' | 'unhealthy'; // Health status of orchestrator
    triageResult?: any; // Full triage check result
    tierPathResult?: string; // Tier path result message
    debug?: any; // Debug information from AI functions
    // Direct Mode specific properties
    characterConsistency?: any; // Character consistency data from Direct Mode
    visualConsistency?: any; // Visual consistency data from Direct Mode  
    culturalEnhancements?: any; // Cultural enhancements data from Direct Mode
    templateData?: any; // Template data from runware-template-cd
  };
}

export const ImageTierTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTestProgress, setCurrentTestProgress] = useState<string>('');
  const [testStoryText, setTestStoryText] = useState(
    "Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies."
  );
  
  // Timeout testing configuration
  const [timeoutDuration, setTimeoutDuration] = useState(30000); // 30 seconds default
  const abortControllerRef = useRef<AbortController | null>(null);
  const abortControllersRef = useRef<AbortController[]>([]); // Track multiple controllers

  // User Info Section - Editable fields
  const [userName, setUserName] = useState('Emma');
  const [userAge, setUserAge] = useState('8');
  const [avatarType, setAvatarType] = useState('girl');
  const [skinTone, setSkinTone] = useState('light');
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');

  // Build dynamic user info from form inputs - MATCH SimpleImageService
  const buildUserInfo = () => {
    try {
      // Use REAL system defaults from useMultiStepForm.tsx (not hardcoded values)
      return {
        name: userName || 'child', // Real system default 
        age: parseInt(userAge) || 8, // Real system default
        userName: userName || 'child', // Real system default
        ethnicity: avatarType || 'prefer-not-to-answer', // Real system default
        skinTone: skinTone || 'medium', // Real system default
        avatar: {
          type: avatarType || 'prefer-not-to-answer', // Real system default
          skinTone: skinTone || 'medium' // Real system default
        },
        nativeLanguage: nativeLanguage || 'en', // Real system default
        difficulty: difficultyLevel || 'pre-reader', // Real system default (not 'medium')
        grade: 'PreK', // Real system default
        culturalProfile: (nativeLanguage && nativeLanguage !== 'en') ? nativeLanguage : undefined
      };
    } catch (error) {
      console.error('Error in buildUserInfo:', error);
      // Return safe fallback with all system defaults
      return {
        name: 'child',
        age: 8,
        userName: 'child',
        ethnicity: 'prefer-not-to-answer',
        skinTone: 'medium',
        avatar: {
          type: 'prefer-not-to-answer',
          skinTone: 'medium'
        },
        nativeLanguage: 'en',
        difficulty: 'pre-reader',
        grade: 'PreK',
        culturalProfile: undefined
      };
    }
  };

  // SVG Fallback Generation - Final tier when all else fails
  const generateSVGFallback = async (userInfo: any, prompt: string) => {
    try {
      // Create a simple SVG based on user preferences
      const colors = {
        blue: '#3B82F6',
        red: '#EF4444', 
        green: '#10B981',
        purple: '#8B5CF6',
        pink: '#EC4899'
      };
      
      const selectedColor = colors[userInfo.favoriteColor] || colors.blue;
      const characterType = userInfo.avatar?.type || 'prefer-not-to-answer';
      
      // Generate descriptive SVG scene
      const svgContent = `
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <!-- Background -->
          <rect width="512" height="512" fill="#E0F2FE"/>
          
          <!-- Ground -->
          <ellipse cx="256" cy="450" rx="200" ry="30" fill="#10B981" opacity="0.7"/>
          
          <!-- Character representation -->
          <circle cx="256" cy="350" r="40" fill="${selectedColor}" stroke="#374151" stroke-width="3"/>
          
          <!-- Simple story elements -->
          <rect x="100" y="320" width="80" height="60" rx="10" fill="#F59E0B" stroke="#374151" stroke-width="2"/>
          <polygon points="100,320 140,280 180,320" fill="#EF4444"/>
          
          <!-- Text overlay -->
          <text x="256" y="100" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
                text-anchor="middle" fill="#374151">Story Adventure</text>
          <text x="256" y="130" font-family="Arial, sans-serif" font-size="16" 
                text-anchor="middle" fill="#6B7280">${userInfo.name || 'Guest'}'s Journey</text>
        </svg>
      `;
      
      // Convert SVG to data URL
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      return {
        success: true,
        imageURL: svgUrl,
        prompt: `SVG fallback: ${prompt.substring(0, 50)}...`,
        tier: 'tier-4-svg'
      };
    } catch (error) {
      return {
        success: false,
        imageURL: null,
        error: `SVG generation failed: ${error.message}`,
        tier: 'tier-4-svg-failed'
      };
    }
  };

  // Map difficulty level - MATCH SimpleImageService exactly
  const mapDifficultyLevel = (userInfo: any): string => {
    if (!userInfo?.age) return 'medium';
    
    const age = userInfo.age;
    if (age <= 5) return 'beginner';
    if (age <= 8) return 'easy';
    if (age <= 12) return 'medium';
    if (age <= 16) return 'hard';
    return 'expert';
  };


  // Advanced Error categorization with Boot vs Runtime Detection
  const categorizeError = (error: any, context?: string, response?: any): { 
    category: string; 
    probableCause: string; 
    errorType: 'BOOT_FAILURE' | 'RUNTIME_ERROR' | 'NETWORK_ISSUE' | 'DEPLOYMENT_ISSUE';
    syncStatus?: string;
    recoveryAction?: string;
  } => {
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    const statusCode = error?.status || response?.status;
    const responseHeaders = response?.headers;
    
    // BOOT FAILURE Detection (503 + specific patterns)
    if (statusCode === 503) {
      // Sync anomaly detection
      if (errorMsg.includes('SYNC_DEPLOYMENT_RACE') || 
          errorMsg.includes('Module not found') ||
          errorMsg.includes('SYNC_IMPORT_FAILURE') ||
          errorMsg.includes('SYNC_EXPORT_MISSING') ||
          responseHeaders?.get?.('X-Sync-Status') === 'ANOMALY_DETECTED') {
        return {
          category: 'BOOT_SYNC_ANOMALY',
          probableCause: 'TypeScript/JavaScript file sync issue during deployment',
          errorType: 'BOOT_FAILURE',
          syncStatus: responseHeaders?.get?.('X-Sync-Status') || 'DETECTED',
          recoveryAction: 'Auto-recovery active. Use Force Redeploy if persistent.'
        };
      }
      
      // Generic boot failure
      if (errorMsg.includes('Service temporarily unavailable') ||
          errorMsg.includes('JavaScript implementation could not be loaded')) {
        return {
          category: 'BOOT_FAILURE',
          probableCause: 'Edge function failed to boot properly',
          errorType: 'BOOT_FAILURE',
          recoveryAction: 'Check deployment logs and retry'
        };
      }
    }
    
    // DEPLOYMENT ISSUE Detection
    if (statusCode === 404 || errorMsg.includes('not found')) {
      return {
        category: 'DEPLOYMENT',
        probableCause: 'Edge function not deployed or incorrect endpoint',
        errorType: 'DEPLOYMENT_ISSUE',
        recoveryAction: 'Verify function deployment and URL'
      };
    }
    
    // NETWORK ISSUE Detection
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || 
        errorMsg.includes('connection') || (error as any)?.name === 'AbortError' ||
        errorMsg.includes('timeout') || errorMsg.includes('abort')) {
      return {
        category: 'NETWORK',
        probableCause: statusCode === 0 ? 'Network connectivity lost' : 'Network timeout or connection issue',
        errorType: 'NETWORK_ISSUE',
        recoveryAction: 'Check network connection and retry'
      };
    }
    
    // RUNTIME ERROR Detection (500 + execution errors)
    if (statusCode === 500 || statusCode >= 500) {
      return {
        category: 'RUNTIME_EXECUTION',
        probableCause: 'Error during function execution (not boot)',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check function logs for runtime exception'
      };
    }
    
    // API Key and authentication specific errors
    if (errorMsg.includes('RUNWARE_API_KEY') || errorMsg.includes('apiKey is not defined') || errorMsg.includes('Missing API key')) {
      return {
        category: 'AUTH',
        probableCause: 'RUNWARE_API_KEY not configured in Supabase Edge Function Secrets',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Configure API key in Supabase dashboard'
      };
    }
    
    // Runware-specific WebSocket errors
    if (errorMsg.includes('WebSocket') || errorMsg.includes('wss://ws-api.runware.ai')) {
      if (errorMsg.includes('timeout') || errorMsg.includes('Image generation timeout')) {
        return {
          category: 'RUNWARE_TIMEOUT',
          probableCause: 'Runware image generation exceeded timeout limit',
          errorType: 'RUNTIME_ERROR',
          recoveryAction: 'Retry with shorter prompt or check Runware service status'
        };
      }
      if (errorMsg.includes('closed') || errorMsg.includes('connection')) {
        return {
          category: 'RUNWARE_CONNECTION',
          probableCause: 'Runware WebSocket connection failed or dropped',
          errorType: 'NETWORK_ISSUE',
          recoveryAction: 'Check network connectivity and Runware API status'
        };
      }
      if (errorMsg.includes('authentication') || errorMsg.includes('Invalid API key')) {
        return {
          category: 'RUNWARE_AUTH',
          probableCause: 'Invalid or expired Runware API key',
          errorType: 'RUNTIME_ERROR',
          recoveryAction: 'Verify Runware API key in Supabase secrets'
        };
      }
    }
    
    // Runware image generation specific errors
    if (errorMsg.includes('NSFWContent') || errorMsg.includes('content filter')) {
      return {
        category: 'RUNWARE_CONTENT_FILTER',
        probableCause: 'Image prompt triggered Runware content filter',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Modify prompt to avoid restricted content'
      };
    }
    
    // Runware model or parameter errors
    if (errorMsg.includes('runware:100@1') || errorMsg.includes('model') || errorMsg.includes('CFGScale') || errorMsg.includes('scheduler')) {
      return {
        category: 'RUNWARE_PARAMS',
        probableCause: 'Invalid Runware model parameters or configuration',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check model name and parameter values'
      };
    }
    
    // Validation / request-shape errors (400 level)
    if (errorMsg.includes('Missing required parameters: pageText') || errorMsg.includes('Missing required parameters: pageText/storyText')) {
      return {
        category: 'VALIDATION',
        probableCause: 'Template requires pageText or storyText; ensure the payload includes one of them',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Fix request payload structure'
      };
    }
    
    // Template AB specific bundle/config errors
    if (errorMsg.includes('Missing bundle or config parameters')) {
      return {
        category: 'VALIDATION',
        probableCause: 'Template AB expects {bundle, config} payload shape, not flat fields',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Use correct payload format for Template AB'
      };
    }
    
    // Edge function returned non-2xx but health GET is OK
    if (errorMsg.includes('non-2xx status code')) {
      // Special-case Tier 1 forced flow where skipTier25=true
      if (context?.includes('runware-generate-image:forced-tier1')) {
        return {
          category: 'VALIDATION',
          probableCause: 'Tier 1 image generation failed while skipTier25=true (no escalation allowed). Not a pageText issue',
          errorType: 'RUNTIME_ERROR',
          recoveryAction: 'Allow tier escalation or fix Tier 1 generation'
        };
      }
      return {
        category: 'INTERNAL',
        probableCause: 'Edge Function returned non-2xx. Check function logs for precise error',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check detailed function logs'
      };
    }
    
    // Escalation signals from placeholder validation
    if (errorMsg.includes('ESCALATE_TO_25')) {
      return {
        category: 'INTERNAL',
        probableCause: 'Placeholder validation triggered escalation (not a request validation error)',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Allow escalation to proceed'
      };
    }
    
    // Authentication errors
    if (statusCode === 401 || errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('auth')) {
      return {
        category: 'AUTH',
        probableCause: 'Authentication failed - check API keys or user permissions',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Verify authentication credentials'
      };
    }
    
    // Configuration errors
    if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('config')) {
      return {
        category: 'CONFIG',
        probableCause: 'Service endpoint not found or misconfigured',
        errorType: 'DEPLOYMENT_ISSUE',
        recoveryAction: 'Verify endpoint configuration and deployment'
      };
    }
    
    // AI Visual Scene Creator specific failures
    if (errorMsg.includes('ReferenceError') || errorMsg.includes('characterConsistencyResult is not defined')) {
      return {
        category: 'INTERNAL',
        probableCause: 'AI Scene Creator failure - characterConsistencyResult undefined error (root cause of image generation failures)',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check AI Scene Creator function logs'
      };
    }
    
    // AI Scene Creator timeout (typically 20+ seconds)
    if (errorMsg.includes('ai-visual-scene-creator') && (errorMsg.includes('timeout') || errorMsg.includes('23') || errorMsg.includes('24'))) {
      return {
        category: 'TIMEOUT',
        probableCause: 'AI Scene Creator timeout (>20s) - this prevents all image generation tiers from functioning',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Optimize scene creation or increase timeout'
      };
    }
    
    // Failed to send request to Edge Function (common scene creator issue)
    if (errorMsg.includes('Failed to send a request to the Edge Function')) {
      return {
        category: 'INTERNAL',
        probableCause: 'AI Scene Creator unreachable - cannot generate scene descriptions needed for image generation',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check Scene Creator deployment and health'
      };
    }
    
    // Internal server errors
    if (errorMsg.includes('500') || errorMsg.includes('internal') || errorMsg.includes('server')) {
      return {
        category: 'INTERNAL',
        probableCause: 'Internal server error - service may be overloaded or down',
        errorType: 'RUNTIME_ERROR',
        recoveryAction: 'Check server status and logs'
      };
    }
    
    return {
      category: 'UNKNOWN',
      probableCause: errorMsg || 'Unknown error occurred',
      errorType: 'RUNTIME_ERROR',
      recoveryAction: 'Check logs and retry'
    };
  };

  // Lightweight triage function - GET health check before POST attempts
  const performTriageCheck = async (endpoint: string): Promise<{
    endpoint: string;
    available: boolean;
    responseTime?: number;
    status?: number;
    triageResult: string;
  }> => {
    const startTime = Date.now();
    
    try {
      // Simple GET request to check endpoint availability using environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cpzeuogomaixamrtnnmj.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        available: response.ok,
        responseTime,
        status: response.status,
        triageResult: response.ok ? 
          `✅ Endpoint responsive (${responseTime}ms)` : 
          `⚠️ Endpoint returned ${response.status} ${response.statusText}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint,
        available: false,
        responseTime,
        triageResult: `❌ Endpoint unreachable: ${error.message}`
      };
    }
  };

  // Reset function to clear results and set defaults - FIXED: Abort multiple controllers
  const resetTester = () => {
    setResults([]);
    setIsLoading(false);
    setCurrentTestProgress('');
    
    // Abort single controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Abort all parallel controllers (for connectivity tests)
    abortControllersRef.current.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        DebugLogger.warn('image', 'Error aborting controller', error);
      }
    });
    abortControllersRef.current = [];
    
    setTestStoryText("Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies.");
    setUserName('Emma');
    setUserAge('8');
    setAvatarType('girl');
    setSkinTone('light');
    setNativeLanguage('en');
    setDifficultyLevel('medium');
    
    DebugLogger.log('image', 'Tester reset - all operations aborted and state cleared');
  };

  // Enhanced test function with timeout and AbortController support
  const testWithTimeout = async (testName: string, testFunction: () => Promise<void>) => {
    setIsLoading(true);
    setResults([]);
    
    // Create AbortController for timeout handling
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, timeoutDuration);
    
    try {
      await testFunction();
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setResults([{
          tier: `${testName}-timeout`,
          success: false,
          imageURL: null,
          details: {
            error: `Test timed out after ${timeoutDuration}ms`,
            testType: 'REAL',
            timeoutTest: true,
            abortReason: 'Timeout exceeded'
          }
        }]);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Batch timeout testing for all tiers with progress tracking
  const batchTimeoutTest = async () => {
    setIsLoading(true);
    setResults([]);
    setCurrentTestProgress('');
    
    const timeoutVariations = [5000, 10000]; // Reduced to 5s, 10s for faster testing
    const endpoints = ['ai-visual-scene-creator', 'runware-generate-image'];
    
    const allResults: TestResult[] = [];
    const totalTests = timeoutVariations.length * endpoints.length;
    let completedTests = 0;
    
    // Create abort controller for batch operation
    const batchController = new AbortController();
    abortControllerRef.current = batchController;
    
    try {
      for (const timeout of timeoutVariations) {
        for (const endpoint of endpoints) {
          if (batchController.signal.aborted) {
            break;
          }
          
          completedTests++;
          setCurrentTestProgress(`Testing ${endpoint} with ${timeout}ms timeout (${completedTests}/${totalTests})`);
          
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const startTime = Date.now();
            const response = await supabase.functions.invoke(endpoint, {
              body: {
                storyText: testStoryText.substring(0, 100),
                pageText: testStoryText.substring(0, 100),
                userInfo: buildUserInfo(),
                pageNumber: 1,
                sessionId: crypto.randomUUID()
              }
            });
            
            clearTimeout(timeoutId);
            const processingTime = Date.now() - startTime;
            
            const result = {
              tier: `${endpoint}-${timeout}ms`,
              success: !response.error && response.data?.success,
              imageURL: response.data?.imageURL,
              details: {
                processingTime,
                testType: 'REAL' as const,
                timeoutTest: true,
                requestId: response.data?.requestId,
                error: response.error?.message || response.data?.error
              }
            };
            
            allResults.push(result);
            setResults([...allResults]); // Show results as they come in
            
          } catch (error) {
            const result = {
              tier: `${endpoint}-${timeout}ms-error`,
              success: false,
              imageURL: undefined,
              details: {
                error: error.name === 'AbortError' ? `Timeout at ${timeout}ms` : (error as Error).message,
                testType: 'REAL' as const,
                timeoutTest: true,
                abortReason: error.name === 'AbortError' ? 'Timeout' : 'Error'
              }
            };
            
            allResults.push(result);
            setResults([...allResults]); // Show results as they come in
          }
        }
      }
    } catch (error) {
      console.error('Batch test error:', error);
    } finally {
      setCurrentTestProgress('');
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // NEW: Individual Tier Testing with Health Checks
  const testIndividualTiers = async () => {
    setIsLoading(true);
    setResults([]);
    
    const tiers = [
      { name: 'AI Scene Creator', endpoint: 'ai-visual-scene-creator', tier: 'tier-0' },
      { name: 'Runware Image Generation', endpoint: 'runware-generate-image', tier: 'tier-1' },
      { name: 'Runware Template AB', endpoint: 'runware-template-ab', tier: 'tier-2' },
      { name: 'Runware Template CD', endpoint: 'runware-template-cd', tier: 'tier-3' }
    ];
    
    const tierResults: TestResult[] = [];
    
    for (const tierConfig of tiers) {
      try {
        // Step 1: Perform lightweight triage check first
        const triageCheck = await performTriageCheck(tierConfig.endpoint);
        
        // Step 2: Only proceed with POST if triage passes
        if (triageCheck.available) {
          const startTime = Date.now();
          const response = await supabase.functions.invoke(tierConfig.endpoint, {
            body: {
              storyText: testStoryText.substring(0, 200), // Template AB expects storyText
              pageText: testStoryText.substring(0, 200), // Template CD compatibility
              userInfo: buildUserInfo(),
              pageNumber: 1,
              sessionId: crypto.randomUUID(),
              forceTier: tierConfig.tier
            }
          });
          
          const processingTime = Date.now() - startTime;
          const { category, probableCause } = !response.error ? 
            { category: 'SUCCESS', probableCause: 'Request completed successfully' } :
            categorizeError(response.error);
          
          tierResults.push({
            tier: tierConfig.name,
            success: !response.error && response.data?.success,
            imageURL: response.data?.imageURL,
            details: {
              processingTime,
              requestId: response.data?.requestId,
              testType: 'HEALTH',
              healthCheck: triageCheck,
              errorCategory: category as any,
              probableCause,
              error: response.error?.message || response.data?.error,
              tier: tierConfig.tier,
              provider: response.data?.provider
            }
          });
        } else {
          // Triage failed - don't attempt POST
          const { category, probableCause } = categorizeError(new Error(triageCheck.triageResult));
          
          tierResults.push({
            tier: `${tierConfig.name} (Triage Failed)`,
            success: false,
            imageURL: null,
            details: {
              testType: 'TRIAGE',
              healthCheck: triageCheck,
              errorCategory: category as any,
              probableCause,
              error: `Triage check failed: ${triageCheck.triageResult}`
            }
          });
        }
      } catch (error) {
        const { category, probableCause } = categorizeError(error, tierConfig.endpoint);
        
        tierResults.push({
          tier: `${tierConfig.name} (Error)`,
          success: false,
          imageURL: null,
          details: {
            testType: 'HEALTH',
            errorCategory: category as any,
            probableCause,
            error: error.message
          }
        });
      }
    }
    
    setResults(tierResults);
    setIsLoading(false);
  };

  // Enhanced Resilience testing with better error categorization
  const resilienceTest = async () => {
    setIsLoading(true);
    setResults([]);
    
    const resilientResults: TestResult[] = [];
    
    // Test 1: Network interruption simulation
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000); // Abort after 2s to simulate network issue
      
        await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText: testStoryText, // Template AB expects storyText
          pageText: testStoryText, // Template CD compatibility
          userInfo: buildUserInfo(),
          pageNumber: 1,
          sessionId: crypto.randomUUID()
        }
      });
    } catch (error) {
      const { category, probableCause } = categorizeError(error);
      
      resilientResults.push({
        tier: 'network-interruption-test',
        success: false,
        imageURL: null,
        details: {
          error: 'Simulated network interruption',
          testType: 'REAL',
          timeoutTest: true,
          abortReason: 'Simulated interruption',
          errorCategory: category as any,
          probableCause
        }
      });
    }
    
    // Test 2: Rapid successive calls (stress test)
    const rapidCalls = Array.from({ length: 3 }, (_, i) => 
      supabase.functions.invoke('ai-visual-scene-creator', {
        body: {
          storyText: `Test ${i + 1}: ${testStoryText.substring(0, 50)}`, // Template AB expects storyText
          pageText: `Test ${i + 1}: ${testStoryText.substring(0, 50)}`, // Template CD compatibility
          isDebugMode: true,
          userInfo: buildUserInfo(),
          pageNumber: i + 1,
          sessionId: crypto.randomUUID()
        }
      })
    );
    
    try {
      const rapidResults = await Promise.allSettled(rapidCalls);
      rapidResults.forEach((result, index) => {
        const error = result.status === 'rejected' ? result.reason : 
                     (result.status === 'fulfilled' && result.value.error ? result.value.error : null);
        const { category, probableCause } = error ? categorizeError(error) : 
                                           { category: 'SUCCESS', probableCause: 'Request completed successfully' };
        
        resilientResults.push({
          tier: `rapid-call-${index + 1}`,
          success: result.status === 'fulfilled' && !result.value.error,
          imageURL: result.status === 'fulfilled' ? result.value.data?.imageURL : null,
          details: {
            testType: 'REAL',
            errorCategory: category as any,
            probableCause,
            error: error?.message
          }
        });
      });
    } catch (error) {
      const { category, probableCause } = categorizeError(error);
      
      resilientResults.push({
        tier: 'rapid-calls-batch-error',
        success: false,
        imageURL: null,
        details: {
          error: error.message,
          testType: 'REAL',
          errorCategory: category as any,
          probableCause
        }
      });
    }
    
    setResults(resilientResults);
    setIsLoading(false);
  };

  // Test AI Scene Creator (scene generation only, no image)
  const testAISceneCreator = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🎬 Testing AI Scene Creator only (no image generation)', {
        storyText: testStoryText.substring(0, 100)
      });

      const userInfo = buildUserInfo();
      const sessionId = crypto.randomUUID();

      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-visual-scene-creator', {
        body: {
          storyText: testStoryText, // Use raw story text to get "word-for-word" primaryScene
          userInfo: userInfo,
          sessionId: sessionId,
          storyId: sessionId, // ADDED: Missing field
          pageNumber: 1,
          isGuestUser: true, // ADDED: Missing field (default to guest for testing)
          difficultyLevel: mapDifficultyLevel(userInfo), // ADDED: Missing field
          isDebugMode: true
        }
      });

      const processingTime = Date.now() - startTime;
      
      DebugLogger.log('image', '✅ AI Scene Creator test completed', {
        success: response.data?.success,
        processingTime,
        hasAiSchema: !!response.data?.aiSchema
      });

      const { category, probableCause } = !response.error ? 
        { category: 'SUCCESS', probableCause: 'Scene generation completed successfully' } :
        categorizeError(response.error);

      setResults([{
        tier: 'ai-scene-creator',
        success: !response.error && response.data?.success,
        imageURL: null, // No image generation - scene only
        details: {
          processingTime,
          requestId: response.data?.requestId,
          aiSchema: response.data?.aiSchema || response.data?.debug?.aiSchema,
          primaryScene: response.data?.primaryScene,
          setting: response.data?.aiSchema?.setting || response.data?.debug?.aiSchema?.setting,
          action: response.data?.aiSchema?.action || response.data?.debug?.aiSchema?.action,
          mood: response.data?.aiSchema?.mood || response.data?.debug?.aiSchema?.mood,
          pose: response.data?.aiSchema?.pose || response.data?.debug?.aiSchema?.pose,
          positivePrompt: response.data?.positivePrompt,
          negativePrompt: response.data?.negativePrompt,
          styleFramework: response.data?.styleFrameworkUsed,
          sceneGenerationOnly: true,
          testType: 'REAL',
          debug: response.data?.debug, // Include debug information
          errorCategory: category as any,
          probableCause,
          error: response.error?.message || response.data?.error
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ AI Scene Creator test failed', { error });
      const { category, probableCause } = categorizeError(error);
      
      setResults([{
        tier: 'ai-scene-creator-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          sceneGenerationOnly: true,
          testType: 'REAL',
          errorCategory: category as any,
          probableCause
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Force Tier 1 (Full Prompt) - Complete Tier 1 flow with photo
  const forceTier1FullPrompt = async () => {
    setIsLoading(true);
    setResults([]);
    
    const steps: Array<{
      name: string;
      status: 'pending' | 'running' | 'success' | 'error';
    }> = [
      { name: '🔍 Preflight Check', status: 'pending' },
      { name: '🎭 AI Scene Creation', status: 'pending' },
      { name: '✨ Primary Scene Validation', status: 'pending' },
      { name: '🧬 AI Schema Validation', status: 'pending' },
      { name: '📝 Prompt Enhancement', status: 'pending' },
      { name: '🎨 Image Generation', status: 'pending' }
    ];
    
    try {
      // Step 1: Perform preflight GET probe
      steps[0].status = 'running';
      const triageCheck = await performTriageCheck('runware-generate-image');
      steps[0].status = triageCheck.available ? 'success' : 'error';
      
      const userInfo = buildUserInfo();
      const enhancedPrompt = testStoryText; // Use raw content directly
      const sessionId = crypto.randomUUID();

      const startTime = Date.now();
      let response: any;
      let chosenPath = '';
      
      // HEALTH-BASED ROUTING: Orchestrator vs Direct Mode
      if (triageCheck.available) {
        // Path 1: Orchestrator Mode - runware-generate-image is healthy
        chosenPath = 'Orchestrator Mode';
        steps[1].name = '🎯 Using Orchestrator Mode';
        
        DebugLogger.log('image', '🎯 Force Tier 1: Orchestrator Mode (healthy)', {
          forceTier: 'COMPLETE_TIER_1',
          path: 'orchestrator',
          triageCheck,
          userInfo,
          steps
        });

        // Step 2: Call runware-generate-image with orchestrator payload
        steps[1].status = 'running';
        response = await supabase.functions.invoke('runware-generate-image', {
          body: {
            pageText: enhancedPrompt,
            userInfo: userInfo,
            sessionId: sessionId,
            storyId: sessionId,
            pageNumber: 1,
            isGuestUser: true,
            difficultyLevel: mapDifficultyLevel(userInfo),
            protectionNegatives: [],
            forceTier: 'COMPLETE_TIER_1',
            test: true
          }
        });
      } else {
        // Path 2: Direct Mode Fallback - runware-generate-image is unhealthy
        chosenPath = 'Direct Mode';
        steps[1].name = '🎯 Using Direct Mode (Nuclear Fallback)';
        
        DebugLogger.log('image', '🎯 Force Tier 1: Direct Mode (unhealthy orchestrator)', {
          forceTier: 'DIRECT_MODE',
          path: 'direct_mode',
          triageCheck,
          reason: 'orchestrator_unhealthy',
          userInfo,
          steps
        });

        // Step 2: Call ai-visual-scene-creator directly
        steps[1].status = 'running';
        response = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            pageText: enhancedPrompt,
            userInfo: userInfo,
            sessionId: sessionId,
            storyId: sessionId,
            pageNumber: 1,
            isGuestUser: true,
            difficultyLevel: mapDifficultyLevel(userInfo),
            protectionNegatives: [],
            directMode: true,
            test: true
          }
        });
        
        // Mark response with direct mode identifier for tracking
        if (response.data) {
          response.data.tier = 'DIRECT_MODE';
          response.data.escalationPath = 'force_tier_1_direct_fallback';
        }
      }

      const processingTime = Date.now() - startTime;
      
      // Step 3: Validate Primary Scene
      steps[2].status = 'running';
      const hasPrimaryScene = response.data?.primaryScene && response.data.primaryScene.length > 0;
      steps[2].status = hasPrimaryScene ? 'success' : 'error';
      
      // CRITICAL: Detect escalation responses and treat as Tier 1 failures
      const hasEscalationAction = response.data?.nextAction && 
        (response.data.nextAction.includes('ESCALATE') || response.data.nextAction.includes('escalate'));
      const isEscalationResponse = hasEscalationAction || 
        (response.data?.templateStructure && response.data.templateStructure !== 'COMPLETE_TIER_1');
      
      // If this is an escalation response, Force Tier 1 should be considered failed
      if (isEscalationResponse) {
        steps[2].status = 'error';
        console.warn(`Force Tier 1 received escalation response - treating as failure:`, {
          nextAction: response.data?.nextAction,
          templateStructure: response.data?.templateStructure
        });
      }
      
      // Step 4: Validate AI Schema (DEBUG ONLY - NOT A FAILURE CONDITION)
      steps[3].status = 'running';
      const aiSchema = response.data?.aiSchema || response.data?.debug?.aiSchema;
      const schemaCompleteness = {
        setting: !!(aiSchema?.setting),
        action: !!(aiSchema?.action), 
        mood: !!(aiSchema?.mood),
        pose: !!(aiSchema?.pose),
        completeness: 0
      };
      schemaCompleteness.completeness = 
        (schemaCompleteness.setting ? 25 : 0) +
        (schemaCompleteness.action ? 25 : 0) +
        (schemaCompleteness.mood ? 25 : 0) +
        (schemaCompleteness.pose ? 25 : 0);
      steps[3].status = 'success'; // Always success - this is debug only
      
      // Step 5: Validate Enhanced Prompt
      steps[4].status = 'running';
      const hasEnhancedPrompt = response.data?.enhancedPrompt && response.data.enhancedPrompt.length > 0;
      steps[4].status = hasEnhancedPrompt ? 'success' : 'error';
      
      // Step 6: Validate Image Generation
      steps[5].status = 'running';
      const hasImage = !!(response.data?.imageURL || response.data?.imageUrl);
      steps[5].status = hasImage ? 'success' : 'error';

      // Determine overall success - Force Tier 1 fails if escalation occurs
      const overallSuccess = !response.error && hasPrimaryScene && hasImage && !isEscalationResponse;
      
      // Categorize error type if failed
      let errorCategory = null;
      let probableCause = null;
      
      if (!overallSuccess) {
        if (isEscalationResponse) {
          errorCategory = 'TIER_1_ESCALATION_FAILURE';
          probableCause = `Force Tier 1 failed: System attempted to escalate to ${response.data?.nextAction || 'higher tier'} instead of completing Tier 1`;
        } else if (response.error?.message?.includes('503') || response.error?.message?.includes('Service Unavailable')) {
          errorCategory = 'NETWORK';
          probableCause = `${chosenPath} failed: Edge function deployment sync issue`;
        } else if (response.error?.message?.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
          errorCategory = 'AI_SCENE_CREATION';
          probableCause = `${chosenPath} failed: ai-visual-scene-creator failed to generate primaryScene`;
        } else if (!hasPrimaryScene && !response.data?.templateStructure) {
          errorCategory = 'AI_SCENE_CREATION';
          probableCause = `${chosenPath} failed: Missing primaryScene in response (may be escalated tier response)`;
        } else if (!hasEnhancedPrompt) {
          errorCategory = 'PROMPT_ENHANCEMENT';
          probableCause = `${chosenPath} failed: PhaseIntegrationOrchestrator failed to enhance prompt`;
        } else if (!hasImage) {
          errorCategory = 'IMAGE_GENERATION';
          probableCause = `${chosenPath} failed: Image generation failed`;
        } else {
          errorCategory = 'UNKNOWN';
          probableCause = `${chosenPath} failed: ${response.error?.message || 'Unknown failure in Tier 1 flow'}`;
        }
        
        // Enhanced error logging for Force Tier 1 failures
        if (chosenPath === 'Direct Mode') {
          DebugLogger.error('image', '❌ Force Tier 1 Direct Mode failed', {
            reason: 'Both orchestrator (unhealthy) and direct mode failed',
            orchestratorHealth: triageCheck,
            directModeError: response.error?.message,
            errorCategory,
            probableCause
          });
        } else {
          DebugLogger.error('image', '❌ Force Tier 1 Orchestrator Mode failed', {
            reason: 'Orchestrator was healthy but failed to complete',
            orchestratorHealth: triageCheck,
            orchestratorError: response.error?.message,
            errorCategory,
            probableCause,
            suggestion: 'Try again - orchestrator may auto-fallback to Direct Mode'
          });
        }
      }

      DebugLogger.log('image', `${overallSuccess ? '✅' : '❌'} Force Tier 1 completed`, {
        success: overallSuccess,
        processingTime,
        hasPrimaryScene,
        hasEnhancedPrompt,
        hasImage,
        errorCategory,
        probableCause,
        steps: steps.map(s => `${s.name}: ${s.status}`)
      });

      // Extract Direct Mode template prompts if available
      const templateResponse = response.data?.enhancedData?.templateResponse;
      const isDirectMode = chosenPath === 'Direct Mode' && templateResponse;
      
      setResults([{
        tier: 'tier-1-forced',
        success: overallSuccess,
        imageURL: response.data?.imageURL || response.data?.imageUrl || null,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          chosenPath: chosenPath,
          orchestratorHealth: triageCheck.available ? 'healthy' : 'unhealthy',
          triageResult: triageCheck,
          aiSchema: response.data?.aiSchema || response.data?.debug?.aiSchema,
          primaryScene: response.data?.primaryScene,
          setting: response.data?.aiSchema?.setting || response.data?.debug?.aiSchema?.setting,
          action: response.data?.aiSchema?.action || response.data?.debug?.aiSchema?.action,
          mood: response.data?.aiSchema?.mood || response.data?.debug?.aiSchema?.mood,
          pose: response.data?.aiSchema?.pose || response.data?.debug?.aiSchema?.pose,
          enhancedPrompt: response.data?.enhancedPrompt,
          // For Direct Mode, show template prompts; otherwise show original prompts
          positivePrompt: isDirectMode ? 
            templateResponse.positivePrompt : 
            (response.data?.positivePrompt || response.data?.enhancedPrompt),
          negativePrompt: isDirectMode ? 
            templateResponse.negativePrompt : 
            response.data?.negativePrompt,
          // Character consistency data
          characterConsistency: response.data?.enhancedData?.characterConsistency,
          visualConsistency: response.data?.enhancedData?.visualConsistency,
          culturalEnhancements: response.data?.enhancedData?.culturalEnhancements,
          // Template data for Direct Mode
          templateData: isDirectMode ? templateResponse.templateData : null,
          templateComplexity: isDirectMode ? templateResponse.templateComplexity || '2.5C' : null,
          styleFramework: response.data?.styleFrameworkUsed,
          testType: 'TIER_1_COMPLETE_FLOW',
          stepByStepValidation: steps,
          schemaCompleteness, // DEBUG INFO ONLY
          primarySceneLength: response.data?.primaryScene?.length || 0,
          tier: response.data?.tier,
          escalationPath: response.data?.escalationPath,
          nextAction: response.data?.nextAction, // Show escalation actions
          templateStructure: isDirectMode ? 'DIRECT_MODE_HYBRID' : response.data?.templateStructure,
          tierPathResult: isEscalationResponse ? 'Both Tier 1 paths failed - escalation attempted' : 
                         (chosenPath === 'Direct Mode' ? 'Direct Mode Success (Tier 1 AI → 2.5C Template)' : 'Tier 1 Complete Flow successful'),
          debug: response.data?.debug, // Include debug information
          error: response.error?.message || response.data?.error,
          errorCategory,
          probableCause
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Force Tier 1 failed with exception', { error });
      
      // Update failed step
      const currentStep = steps.find(s => s.status === 'running');
      if (currentStep) currentStep.status = 'error';
      
      setResults([{
        tier: 'tier-1-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message,
          testType: 'TIER_1_COMPLETE_FLOW',
          stepByStepValidation: steps,
          errorCategory: 'NETWORK',
          probableCause: 'Network timeout or connection failure'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug Real Routing - FIXED: Add health check first, then bypass logic, then orchestrator
  const debugRealRouting = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🔍 E2E Real Routing: Health Check → Orchestrator → Direct Mode → Tier Cascade → SVG Fallback', {
        userInfo: buildUserInfo()
      });

      const globalStartTime = Date.now();
      const sessionId = crypto.randomUUID();
      const userInfo = buildUserInfo();
      // Use raw story text directly - no protection enhancement
      const rawStoryText = testStoryText;
      
      let cascadeHistory = [];
      let finalResult = null;
      let resultBadge = '';
      let fallbackPath = '';
      let healthStatus = null;

      // STEP 1: Health Check
      cascadeHistory.push('🏥 Checking System Health...');
      const healthStartTime = Date.now();
      
      try {
        healthStatus = await HealthCheckService.checkSystemHealth();
        const healthTime = Date.now() - healthStartTime;
        cascadeHistory.push(`✅ Health Check Complete (${healthTime}ms): ${healthStatus.overallHealth}`);
        cascadeHistory.push(`📊 Orchestrator: ${healthStatus.orchestrator}, Runware: ${healthStatus.runwareAPI}, Dependencies: ${healthStatus.serviceDependencies}`);
      } catch (healthError) {
        const healthTime = Date.now() - healthStartTime;
        cascadeHistory.push(`❌ Health Check Failed (${healthTime}ms): ${healthError.message}`);
        healthStatus = {
          orchestrator: 'server',
          runwareAPI: 'server',
          serviceDependencies: 'server',
          overallHealth: 'server'
        };
      }

      // STEP 2: Try Orchestrator
      cascadeHistory.push('🚀 Attempting Orchestrator (runware-generate-image)...');
      const orchestratorStartTime = Date.now();
      
      try {
        const orchestratorResponse = await supabase.functions.invoke('runware-generate-image', {
          body: {
            pageText: testStoryText,
            userInfo: userInfo,
            sessionId: sessionId,
            pageNumber: 1,
            storyId: 'debug-routing-test',
            isGuestUser: false,
            difficultyLevel: mapDifficultyLevel(userInfo)
          }
        });

        const orchestratorTime = Date.now() - orchestratorStartTime;
        
        if (orchestratorResponse.data?.success) {
          cascadeHistory.push(`✅ Orchestrator Success (${orchestratorTime}ms)`);
          resultBadge = 'Orchestrator Success';
          fallbackPath = 'No fallbacks needed - direct orchestrator success';
          finalResult = {
            tier: orchestratorResponse.data.tier || 'orchestrator',
            success: true,
            imageURL: orchestratorResponse.data.imageURL,
            details: {
              processingTime: orchestratorTime,
              cascadeHistory,
                      testType: 'REAL',
              resultType: 'ORCHESTRATOR_SUCCESS',
              tierFailureHistory: orchestratorResponse.data.tierFailureHistory || [],
              positivePrompt: orchestratorResponse.data.positivePrompt,
              routingMetadata: orchestratorResponse.data.routingMetadata,
              error: null
            }
          };
        } else {
          // Orchestrator failed - start cascade
          cascadeHistory.push(`❌ Orchestrator Failed (${orchestratorTime}ms)`);
          const errorAnalysis = categorizeError(orchestratorResponse.error, 'orchestrator', orchestratorResponse);
          cascadeHistory.push(`❌ Error Type: ${errorAnalysis.errorType} - ${errorAnalysis.probableCause}`);
          
          // STEP 3: Try Direct Mode Fallback
          cascadeHistory.push('🔄 Attempting Direct Mode (ai-visual-scene-creator)...');
          const directModeStartTime = Date.now();
          
          try {
            const directModeResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
              body: {
                storyText: rawStoryText,
                userInfo: userInfo,
                sessionId: sessionId,
                storyId: sessionId,
                pageNumber: 1,
                isGuestUser: true,
                difficultyLevel: mapDifficultyLevel(userInfo),
                directMode: true
              }
            });

            const directModeTime = Date.now() - directModeStartTime;
            
            if (directModeResponse.data?.success) {
              cascadeHistory.push(`✅ Direct Mode Success (${directModeTime}ms)`);
              resultBadge = 'Direct Mode Fallback';
              fallbackPath = 'Orchestrator failed → Direct Mode succeeded';
              finalResult = {
                tier: 'direct-mode',
                success: true,
                imageURL: directModeResponse.data.imageURL,
                details: {
                  processingTime: Date.now() - globalStartTime,
                  cascadeHistory,
                      testType: 'REAL',
                  resultType: 'DIRECT_MODE_SUCCESS',
                  error: null
                }
              };
            } else {
              // Direct Mode failed - try Tier 2.5C
              cascadeHistory.push(`❌ Direct Mode Failed (${directModeTime}ms)`);
              
              // STEP 4: Try Tier 2.5C
              cascadeHistory.push('🔄 Attempting Tier 2.5C (runware-template-cd)...');
              const tier25CStartTime = Date.now();
              
              try {
                const tier25CResponse = await supabase.functions.invoke('runware-template-cd', {
                  body: {
                    pageText: rawStoryText,
                    userInfo: userInfo,
                    sessionId: sessionId,
                    pageNumber: 1,
                    templateComplexity: 'C'
                  }
                });

                const tier25CTime = Date.now() - tier25CStartTime;
                
                if (tier25CResponse.data?.success) {
                  cascadeHistory.push(`✅ Tier 2.5C Success (${tier25CTime}ms)`);
                  resultBadge = 'Tier 2.5C Success';
                  fallbackPath = 'Orchestrator failed → Direct Mode failed → Tier 2.5C succeeded';
                  finalResult = {
                    tier: '2.5C',
                    success: true,
                    imageURL: tier25CResponse.data.imageURL,
                    details: {
                      processingTime: Date.now() - globalStartTime,
                      cascadeHistory,
                      testType: 'REAL',
                      resultType: 'TIER_25C_SUCCESS',
                      error: null
                    }
                  };
                } else {
                  // Tier 2.5C failed - try SVG Tier 4
                  cascadeHistory.push(`❌ Tier 2.5C Failed (${tier25CTime}ms)`);
                  
                  // STEP 5: Try SVG Tier 4 (Final Fallback)
                  cascadeHistory.push('🔄 Attempting SVG Tier 4 (final fallback)...');
                  const svgStartTime = Date.now();
                  
                  try {
                    const svgResponse = await ImageFallbackService.generateStoryPlaceholder(rawStoryText, 1);
                    const svgTime = Date.now() - svgStartTime;
                  
                  if (svgResponse) {
                      cascadeHistory.push(`✅ SVG Tier 4 Success (${svgTime}ms)`);
                      resultBadge = 'SVG Tier 4 Fallback';
                      fallbackPath = 'Complete cascade: Orchestrator → Direct Mode → Tier 2.5C → SVG Tier 4';
                      finalResult = {
                        tier: 'SVG_TIER_4',
                        success: true,
                      imageURL: svgResponse,
                        details: {
                          processingTime: Date.now() - globalStartTime,
                          cascadeHistory,
                      testType: 'REAL',
                          resultType: 'SVG_TIER_4_SUCCESS',
                          error: null
                        }
                      };
                    } else {
                      // Complete failure - all tiers failed
                      cascadeHistory.push(`❌ SVG Tier 4 Failed (${svgTime}ms) - Complete System Failure`);
                      resultBadge = 'Complete Failure';
                      fallbackPath = 'All tiers failed: Orchestrator → Direct Mode → Tier 2.5C → SVG Tier 4';
                      finalResult = {
                        tier: 'complete-failure',
                        success: false,
                        imageURL: null,
                        details: {
                          processingTime: Date.now() - globalStartTime,
                          cascadeHistory,
                          testType: 'REAL_ROUTING',
                          resultType: 'COMPLETE_FAILURE',
                          error: 'All fallback tiers exhausted'
                        }
                      };
                    }
                  } catch (svgError) {
                    const svgTime = Date.now() - svgStartTime;
                    cascadeHistory.push(`❌ SVG Tier 4 Exception (${svgTime}ms): ${svgError.message}`);
                    resultBadge = 'Complete Failure';
                    fallbackPath = 'System failure at final SVG fallback';
                    finalResult = {
                      tier: 'complete-failure',
                      success: false,
                      imageURL: null,
                      details: {
                        processingTime: Date.now() - globalStartTime,
                        cascadeHistory,
                        testType: 'REAL_ROUTING',
                        resultType: 'COMPLETE_SYSTEM_FAILURE',
                        error: `SVG Tier 4 exception: ${svgError.message}`
                      }
                    };
                  }
                }
              } catch (tier25CError) {
                const tier25CTime = Date.now() - tier25CStartTime;
                cascadeHistory.push(`❌ Tier 2.5C Exception (${tier25CTime}ms): ${tier25CError.message}`);
                
                // Still try SVG Tier 4 even after 2.5C exception
                cascadeHistory.push('🔄 Attempting SVG Tier 4 after 2.5C exception...');
                const svgStartTime = Date.now();
                
                try {
                  const svgResponse = await ImageFallbackService.generateStoryPlaceholder(rawStoryText, 1);
                  const svgTime = Date.now() - svgStartTime;
                  
                  if (svgResponse) {
                    cascadeHistory.push(`✅ SVG Tier 4 Success after 2.5C exception (${svgTime}ms)`);
                    resultBadge = 'SVG Tier 4 Recovery';
                    fallbackPath = 'Recovered at SVG Tier 4 after 2.5C exception';
                    finalResult = {
                      tier: 'SVG_TIER_4',
                      success: true,
                      imageURL: svgResponse,
                      details: {
                        processingTime: Date.now() - globalStartTime,
                        cascadeHistory,
                      testType: 'REAL',
                        resultType: 'SVG_TIER_4_RECOVERY',
                        error: null
                      }
                    };
                  } else {
                    cascadeHistory.push(`❌ SVG Tier 4 also failed after 2.5C exception`);
                    resultBadge = 'Complete Failure';
                    fallbackPath = 'Complete failure after 2.5C exception';
                    finalResult = {
                      tier: 'complete-failure',
                      success: false,
                      imageURL: null,
                      details: {
                        processingTime: Date.now() - globalStartTime,
                        cascadeHistory,
                        testType: 'REAL_ROUTING',
                        resultType: 'COMPLETE_FAILURE_AFTER_EXCEPTION',
                        error: 'Complete failure after Tier 2.5C exception'
                      }
                    };
                  }
                } catch (svgError) {
                  cascadeHistory.push(`❌ SVG Tier 4 Exception after 2.5C exception: ${svgError.message}`);
                  resultBadge = 'Complete Failure';
                  fallbackPath = 'Multiple exceptions in cascade';
                  finalResult = {
                    tier: 'complete-failure',
                    success: false,
                    imageURL: null,
                    details: {
                      processingTime: Date.now() - globalStartTime,
                      cascadeHistory,
                      testType: 'REAL',
                      resultType: 'MULTIPLE_EXCEPTIONS',
                      error: 'Multiple exceptions in tier cascade'
                    }
                  };
                }
              }
            }
          } catch (directModeError) {
            const directModeTime = Date.now() - directModeStartTime;
            cascadeHistory.push(`❌ Direct Mode Exception (${directModeTime}ms): ${directModeError.message}`);
            
            // Still try remaining tiers after Direct Mode exception
            cascadeHistory.push('🔄 Attempting Tier 2.5C after Direct Mode exception...');
            
            try {
              const tier25CResponse = await supabase.functions.invoke('runware-template-cd', {
                body: {
                  pageText: rawStoryText,
                  userInfo: userInfo,
                  sessionId: sessionId,
                  pageNumber: 1,
                  templateComplexity: 'C'
                }
              });

              if (tier25CResponse.data?.success) {
                cascadeHistory.push(`✅ Tier 2.5C Success after Direct Mode exception`);
                resultBadge = 'Tier 2.5C Recovery';
                fallbackPath = 'Recovered at Tier 2.5C after Direct Mode exception';
                finalResult = {
                  tier: '2.5C',
                  success: true,
                  imageURL: tier25CResponse.data.imageURL,
                  details: {
                    processingTime: Date.now() - globalStartTime,
                    cascadeHistory,
          testType: 'REAL',
                    resultType: 'TIER_25C_RECOVERY',
                    error: null
                  }
                };
              } else {
                // Final SVG fallback
                cascadeHistory.push('🔄 Final SVG Tier 4 attempt...');
                const svgResponse = await ImageFallbackService.generateStoryPlaceholder(rawStoryText, 1);
                
                if (svgResponse) {
                  cascadeHistory.push('✅ SVG Tier 4 Final Success');
                  resultBadge = 'SVG Tier 4 Final Fallback';
                  fallbackPath = 'Final recovery at SVG Tier 4';
                  finalResult = {
                    tier: 'SVG_TIER_4',
                    success: true,
                    imageURL: svgResponse,
                    details: {
                      processingTime: Date.now() - globalStartTime,
                      cascadeHistory,
                      testType: 'REAL',
                      resultType: 'SVG_TIER_4_FINAL_FALLBACK',
                      error: null
                    }
                  };
                } else {
                  cascadeHistory.push('❌ Complete system failure - all tiers exhausted');
                  resultBadge = 'Complete Failure';
                  fallbackPath = 'All tiers failed with exceptions';
                  finalResult = {
                    tier: 'complete-failure',
                    success: false,
                    imageURL: null,
                    details: {
                      processingTime: Date.now() - globalStartTime,
                      cascadeHistory,
                      testType: 'REAL',
                      resultType: 'COMPLETE_SYSTEM_FAILURE',
                      error: 'All tiers failed with exceptions'
                    }
                  };
                }
              }
            } catch (finalError) {
              cascadeHistory.push(`❌ Final tier attempt failed: ${finalError.message}`);
              resultBadge = 'Complete Failure';
              fallbackPath = 'Complete system failure';
              finalResult = {
                tier: 'complete-failure',
                success: false,
                imageURL: null,
                details: {
                  processingTime: Date.now() - globalStartTime,
                  cascadeHistory,
                      testType: 'REAL',
                  resultType: 'COMPLETE_SYSTEM_FAILURE',
                  error: 'Complete system failure with multiple exceptions'
                }
              };
            }
          }
        }
      } catch (orchestratorError) {
        const orchestratorTime = Date.now() - orchestratorStartTime;
        cascadeHistory.push(`❌ Orchestrator Exception (${orchestratorTime}ms): ${orchestratorError.message}`);
        
        // Try Direct Mode after orchestrator exception
        cascadeHistory.push('🔄 Attempting Direct Mode after orchestrator exception...');
        
        try {
          const directModeResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
            body: {
              storyText: rawStoryText,
              userInfo: userInfo,
              sessionId: sessionId,
              storyId: sessionId,
              pageNumber: 1,
              isGuestUser: true,
              difficultyLevel: mapDifficultyLevel(userInfo),
              directMode: true
            }
          });
          
          if (directModeResponse.data?.success) {
            cascadeHistory.push('✅ Direct Mode Success after orchestrator exception');
            resultBadge = 'Direct Mode Recovery';
            fallbackPath = 'Recovered at Direct Mode after orchestrator exception';
            finalResult = {
              tier: 'direct-mode',
              success: true,
              imageURL: directModeResponse.data.imageURL,
              details: {
                processingTime: Date.now() - globalStartTime,
                cascadeHistory,
                      testType: 'REAL',
                resultType: 'DIRECT_MODE_RECOVERY',
                error: null
              }
            };
          } else {
            cascadeHistory.push('❌ Direct Mode also failed after orchestrator exception');
            // Final SVG attempt
            cascadeHistory.push('🔄 Final SVG Tier 4 attempt after orchestrator exception...');
            const svgResponse = await ImageFallbackService.generateStoryPlaceholder(rawStoryText, 1);
            
            if (svgResponse) {
              cascadeHistory.push('✅ SVG Tier 4 Final Recovery');
              resultBadge = 'SVG Tier 4 Final Recovery';
              fallbackPath = 'Final recovery at SVG Tier 4 after orchestrator exception';
              finalResult = {
                tier: 'SVG_TIER_4',
                success: true,
                imageURL: svgResponse,
                details: {
                  processingTime: Date.now() - globalStartTime,
                  cascadeHistory,
                      testType: 'REAL',
                  resultType: 'SVG_TIER_4_FINAL_RECOVERY',
                  error: null
                }
              };
            } else {
              cascadeHistory.push('❌ Complete failure - SVG Tier 4 also failed');
              resultBadge = 'Complete Failure';
              fallbackPath = 'Complete failure after orchestrator exception';
              finalResult = {
                tier: 'complete-failure',
                success: false,
                imageURL: null,
                details: {
                  processingTime: Date.now() - globalStartTime,
                  cascadeHistory,
                      testType: 'REAL',
                  resultType: 'COMPLETE_FAILURE_AFTER_ORCHESTRATOR_EXCEPTION',
                  error: 'Complete failure after orchestrator exception'
                }
              };
            }
          }
        } catch (finalException) {
          cascadeHistory.push(`❌ Final exception: ${finalException.message}`);
          resultBadge = 'Complete Failure';
          fallbackPath = 'Complete system failure with multiple exceptions';
          finalResult = {
            tier: 'complete-failure',
            success: false,
            imageURL: null,
            details: {
              processingTime: Date.now() - globalStartTime,
              cascadeHistory,
                      testType: 'REAL',
              resultType: 'MULTIPLE_EXCEPTIONS_FAILURE',
              error: 'Multiple exceptions in tier cascade'
            }
          };
        }
      }

      // Add result metadata
      if (finalResult?.details) {
        finalResult.details.resultBadge = resultBadge;
        finalResult.details.fallbackPath = fallbackPath;
        finalResult.details.healthStatus = healthStatus;
      }

      DebugLogger.log('image', `✅ Real Routing Completed: ${resultBadge}`, {
        success: finalResult?.success,
        processingTime: finalResult?.details?.processingTime,
        cascadeHistory,
        fallbackPath
      });

      setResults([finalResult]);

    } catch (error) {
      DebugLogger.error('image', '❌ Real Routing failed with unexpected error', { error });
      setResults([{
        tier: 'system-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
                      testType: 'REAL',
          resultType: 'SYSTEM_ERROR',
          cascadeHistory: ['❌ System error before flow could complete']
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for enhanced routing analysis
  const analyzeAvatarCompleteness = (userInfo: any) => {
    const requiredFields = ['name', 'culturalProfile', 'nativeLanguage', 'age'];
    const avatarFields = ['avatar.type', 'avatar.skinTone'];
    
    // Check nested avatar fields
    const flatUserInfo = {
      ...userInfo,
      'avatar.type': userInfo?.avatar?.type,
      'avatar.skinTone': userInfo?.avatar?.skinTone
    };
    
    const allFields = [...requiredFields, ...avatarFields];
    const presentFields = allFields.filter(field => {
      const value = field.includes('.') ? flatUserInfo[field] : userInfo?.[field];
      return value && value.toString().trim().length > 0;
    });
    const missingFields = allFields.filter(field => {
      const value = field.includes('.') ? flatUserInfo[field] : userInfo?.[field];
      return !value || value.toString().trim().length === 0;
    });
    
    return {
      completeness: presentFields.length / allFields.length,
      presentFields,
      missingFields,
      isComplete: missingFields.length === 0
    };
  };

  const generateRoutingCascade = (routingMetadata: any, avatarAnalysis: any) => {
    const cascade = [];
    
    if (avatarAnalysis.completeness >= 0.8) {
      cascade.push('✅ Avatar Complete → Attempted Tier 1');
      cascade.push('✅ High Quality Data → Considered Tier 2.5A/2.5B');
    } else {
      cascade.push('❌ Avatar Incomplete → Skipped Tier 1');
      cascade.push('❌ Insufficient Data → Skipped Tier 2.5A/2.5B');
      cascade.push('✅ Fallback Logic → Routed to Tier 2.5C/2.5D');
    }
    
    if (routingMetadata?.executedTier) {
      cascade.push(`🎯 Final Route → Tier ${routingMetadata.executedTier}`);
    }
    
    return cascade;
  };

  const generateFallbackReason = (routingMetadata: any, avatarAnalysis: any) => {
    if (avatarAnalysis.missingFields.length > 0) {
      return `Avatar incomplete (missing: ${avatarAnalysis.missingFields.join(', ')})`;
    }
    
    if (routingMetadata?.fallbackReason) {
      return routingMetadata.fallbackReason;
    }
    
    return 'Standard routing applied';
  };

  // Force specific tier tests - FIXED: Correct payload structure and fields
  const forceTier = async (tier: string) => {
    setIsLoading(true);
    setResults([]);
    
    const steps: Array<{
      name: string;
      status: 'pending' | 'running' | 'success' | 'error';
    }> = [
      { name: '🔍 Function Selection', status: 'pending' },
      { name: '📋 Payload Construction', status: 'pending' },
      { name: '🚀 Template Execution', status: 'pending' },
      { name: '📝 Prompt Generation', status: 'pending' },
      { name: '🎨 Image Generation', status: 'pending' }
    ];
    
    try {
      DebugLogger.log('image', `🎯 Force Tier ${tier}: Direct template bypass simulation`, { 
        tier, 
        bypassedTiers: tier === '2.5A' ? 'Tier 1' : tier === '2.5B' ? 'Tier 1, 2.5A' : 'Unknown',
        expectedTemplate: tier.includes('A') || tier.includes('B') ? 'template-ab' : 'template-cd'
      });

      const startTime = Date.now();
      const userInfo = buildUserInfo();
      const enhancedPrompt = testStoryText; // Use raw content directly
      
      // Step 1: Function Selection
      steps[0].status = 'running';
      const functionMap: { [key: string]: string } = {
        '2.5A': 'runware-template-ab',
        '2.5B': 'runware-template-ab', 
        '2.5C': 'runware-template-cd',
        '2.5D': 'runware-template-cd'
      };

      const templateMap: { [key: string]: string } = {
        '2.5A': 'A',
        '2.5B': 'B',
        '2.5C': 'C', 
        '2.5D': 'D'
      };
      
      const selectedFunction = functionMap[tier];
      steps[0].status = selectedFunction ? 'success' : 'error';
      
      // Step 2: Payload Construction - FIXED: Use pageText and add missing fields
      steps[1].status = 'running';
      const payload = tier === '2.5A' || tier === '2.5B' 
        ? {
            // Template AB expects {bundle, config} payload shape
            bundle: {
              pageText: enhancedPrompt, // FIXED: Use pageText like SimpleImageService
              userInfo: userInfo,
              sessionId: crypto.randomUUID(),
              storyId: crypto.randomUUID(), // ADDED: Missing field
              pageNumber: 1,
              isGuestUser: true, // ADDED: Missing field  
              difficultyLevel: mapDifficultyLevel(userInfo), // ADDED: Missing field
              protectionNegatives: [] // ADDED: Missing field
            },
            config: {
              templateComplexity: templateMap[tier]
            },
            test: true
          }
        : {
            // Template CD expects flat payload - FIXED: Use pageText and add missing fields
            pageText: enhancedPrompt, // FIXED: Use pageText like SimpleImageService
            userInfo: userInfo,
            sessionId: crypto.randomUUID(),
            storyId: crypto.randomUUID(), // ADDED: Missing field
            pageNumber: 1,
            isGuestUser: true, // ADDED: Missing field
            difficultyLevel: mapDifficultyLevel(userInfo), // ADDED: Missing field
            protectionNegatives: [], // ADDED: Missing field
            templateComplexity: templateMap[tier],
            test: true
          };
      steps[1].status = 'success';

      // Step 3: Template Execution
      steps[2].status = 'running';
      const response = await supabase.functions.invoke(selectedFunction, { body: payload });
      steps[2].status = !response.error ? 'success' : 'error';

      const processingTime = Date.now() - startTime;
      
      // Step 4: Prompt Generation Validation
      steps[3].status = 'running';
      const safePositive = response.data?.positivePrompt
        || response.data?.prompt
        || response.data?.metadata?.enhancedPrompt
        || response.data?.metadata?.positivePrompt
        || null;
      const hasPrompt = !!(safePositive && safePositive.length > 0);
      steps[3].status = hasPrompt ? 'success' : 'error';
      
      // Step 5: Image Generation Validation
      steps[4].status = 'running';
      const safeImageURL = response.data?.imageURL || response.data?.imageUrl || null;
      const hasImage = !!safeImageURL;
      steps[4].status = hasImage ? 'success' : 'error';

      // Determine overall success and error categorization
      const overallSuccess = !response.error && response.data?.success && hasPrompt && hasImage;
      
      let errorCategory = null;
      let probableCause = null;
      
      if (!overallSuccess) {
        if (response.error?.message?.includes('503') || response.error?.message?.includes('Service Unavailable')) {
          errorCategory = 'NETWORK';
          probableCause = `${selectedFunction} edge function deployment sync issue`;
        } else if (response.error?.message?.includes('Missing required field')) {
          errorCategory = 'VALIDATION';
          probableCause = 'Required fields missing in payload';
        } else if (!hasPrompt) {
          errorCategory = 'TEMPLATE_GENERATION';
          probableCause = `Template ${tier} failed to generate prompts`;
        } else if (!hasImage) {
          errorCategory = 'IMAGE_GENERATION';
          probableCause = 'Runware image generation failed in template';
        } else {
          errorCategory = 'TEMPLATE_PROCESSING';
          probableCause = response.error?.message || response.data?.error || 'Template processing failed';
        }
      }
      
      DebugLogger.log('image', `${overallSuccess ? '✅' : '❌'} Force Tier ${tier} completed`, {
        success: overallSuccess,
        processingTime,
        hasPrompt,
        hasImage,
        templateComplexity: templateMap[tier],
        selectedFunction,
        errorCategory,
        probableCause,
        steps: steps.map(s => `${s.name}: ${s.status}`)
      });

      setResults([{
        tier: `tier-${tier}-forced`,
        success: overallSuccess,
        imageURL: safeImageURL,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          tier: response.data?.tier,
          templateComplexity: templateMap[tier],
          positivePrompt: safePositive,
          negativePrompt: response.data?.negativePrompt,
          styleFramework: response.data?.styleFrameworkUsed,
          forcedTier: tier,
          testType: 'FORCED_TEMPLATE_BYPASS',
          bypassedTiers: tier === '2.5A' ? ['Tier 1'] : tier === '2.5B' ? ['Tier 1', 'Tier 2.5A'] : [],
          selectedFunction,
          stepByStepValidation: steps,
          promptLength: safePositive?.length || 0,
          templateStructure: response.data?.templateStructure,
          error: response.error?.message || response.data?.error,
          errorCategory,
          probableCause
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', `❌ Force Tier ${tier} failed with exception`, { error });
      
      // Update failed step
      const currentStep = steps.find(s => s.status === 'running');
      if (currentStep) currentStep.status = 'error';
      
      setResults([{
        tier: `tier-${tier}-error`,
        success: false,
        imageURL: null,
        details: { 
          error: error.message, 
          forcedTier: tier,
          testType: 'FORCED_TEMPLATE_BYPASS',
          stepByStepValidation: steps,
          errorCategory: 'NETWORK',
          probableCause: 'Network timeout or connection failure'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced connectivity test for all 4 endpoints - FIXED: Track controllers for proper abort
  const testConnectivity = async () => {
    setIsLoading(true);
    setResults([]);
    
    // Clear any existing controllers
    abortControllersRef.current.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        // Ignore abort errors for already completed requests
      }
    });
    abortControllersRef.current = [];
    
    try {
      DebugLogger.log('image', '🌐 Enhanced connectivity test: GET + POST with boot detection');
      
      const endpoints = [
        { name: 'ai-visual-scene-creator', type: 'Pure TypeScript (.ts)', architecture: 'PURE_TYPESCRIPT' },
        { name: 'runware-generate-image', type: 'Pure TypeScript (.ts) - ORCHESTRATOR', architecture: 'PURE_TYPESCRIPT' }, 
        { name: 'runware-template-ab', type: 'Hybrid JavaScript (.js)', architecture: 'RECEPTIONIST_PATTERN' },
        { name: 'runware-template-cd', type: 'Hybrid JavaScript (.js)', architecture: 'RECEPTIONIST_PATTERN' }
      ];

      const startTime = Date.now();
      const connectivityResults = await Promise.allSettled(
        endpoints.map(async endpoint => {
          const controller = new AbortController();
          abortControllersRef.current.push(controller);
          
          const endpointStartTime = Date.now();
          
          // Test both GET (health check) and POST (minimal request)
          const tests = {
            GET: null as any,
            POST: null as any
          };
          
          // GET Test (Health Check) - Use controller for abort
          try {
            const getResponse = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${endpoint.name}`, {
              method: 'GET',
              signal: controller.signal,
              headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino'
              }
            });
            
            tests.GET = {
              success: getResponse.ok,
              status: getResponse.status,
              statusText: getResponse.statusText,
              category: getResponse.ok ? 'HEALTHY' : 'BOOT_SYNC_ANOMALY'
            };
          } catch (getError: any) {
            if (getError.name === 'AbortError') {
              tests.GET = {
                success: false,
                status: 0,
                statusText: 'Request aborted',
                category: 'ABORTED'
              };
            } else {
              tests.GET = {
                success: false,
                status: 0,
                statusText: getError.message,
                category: 'NETWORK_ISSUE'
              };
            }
          }
          
          // POST Test (Minimal Request)
          try {
            const postResponse = await fetch(`https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/${endpoint.name}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                pageText: testStoryText,
                userInfo: buildUserInfo(),
                sessionId: "test-session",
                pageNumber: 1,
                // Add required flags for ai-visual-scene-creator
                ...(endpoint.name === 'ai-visual-scene-creator' ? { isDebugMode: true } : {})
              })
            });
            
            let category = 'HEALTHY';
            if (postResponse.status === 503) {
              category = 'BOOT_SYNC_ANOMALY';
            } else if (postResponse.status >= 500) {
              category = 'RUNTIME_ERROR';
            } else if (postResponse.status === 404) {
              category = 'DEPLOYMENT_ISSUE';
            }
            
            tests.POST = {
              success: postResponse.ok || postResponse.status < 500,
              status: postResponse.status,
              statusText: postResponse.statusText,
              category
            };
          } catch (postError: any) {
            tests.POST = {
              success: false,
              status: 0,
              statusText: postError.message,
              category: 'NETWORK_ISSUE'
            };
          }
          
          const responseTime = Date.now() - endpointStartTime;
          
          // Overall assessment - FIXED: Handle abort cases
          const wasAborted = tests.GET.category === 'ABORTED' || tests.POST.category === 'ABORTED';
          const overallSuccess = !wasAborted && tests.GET.success && tests.POST.success;
          const overallCategory = wasAborted ? 'ABORTED' :
            (tests.GET.category === 'HEALTHY' && tests.POST.category === 'HEALTHY' 
              ? 'HEALTHY' 
              : tests.POST.category); // POST reveals more issues
          
          let humanReadableReason = '';
          if (wasAborted) {
            humanReadableReason = 'Test was aborted (Reset button pressed)';
          } else if (overallSuccess) {
            humanReadableReason = `${endpoint.type} - Both GET and POST working`;
          } else if (tests.GET.success && !tests.POST.success) {
            const bootExpected = endpoint.architecture === 'RECEPTIONIST_PATTERN' ? 
              'Can have boot failures (has receptionist)' : 
              'Should not have boot failures (pure .ts)';
            humanReadableReason = `Boot OK but runtime issues (${tests.POST.category}) - ${bootExpected}`;
          } else if (!tests.GET.success && !tests.POST.success) {
            humanReadableReason = `Complete failure (${overallCategory}) - ${endpoint.type}`;
          } else {
            humanReadableReason = `Mixed results - ${overallCategory}`;
          }
          
          return { 
            endpoint: endpoint.name, 
            success: overallSuccess,
            responseTime,
            humanReadableReason,
            category: overallCategory,
            architecture: endpoint.architecture,
            type: endpoint.type,
            tests
          };
        })
      );

      const processingTime = Date.now() - startTime;
      const successfulConnections = connectivityResults.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      setResults([{
        tier: 'connectivity-test-enhanced',
        success: successfulConnections > 0,
        imageURL: null,
        details: {
          processingTime,
          successfulConnections,
          totalEndpoints: endpoints.length,
          testType: 'ENHANCED_CONNECTIVITY', // Enhanced test type
          endpointResults: connectivityResults.map(result => 
            result.status === 'fulfilled' ? result.value : { 
              endpoint: 'unknown', 
              success: false, 
              error: result.reason?.message || 'Unknown error',
              humanReadableReason: 'Test execution failed',
              category: 'NETWORK_ISSUE'
            }
          )
        }
      }]);
    } catch (error) {
      DebugLogger.error('image', '❌ Connectivity test failed', { error });
      setResults([{
        tier: 'connectivity-error',
        success: false,
        imageURL: null,
        details: { 
          error: error.message,
          testType: 'CONNECTIVITY'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Test Architecture Awareness - Different payload structures for mixed architectures
  const testArchitectureAwareness = async () => {
    if (!testStoryText.trim()) {
      alert('Please enter story text first');
      return;
    }

    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🏗️ Testing mixed architecture cascade flow');
      
      // Updated tier configurations to handle mixed architectures
      const tierConfigurations = [
        {
          name: 'Tier 1 (via Orchestrator)', 
          function: 'runware-generate-image',
          architecture: 'PURE_TYPESCRIPT',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session',
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium'
          }
        },
        {
          name: 'Direct Mode (AI Scene Creator)', 
          function: 'ai-visual-scene-creator',
          architecture: 'PURE_TYPESCRIPT',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session',
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            isDebugMode: true,
            directMode: true
          }
        },
        {
          name: 'Template 2.5A (Complexity A)',
          function: 'runware-template-ab',
          architecture: 'RECEPTIONIST_PATTERN',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session',
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium',
            templateComplexity: 'A'
          }
        },
        {
          name: 'Template 2.5B (Complexity B)',
          function: 'runware-template-ab',
          architecture: 'RECEPTIONIST_PATTERN',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session',
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium',
            templateComplexity: 'B'
          }
        },
        {
          name: 'Template 2.5C (Complexity C)',
          function: 'runware-template-cd',
          architecture: 'RECEPTIONIST_PATTERN',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session', 
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium',
            templateComplexity: 'C'
          }
        },
        {
          name: 'Template 2.5D (Complexity D)',
          function: 'runware-template-cd',
          architecture: 'RECEPTIONIST_PATTERN',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session', 
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium',
            templateComplexity: 'D'
          }
        }
      ];

      const testResults: TestResult[] = [];
      
      for (const tier of tierConfigurations) {
        const tierStartTime = Date.now();
        let tierResult: TestResult;

        try {
          DebugLogger.log('image', `Testing ${tier.name} (${tier.architecture})`);

          const { data, error } = await supabase.functions.invoke(tier.function, {
            body: tier.payload
          });

          const processingTime = Date.now() - tierStartTime;
          
          // Only categorize error if there actually is an error
          const { category, probableCause, errorType } = error ? 
            categorizeError(error, tier.function, data) : 
            { category: 'SUCCESS', probableCause: 'Test completed successfully', errorType: 'RUNTIME_ERROR' as const };

          if (data?.success && data?.imageURL) {
            tierResult = {
              tier: tier.name,
              success: true,
              imageURL: data.imageURL,
              details: {
                processingTime,
                testType: 'REAL',
                errorCategory: 'SUCCESS',
                architecture: tier.architecture,
                requestId: data.requestId,
                usedTier: data.usedTier || data.tier,
                tier: data.tier,
                
                // Architecture-specific display fields
                primaryScene: data.primaryScene,
                templateStructure: data.templateStructure,
                
                // Orchestrator-specific fields
                nextAction: data.nextAction,
                recommendedAction: data.recommendedAction,
                
                // Show payload structure used
                payloadStructure: Object.keys(tier.payload).join(', '),
                expectedArchitecture: tier.architecture
              }
            };
          } else {
            throw new Error(error?.message || `No image returned from ${tier.name}`);
          }
        } catch (error: any) {
          const processingTime = Date.now() - tierStartTime;
          const { category, probableCause, errorType } = categorizeError(error, tier.function);

          tierResult = {
            tier: tier.name,
            success: false,
            details: {
              processingTime,
              testType: 'REAL',
              error: error?.message || 'Unknown error',
              probableCause,
              errorCategory: category as any,
              errorType,
              architecture: tier.architecture,
              
              // Show architecture mismatch indicators
              payloadStructure: Object.keys(tier.payload).join(', '),
              expectedArchitecture: tier.architecture,
              
              // Detect potential orchestrator guidance
              orchestratorGuidance: error?.message?.includes('TRY_DIRECT_MODE') ? 'TRY_DIRECT_MODE' : null
            }
          };
        }

        testResults.push(tierResult);
        setResults([...testResults]); // Update UI progressively
      }

      DebugLogger.log('image', '✅ Architecture awareness test completed', {
        totalTests: testResults.length,
        successCount: testResults.filter(r => r.success).length
      });

    } catch (error: any) {
      DebugLogger.error('image', '❌ Architecture awareness test failed', { error });
      
      setResults([{
        tier: 'architecture-test-error',
        success: false,
        details: { 
          error: error.message,
          testType: 'REAL',
          errorCategory: 'INTERNAL',
          probableCause: 'Test framework error'
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Tier Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                👤 Prompt & User Info
                <Button
                  onClick={resetTester}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Child's name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Age</label>
                <Input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="Age"
                  min="3"
                  max="17"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar Type</label>
                <Select value={avatarType} onValueChange={setAvatarType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">Boy</SelectItem>
                    <SelectItem value="girl">Girl</SelectItem>
                    <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Tone</label>
                <Select value={skinTone} onValueChange={setSkinTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pale">Pale</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="olive">Olive</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Native Language</label>
                <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2)</SelectItem>
                    <SelectItem value="easy">Easy (0-2)</SelectItem>
                    <SelectItem value="medium">Medium (0-2)</SelectItem>
                    <SelectItem value="hard">Hard (3-4)</SelectItem>
                    <SelectItem value="expert">Expert (3-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Style Framework Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Style Framework Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Selected Difficulty:</span>
                  <Badge variant="outline" className="text-sm">
                    {difficultyLevel} ({['beginner', 'easy', 'medium'].includes(difficultyLevel) ? '0-2' : '3-4'})
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="font-medium">Framework Name:</span>
                  <div className="text-sm bg-blue-50 p-2 rounded">
                    {['beginner', 'easy', 'medium'].includes(difficultyLevel) 
                      ? 'Contemporary Children\'s Book Illustration' 
                      : '2.9D Rendered Illustration'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="font-medium">Framework Category:</span>
                  <div className="text-sm">
                    {['beginner', 'easy', 'medium'].includes(difficultyLevel) 
                      ? '🎨 Levels 0-2: Traditional children\'s book style with contemporary elements' 
                      : '🎯 Levels 3-4: Semi-realistic 2.9D rendering with advanced lighting'}
                  </div>
                </div>
                
                <details className="border rounded p-2">
                  <summary className="cursor-pointer font-medium">Framework Prompt Preview</summary>
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
                    {['beginner', 'easy', 'medium'].includes(difficultyLevel) 
                      ? 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting'
                      : '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting'}
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          <div>
            <label className="text-sm font-medium mb-2 block">Test Story Text</label>
            <Textarea
              value={testStoryText}
              onChange={(e) => setTestStoryText(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter story text for testing..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={testAISceneCreator}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Test AI Scene Creator
            </Button>
            
            <Button
              onClick={forceTier1FullPrompt}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary"
            >
              <Camera className="h-4 w-4" />
              Force Tier 1 (Full Prompt)
            </Button>
            
            <Button
              onClick={debugRealRouting}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Debug Real Routing
            </Button>
            
            <Button
              onClick={() => forceTier('2.5A')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5A
            </Button>
            
            <Button
              onClick={() => forceTier('2.5B')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5B
            </Button>
            
            <Button
              onClick={() => forceTier('2.5C')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5C
            </Button>
            
            <Button
              onClick={() => forceTier('2.5D')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 2.5D
            </Button>
            
            <Button
              onClick={testConnectivity}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              Test Connectivity
            </Button>
            
            <Button
              onClick={testArchitectureAwareness}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Test Architecture Cascade
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <div className="ml-2">
                <div>Running test...</div>
                {currentTestProgress && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentTestProgress}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
          {/* Data Flow Trace Visualization */}
          {results.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Data Flow Trace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    End-to-end tracing of the last test execution showing data transformation and routing decisions.
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">1. User Input</h4>
                    <div className="text-xs space-y-1">
                      <div><strong>Story Text:</strong> {testStoryText.substring(0, 100)}...</div>
                      <div><strong>User Name:</strong> {userName}</div>
                      <div><strong>Age:</strong> {userAge}</div>
                      <div><strong>Difficulty:</strong> {difficultyLevel}</div>
                      <div><strong>Avatar:</strong> {avatarType} ({skinTone})</div>
                      <div><strong>Language:</strong> {nativeLanguage}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">2. Style Framework Selection</h4>
                    <div className="text-xs space-y-1">
                      <div><strong>Selected Framework:</strong> {['beginner', 'easy', 'medium'].includes(difficultyLevel) 
                        ? 'Contemporary Children\'s Book Illustration' 
                        : '2.9D Rendered Illustration'}</div>
                      <div><strong>Level Category:</strong> {['beginner', 'easy', 'medium'].includes(difficultyLevel) ? '0-2' : '3-4'}</div>
                      <div><strong>Framework Choice Reason:</strong> Based on difficulty level "{difficultyLevel}"</div>
                    </div>
                  </div>
                  
                  {results[0] && (
                    <div className="bg-purple-50 p-4 rounded border">
                      <h4 className="font-medium mb-2">3. Processing Pipeline</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Executed Tier:</strong> {results[0].tier}</div>
                        <div><strong>Success:</strong> {results[0].success ? '✅ Yes' : '❌ No'}</div>
                        <div><strong>Processing Time:</strong> {results[0].details.processingTime}ms</div>
                        {results[0].details.testType && (
                          <div><strong>Test Type:</strong> {results[0].details.testType}</div>
                        )}
                        {results[0].details.styleFramework && (
                          <div><strong>Style Framework Used:</strong> {results[0].details.styleFramework}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {results[0] && results[0].imageURL && (
                    <div className="bg-yellow-50 p-4 rounded border">
                      <h4 className="font-medium mb-2">4. Final Output</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Image Generated:</strong> ✅ Yes</div>
                        <div><strong>Image URL:</strong> <span className="font-mono">{typeof results[0].imageURL === 'string' ? results[0].imageURL.substring(0, 50) : String(results[0].imageURL).substring(0, 50)}...</span></div>
                        {results[0].details.positivePrompt && (
                          <div><strong>Prompt Length:</strong> {results[0].details.positivePrompt.length} characters</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.tier}</span>
                      <span className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.success ? "✅" : "❌"}
                      </span>
                      {/* Test Type Badge */}
                      {result.details.testType && (
                        <Badge variant={
                          result.details.testType === 'REAL' ? 'default' :
                          result.details.testType === 'FORCED' ? 'secondary' :
                          result.details.testType === 'CONNECTIVITY' ? 'outline' :
                          result.details.testType === 'E2E_SIMULATION' ? 'default' : 'default'
                        }>
                          {result.details.testType}
                        </Badge>
                      )}
                      
                      {/* Enhanced Result Type Badge for E2E Simulation */}
                      {result.details.resultBadge && (
                        <Badge variant={
                          result.details.resultBadge === 'Orchestrator Success' ? 'default' :
                          result.details.resultBadge === 'Direct Mode Fallback' ? 'secondary' :
                          result.details.resultBadge === 'Tier Cascade Success' ? 'outline' :
                          result.details.resultBadge === 'Tier 4 Emergency' ? 'destructive' :
                          result.details.resultBadge === 'Complete Failure' ? 'destructive' : 'default'
                        } className={
                          result.details.resultBadge === 'Orchestrator Success' ? 'bg-green-100 text-green-800' :
                          result.details.resultBadge === 'Direct Mode Fallback' ? 'bg-blue-100 text-blue-800' :
                          result.details.resultBadge === 'Tier Cascade Success' ? 'bg-orange-100 text-orange-800' :
                          result.details.resultBadge === 'Tier 4 Emergency' ? 'bg-red-100 text-red-800' :
                          result.details.resultBadge === 'Complete Failure' ? 'bg-gray-100 text-gray-800' : ''
                        }>
                          {result.details.resultBadge}
                        </Badge>
                      )}
                      
                      {/* Template Complexity Badge - Shows all tier variants */}
                      {result.details.templateComplexity && (
                        <Badge variant={
                          result.details.templateComplexity === 'A' ? 'default' : 
                          result.details.templateComplexity === 'B' ? 'secondary' :
                          result.details.templateComplexity === 'C' ? 'outline' :
                          'destructive'
                        } className={
                          result.details.templateComplexity === 'A' ? 
                          'bg-green-600 text-white hover:bg-green-700' : 
                          result.details.templateComplexity === 'B' ? 
                          'bg-blue-600 text-white hover:bg-blue-700' :
                          result.details.templateComplexity === 'C' ?
                          'bg-orange-600 text-white hover:bg-orange-700' :
                          'bg-red-600 text-white hover:bg-red-700'
                        }>
                          {result.details.templateComplexity === 'A' ? '🎨 Premium Template (2.5A)' : 
                           result.details.templateComplexity === 'B' ? '📋 Basic Template (2.5B)' :
                           result.details.templateComplexity === 'C' ? '🔧 Nuclear Template (2.5C)' :
                           '🚨 Emergency Template (2.5D)'}
                        </Badge>
                      )}
                      
                      {/* AI Schema Generator Badge for ai-visual-scene-creator */}
                      {result.tier === 'AI Scene Creator' && (
                        <Badge variant="outline" className="bg-purple-600 text-white hover:bg-purple-700">
                          🎯 AI Schema Generator
                        </Badge>
                      )}
                      
                      {/* Tier 1 Success Badge */}
                      {result.details.templateStructure === 'COMPLETE_TIER_1' && (
                        <Badge variant="default" className="bg-green-600 text-white hover:bg-green-700">
                          ✅ Tier 1 Success
                        </Badge>
                      )}
                      
                      {/* Direct Mode Success Badge */}
                      {(result.tier === 'DIRECT_MODE' || result.details.templateStructure === 'DIRECT_MODE_SUCCESS') && (
                        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                          🚀 Direct Mode Success
                        </Badge>
                      )}
                      
                      {/* Tier 1 Failed Badge */}
                      {(result.tier === 'TIER_1_FAILED' || result.details.templateStructure === 'TIER_1_FAILED') && (
                        <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700">
                          ❌ Tier 1 Failed
                        </Badge>
                      )}
                    </div>
                    {result.details.processingTime && (
                      <span className="text-sm text-muted-foreground">
                        {result.details.processingTime}ms
                      </span>
                    )}
                  </div>

                  {result.imageURL && (
                    <div className="mb-4">
                      <img 
                        src={result.imageURL} 
                        alt="Generated test image" 
                        className="max-w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {result.details.requestId && (
                      <div className="text-sm">
                        <span className="font-medium">Request ID:</span> {result.details.requestId}
                      </div>
                    )}
                    
                     {/* Enhanced AI Scene Creator Details with Comprehensive Debug Display */}
                     {result.details.sceneGenerationOnly && (
                       <div className="text-sm">
                         <span className="font-medium text-blue-600">Scene Generation Only (No Image)</span>
                       </div>
                     )}
                     
                     {/* OpenAI Interaction Details */}
                     {result.details.debug?.openaiInteraction && (
                       <details className="text-sm border rounded p-2 bg-blue-50 mb-2">
                         <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                           🤖 OpenAI Interaction Details
                         </summary>
                         <div className="mt-2 space-y-2">
                           <div>
                             <span className="font-medium">Model Used:</span>
                             <Badge variant="default" className="ml-2">
                               {result.details.debug.openaiInteraction.model}
                             </Badge>
                           </div>
                           {result.details.debug.openaiInteraction.tokenUsage && (
                             <div className="text-xs">
                               <span className="font-medium">Token Usage:</span>
                               <div className="ml-2 mt-1 grid grid-cols-3 gap-2 text-xs">
                                 <span className="bg-green-100 px-2 py-1 rounded">
                                   Prompt: {result.details.debug.openaiInteraction.tokenUsage.prompt_tokens}
                                 </span>
                                 <span className="bg-blue-100 px-2 py-1 rounded">
                                   Completion: {result.details.debug.openaiInteraction.tokenUsage.completion_tokens}
                                 </span>
                                 <span className="bg-purple-100 px-2 py-1 rounded">
                                   Total: {result.details.debug.openaiInteraction.tokenUsage.total_tokens}
                                 </span>
                               </div>
                             </div>
                           )}
                           {result.details.debug.systemPrompt && (
                             <details className="mt-2">
                               <summary className="cursor-pointer text-xs font-medium text-gray-600">
                                 📝 System Prompt ({result.details.debug.systemPrompt.length} chars)
                               </summary>
                               <pre className="text-xs bg-gray-50 p-2 rounded border mt-1 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                                 {result.details.debug.systemPrompt}
                               </pre>
                             </details>
                           )}
                           {result.details.debug.userPrompt && (
                             <details className="mt-2">
                               <summary className="cursor-pointer text-xs font-medium text-gray-600">
                                 👤 User Prompt ({result.details.debug.userPrompt.length} chars)
                               </summary>
                               <pre className="text-xs bg-gray-50 p-2 rounded border mt-1 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                                 {result.details.debug.userPrompt}
                               </pre>
                             </details>
                           )}
                         </div>
                       </details>
                     )}

                     {/* Cultural Context Details */}
                     {result.details.debug?.culturalContext && (
                       <details className="text-sm border rounded p-2 bg-purple-50 mb-2">
                         <summary className="cursor-pointer font-medium text-purple-600 hover:text-purple-700">
                           🌍 Cultural Context & Character Consistency
                         </summary>
                         <div className="mt-2 space-y-2">
                           <div className="grid grid-cols-2 gap-2 text-xs">
                             <div>
                               <span className="font-medium">Native Language:</span>
                               <Badge variant="outline" className="ml-2">
                                 {result.details.debug.culturalContext.nativeLanguage}
                               </Badge>
                             </div>
                             <div>
                               <span className="font-medium">Skin Tone:</span>
                               <Badge variant="outline" className="ml-2">
                                 {result.details.debug.culturalContext.skinTone}
                               </Badge>
                             </div>
                             <div>
                               <span className="font-medium">Avatar Type:</span>
                               <Badge variant="outline" className="ml-2">
                                 {result.details.debug.culturalContext.avatarType}
                               </Badge>
                             </div>
                             <div>
                               <span className="font-medium">Multicultural:</span>
                               <Badge variant={result.details.debug.culturalContext.isMulticultural ? "default" : "secondary"} className="ml-2">
                                 {result.details.debug.culturalContext.isMulticultural ? "Yes" : "No"}
                               </Badge>
                             </div>
                           </div>
                           <div className="text-xs">
                             <span className="font-medium">Cultural Enhancements:</span>
                             <div className="ml-2 mt-1 bg-white p-2 rounded border">
                               {result.details.debug.culturalContext.culturalEnhancements}
                             </div>
                           </div>
                           <div className="text-xs">
                             <span className="font-medium">Character Consistency:</span>
                             <Badge variant={result.details.debug.culturalContext.characterConsistency === 'applied' ? "default" : "secondary"} className="ml-2">
                               {result.details.debug.culturalContext.characterConsistency}
                             </Badge>
                           </div>
                         </div>
                       </details>
                     )}

                     {result.details.primaryScene && (
                       <div className="text-sm">
                         <span className="font-medium">Primary Scene:</span>
                         <div className="text-xs mt-1 bg-blue-50 p-2 rounded">{result.details.primaryScene}</div>
                       </div>
                     )}
                      {result.details.aiSchema && (
                        <div className="text-sm">
                          <span className="font-medium">AI Schema Details:</span>
                          <div className="text-xs mt-1 space-y-1">
               {result.details.aiSchema?.setting && <div><strong>Setting:</strong> {result.details.aiSchema.setting}</div>}
               {result.details.aiSchema?.action && <div><strong>Action:</strong> {result.details.aiSchema.action}</div>}
               {result.details.aiSchema?.mood && <div><strong>Mood:</strong> {result.details.aiSchema.mood}</div>}
               {result.details.aiSchema?.pose && <div><strong>Pose:</strong> {result.details.aiSchema.pose}</div>}
                          </div>
                        </div>
                      )}

                      {/* Full Schema Output Expandable Section */}
                      {result.details.aiSchema && (
                        <details className="text-sm border rounded p-2 bg-gray-50">
                          <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                            Full Schema Output (Expandable)
                          </summary>
                          <div className="mt-2">
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-48 overflow-y-auto">
                              {result.details.aiSchema ? JSON.stringify(result.details.aiSchema, null, 2) : 'No schema data'}
                            </pre>
                          </div>
                        </details>
                      )}

                      {/* Enhanced Runware Prompt Display Section - Now shows prompts for ALL successes */}
                      {(result.success && (result.details.positivePrompt || result.details.negativePrompt || result.details.enhancedPrompt || result.details.originalPrompt)) && (
                        <div className="text-sm border rounded p-2 bg-green-50">
                          <span className="font-medium text-green-700">
                            🎯 Full Prompts Sent to Runware - 
                            {result.details.templateStructure === 'COMPLETE_TIER_1' && ' (Tier 1 Success)'}
                            {result.details.templateStructure === 'DIRECT_MODE_SUCCESS' && ' (Direct Mode Success)'}
                          </span>
                          
                          {/* Enhanced Prompt Source Indicator */}
                          <div className="mt-1 text-xs">
                            <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                              {result.details.templateStructure === 'COMPLETE_TIER_1' ? '🎯 Enhanced by Orchestrator' : 
                               result.details.templateStructure === 'DIRECT_MODE_SUCCESS' ? '🚀 Built by Direct Mode' : 
                               '📝 Generated Prompt'}
                            </span>
                          </div>
                          
                          {/* Positive Prompt (Enhanced Prompt sent to Runware) */}
                          {result.details.positivePrompt && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs font-medium text-blue-600">
                                ✨ Positive Prompt ({result.details.positivePrompt.length} chars) - Sent to Runware
                              </summary>
                              <div className="mt-1">
                                <pre className="text-xs bg-blue-50 p-2 rounded border overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                                  {result.details.positivePrompt}
                                </pre>
                              </div>
                            </details>
                          )}

                          {/* Enhanced Negative Prompt with NO TEXT badge */}
                          {result.details.negativePrompt && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs font-medium text-red-600 flex items-center gap-2">
                                🛡️ Negative Prompt ({result.details.negativePrompt.length} chars) - Nuclear Negative
                                {result.details.negativePrompt.includes('NO TEXT') && (
                                  <Badge variant="destructive" className="text-xs">NO TEXT</Badge>
                                )}
                                {result.details.negativePrompt.includes('(especially for Emma)') && (
                                  <Badge variant="secondary" className="text-xs">EMMA</Badge>
                                )}
                              </summary>
                              <div className="mt-1">
                                <pre className="text-xs bg-red-50 p-2 rounded border overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                                  {result.details.negativePrompt}
                                </pre>
                              </div>
                            </details>
                          )}

                          {/* Enhanced Prompt Structure Display with Success Indicators */}
                          {result.details.enhancedPrompt && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs font-medium text-green-600 flex items-center gap-2">
                                📝 Enhanced Prompt ({result.details.enhancedPrompt.length} chars)
                                {result.details.templateStructure === 'COMPLETE_TIER_1' && (
                                  <Badge variant="default" className="text-xs bg-green-600">✅ TIER 1 COMPLETE</Badge>
                                )}
                                {result.details.templateStructure === 'DIRECT_MODE_SUCCESS' && (
                                  <Badge variant="secondary" className="text-xs bg-blue-600">🚀 DIRECT MODE</Badge>
                                )}
                                {result.details.templateStructure === 'TIER_1_FAILED' && (
                                  <Badge variant="destructive" className="text-xs">❌ TIER 1 FAILED</Badge>
                                )}
                                {result.details.templateStructure === 'FAILED' && (
                                  <Badge variant="destructive" className="text-xs">TEMPLATE FAILED</Badge>
                                )}
                              </summary>
                              <div className="mt-1">
                                <pre className="text-xs bg-green-50 p-2 rounded border overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                                  {result.details.enhancedPrompt}
                                </pre>
                              </div>
                            </details>
                          )}

                          {/* Style Framework */}
                          {result.details.styleFramework && (
                            <div className="mt-2 text-xs">
                              <span className="font-medium text-purple-600">🎨 Style Framework:</span>
                              <span className="ml-2 bg-purple-100 px-2 py-1 rounded text-purple-700">
                                {result.details.styleFramework}
                              </span>
                            </div>
                          )}

                          {/* Prompt Length Stats */}
                          {result.details.promptLengths && (
                            <div className="mt-2 text-xs">
                              <span className="font-medium text-gray-600">📊 Prompt Stats:</span>
                              <div className="ml-2 mt-1 flex flex-wrap gap-2">
                                {result.details.promptLengths.original && (
                                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                                    Original: {result.details.promptLengths.original} chars
                                  </span>
                                )}
                                {result.details.promptLengths.enhanced && (
                                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                                    Enhanced: {result.details.promptLengths.enhanced} chars
                                  </span>
                                )}
                                {result.details.promptLengths.negative && (
                                  <span className="bg-red-100 px-2 py-1 rounded text-red-700">
                                    Negative: {result.details.promptLengths.negative} chars
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Fallback: Original Prompt (for backwards compatibility) */}
                          {!result.details.positivePrompt && result.details.originalPrompt && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs font-medium text-gray-600">
                                📝 Original Input ({result.details.originalPrompt.length} chars)
                             </summary>
                             <div className="mt-1 text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                               {result.details.originalPrompt}
                             </div>
                           </details>
                         )}
                        </div>
                      )}
                    
                    {/* Enhanced Routing Analysis */}
                    {result.details.realRoutingFlow && (
                      <div className="text-sm">
                        <span className="font-medium text-purple-600">Real Routing Analysis</span>
                      </div>
                    )}
                    {result.details.fallbackReason && (
                      <div className="text-sm">
                        <span className="font-medium">Fallback Reason:</span>
                        <div className="text-xs mt-1 bg-yellow-50 p-2 rounded text-yellow-800">{result.details.fallbackReason}</div>
                      </div>
                    )}
                    {result.details.routingCascade && (
                      <div className="text-sm">
                        <span className="font-medium">Routing Cascade:</span>
                        <div className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          {result.details.routingCascade.map((step: string, index: number) => (
                            <div key={index} className="mb-1">{step}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.details.avatarAnalysis && (
                      <div className="text-sm">
                        <span className="font-medium">Avatar Completeness:</span>
                        <div className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          <div>Score: {Math.round(result.details.avatarAnalysis.completeness * 100)}%</div>
                          <div>Present: {result.details.avatarAnalysis.presentFields.join(', ')}</div>
                          {result.details.avatarAnalysis.missingFields.length > 0 && (
                            <div className="text-red-600">Missing: {result.details.avatarAnalysis.missingFields.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Forced Tier Indicator */}
                    {result.details.fullPromptFlow && (
                      <div className="text-sm">
                        <span className="font-medium text-green-600">Complete Tier 1 Flow (Forced)</span>
                      </div>
                    )}
                    
                    {result.details.routingMetadata && !result.details.realRoutingFlow && (
                      <div className="text-sm">
                        <span className="font-medium">Routing Metadata:</span>
                        <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details.routingMetadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {/* Enhanced Connectivity Results - supports both CONNECTIVITY and ENHANCED_CONNECTIVITY */}
                    {(result.details.testType === 'CONNECTIVITY' || result.details.testType === 'ENHANCED_CONNECTIVITY') && result.details.endpointResults && (
                      <div className="text-sm">
                        <span className="font-medium">Endpoint Status Details:</span>
                        <div className="text-xs mt-2 space-y-2">
                          {result.details.endpointResults.map((endpoint: any, idx: number) => (
                            <div key={idx} className="border rounded p-2 bg-gray-50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-blue-600">{endpoint.endpoint}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant={endpoint.success ? 'default' : 'destructive'}>
                                    {endpoint.success ? 'HEALTHY' : 'FAILED'}
                                  </Badge>
                                  {endpoint.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {endpoint.category}
                                    </Badge>
                                  )}
                                  {endpoint.responseTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {endpoint.responseTime}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Enhanced GET vs POST Results for ENHANCED_CONNECTIVITY */}
                              {endpoint.tests && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="border rounded p-2 bg-blue-50">
                                    <div className="font-medium text-blue-700 text-xs">GET (Health Check)</div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className={endpoint.tests.GET.success ? "text-green-600" : "text-red-600"}>
                                        {endpoint.tests.GET.success ? "✅" : "❌"}
                                      </span>
                                      <span className="text-xs">Status {endpoint.tests.GET.status}</span>
                                      <Badge variant="outline" className="text-xs">{endpoint.tests.GET.category}</Badge>
                                    </div>
                                  </div>
                                  <div className="border rounded p-2 bg-green-50">
                                    <div className="font-medium text-green-700 text-xs">POST (Runtime Test)</div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className={endpoint.tests.POST.success ? "text-green-600" : "text-red-600"}>
                                        {endpoint.tests.POST.success ? "✅" : "❌"}
                                      </span>
                                      <span className="text-xs">Status {endpoint.tests.POST.status}</span>
                                      <Badge variant="outline" className="text-xs">{endpoint.tests.POST.category}</Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Legacy status display for old CONNECTIVITY tests */}
                              {!endpoint.tests && endpoint.status && (
                                <div className="text-xs">
                                  <strong>HTTP Status:</strong> {endpoint.status} {endpoint.statusText}
                                </div>
                              )}
                              
                              <div className="text-xs">
                                <strong>Assessment:</strong> {endpoint.humanReadableReason}
                              </div>
                              {endpoint.error && (
                                <div className="text-xs text-red-600">
                                  <strong>Error:</strong> {endpoint.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                     )}
                     
                     {/* E2E Simulation Cascade History and Fallback Path */}
                     {result.details.testType === 'E2E_SIMULATION' && (
                       <>
                         {/* Fallback Path Summary */}
                         {result.details.fallbackPath && (
                           <div className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                             <span className="font-medium text-blue-800">🔄 E2E Flow Path:</span>
                             <div className="text-blue-700 text-xs mt-1 font-mono">
                               {result.details.fallbackPath}
                             </div>
                           </div>
                         )}
                         
                         {/* Cascade History */}
                         {result.details.cascadeHistory && result.details.cascadeHistory.length > 0 && (
                           <div className="text-sm bg-gray-50 p-3 rounded-lg border">
                             <span className="font-medium text-gray-800">📝 Cascade History:</span>
                             <div className="mt-2 space-y-1">
                               {result.details.cascadeHistory.map((step: string, idx: number) => (
                                 <div key={idx} className="text-xs text-gray-700 font-mono flex items-start gap-2">
                                   <span className="text-gray-400 min-w-[20px]">{idx + 1}.</span>
                                   <span className={
                                     step.includes('✅') ? 'text-green-600' :
                                     step.includes('❌') ? 'text-red-600' :
                                     step.includes('🔄') ? 'text-blue-600' :
                                     step.includes('🎯') ? 'text-purple-600' :
                                     'text-gray-700'
                                   }>
                                     {step}
                                   </span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                         
                         {/* Tier Failure History from Orchestrator */}
                         {result.details.tierFailureHistory && result.details.tierFailureHistory.length > 0 && (
                           <div className="text-sm bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                             <span className="font-medium text-orange-800">⚠️ Internal Tier Failures:</span>
                             <div className="text-orange-700 text-xs mt-1">
                               {result.details.tierFailureHistory.join(' → ')}
                             </div>
                           </div>
                         )}
                         
                         {/* Performance Breakdown for E2E */}
                         {(result.details.orchestratorFailureTime || result.details.directModeTime || result.details.tier4Time) && (
                           <div className="text-sm bg-purple-50 p-3 rounded-lg border">
                             <span className="font-medium text-purple-800">⏱️ Performance Breakdown:</span>
                             <div className="text-xs mt-1 space-y-1">
                               {result.details.orchestratorFailureTime && (
                                 <div>Orchestrator attempt: {result.details.orchestratorFailureTime}ms</div>
                               )}
                               {result.details.directModeTime && (
                                 <div>Direct Mode: {result.details.directModeTime}ms</div>
                               )}
                               {result.details.tier4Time && (
                                 <div>Tier 4 Emergency: {result.details.tier4Time}ms</div>
                               )}
                               <div className="font-medium">Total: {result.details.processingTime}ms</div>
                             </div>
                           </div>
                         )}
                       </>
                     )}

                      {result.details.error && (
                        <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200">
                          {/* Error Type Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-700">Error Details</span>
                            </div>
                            {result.details.errorType && (
                              <Badge 
                                variant="destructive" 
                                className="text-xs"
                              >
                                {result.details.errorType.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>

                          {/* Main Error Message */}
                          <div className="text-sm">
                            <span className="font-medium text-red-600">🚨 Error:</span>
                            <div className="text-red-600 text-xs mt-1 bg-white p-2 rounded border">
                              {typeof result.details.error === 'string'
                                ? result.details.error
                                : ((result.details.error as any)?.message || JSON.stringify(result.details.error))}
                            </div>
                          </div>

                          {/* Probable Cause */}
                          {result.details.probableCause && (
                            <div className="text-sm">
                              <span className="font-medium text-orange-600">📝 Probable Cause:</span>
                              <div className="text-orange-700 text-xs mt-1 bg-orange-50 p-2 rounded border-l-2 border-orange-300">
                                {result.details.probableCause}
                              </div>
                            </div>
                          )}

                          {/* Recovery Action - NEW */}
                          {(result.details as any).recoveryAction && (
                            <div className="text-sm">
                              <span className="font-medium text-green-600">🔧 Recovery Action:</span>
                              <div className="text-green-700 text-xs mt-1 bg-green-50 p-2 rounded border-l-2 border-green-300">
                                {(result.details as any).recoveryAction}
                              </div>
                            </div>
                          )}

                          {/* Architecture Context - NEW */}
                          {result.details.architecture && (
                            <div className="text-sm">
                              <span className="font-medium text-purple-600">📊 Architecture:</span>
                              <div className="text-xs mt-1 bg-purple-50 p-2 rounded">
                                <div className="flex justify-between">
                                  <span>Current: {result.details.architecture}</span>
                                  {result.details.expectedArchitecture && (
                                    <span>Expected: {result.details.expectedArchitecture}</span>
                                  )}
                                </div>
                                {result.details.payloadStructure && (
                                  <div className="mt-1 text-purple-600">
                                    Format: {result.details.payloadStructure}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Direct Function Logs Access - NEW */}
                          <div className="flex flex-wrap gap-2">
                            {result.tier.includes('ai-visual-scene-creator') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => window.open(`https://supabase.com/dashboard/project/cpzeuogomaixamrtnnmj/functions/ai-visual-scene-creator/logs`, '_blank')}
                              >
                                🔗 View AI Scene Creator Logs
                              </Button>
                            )}
                            {result.tier.includes('runware-generate-image') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => window.open(`https://supabase.com/dashboard/project/cpzeuogomaixamrtnnmj/functions/runware-generate-image/logs`, '_blank')}
                              >
                                🔗 View Runware Generator Logs
                              </Button>
                            )}
                            {result.tier.includes('runware-template-ab') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => window.open(`https://supabase.com/dashboard/project/cpzeuogomaixamrtnnmj/functions/runware-template-ab/logs`, '_blank')}
                              >
                                🔗 View Template AB Logs
                              </Button>
                            )}
                            {result.tier.includes('runware-template-cd') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => window.open(`https://supabase.com/dashboard/project/cpzeuogomaixamrtnnmj/functions/runware-template-cd/logs`, '_blank')}
                              >
                                🔗 View Template CD Logs
                              </Button>
                            )}
                          </div>

                          {/* Retry This Tier Button - NEW */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-8 bg-blue-50 hover:bg-blue-100 text-blue-700"
                            onClick={() => {
                              // Extract the tier name for retry
                              const tierName = result.tier;
                              setCurrentTestProgress(`Retrying ${tierName}...`);
                              // You could implement individual tier retry logic here
                              console.log(`Retrying tier: ${tierName}`);
                            }}
                          >
                            🔄 Retry This Tier Only
                          </Button>
                        </div>
                      )}
                     
                     {/* Enhanced Error Category Display */}
                     {result.details.errorCategory && result.details.errorCategory !== 'SUCCESS' && !result.details.error && (
                       <div className="text-sm">
                         <span className="font-medium text-orange-600">Error Category:</span>
                         <Badge 
                           variant="outline" 
                           className={`ml-1 text-xs ${
                             result.details.errorCategory === 'NETWORK' ? 'bg-red-50 text-red-700' :
                             result.details.errorCategory === 'TIMEOUT' ? 'bg-yellow-50 text-yellow-700' :
                             result.details.errorCategory === 'AUTH' ? 'bg-purple-50 text-purple-700' :
                             result.details.errorCategory === 'CONFIG' ? 'bg-blue-50 text-blue-700' :
                             'bg-gray-50 text-gray-700'
                           }`}
                         >
                           {result.details.errorCategory}
                         </Badge>
                       </div>
                     )}
                    
                    {/* NEW: Health Check Results Display */}
                    {result.details.healthCheck && (
                      <div className="text-sm">
                        <span className="font-medium text-purple-600">Health Check Results:</span>
                        <div className="text-xs mt-1 bg-purple-50 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <span>Endpoint: {result.details.healthCheck.endpoint}</span>
                            <Badge variant={result.details.healthCheck.available ? 'default' : 'destructive'}>
                              {result.details.healthCheck.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                            </Badge>
                          </div>
                          {result.details.healthCheck.responseTime && (
                            <div>Response Time: {result.details.healthCheck.responseTime}ms</div>
                          )}
                          {result.details.healthCheck.status && (
                            <div>HTTP Status: {result.details.healthCheck.status}</div>
                          )}
                          <div>Triage Result: {result.details.healthCheck.triageResult}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Test Type Indicator with color coding */}
                    {result.details.testType && (
                      <div className="text-sm">
                        <span className="font-medium">Test Type:</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-1 text-xs ${
                            result.details.testType === 'HEALTH' ? 'bg-green-50 text-green-700' :
                            result.details.testType === 'TRIAGE' ? 'bg-purple-50 text-purple-700' :
                            result.details.testType === 'FORCED' ? 'bg-yellow-50 text-yellow-700' :
                            result.details.testType === 'REAL' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {result.details.testType}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageTierTester;