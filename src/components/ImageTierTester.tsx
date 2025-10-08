import { useState, useRef } from 'react';
// FIX: 2025-09-20 - React object rendering error fixed by proper aiSchema property access
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CCSStatusDisplay } from '@/components/CCSStatusDisplay';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExpandableText } from '@/components/ui/ExpandableText';
import { supabase } from '@/integrations/supabase/client';
import { extractImageUrl, extractSuccessValue } from '@/utils/typeGuards';
import { DebugLogger } from '@/services/DebugLogger';
import { HealthCheckService } from '@/services/HealthCheckService';
import { ImageFallbackService } from '@/services/ImageFallbackService';
import { Sparkles, Zap, Network, Search, Camera, RefreshCw, RotateCcw, Clock, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { SimpleImageService } from '@/services/SimpleImageService';
import { TimerToggleItem } from '@/components/ui/timer-toggle-item';
import { NetflixSessionManager } from '@/services/NetflixSessionManager';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';

interface TestResult {
  tier: string;
  success: boolean;
  isFallback?: boolean; // NEW: Indicates Direct Mode fallback scenario
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
    testType?: 'REAL' | 'FORCED' | 'CONNECTIVITY' | 'ENHANCED_CONNECTIVITY' | 'HEALTH' | 'TRIAGE' | 'TIER_1_COMPLETE_FLOW' | 'TIER_1_FORCE_TEST' | 'FORCED_TEMPLATE_BYPASS' | 'E2E_SIMULATION'; // Enhanced test types
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
    // COMPREHENSIVE DEBUG PLAN: OpenAI and Runware debug data
    aiDebugSchema?: any; // Full OpenAI request debug data including prompts and character data
    promptSource?: string; // Where prompts were extracted from
    promptExtractionSuccess?: boolean; // Whether prompt extraction succeeded
    orchestratorDebugData?: any; // Full orchestrator debug data
    directModeDebugData?: any; // Full direct mode debug data
    rawPromptData?: any; // Raw prompt data for debugging
    tier1Validation?: { // Tier 1 force mode validation
      expectedStructure: string;
      actualStructure?: string;
      success: boolean;
      forcedFailure: boolean;
      cascadeBlocked?: boolean;
    };
    errorDetails?: { // Force mode error details
      message: string;
      stack?: string;
      timestamp: string;
      tier1ErrorLog?: Array<{ // Timeline of Tier 1 execution steps
        step: string;
        status: 'attempt' | 'success' | 'failed' | 'skipped';
        message: string;
        at: string;
      }>;
      componentFailures?: {
        orchestratorHealth: boolean;
        characterConsistencyAvailable: boolean;
        aiVisualSceneCreatorAvailable: boolean;
      };
      failureType?: string;
      attemptedPrompts?: any;
    };
    // CCS Status Tracking (Enhanced Visibility)
    ccsBootStatus?: {
      loaded: boolean;
      tier1: boolean;
      tier25: boolean;
      directMode: boolean;
    };
    precomputedCCSUsed?: boolean | null; // Fast path vs legacy path indicator
    ccsMethodStatus?: Record<string, string>; // Method-specific status
    ccsFallbacksActive?: string[]; // Active fallbacks
    ccsImportSource?: string; // Import source (_shared/_vendor/inline/unavailable)
    hasCharacterConsistency?: boolean; // Overall CCS status
    ccsStatus?: {
      tier1Loaded: boolean;
      tier25Loaded: boolean;
      directModeLoaded: boolean;
    };
    metadata?: any; // Metadata object containing nested CCS data
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
  
  // Smart Bypass control removed - now tied to user tier (guests=ON, premium=OFF)
  
  // User tier control for testing
  const [userTier, setUserTier] = useState<'premium' | 'guest'>('guest');

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
        culturalProfile: (nativeLanguage && nativeLanguage !== 'en') ? nativeLanguage : undefined,
        userTier: userTier // Add user tier for Smart Bypass
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
        culturalProfile: undefined,
        userTier: 'guest' // Default to guest tier
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
          aiDebugSchema: response.data?.aiDebugSchema, // NEW: Full OpenAI debug data
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


  // PLAN B: Force Tier 1 removed - now using simplified forceTier('1') pattern

  // Debug Real Routing - FIXED: Add health check first, then bypass logic, then orchestrator
  const debugRealRouting = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      DebugLogger.log('image', '🔍 E2E Real Routing: Health Check → Orchestrator → Direct Mode → Tier Cascade → SVG Fallback', {
        userInfo: buildUserInfo()
      });

      const globalStartTime = Date.now();
      const userInfo = buildUserInfo();
      
      // REAL USER SESSION MANAGEMENT: Match actual user experience
      const sessionId = userTier === 'guest' 
        ? NetflixSessionManager.getOrCreateSession(userInfo.name)
        : generateSessionIdWithPrefix('premium');
      
      // Use raw story text directly - no protection enhancement
      const rawStoryText = testStoryText;
      
      let cascadeHistory = [];
      let finalResult = null;
      let resultBadge = '';
      let fallbackPath = '';
      let healthStatus = null;

      // Log session management
      cascadeHistory.push(`🔑 Session: ${sessionId.substring(0, 30)}... (${userTier} tier - matches real user experience)`);

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

       // STEP 2: Use real frontend routing (generateStoryImage - the actual user entry point)
       cascadeHistory.push('🚀 Using SimpleImageService.generateStoryImage (real user flow)...');
       cascadeHistory.push(`⚙️ Smart Bypass: ${userTier === 'guest' ? 'Enabled (Real Guest Experience)' : 'Disabled (Real Premium Experience)'}`);
       cascadeHistory.push('🎯 Attempting Tier 1 via Enhanced Character-First Flow (runware-generate-image)...');
       cascadeHistory.push(`⏰ ${new Date().toLocaleTimeString()}: Starting user image generation request`);
       const userFlowStartTime = Date.now();
      
      try {
        const result = await SimpleImageService.generateStoryImage(
          testStoryText,    // storyText - the actual story content
          userInfo,         // userInfo - user profile and preferences
          sessionId,        // sessionId - unique session identifier
          1,                // pageNumber - current story page
          userTier === 'premium', // isPremium - based on selected user tier
          false,            // forceTier1 - not forced
          userTier === 'guest' // smartBypassEnabled - guests get bypass ON, premium gets bypass OFF
        );

        const userFlowTime = Date.now() - userFlowStartTime;
        
        if (result.success) {
          // Check if cascade history is missing (indicates Smart Bypass or missing metadata)
          if (!result.metadata?.cascadeHistory || result.metadata.cascadeHistory.length === 0) {
            cascadeHistory.push('⚠️ No cascade history returned - Smart Bypass likely used or metadata missing');
          }
          
          // Extract actual cascade history from backend metadata
          if (result.metadata?.cascadeHistory && Array.isArray(result.metadata.cascadeHistory)) {
            cascadeHistory.push('🔄 Backend Cascade Tracking:');
            cascadeHistory.push(...result.metadata.cascadeHistory);
          } else {
            // Manual cascade history construction if not provided by backend
            if (result.metadata?.tier1FailureReason) {
              cascadeHistory.push(`❌ Tier 1 Failed: ${result.metadata.tier1FailureReason}`);
            }
          }
          
          // Determine actual successful tier and path
          const actualTier = result.metadata?.pathUsed || result.tier || 'Unknown';
          const wasFailover = result.metadata?.tier1FailureReason ? ' (Failover)' : '';
          
          // Enhanced Character-First Flow detection
          if (result.metadata?.templateStructure === 'COMPLETE_TIER_1') {
            cascadeHistory.push('✅ Enhanced Character-First Flow succeeded - COMPLETE_TIER_1 template generated');
            cascadeHistory.push(`🎭 Character Foundation: ${result.metadata?.hasCharacterSeed ? 'Established' : 'Missing'}`);
            cascadeHistory.push(`🌍 Cultural Bundle: ${result.metadata?.hasCulturalBundle ? 'Applied' : 'Missing'}`);
          } else if (result.metadata?.orchestratorFailed) {
            cascadeHistory.push(`❌ Orchestrator failed: ${result.metadata?.orchestratorFailureReason || 'Unknown reason'}`);
            cascadeHistory.push('🔄 Falling back to Direct Mode...');
          }
          
          cascadeHistory.push(`✅ Success via: ${actualTier}`);
          cascadeHistory.push(`⏰ ${new Date().toLocaleTimeString()}: Real user flow completed successfully`);
          
          // Enhanced character consistency diagnostics for BOTH Tier 1 AND Direct Mode
          const isTier1Success = actualTier.includes('TIER_1') || actualTier.includes('orchestrator') || actualTier.includes('Enhanced Character-First');
          const isDirectModeSuccess = actualTier.includes('DIRECT_MODE') || actualTier.includes('ai-visual-scene-creator');
          
          const ccErrors = result.metadata?.cascadeHistory?.filter((line: string) => 
            line.includes('structuredAvatarData') || 
            line.includes('CharacterConsistencyService') || 
            line.includes('CHARACTERSERVICE') ||
            line.includes('resilientLoader') ||
            line.includes('Import @supabase/supabase-js failed') ||
            line.includes('getSupabaseClient') ||
            line.includes('getCulturalEnhancements') ||
            line.includes('getCharacterAppearanceFromStory') ||
            line.includes('analyzeVisualDetails') ||
            line.includes('getColoredObjects') ||
            line.includes('Database connection') ||
            line.includes('CDN_IMPORT_FAILURE') ||
            line.includes('Emergency fallback') ||
            line.includes('hardcoded cultural bundle') ||
            line.includes('emergency structuredAvatarData')
          ) || [];
          
          // TIER 1 CCS DIAGNOSTICS (Enhanced with method-specific status)
          if (isTier1Success) {
            cascadeHistory.push('🔍 Tier 1 Character Consistency Status:');
            
            const ccsMethodStatus = result.metadata?.ccsMethodStatus || {};
            const hasMethodStatus = Object.keys(ccsMethodStatus).length > 0;
            const ccsImportSource = result.metadata?.ccsImportSource;
            
            if (hasMethodStatus) {
              cascadeHistory.push('   📊 CCS Method-Specific Status:');
              
              // Display each method's status
              Object.entries(ccsMethodStatus).forEach(([method, status]) => {
                const icon = status === 'success' ? '✅' : 
                             String(status).includes('fallback') ? '🟡' : '❌';
                cascadeHistory.push(`      ${icon} ${method}(): ${String(status).toUpperCase()}`);
              });
              
              // Overall status
              const allSuccess = Object.values(ccsMethodStatus).every(s => s === 'success');
              const hasFallbacks = Object.values(ccsMethodStatus).some(s => String(s).includes('fallback'));
              
              cascadeHistory.push('');
              if (allSuccess) {
                cascadeHistory.push('   ✅ Tier 1 CCS: FULLY OPERATIONAL');
              } else if (hasFallbacks) {
                cascadeHistory.push('   🟡 Tier 1 CCS: PARTIAL (Using Fallbacks)');
              } else {
                cascadeHistory.push('   ⚠️ Tier 1 CCS: DEGRADED');
              }
            } else if (result.metadata?.characterConsistencyActive === true) {
              cascadeHistory.push('   ✅ CCS Active and Working');
            } else if (ccErrors.length > 0) {
              cascadeHistory.push('   ⚠️ CCS Issues Detected');
              cascadeHistory.push('   📋 Tier 1 CCS Diagnostics:');
              
              // Categorize CC errors
              const dbErrors = ccErrors.filter(e => e.includes('getSupabaseClient') || e.includes('Database'));
              const importErrors = ccErrors.filter(e => e.includes('resilientLoader') || e.includes('Import') || e.includes('CDN'));
              const avatarErrors = ccErrors.filter(e => e.includes('structuredAvatarData') || e.includes('getCulturalEnhancements'));
              
              if (dbErrors.length > 0) {
                cascadeHistory.push('      🔴 Database Connection Issues:');
                dbErrors.forEach(error => cascadeHistory.push(`         • ${error}`));
                cascadeHistory.push('      💡 Check Supabase connection and RLS policies');
              }
              
              if (importErrors.length > 0) {
                cascadeHistory.push('      🔴 Import/Module Loading Failures:');
                importErrors.forEach(error => cascadeHistory.push(`         • ${error}`));
                cascadeHistory.push('      💡 Check CDN availability and module imports');
              }
              
              if (avatarErrors.length > 0) {
                cascadeHistory.push('      🔴 Avatar Data Generation Issues:');
                avatarErrors.forEach(error => cascadeHistory.push(`         • ${error}`));
                cascadeHistory.push('      💡 Verify CharacterConsistencyService initialization');
              }
            }
            
            // Import Source
            if (ccsImportSource) {
              cascadeHistory.push(`   📦 CCS Import Source: ${ccsImportSource}`);
            }
          }
          
          // DIRECT MODE CCS DIAGNOSTICS (Enhanced - show even when used)
          if (isDirectModeSuccess) {
            cascadeHistory.push('🔍 Direct Mode Character Consistency Analysis:');
            
            // CCS Import Status
            const ccsImportFailed = ccErrors.some(e => 
              e.includes('resilientLoader') || 
              e.includes('Import') || 
              e.includes('CDN_IMPORT_FAILURE')
            );
            
            if (ccsImportFailed) {
              cascadeHistory.push('   🔴 CCS Import/Module Loading: FAILED');
              const importIssues = ccErrors.filter(e => 
                e.includes('resilientLoader') || e.includes('Import') || e.includes('CDN')
              );
              importIssues.forEach(issue => cascadeHistory.push(`      • ${issue}`));
              cascadeHistory.push('      💡 Impact: HIGH - CCS unavailable, using fallbacks');
            } else {
              cascadeHistory.push('   ✅ CCS Import/Module Loading: SUCCESS');
            }
            
            // CCS Method-Specific Status
            cascadeHistory.push('   📊 CCS Method Status:');
            
            // analyzeVisualDetails
            const visualAnalysisFailed = ccErrors.some(e => e.includes('analyzeVisualDetails'));
            if (visualAnalysisFailed) {
              cascadeHistory.push('      🔴 analyzeVisualDetails(): FAILED');
              ccErrors.filter(e => e.includes('analyzeVisualDetails')).forEach(e => 
                cascadeHistory.push(`         • ${e}`)
              );
              cascadeHistory.push('      💡 Impact: MEDIUM - Visual consistency may be reduced');
            } else if (!ccsImportFailed) {
              cascadeHistory.push('      ✅ analyzeVisualDetails(): SUCCESS');
            }
            
            // getCulturalEnhancements
            const culturalFailed = ccErrors.some(e => e.includes('getCulturalEnhancements'));
            const culturalFallback = ccErrors.some(e => e.includes('hardcoded cultural bundle'));
            if (culturalFailed || culturalFallback) {
              cascadeHistory.push('      🟡 getCulturalEnhancements(): FALLBACK USED');
              if (culturalFallback) {
                cascadeHistory.push('         ⚡ Emergency hardcoded cultural bundle activated');
                cascadeHistory.push('      💡 Impact: LOW - Basic cultural context maintained');
              }
            } else if (!ccsImportFailed) {
              cascadeHistory.push('      ✅ getCulturalEnhancements(): SUCCESS');
            }
            
            // getCharacterAppearanceFromStory
            const appearanceFailed = ccErrors.some(e => e.includes('getCharacterAppearanceFromStory'));
            const appearanceFallback = ccErrors.some(e => e.includes('emergency structuredAvatarData'));
            if (appearanceFailed || appearanceFallback) {
              cascadeHistory.push('      🟡 getCharacterAppearanceFromStory(): FALLBACK USED');
              if (appearanceFallback) {
                cascadeHistory.push('         ⚡ Emergency structuredAvatarData fallback activated');
                cascadeHistory.push('      💡 Impact: MEDIUM - Using basic avatar structure');
              }
            } else if (!ccsImportFailed) {
              cascadeHistory.push('      ✅ getCharacterAppearanceFromStory(): SUCCESS');
            }
            
            // getColoredObjects
            const colorsFailed = ccErrors.some(e => e.includes('getColoredObjects'));
            if (colorsFailed) {
              cascadeHistory.push('      🟡 getColoredObjects(): FAILED');
              cascadeHistory.push('      💡 Impact: LOW - Color consistency may vary');
            } else if (!ccsImportFailed) {
              cascadeHistory.push('      ✅ getColoredObjects(): SUCCESS');
            }
            
            // Overall Direct Mode CCS Summary
            const allMethodsWorking = !ccsImportFailed && !visualAnalysisFailed && 
                                     !culturalFailed && !appearanceFailed && !colorsFailed;
            const hasFallbacks = culturalFallback || appearanceFallback;
            
            cascadeHistory.push('');
            if (allMethodsWorking) {
              cascadeHistory.push('   ✅ Direct Mode CCS: FULLY OPERATIONAL');
              cascadeHistory.push('      All character consistency methods working');
            } else if (hasFallbacks) {
              cascadeHistory.push('   🟡 Direct Mode CCS: PARTIAL (Fallbacks Active)');
              cascadeHistory.push('      Some methods using emergency fallbacks');
              cascadeHistory.push('      💡 Image generated successfully with reduced consistency');
            } else if (ccsImportFailed) {
              cascadeHistory.push('   🔴 Direct Mode CCS: UNAVAILABLE');
              cascadeHistory.push('      CCS module failed to load');
              cascadeHistory.push('      💡 Using minimal fallback data only');
            }
          }
          
          // Show Direct Mode status explicitly
          if (result.metadata?.directModeAttempted) {
            if (result.metadata?.pathUsed === 'DIRECT_MODE') {
              cascadeHistory.push('✅ Direct Mode Success');
            } else {
              cascadeHistory.push(`❌ Direct Mode Failed: ${result.metadata?.directModeError || 'Unknown error'}`);
            }
          }
          
          const hasCharacterConsistency = result.metadata?.characterConsistencyActive === true || ccErrors.length === 0;
          
          // Check CCS boot status from metadata
          const ccsStatus = {
            tier1Loaded: result.metadata?.ccsBootStatus?.tier1 || false,
            tier25Loaded: result.metadata?.ccsBootStatus?.tier25 || false,
            directModeLoaded: result.metadata?.ccsBootStatus?.directMode || false,
          };
          
          resultBadge = `${actualTier}${wasFailover} Success`;
          fallbackPath = `Real user flow succeeded via ${actualTier}${wasFailover}`;
          finalResult = {
            tier: actualTier,
            success: true,
            imageURL: extractImageUrl(result) || '',
            details: {
              processingTime: userFlowTime,
              cascadeHistory,
              testType: 'E2E_SIMULATION',
              resultType: 'REAL_USER_FLOW_SUCCESS',
              metadata: result.metadata,
              error: null,
              pathUsed: actualTier,
              routingDecision: result.metadata?.routingReason || 'Natural tier routing',
              hasCharacterConsistency,
              ccsStatus
            }
          };
        } else {
          // Real user flow failed - this means complete cascade failure  
          cascadeHistory.push(`❌ Real User Flow Complete Failure (${userFlowTime}ms)`);
          resultBadge = 'Complete Cascade Failure';
          fallbackPath = 'Real user flow exhausted all tiers without success';
          finalResult = {
            tier: 'cascade-failure',
            success: false,
            imageURL: null,
            details: {
              processingTime: userFlowTime,
              cascadeHistory,
              testType: 'E2E_SIMULATION',
              resultType: 'COMPLETE_CASCADE_FAILURE',
              error: result.error
            }
          };
        }
      } catch (userFlowError) {
        const userFlowTime = Date.now() - userFlowStartTime;
        cascadeHistory.push(`❌ Real User Flow Error (${userFlowTime}ms): ${userFlowError.message}`);
        resultBadge = 'Real User Flow Error';
        fallbackPath = 'Real user flow encountered an error';
        finalResult = {
          tier: 'error',
          success: false,
          imageURL: null,
          details: {
            processingTime: userFlowTime,
            cascadeHistory,
            testType: 'E2E_SIMULATION',
            resultType: 'REAL_USER_FLOW_ERROR',
            error: userFlowError.message
          }
        };
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
      const logMessage = tier === '1' 
        ? '🎯 Force Tier 1: Testing Complete Orchestrator Flow - NO CASCADE'
        : `🎯 Force Tier ${tier}: Direct template bypass simulation`;
      
      DebugLogger.log('image', logMessage, { 
        tier, 
        forceMode: tier === '1',
        cascadeDisabled: tier === '1',
        bypassedTiers: tier === '2.5A' ? 'Tier 1' : tier === '2.5B' ? 'Tier 1, 2.5A' : tier === '1' ? 'NONE - Testing Full Orchestrator' : 'Unknown',
        expectedTemplate: tier === '1' ? 'COMPLETE_TIER_1' : tier.includes('A') || tier.includes('B') ? 'template-ab' : 'template-cd'
      });

      const startTime = Date.now();
      const userInfo = buildUserInfo();
      const enhancedPrompt = testStoryText; // Use raw content directly
      
      // Step 1: Function Selection
      steps[0].status = 'running';
      const functionMap: { [key: string]: string } = {
        '1': 'runware-generate-image',  // Test Enhanced Character-First Flow orchestrator
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
      
      // Step 2: Payload Construction - PLAN B: Add Tier 1 case
      steps[1].status = 'running';
      const payload = tier === '1'
        ? {
            // Tier 1 Enhanced Character-First Flow: runware-generate-image orchestrator
            storyText: enhancedPrompt,  // FIXED: Add missing storyText field
            pageText: enhancedPrompt,
            userInfo: userInfo,
            sessionId: crypto.randomUUID(),
            storyId: crypto.randomUUID(),
            pageNumber: 1,
            characterName: userInfo?.name || 'Alex',
            isGuestUser: true,
            difficultyLevel: mapDifficultyLevel(userInfo),
            protectionNegatives: [],
            forceCompleteTier1: true, // Force Enhanced Character-First Flow
            test: true
          }
        : tier === '2.5A' || tier === '2.5B'
        ? {
            // FLAT payload structure for template AB (no nested bundle/config)
            pageText: enhancedPrompt,
            storyText: enhancedPrompt, // Add fallback field
            userInfo: userInfo,
            sessionId: crypto.randomUUID(),
            storyId: crypto.randomUUID(),
            pageNumber: 1,
            isGuestUser: true,
            difficultyLevel: mapDifficultyLevel(userInfo),
            protectionNegatives: [],
            templateComplexity: templateMap[tier], // Add directly at root level
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
      const safeImageURL = extractImageUrl(response.data);
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

      // Tier 1 specific validation
      const isTier1Test = tier === '1';
      const tier1Success = isTier1Test && response.data?.templateStructure === 'COMPLETE_TIER_1';
      const tier1ForcedFailure = isTier1Test && response.data?.templateStructure === 'TIER_1_FORCED_FAILURE';
      
      setResults([{
        tier: `tier-${tier}-forced`,
        success: isTier1Test ? tier1Success : overallSuccess,
        imageURL: safeImageURL,
        details: {
          processingTime,
          requestId: response.data?.requestId,
          tier: response.data?.tier,
          templateComplexity: isTier1Test ? 'COMPLETE_TIER_1' : templateMap[tier],
          positivePrompt: safePositive,
          negativePrompt: response.data?.negativePrompt,
          styleFramework: response.data?.styleFrameworkUsed,
          forcedTier: tier,
          testType: isTier1Test ? 'TIER_1_FORCE_TEST' : 'FORCED_TEMPLATE_BYPASS',
          bypassedTiers: isTier1Test ? [] : tier === '2.5A' ? ['Tier 1'] : tier === '2.5B' ? ['Tier 1', 'Tier 2.5A'] : [],
          selectedFunction,
          stepByStepValidation: steps,
          promptLength: safePositive?.length || 0,
          templateStructure: response.data?.templateStructure,
          tier1Validation: isTier1Test ? {
            expectedStructure: 'COMPLETE_TIER_1',
            actualStructure: response.data?.templateStructure,
            success: tier1Success,
            forcedFailure: tier1ForcedFailure,
            cascadeBlocked: response.data?.cascadeBlocked
          } : undefined,
          error: response.error?.message || response.data?.error,
          errorCategory,
          probableCause,
          errorDetails: response.data?.errorDetails
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
          
          // POST Test (Use supabase.functions.invoke to match production with timeout)
          const postAbortController = new AbortController();
          const postTimeoutId = setTimeout(() => postAbortController.abort(), timeoutDuration);
          
          try {
            const payload = {
              pageText: testStoryText,
              storyText: testStoryText,
              userInfo: buildUserInfo(),
              sessionId: "test-session",
              pageNumber: 1,
              storyId: crypto.randomUUID(),
              isGuestUser: false,
              difficultyLevel: 'medium',
              protectionNegatives: [],
              // Add required flags for ai-visual-scene-creator
              ...(endpoint.name === 'ai-visual-scene-creator' ? { isDebugMode: true } : {}),
              // Add dryRun flag for runware-generate-image to prevent timeouts
              ...(endpoint.name === 'runware-generate-image' ? { dryRun: true } : {})
            };
            
            const postResponse = await supabase.functions.invoke(endpoint.name, { 
              body: payload 
            });
            
            clearTimeout(postTimeoutId);
            
            let category = 'HEALTHY';
            let status = 200;
            
            if (postResponse.error) {
              const errorMessage = postResponse.error.message || String(postResponse.error);
              const errorStatus = postResponse.error.status;
              const errorCode = postResponse.error.code;
              
              // Classify by actual HTTP status code and error patterns
              if (errorCode === 'WORKER_LIMIT' || errorStatus === 546 || errorMessage.includes('WORKER_LIMIT')) {
                category = 'CAPACITY_LIMIT';
                status = 546;
              } else if (errorStatus === 503) {
                category = 'BOOT_SYNC_ANOMALY';
                status = 503;
              } else if (errorStatus === 500) {
                category = 'RUNTIME_ERROR';
                status = 500;
              } else if (errorStatus === 404) {
                category = 'DEPLOYMENT_ISSUE';
                status = 404;
              } else if (errorStatus === 400 || errorStatus === 422) {
                category = 'VALIDATION_ERROR';
                status = errorStatus;
              } else if (errorMessage.includes('NO_STORY_CONTENT')) {
                category = 'VALIDATION_ERROR';
                status = 400;
              } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                // Only real fetch failures are browser noise
                category = 'BROWSER_NOISE';
                status = 0;
              } else if (!errorStatus && (errorCode || errorMessage)) {
                // Ambiguous error without status - try raw fetch for diagnostic
                try {
                  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cpzeuogomaixamrtnnmj.supabase.co';
                  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino';
                  
                  const rawResponse = await fetch(
                    `${supabaseUrl}/functions/v1/${endpoint.name}`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'apikey': supabaseAnonKey
                      },
                      body: JSON.stringify(payload),
                      signal: AbortSignal.timeout(5000)
                    }
                  );
                  
                  status = rawResponse.status;
                  const rawBody = await rawResponse.text();
                  
                  // Re-classify based on raw HTTP status
                  if (status === 546) category = 'CAPACITY_LIMIT';
                  else if (status === 503) category = 'BOOT_SYNC_ANOMALY';
                  else if (status === 500) category = 'RUNTIME_ERROR';
                  else if (status === 404) category = 'DEPLOYMENT_ISSUE';
                  else if (status === 400 || status === 422) category = 'VALIDATION_ERROR';
                  else category = 'NETWORK_ISSUE';
                  
                  tests.POST = {
                    success: false,
                    status,
                    statusText: `${errorMessage} (raw: ${rawBody.substring(0, 100)})`,
                    category,
                    details: `SDK error mapped via raw fetch: HTTP ${status}`
                  };
                } catch (rawFetchError: any) {
                  // Raw fetch also failed - truly a network issue
                  category = 'NETWORK_ISSUE';
                  status = 0;
                  tests.POST = {
                    success: false,
                    status,
                    statusText: errorMessage,
                    category,
                    details: `SDK and raw fetch both failed: ${rawFetchError.message}`
                  };
                }
              } else {
                // Unknown error - classify as network issue
                category = 'NETWORK_ISSUE';
                status = errorStatus || 0;
              }
              
              if (!tests.POST) {
                tests.POST = {
                  success: false,
                  status,
                  statusText: errorMessage,
                  category,
                  details: `${errorMessage}${status ? ` (HTTP ${status})` : ''}`
                };
              }
            } else if (postResponse.data?.success === false) {
              category = 'RUNTIME_ERROR';
              status = 500;
              tests.POST = {
                success: false,
                status,
                statusText: 'Function returned success=false',
                category
              };
            } else {
              // Success case
              tests.POST = {
                success: true,
                status,
                statusText: 'OK',
                category
              };
            }
          } catch (postError: any) {
            clearTimeout(postTimeoutId);
            
            // Check if this was a timeout abort
            if (postError.name === 'AbortError') {
              tests.POST = {
                success: false,
                status: 0,
                statusText: `Request timed out after ${timeoutDuration}ms`,
                category: 'TIMEOUT'
              };
            } else {
              // If GET succeeded but POST returns status 0, it's likely browser noise
              const isLikelyBrowserNoise = tests.GET.success && postError.message?.includes('Failed to fetch');
              
              tests.POST = {
                success: false,
                status: 0,
                statusText: postError.message || 'Unknown error',
                category: isLikelyBrowserNoise ? 'BROWSER_NOISE' : 'NETWORK_ISSUE'
              };
            }
          }
          
          const responseTime = Date.now() - endpointStartTime;
          
          // Overall assessment - FIXED: Handle abort cases and browser noise
          const wasAborted = tests.GET.category === 'ABORTED' || tests.POST.category === 'ABORTED';
          const isBrowserNoise = tests.POST.category === 'BROWSER_NOISE';
          
          // If GET succeeds and POST is browser noise, count as success
          const overallSuccess = !wasAborted && tests.GET.success && (tests.POST.success || isBrowserNoise);
          
          const overallCategory = wasAborted ? 'ABORTED' :
            isBrowserNoise ? 'HEALTHY_WITH_NOISE' :
            (tests.GET.category === 'HEALTHY' && tests.POST.category === 'HEALTHY' 
              ? 'HEALTHY' 
              : tests.POST.category); // POST reveals more issues
          
          let humanReadableReason = '';
          if (wasAborted) {
            humanReadableReason = 'Test was aborted (Reset button pressed)';
          } else if (isBrowserNoise) {
            humanReadableReason = `${endpoint.type} - GET healthy, POST browser noise (ignored)`;
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
      
      // Updated tier configurations to standardize with Debug Real Routing
      const tierConfigurations = [
        {
          name: 'Tier 1 (Direct Mode)', // PLAN FIX 2A: Renamed from "Direct Mode (AI Scene Creator)" 
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
          name: 'Tier 1 (via Orchestrator)', // PLAN FIX 2A: Renamed from "Orchestrator (Health Check)"
          function: 'runware-generate-image',
          architecture: 'ORCHESTRATOR_PATTERN',
          payload: {
            storyText: testStoryText,
            userInfo: buildUserInfo(),
            sessionId: 'test-session',
            pageNumber: 1,
            storyId: 'cascade-test-story',
            isGuestUser: false,
            difficultyLevel: 'medium',
            test: true
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
            // Check for escalation in Tier 1 (via Orchestrator)
            if (tier.name === 'Tier 1 (via Orchestrator)' && data.templateStructure !== 'COMPLETE_TIER_1') {
              throw new Error(`Tier 1 failed - escalated to ${data.usedTier || data.tier || 'higher tier'}`);
            }
            
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
                expectedArchitecture: tier.architecture,
                
                // CCS Status Tracking
                ccsBootStatus: data.ccsBootStatus || data.metadata?.ccsBootStatus || { loaded: false, tier1: false, tier25: false, directMode: false },
                precomputedCCSUsed: data.precomputedCCSUsed ?? null,
                ccsMethodStatus: data.ccsMethodStatus || data.metadata?.ccsMethodStatus || {},
                ccsFallbacksActive: data.ccsFallbacksActive || data.metadata?.ccsFallbacksActive || [],
                ccsImportSource: data.ccsImportSource || data.metadata?.ccsImportSource || 'unknown',
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
               
               <div>
                 <label className="text-sm font-medium mb-2 block">User Tier</label>
                 <Select value={userTier} onValueChange={(value: string) => setUserTier(value as 'premium' | 'guest')}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
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
              onClick={() => forceTier('1')}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Force Tier 1
            </Button>
            
            <div className="space-y-2">
              <Button
                onClick={debugRealRouting}
                disabled={isLoading}
                variant="secondary"
                className="flex items-center gap-2 w-full"
              >
                <Search className="h-4 w-4" />
                E2E User Simulation
              </Button>
            </div>
            
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
              Batch Tier Testing
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
                      <span className={
                        result.success ? "text-green-600" : 
                        result.isFallback ? "text-yellow-600" : 
                        "text-red-600"
                      }>
                        {result.success ? "✅" : result.isFallback ? "⚠️" : "❌"}
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
                      
                      {/* Template Complexity Badge - Only show for actual A/B/C/D */}
                      {result.details.templateComplexity && ['A', 'B', 'C', 'D'].includes(result.details.templateComplexity) && (
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
                      
                      {/* Tier 1 Force Mode Failed Badge */}
                      {result.details.templateStructure === 'TIER_1_FORCED_FAILURE' && (
                        <Badge variant="destructive" className="bg-orange-600 text-white hover:bg-orange-700">
                          ⚡ Tier 1 Force Mode Failed - No Cascade
                        </Badge>
                      )}
                      
                      {/* Force Mode Indicator */}
                      {result.details.tier1Validation?.cascadeBlocked && (
                        <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-700">
                          🛑 Cascade Blocked (Force Mode)
                        </Badge>
                      )}
                    </div>
                    {result.details.processingTime && (
                      <span className="text-sm text-muted-foreground">
                        {result.details.processingTime}ms
                      </span>
                    )}
                  </div>

                  {extractImageUrl(result) && (
                    <div className="mb-4">
                      <img 
                        src={extractImageUrl(result)!}
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

                      {/* PRIMARY SCENE - DISPLAY FIRST */}
                      {result.details.primaryScene && (
                        <div className="text-sm mb-3">
                          <span className="font-medium">Primary Scene:</span>
                          <div className="text-xs mt-1 bg-blue-50 p-2 rounded">{result.details.primaryScene}</div>
                        </div>
                      )}
                      
                      {/* COMPREHENSIVE DEBUG PLAN: OpenAI Debug Data Section */}
                      {result.details.aiDebugSchema && (
                        <div className="text-sm border-2 border-purple-300 rounded p-3 bg-purple-50 mt-3">
                          <div className="font-bold text-purple-700 mb-2">🔍 OpenAI Debug Data - Full Request Details</div>
                          
                          {/* Character Data Sent Warning */}
                          <div className={`text-xs mb-2 p-2 rounded ${
                            result.details.aiDebugSchema.characterDataSent === 'undefined' || 
                            result.details.aiDebugSchema.characterDataSent === '{}' 
                              ? 'bg-red-100 border border-red-400' 
                              : 'bg-green-100 border border-green-400'
                          }`}>
                            <span className="font-medium">Character Data Sent to OpenAI:</span>
                            {result.details.aiDebugSchema.characterDataSent === 'undefined' || 
                             result.details.aiDebugSchema.characterDataSent === '{}' ? (
                              <div className="text-red-700 font-bold mt-1">
                                ⚠️ WARNING: OpenAI received "undefined" or empty character data! This causes "brown hair" defaults.
                              </div>
                            ) : (
                              <div className="text-green-700 mt-1">
                                ✅ Character data sent: {result.details.aiDebugSchema.characterDataSent}
                              </div>
                            )}
                          </div>
                          
                          {/* System Prompt */}
                          <details className="mb-2">
                            <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 text-xs">
                              📋 System Prompt ({result.details.aiDebugSchema.systemPrompt?.length || 0} chars) - Click to expand
                            </summary>
                            <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                              <pre className="whitespace-pre-wrap">{result.details.aiDebugSchema.systemPrompt}</pre>
                            </div>
                          </details>
                          
                          {/* User Prompt */}
                          <details className="mb-2">
                            <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 text-xs">
                              💬 User Prompt ({result.details.aiDebugSchema.userPrompt?.length || 0} chars) - Click to expand
                            </summary>
                            <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                              <pre className="whitespace-pre-wrap">{result.details.aiDebugSchema.userPrompt}</pre>
                            </div>
                          </details>
                          
                          {/* Model & Context Info */}
                          <div className="text-xs border-t pt-2 mt-2">
                            <div className="font-medium mb-1">🤖 Model & Context:</div>
                            <div className="bg-white p-2 rounded space-y-1">
                              <div>Model: {result.details.aiDebugSchema.modelUsed}</div>
                              <div>Story Length: {result.details.aiDebugSchema.storyTextLength} chars</div>
                              <div>Non-English: {result.details.aiDebugSchema.isNonEnglish ? 'Yes' : 'No'}</div>
                              {result.details.aiDebugSchema.culturalContext && (
                                <div>Cultural Context: {result.details.aiDebugSchema.culturalContext}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Force Mode Component Failure Details */}
                      {result.details.templateStructure === 'TIER_1_FORCED_FAILURE' && result.details.errorDetails && (
                        <div className="text-sm border-2 border-red-400 rounded p-3 bg-red-50 mt-3">
                          <div className="font-bold text-red-800 mb-2">🚨 Force Tier 1 - Component Failure Analysis</div>
                          
                          {/* Component Health Status */}
                          {result.details.errorDetails.componentFailures && (
                            <div className="mb-3 p-2 bg-white rounded border">
                              <div className="font-medium text-sm mb-2">Component Health Check:</div>
                              <div className="space-y-1 text-xs">
                                <div className={result.details.errorDetails.componentFailures.orchestratorHealth ? 'text-green-700' : 'text-red-700'}>
                                  {result.details.errorDetails.componentFailures.orchestratorHealth ? '✅' : '❌'} PhaseIntegrationOrchestrator
                                </div>
                                <div className={result.details.errorDetails.componentFailures.characterConsistencyAvailable ? 'text-green-700' : 'text-red-700'}>
                                  {result.details.errorDetails.componentFailures.characterConsistencyAvailable ? '✅' : '❌'} CharacterConsistencyService
                                </div>
                                <div className={result.details.errorDetails.componentFailures.aiVisualSceneCreatorAvailable ? 'text-green-700' : 'text-red-700'}>
                                  {result.details.errorDetails.componentFailures.aiVisualSceneCreatorAvailable ? '✅' : '❌'} AI Visual Scene Creator
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Failure Type Classification */}
                          {result.details.errorDetails.failureType && (
                            <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-300">
                              <span className="font-medium text-xs">Failure Type:</span>
                              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs font-mono">
                                {result.details.errorDetails.failureType}
                              </span>
                            </div>
                          )}
                          
                          {/* Attempted Prompts Section */}
                          {result.details.errorDetails.attemptedPrompts && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-orange-700 hover:text-orange-800 text-xs">
                                📝 Attempted Prompt Generation (Click to expand)
                              </summary>
                              <div className="mt-2 bg-white p-2 rounded border text-xs">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(result.details.errorDetails.attemptedPrompts, null, 2)}</pre>
                              </div>
                            </details>
                          )}
                          
                          {/* Full Error Details */}
                          <details className="mb-2">
                            <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800 text-xs">
                              🔍 Full Error Details (Click to expand)
                            </summary>
                            <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-48 overflow-y-auto">
                              <div className="mb-2"><strong>Message:</strong> {result.details.errorDetails.message}</div>
                              {result.details.errorDetails.stack && (
                                <div>
                                  <strong>Stack Trace:</strong>
                                  <pre className="mt-1 text-xs">{result.details.errorDetails.stack}</pre>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                      
                      {/* Tier 1 Timeline (Force Mode) */}
                      {result.details.templateStructure === 'TIER_1_FORCED_FAILURE' && result.details.errorDetails?.tier1ErrorLog && result.details.errorDetails.tier1ErrorLog.length > 0 && (
                        <div className="text-sm border-2 border-yellow-300 rounded p-3 bg-yellow-50 mt-3">
                          <div className="font-bold text-yellow-700 mb-3">⚡ Tier 1 Timeline (Force Mode)</div>
                          
                          <div className="space-y-2">
                            {result.details.errorDetails.tier1ErrorLog.map((entry: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-2 bg-white rounded border text-xs">
                                <span className="text-lg shrink-0 mt-0.5">
                                  {entry.status === 'attempt' && '⏳'}
                                  {entry.status === 'success' && '✅'}
                                  {entry.status === 'failed' && '❌'}
                                  {entry.status === 'skipped' && '⏭️'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-foreground mb-1">{entry.step}</div>
                                  <div className="text-muted-foreground/90 break-words mb-1">{entry.message}</div>
                                  <div className="text-muted-foreground/60 text-[10px]">
                                    {new Date(entry.at).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300 text-xs text-yellow-800">
                            <strong>ℹ️ Force Mode:</strong> Cascade was blocked. Timeline shows Tier 1 execution steps before failure.
                          </div>
                        </div>
                      )}
                      
                      {/* COMPREHENSIVE DEBUG PLAN: Runware Debug Info Section - Hide for Scene-Only mode and Force Tier 1 */}
                      {!result.details.sceneGenerationOnly && result.tier !== 'tier-1-forced' && (result.details.positivePrompt || result.details.negativePrompt || result.details.promptSource || 
                        (result.tier === 'tier-1-forced-failure' && result.details.errorDetails?.attemptedPrompts)) && (
                        <div className="text-sm border-2 border-orange-300 rounded p-3 bg-orange-50 mt-3">
                          <div className="font-bold text-orange-700 mb-2">🎨 Runware Debug Info - Prompts Sent to Image API</div>
                          
                          {/* Prompt Source Indicator */}
                          <div className="text-xs mb-2 p-2 rounded bg-white border">
                            <span className="font-medium">Prompt Source:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded ${
                              result.details.promptSource === 'top_level' ? 'bg-green-200 text-green-800' :
                              result.details.promptSource === 'orchestrator_metadata' ? 'bg-blue-200 text-blue-800' :
                              result.details.promptSource === 'direct_mode_runware' ? 'bg-orange-200 text-orange-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {result.details.promptSource || 'unknown'}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded ${
                              result.details.promptExtractionSuccess ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              {result.details.promptExtractionSuccess ? '✅ Extracted' : '❌ Failed'}
                            </span>
                          </div>
                          
                          {/* Positive Prompt */}
                          {result.details.positivePrompt && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-green-600 hover:text-green-700 text-xs">
                                ✨ Positive Prompt ({result.details.positivePrompt.length} chars) - Click to expand
                              </summary>
                              <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{result.details.positivePrompt}</pre>
                              </div>
                            </details>
                          )}
                          
                          {/* Negative Prompt */}
                          {result.details.negativePrompt && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-red-600 hover:text-red-700 text-xs">
                                🚫 Negative Prompt ({result.details.negativePrompt.length} chars) - Click to expand
                              </summary>
                              <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{result.details.negativePrompt}</pre>
                              </div>
                            </details>
                          )}
                          
                          {/* Orchestrator Debug Data */}
                          {result.details.orchestratorDebugData && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 text-xs">
                                🎯 Orchestrator Debug Data - Click to expand
                              </summary>
                              <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                <pre>{JSON.stringify(result.details.orchestratorDebugData, null, 2)}</pre>
                              </div>
                            </details>
                          )}
                          
                          {/* Force Mode Attempted Prompts */}
                          {result.tier === 'tier-1-forced-failure' && result.details.errorDetails?.attemptedPrompts && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-purple-600 hover:text-purple-700 text-xs">
                                🔧 Attempted Prompts (Force Mode Failure) - Click to expand
                              </summary>
                              <div className="mt-2 bg-purple-50 p-3 rounded border border-purple-200 text-xs">
                                {result.details.errorDetails.attemptedPrompts.partialData && (
                                  <div className="mb-2">
                                    <div className="font-medium text-purple-700 mb-1">Partial Story Data:</div>
                                    <pre className="bg-white p-2 rounded border overflow-x-auto max-h-32 overflow-y-auto">
                                      {JSON.stringify(result.details.errorDetails.attemptedPrompts.partialData, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div className="text-purple-600 text-xs italic">
                                  ℹ️ These are the inputs that were being processed when Tier 1 orchestrator failed
                                </div>
                              </div>
                            </details>
                          )}
                          
                          {/* Direct Mode Fallback Debug Data */}
                          {result.details.directModeDebugData && (
                            <details className="mb-2">
                              <summary className="cursor-pointer font-medium text-orange-600 hover:text-orange-700 text-xs">
                                🔄 Direct Mode Fallback Debug Data - Click to expand
                              </summary>
                              <div className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                <pre>{JSON.stringify(result.details.directModeDebugData, null, 2)}</pre>
                              </div>
                            </details>
                          )}
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

                      {/* AI Schema Output - Actual JSON from OpenAI */}
                      {result.details.aiSchema && (
                        <details className="text-sm border-2 border-purple-300 rounded p-3 bg-purple-50 mt-3">
                          <summary className="cursor-pointer font-medium text-purple-700 hover:text-purple-800">
                            🧪 AI Schema Output - JSON Response from OpenAI (Expandable)
                          </summary>
                          <div className="mt-2">
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                              {JSON.stringify(result.details.aiSchema, null, 2)}
                            </pre>
                          </div>
                        </details>
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

                      {/* Enhanced Runware Prompt Display Section - Hide for Scene-Only mode */}
                      {!result.details.sceneGenerationOnly && ((result.success || result.isFallback) && (result.details.positivePrompt || result.details.negativePrompt || result.details.enhancedPrompt || result.details.originalPrompt)) && (
                        <div className={`text-sm border rounded p-2 ${result.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <span className={`font-medium ${result.success ? 'text-green-700' : 'text-yellow-700'}`}>
                            🎯 Full Prompts Sent to Runware - 
                            {result.details.templateStructure === 'COMPLETE_TIER_1' && ' (Enhanced by Orchestrator - COMPLETE_TIER_1 Template)'}
                            {result.details.templateStructure === 'DIRECT_MODE_SUCCESS' && ' (AI Primary Scene + Tier 2.5C Nuclear Template)'}
                            {result.isFallback && !result.details.templateStructure?.includes('COMPLETE_TIER_1') && ' (AI Primary Scene + Tier 2.5C Nuclear Template)'}
                          </span>
                          
                          {/* Enhanced Prompt Source Indicator */}
                          <div className="mt-1 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              result.details.templateStructure === 'COMPLETE_TIER_1' ? 'bg-blue-100 text-blue-700' : 
                              result.isFallback || result.details.templateStructure === 'DIRECT_MODE_SUCCESS' ? 'bg-orange-100 text-orange-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.details.templateStructure === 'COMPLETE_TIER_1' ? '🎯 Enhanced by Orchestrator (COMPLETE_TIER_1 Template)' : 
                               result.isFallback || result.details.templateStructure === 'DIRECT_MODE_SUCCESS' ? '🚀 AI Primary Scene + Tier 2.5C Nuclear Template' : 
                               '📝 Generated Prompt'}
                            </span>
                          </div>
                          
                          {/* Positive Prompt with Preview */}
                          {result.details.positivePrompt && (
                            <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-200">
                              <div className="text-xs font-medium text-blue-700 mb-1">
                                ✨ Positive Prompt ({result.details.positivePrompt.length} chars) - Sent to Runware
                              </div>
                              <div className="text-xs text-blue-600 bg-white p-2 rounded">
                                <ExpandableText 
                                  text={result.details.positivePrompt} 
                                  maxLength={80} 
                                  showCharCount={false}
                                  className="text-blue-800"
                                />
                              </div>
                            </div>
                          )}

                          {/* Negative Prompt with Preview */}
                          {result.details.negativePrompt && (
                            <div className="mt-2 bg-red-50 p-2 rounded border border-red-200">
                              <div className="text-xs font-medium text-red-700 mb-1 flex items-center gap-2">
                                🛡️ Negative Prompt ({result.details.negativePrompt.length} chars) - Nuclear Negative
                                {result.details.negativePrompt.includes('NO TEXT') && (
                                  <Badge variant="destructive" className="text-xs">NO TEXT</Badge>
                                )}
                                {result.details.negativePrompt.includes('(especially for Emma)') && (
                                  <Badge variant="secondary" className="text-xs">EMMA</Badge>
                                )}
                              </div>
                              <div className="text-xs text-red-600 bg-white p-2 rounded">
                                <ExpandableText 
                                  text={result.details.negativePrompt} 
                                  maxLength={80} 
                                  showCharCount={false}
                                  className="text-red-800"
                                />
                              </div>
                            </div>
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
                     
                     {/* CCS Status Display - Batch Tier Testing & E2E */}
                     <CCSStatusDisplay result={result} />
                     
                     {/* E2E Simulation Cascade History and Fallback Path */}
                     {result.details.cascadeHistory && result.details.cascadeHistory.length > 0 && (
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
                         
                           {/* Enhanced Cascade History with Routing Steps */}
                           {result.details.cascadeHistory && result.details.cascadeHistory.length > 0 && (
                             <div className="text-sm bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="font-semibold text-blue-900">🛤️ Routing Steps</span>
                                 {(result.details as any).pathUsed && (
                                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                     {(result.details as any).pathUsed}
                                   </span>
                                 )}
                               </div>
                               
                               {/* Routing Decision Summary */}
                               {(result.details as any).routingDecision && (
                                 <div className="mb-3 p-2 bg-blue-100 rounded text-xs">
                                   <span className="font-medium text-blue-900">Routing Decision: </span>
                                   <span className="text-blue-800">{(result.details as any).routingDecision}</span>
                                 </div>
                               )}
                               
                                <div className="space-y-1">
                                  {result.details.cascadeHistory.map((step: string, idx: number) => {
                                    const timestamp = new Date().toLocaleTimeString();
                                    const needsExpansion = step.length > 150;
                                    
                                    return (
                                      <div key={idx} className="text-xs font-mono flex items-start gap-2 p-1 hover:bg-blue-100 rounded">
                                        <span className="text-blue-400 min-w-[20px] font-bold">{idx + 1}.</span>
                                        <span className="text-gray-500 min-w-[60px] text-[10px]">{timestamp}</span>
                                        <div className={`flex-1 ${
                                          step.includes('✅') ? 'text-green-700 font-medium' :
                                          step.includes('❌') ? 'text-red-700 font-medium' :
                                          step.includes('🔄') ? 'text-blue-700 font-medium' :
                                          step.includes('🎯') ? 'text-purple-700 font-medium' :
                                          'text-gray-700'
                                        }`}>
                                          {needsExpansion ? (
                                            <ExpandableText text={step} maxLength={150} showCharCount={true} />
                                          ) : (
                                            <span className="whitespace-pre-wrap break-words">{step}</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                               
                               {/* Final Routing Summary */}
                               <div className="mt-3 pt-2 border-t border-blue-200">
                                 <div className="text-xs text-blue-800">
                                   <span className="font-medium">Final Classification: </span>
                                   <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                     {(result.details as any).pathUsed || result.tier || 'Tier 1'} Success
                                   </span>
                                 </div>
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

                           {/* Main Error Message with Enhanced Parsing */}
                           <div className="text-sm">
                             <span className="font-medium text-red-600">🚨 Error:</span>
                             <div className="text-red-600 text-xs mt-1 bg-white p-2 rounded border">
                               {(() => {
                                 const errorMsg = typeof result.details.error === 'string'
                                   ? result.details.error
                                   : ((result.details.error as any)?.message || JSON.stringify(result.details.error));
                                 
                                 return <ExpandableText text={errorMsg} maxLength={200} showCharCount={true} />;
                               })()}
                             </div>
                             
                             {/* Enhanced Error Explanation */}
                             {(() => {
                               const errorMsg = typeof result.details.error === 'string'
                                 ? result.details.error
                                 : ((result.details.error as any)?.message || '');
                               
                               // Parse common orchestrator errors
                               if (errorMsg.includes('logTier1Step is not defined')) {
                                 return (
                                   <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-yellow-800 text-xs">
                                     <div className="font-medium">🔍 Analysis: Missing Logging Function</div>
                                     <div className="mt-1">The orchestrator is trying to call a logging function that doesn't exist in the current execution context.</div>
                                     <div className="mt-1 font-medium">Suggested Fix: Check runware-generate-image edge function for missing logTier1Step import or definition.</div>
                                   </div>
                                 );
                               }
                               
                               if (errorMsg.includes('structuredAvatarData is not defined')) {
                                 return (
                                   <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-yellow-800 text-xs">
                                     <div className="font-medium">🔍 Analysis: Character Data Missing</div>
                                     <div className="mt-1">Character consistency data was not properly passed from CharacterConsistencyService to the AI scene creator.</div>
                                     <div className="mt-1 font-medium">Suggested Fix: Verify CharacterConsistencyService.getCulturalEnhancements() is returning data and being passed to payload correctly.</div>
                                   </div>
                                 );
                               }
                               
                               if (errorMsg.includes('Module not found') || errorMsg.includes('Import') || errorMsg.includes('ERR_MODULE_NOT_FOUND')) {
                                 return (
                                   <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-yellow-800 text-xs">
                                     <div className="font-medium">🔍 Analysis: Module Import Failure</div>
                                     <div className="mt-1">Edge function failed to load required dependencies from CDN or local imports.</div>
                                     <div className="mt-1 font-medium">Suggested Fix: Check resilientLoader.ts CDN fallbacks and verify all import paths are correct.</div>
                                   </div>
                                 );
                               }
                               
                               if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
                                 return (
                                   <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-yellow-800 text-xs">
                                     <div className="font-medium">🔍 Analysis: Request Timeout</div>
                                     <div className="mt-1">The orchestrator took too long to respond (exceeded 60s timeout).</div>
                                     <div className="mt-1 font-medium">Suggested Fix: Check AI service response times and consider increasing timeout threshold.</div>
                                   </div>
                                 );
                               }
                               
                               if (errorMsg.includes('Supabase') || errorMsg.includes('Database')) {
                                 return (
                                   <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-yellow-800 text-xs">
                                     <div className="font-medium">🔍 Analysis: Database Connection Issue</div>
                                     <div className="mt-1">Failed to connect to Supabase database or execute database operations.</div>
                                     <div className="mt-1 font-medium">Suggested Fix: Verify Supabase credentials, check RLS policies, and ensure tables exist.</div>
                                   </div>
                                 );
                               }
                               
                               return null;
                             })()}
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