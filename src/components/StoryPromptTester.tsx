import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play, RotateCcw, Zap, Brain, Shuffle, ChevronDown, ChevronUp, Eye, AlertTriangle, User, Settings } from 'lucide-react';
import { AvatarPicker } from '@/components/ui/avatar-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { LiveGenerationService } from '@/services/LiveGenerationService';
import { useTemplateService } from '@/hooks/useTemplateService';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { UnifiedValidator, type ValidationResult, type ValidationDecision } from '@/utils/unifiedValidator';
import { validatePlaceholders, getPlaceholderValidationMessage, checkForPlaceholderIssues } from '@/utils/placeholderValidator';
import { mapDifficultyToLevel, getExpectedPagesForLevel } from '../../supabase/functions/_shared/validation-utils';
import { withTimeout, TIMEOUT_CONFIGS } from '@/utils/networkTimeout';
import { countCharacters, analyzeCharacters, type CharacterAnalysis } from '@/utils/characterCount';
import { showTestToast, clearAllTestingToasts, showTestSummaryToast } from '@/utils/testingToasts';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel, Grade, LanguageCode, LearningGoal, AvatarType, SkinTone } from '@/types';

// Robust word counting function
const countWords = (content: string | string[]): number => {
  if (!content) return 0;
  
  // Handle array of pages
  if (Array.isArray(content)) {
    return content.reduce((total, page) => total + countWords(page), 0);
  }
  
  // Handle single string
  if (typeof content === 'string') {
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
  
  return 0;
};

interface TestResult {
  level: string;
  service: 'netflix' | 'live' | 'template';
  success: boolean;
  pages: number;
  actualPages?: number;
  wordCount: number;
  source: 'ai' | 'fallback' | 'emergency' | 'unknown';
  contentPreview: string;
  fullContent: string[];
  responseTime?: number;
  error?: string;
  fallbackReason?: string;
  generationPath?: string[];
  emergencyContentUsed?: boolean;
  sessionId?: string;  // Add session ID field
  // Enhanced validation fields
  placeholderValidation?: import('@/utils/placeholderValidator').PlaceholderValidationResult;
  contentIssues?: string[];
  tokenValidation?: any;
  hasEmptyContent?: boolean;
  // Character analysis fields
  characterAnalysis?: CharacterAnalysis;
  // Validation tracking
  validationDecision?: ValidationDecision;
  validationReasons?: string[];
  repairAttempted?: boolean;
}

interface ServiceComparison {
  level: string;
  netflix?: TestResult;
  live?: TestResult;
  template?: TestResult;
}

// Enhanced test profiles with more comprehensive coverage
const testUserProfiles: Record<string, UserInfo> = {
  // Core difficulty levels
  beginner: {
    name: 'Emma',
    age: 4,
    grade: "PreK" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'beginner',
    favoriteColor: 'pink',
    favoriteAnimal: 'butterfly',
    hobbies: 'coloring',
    favoriteFood: 'cookies',
    specialRequest: 'stories about rainbows'
  },
  easy: {
    name: 'Alex',
    age: 6,
    grade: "K" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'easy',
    favoriteColor: 'blue',
    favoriteAnimal: 'dolphin',
    hobbies: 'swimming',
    favoriteFood: 'ice cream',
    specialRequest: 'sports adventures'
  },
  medium: {
    name: 'Maya',
    age: 8,
    grade: "2nd" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "medium" },
    difficultyLevel: 'medium',
    favoriteColor: 'green',
    favoriteAnimal: 'owl',
    hobbies: 'reading mysteries',
    favoriteFood: 'pizza',
    specialRequest: 'mystery adventures'
  },
  hard: {
    name: 'Jordan',
    age: 10,
    grade: "4th" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "dark" },
    difficultyLevel: 'hard',
    favoriteColor: 'purple',
    favoriteAnimal: 'wolf',
    hobbies: 'adventure sports',
    favoriteFood: 'sushi',
    specialRequest: 'science fiction'
  },
  expert: {
    name: 'Taylor',
    age: 12,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'expert',
    expertGradeLevel: '6th' as ExpertGradeLevel,
    favoriteColor: 'silver',
    favoriteAnimal: 'dragon',
    hobbies: 'advanced reading',
    favoriteFood: 'sushi',
    specialRequest: 'complex adventures'
  },
  
  // Grade-specific expert levels
  grade6: {
    name: 'Sam',
    age: 11,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'expert',
    expertGradeLevel: '6th' as ExpertGradeLevel,
    favoriteColor: 'orange',
    favoriteAnimal: 'tiger',
    hobbies: 'martial arts',
    favoriteFood: 'burgers',
    specialRequest: 'mythological adventures'
  },
  grade7: {
    name: 'Dakota',
    age: 12,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "dark" },
    difficultyLevel: 'expert',
    expertGradeLevel: '7th' as ExpertGradeLevel,
    favoriteColor: 'gold',
    favoriteAnimal: 'falcon',
    hobbies: 'astronomy',
    favoriteFood: 'ramen',
    specialRequest: 'space exploration'
  },
  grade8: {
    name: 'River',
    age: 13,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "medium" },
    difficultyLevel: 'expert',
    expertGradeLevel: '8th' as ExpertGradeLevel,
    favoriteColor: 'teal',
    favoriteAnimal: 'whale',
    hobbies: 'marine biology',
    favoriteFood: 'tacos',
    specialRequest: 'futuristic stories'
  },
  grade9: {
    name: 'Sage',
    age: 14,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "olive" },
    difficultyLevel: 'expert',
    expertGradeLevel: '9th' as ExpertGradeLevel,
    favoriteColor: 'violet',
    favoriteAnimal: 'raven',
    hobbies: 'creative writing',
    favoriteFood: 'curry',
    specialRequest: 'psychological thrillers'
  },
  grade10: {
    name: 'Phoenix',
    age: 15,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "olive" },
    difficultyLevel: 'expert',
    expertGradeLevel: '10th' as ExpertGradeLevel,
    favoriteColor: 'crimson',
    favoriteAnimal: 'phoenix',
    hobbies: 'mythology research',
    favoriteFood: 'lobster',
    specialRequest: 'complex narratives'
  }
};


export function StoryPromptTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [serviceComparisons, setServiceComparisons] = useState<ServiceComparison[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('netflix');
  const [testMode, setTestMode] = useState<'full' | 'ai-only' | 'live-only' | 'template-only' | 'comparison'>('full');
  const [logs, setLogs] = useState<string[]>([]);
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});
  
  // Performance optimization: Cache validation results
  const [validationCache] = useState<Map<string, any>>(new Map());
  const [testTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  
  // Custom user preferences state
  const [useCustomPreferences, setUseCustomPreferences] = useState(false);
  const [customUserPrefs, setCustomUserPrefs] = useState<UserInfo>({
    name: 'Test User',
    age: 8,
    grade: "2nd" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    difficultyLevel: 'medium',
    favoriteColor: 'blue',
    favoriteAnimal: 'dog',
    hobbies: 'playing games',
    favoriteFood: 'pizza',
    specialRequest: 'adventure stories',
    targetVocabulary: ''
  });
  const [customFormExpanded, setCustomFormExpanded] = useState(false);

  const templateService = useTemplateService();

  // Cached validation to improve performance
  const getCachedValidation = (content: string[], level: string, service: string) => {
    const cacheKey = `${content.join('').substring(0, 100)}_${level}_${service}`;
    return validationCache.get(cacheKey);
  };

  const setCachedValidation = (content: string[], level: string, service: string, result: any) => {
    const cacheKey = `${content.join('').substring(0, 100)}_${level}_${service}`;
    validationCache.set(cacheKey, result);
    
    // Limit cache size to prevent memory leaks
    if (validationCache.size > 100) {
      const firstKey = validationCache.keys().next().value;
      validationCache.delete(firstKey);
    }
  };

  // Enhanced validation with repair handling (moved to proper location)
  const performValidationWithRepair = async (
    content: string[],
    level: string,
    result: TestResult
  ): Promise<void> => {
    try {
      showTestToast({
        level,
        step: 'validation',
        message: 'Validating content quality'
      });

      const validationLevel = UnifiedValidator.mapDifficultyToLevel(level as DifficultyLevel);
      const validationResult = UnifiedValidator.validateContent(content, {
        mode: 'guest',
        level: validationLevel,
        userLanguage: 'en'
      });

      result.validationDecision = validationResult.decision;
      result.validationReasons = validationResult.reasons;
      
      // PHASE 2: PAGE COUNT INVESTIGATION - Track validation decisions affecting page count
      console.log(`🔍 [VALIDATION-DEBUG] ${level} - Validation Decision Impact:`, {
        originalPageCount: content.length,
        validationDecision: validationResult.decision,
        validationReasons: validationResult.reasons,
        newPageCount: validationResult.content?.length || content.length,
        pageCountChanged: (validationResult.content?.length || content.length) !== content.length
      });

      if (validationResult.decision === 'REPAIR') {
        showTestToast({
          level,
          step: 'repair_needed',
          message: validationResult.reasons[0] || 'Content needs repair'
        });
        result.repairAttempted = true;
        
        // PHASE 5: ROOT CAUSE IDENTIFICATION - Track repair triggers
        console.log(`🔍 [REPAIR-TRIGGER-DEBUG] ${level} - Repair Needed:`, {
          repairReason: validationResult.reasons[0],
          originalContent: content[0]?.substring(0, 100) + '...',
          repairStrategy: 'simulated'
        });
        
        showTestToast({
          level,
          step: 'repair_success',
          message: 'Repair completed (simulated)'
        });
      } else if (validationResult.decision === 'REPAIR_AND_SPLIT') {
        if (validationResult.content) {
          result.fullContent = validationResult.content;
          result.actualPages = validationResult.content.length;
          
          // PHASE 2: PAGE COUNT INVESTIGATION - Track page splitting in validation
          console.log(`🔍 [PAGE-SPLIT-DEBUG] ${level} - Validation Split Pages:`, {
            originalPages: content.length,
            newPages: validationResult.content.length,
            splitReason: validationResult.reasons[0],
            pageCountDelta: validationResult.content.length - content.length
          });
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      // PHASE 5: ROOT CAUSE IDENTIFICATION - Track validation failures
      console.log(`🔍 [VALIDATION-ERROR-DEBUG] ${level} - Validation Failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        contentLength: content.length,
        contentPreview: content[0]?.substring(0, 50) + '...'
      });
    }
  };

  // Test individual service with timeout and enhanced validation
  const testService = async (
    level: string, 
    userInfo: UserInfo, 
    service: 'netflix' | 'live' | 'template'
  ): Promise<TestResult> => {
    const startTime = Date.now();
    const testKey = `${level}_${service}`;
    
    // PHASE 4: PLACEHOLDER TRACKING - Log all 6 placeholders being sent
    console.log(`🔍 [PLACEHOLDER-DEBUG] ${service} test for ${level} level - Placeholder data:`, {
      placeholdersSent: {
        userName: userInfo.name,
        favoriteColor: userInfo.favoriteColor,
        favoriteAnimal: userInfo.favoriteAnimal,
        favoriteFood: userInfo.favoriteFood,
        hobbies: userInfo.hobbies,
        specialRequest: userInfo.specialRequest
      },
      allSixPlaceholdersActive: !!(userInfo.name && userInfo.favoriteColor && userInfo.favoriteAnimal && userInfo.favoriteFood && userInfo.hobbies && userInfo.specialRequest),
      timestamp: new Date().toISOString()
    });
    
    // Show starting toast
    showTestToast({
      level,
      step: 'starting',
      message: `Starting ${service} service test`
    });
    
    // Clear any existing timeout
    if (testTimeouts.has(testKey)) {
      clearTimeout(testTimeouts.get(testKey)!);
      testTimeouts.delete(testKey);
    }
    let result: TestResult = {
      level,
      service,
      success: false,
      pages: 0,
      wordCount: 0,
      source: 'unknown',
      contentPreview: '',
      fullContent: [],
      generationPath: [],
      emergencyContentUsed: false
    };

    try {
      let response: any = null;
      result.generationPath = [`Starting ${service} service test`];

      // Use real user timeout configuration with retries and delays
      const testWithTimeout = async (operation: () => Promise<any>) => {
        return withTimeout(operation, TIMEOUT_CONFIGS.STORY_GENERATION);
      };

      // Add detailed debugging for medium and hard levels
      if (level === 'medium' || level === 'hard') {
        console.log(`🔍 [TEST-DEBUG] Starting ${service} test for ${level} level:`, {
          userInfo: {
            name: userInfo.name,
            age: userInfo.age,
            difficultyLevel: userInfo.difficultyLevel,
            grade: userInfo.grade
          },
          expectedLevel: level === 'medium' ? 'Level2' : 'Level3',
          expectedTokens: level === 'medium' ? '1500 (guest)' : '2100 (guest)',
          timestamp: new Date().toISOString()
        });
      }

      if (service === 'netflix') {
        result.generationPath.push('Calling NetflixStyleStoryService.generateStory()');
        
        // Generate session ID for debug tracking (matches service format)
        result.sessionId = `netflix-${userInfo.name}-${Date.now()}`;
        
        // Show AI generation toast
        showTestToast({
          level,
          step: 'ai_generation',
          message: 'Generating with Netflix-style service'
        });
        
        // PHASE 3: PERFORMANCE ANALYSIS - Track timing breakdown
        const aiStartTime = Date.now();
        response = await testWithTimeout(() => NetflixStyleStoryService.generateStory(userInfo));
        const aiGenerationTime = Date.now() - aiStartTime;
        
        result.source = response.source || 'unknown';
        
        // PHASE 2: PAGE COUNT INVESTIGATION - Enhanced logging
        console.log(`🔍 [PAGE-COUNT-DEBUG] Netflix ${level} - Raw AI Response Analysis:`, {
          rawResponseKeys: Object.keys(response),
          hasContent: !!response.content,
          contentType: Array.isArray(response.content) ? 'array' : typeof response.content,
          rawPageCount: response.content?.length || 0,
          contentPreview: response.content?.[0]?.substring(0, 100) + '...',
          pageSplittingMethod: response.pageCountMethod || 'unknown',
          aiGenerationTime: `${aiGenerationTime}ms`,
          source: response.source,
          expectedPages: 12,
          actualPages: response.content?.length || 0,
          pageCountDelta: (response.content?.length || 0) - 12
        });
        
        // Check if this was actually AI or fallback
        if (result.source === 'ai') {
          showTestToast({
            level,
            step: 'ai_success',
            message: 'AI generation completed'
          });
        } else if (result.source === 'fallback') {
          showTestToast({
            level,
            step: 'template_fallback',
            message: 'AI failed, used template fallback'
          });
        } else if (result.source === 'emergency') {
          showTestToast({
            level,
            step: 'template_failed',
            message: 'Template failed, used emergency content'
          });
        }
        
        // Use actual page count from the response
        const actualPageCount = response.pageCount || response.pages?.length || 0;
        // Get expected pages using real session logic
        const validationLevel = mapDifficultyToLevel(level as DifficultyLevel | ExpertGradeLevel);
        result.pages = getExpectedPagesForLevel(validationLevel);
        result.actualPages = actualPageCount;
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 [TEST-DEBUG] Netflix Service Result for ${level}:`, {
          source: response.source,
          hasContent: !!response.content,
          pageCount: response.content?.length || 0,
          contentPreview: response.content?.[0]?.substring(0, 50) + '...',
          totalWordCount: response.content ? response.content.join(' ').split(/\s+/).length : 0,
          error: response.error || 'none',
          fallbackReason: response.fallbackReason || 'none'
        });
        
        if (response.content && Array.isArray(response.content)) {
          result.wordCount = countWords(response.content);
          result.contentPreview = response.content[0]?.substring(0, 100) + '...' || '';
          result.fullContent = response.content;
          
          // PHASE 4: PLACEHOLDER TRACKING - Check placeholder usage in final story
          const fullStoryText = response.content.join(' ');
          const placeholderUsage = {
            userName: fullStoryText.toLowerCase().includes(userInfo.name?.toLowerCase() || ''),
            favoriteColor: fullStoryText.toLowerCase().includes(userInfo.favoriteColor?.toLowerCase() || ''),
            favoriteAnimal: fullStoryText.toLowerCase().includes(userInfo.favoriteAnimal?.toLowerCase() || ''),
            favoriteFood: fullStoryText.toLowerCase().includes(userInfo.favoriteFood?.toLowerCase() || ''),
            hobbies: fullStoryText.toLowerCase().includes(userInfo.hobbies?.toLowerCase() || ''),
            specialRequest: fullStoryText.toLowerCase().includes(userInfo.specialRequest?.toLowerCase() || '')
          };
          const placeholdersUsedCount = Object.values(placeholderUsage).filter(Boolean).length;
          
          console.log(`🔍 [PLACEHOLDER-USAGE-DEBUG] Netflix ${level} - Placeholder Utilization:`, {
            placeholderUsage,
            placeholdersUsedCount,
            placeholdersUsedRate: `${placeholdersUsedCount}/6 (${Math.round((placeholdersUsedCount/6)*100)}%)`,
            storyPreview: fullStoryText.substring(0, 200) + '...'
          });
          
          // Add character analysis
          result.characterAnalysis = analyzeCharacters(
            response.content,
            result.wordCount,
            response.content.length
          );
          
          // Check for emergency content (rhyming educational content)
          const firstPage = response.content[0] || '';
          if (firstPage.includes('story machine took a little rest') || 
              firstPage.includes('story elves went to play') ||
              firstPage.includes('Try Again')) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used emergency rhyming content');
          }
          
          // PHASE 3: PERFORMANCE ANALYSIS - Track validation timing
          const validationStartTime = Date.now();
          await performValidationWithRepair(response.content, level, result);
          const validationTime = Date.now() - validationStartTime;
          
          console.log(`🔍 [PERFORMANCE-DEBUG] Netflix ${level} - Timing Breakdown:`, {
            aiGenerationTime: `${aiGenerationTime}ms`,
            validationTime: `${validationTime}ms`,
            totalTime: `${Date.now() - startTime}ms`,
            pageCount: response.content.length,
            wordsPerSecond: Math.round(result.wordCount / ((Date.now() - startTime) / 1000))
          });
        }
        
      } else if (service === 'live') {
        result.generationPath.push('Calling LiveGenerationService.generateFirstPage()');
        
        // Generate session ID for debug tracking (matches service format)  
        result.sessionId = `live-first-${userInfo.name}-${Date.now()}`;
        
        // Show AI generation toast
        showTestToast({
          level,
          step: 'ai_generation',
          message: 'Generating with Live service'
        });
        
        console.log('🔄 About to call LiveGenerationService.generateFirstPage with userInfo:', userInfo);
        try {
          response = await testWithTimeout(() => LiveGenerationService.generateFirstPage(userInfo));
          console.log('✅ Live service call completed successfully:', response);
        } catch (liveServiceError) {
          console.error('❌ Live service call failed:', liveServiceError);
          throw liveServiceError; // Re-throw to maintain existing error handling
        }
        
        // Check global source tracking
        const globalSource = (globalThis as any).__LAST_PAGE_SOURCE__;
        result.source = globalSource || 'unknown';
        // Dynamic linkage: LiveGenerationService generates "1 page at a time" (as defined in NetflixStyleStoryService.ts:20)
        result.pages = response.content ? 1 : 0;
        
        // Show appropriate toast based on source
        if (result.source === 'ai') {
          showTestToast({
            level,
            step: 'ai_success',
            message: 'AI generation completed'
          });
        } else {
          showTestToast({
            level,
            step: 'template_fallback',
            message: 'AI failed, used fallback'
          });
        }
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 [TEST-DEBUG] Live Service Result for ${level}:`, {
          source: globalSource,
          hasContent: !!response.content,
          contentLength: response.content?.length || 0,
          contentPreview: response.content?.substring(0, 50) + '...',
          wordCount: response.content ? response.content.split(/\s+/).length : 0,
          error: response.error || 'none'
        });
        
        if (response.content) {
          result.wordCount = countWords(response.content);
          result.contentPreview = response.content.substring(0, 100) + '...';
          result.fullContent = [response.content];
          
          // Add character analysis
          result.characterAnalysis = analyzeCharacters(
            [response.content],
            result.wordCount,
            1
          );
          
          // Check for emergency content
          if (response.content.includes('began a wonderful adventure') && response.content.length < 50) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used basic emergency content');
          }
          
          // Perform validation with repair handling  
          await performValidationWithRepair([response.content], level, result);
        }
        
      } else if (service === 'template') {
        result.generationPath.push('Calling template service directly');
        
        // Generate session ID for debug tracking
        result.sessionId = `template-test-${userInfo.name}-${Date.now()}`;
        
        // Show template generation toast
        showTestToast({
          level,
          step: 'template_fallback',
          message: 'Testing template service directly'
        });
        
        response = await testWithTimeout(() => templateService.generateStory(userInfo, 'testing'));
        result.source = response.success ? 'fallback' : 'emergency'; // Templates are fallback, emergency if they fail
        result.pages = response.pageCount || response.pages?.length || 0;
        
        // Show result toast
        if (response.success) {
          showTestToast({
            level,
            step: 'template_success',
            message: 'Template generation completed'
          });
        } else {
          showTestToast({
            level,
            step: 'template_failed',
            message: 'Template generation failed'
          });
        }
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 [TEST-DEBUG] Template Service Result for ${level}:`, {
          source: response.success ? 'fallback' : 'emergency',
          success: response.success,
          hasPages: !!response.pages,
          pageCount: response.pages?.length || 0,
          contentPreview: response.pages?.[0]?.substring(0, 50) + '...',
          totalWordCount: response.pages ? response.pages.join(' ').split(/\s+/).length : 0,
          error: response.error || 'none'
        });
        
        if (response.pages && Array.isArray(response.pages)) {
          result.wordCount = countWords(response.pages);
          result.contentPreview = response.pages[0]?.substring(0, 100) + '...' || '';
          result.fullContent = response.pages;
          
          // Add character analysis
          result.characterAnalysis = analyzeCharacters(
            response.pages,
            result.wordCount,
            response.pages.length
          );
          
          // Check for emergency rhyming content from ErrorHandlingManager
          const firstPage = response.pages[0] || '';
          if (firstPage.includes('story machine took a little rest') || 
              firstPage.includes('story elves went to play') ||
              firstPage.includes('Try Again')) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used ErrorHandlingManager emergency content');
          }
          
          // Perform validation with repair handling
          await performValidationWithRepair(response.pages, level, result);
        }
      }

      result.responseTime = Date.now() - startTime;
      result.success = true;
      
      // Show final result toast
      showTestToast({
        level,
        step: 'final_result',
        source: result.source as any,
        message: `Test completed in ${result.responseTime}ms`
      });
      
      // Performance optimized validation - check cache first
      if (result.fullContent && result.fullContent.length > 0) {
        let cachedValidation = getCachedValidation(result.fullContent, level, service);
        
        if (!cachedValidation) {
          // Run validation and cache results
          const placeholderValidation = validatePlaceholders(result.fullContent, result.source);
          const contentIssues = checkForPlaceholderIssues(result.fullContent);
          const validationLevel = UnifiedValidator.mapDifficultyToLevel(level as DifficultyLevel);
          const tokenValidation = UnifiedValidator.validateContent(result.fullContent.join(' '), { mode: 'guest', level: validationLevel });
          
          cachedValidation = {
            placeholderValidation,
            contentIssues,
            tokenValidation: {
              isValid: tokenValidation.isValid,
              actualTokens: tokenValidation.metrics.tokenCount,
              maxAllowed: UnifiedValidator.getTokenLimits(validationLevel).guestStory,
              warnings: tokenValidation.reasons
            }
          };
          
          setCachedValidation(result.fullContent, level, service, cachedValidation);
        }
        
        result.placeholderValidation = cachedValidation.placeholderValidation;
        result.contentIssues = cachedValidation.contentIssues;
        result.tokenValidation = cachedValidation.tokenValidation;
        result.hasEmptyContent = result.wordCount === 0 || result.fullContent.every(page => page.trim().length === 0);
        
        // If we have empty content, mark as failed
        if (result.hasEmptyContent) {
          result.success = false;
          result.error = 'Content generation resulted in empty pages - likely placeholder resolution failure';
          result.generationPath.push('❌ Content validation failed: Empty pages detected');
        }
        
        // Add placeholder validation to generation path
        if (result.placeholderValidation && !result.placeholderValidation.isValid) {
          result.generationPath.push(`⚠️ Placeholder issues: ${result.placeholderValidation.unresolvedPlaceholders?.join(', ') || 'Unknown'}`);
        }
      }
      
      // Determine fallback reason for non-AI sources
      if (result.source === 'fallback') {
        result.fallbackReason = 'Template system used (AI unavailable)';
        result.generationPath.push('Used template fallback');
      } else if (result.source === 'emergency') {
        result.fallbackReason = result.emergencyContentUsed ? 
          'Emergency rhyming content used (system failure)' : 
          'Basic emergency content used';
        result.generationPath.push('Used emergency fallback');
      } else if (result.source === 'ai') {
        result.generationPath.push('AI generation successful');
      }

      // Clear timeout if test completes successfully
      if (testTimeouts.has(testKey)) {
        clearTimeout(testTimeouts.get(testKey)!);
        testTimeouts.delete(testKey);
      }

      // Add log entry with performance info
      setLogs(prev => [...prev, `✅ ${service} test for ${level}: ${result.source} source, ${result.pages} pages, ${result.wordCount} words (${result.responseTime}ms)`]);

      // Special logging for medium level to debug failures
      if (level === 'medium') {
        console.log(`🔍 [DEBUG] Medium ${service} test completed:`, {
          success: result.success,
          source: result.source,
          pages: result.pages,
          wordCount: result.wordCount,
          fallbackReason: result.fallbackReason,
          error: result.error
        });
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.responseTime = Date.now() - startTime;
      result.generationPath.push(`Error: ${result.error}`);
      
      // PHASE 5: ROOT CAUSE IDENTIFICATION - Track cascade failures and timeouts
      console.log(`🔍 [PERFORMANCE-ERROR-DEBUG] ${service} ${level} - Load Time Analysis:`, {
        totalTime: `${result.responseTime}ms`,
        error: result.error,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        timeoutOccurred: result.error?.includes('timeout') || result.error?.includes('AbortError'),
        cascadeFailure: result.error?.includes('model') || result.error?.includes('service'),
        networkDelay: result.responseTime > 10000 ? 'EXCESSIVE' : result.responseTime > 5000 ? 'HIGH' : 'NORMAL'
      });
      
      // Clear timeout on error
      if (testTimeouts.has(testKey)) {
        clearTimeout(testTimeouts.get(testKey)!);
        testTimeouts.delete(testKey);
      }
      
      setLogs(prev => [...prev, `❌ ${service} test failed for ${level}: ${result.error}`]);
      console.error(`${service} test failed for ${level}:`, error);
      
      // Special error logging for medium level
      if (level === 'medium') {
        console.error(`🚨 [DEBUG] Medium ${service} test failed:`, {
          error: result.error,
          responseTime: result.responseTime,
          userInfo: userInfo.name
        });
      }
    }

    return result;
  };


  // Enhanced content validation
  const validateContentQuality = (pages: string[]): { 
    score: number;
    issues: string[];
    grammarIssues: string[];
  } => {
    const issues: string[] = [];
    const grammarIssues: string[] = [];
    let score = 100;

    pages.forEach((page, index) => {
      if (!page || typeof page !== 'string') {
        issues.push(`Page ${index + 1}: Invalid content type`);
        score -= 20;
        return;
      }

      // Grammar issues
      const grammarPatterns = [
        { pattern: /\ba\s+([aeiouAEIOU])/, description: "Should use 'an' before vowel" },
        { pattern: /\ban\s+([^aeiouAEIOU])/, description: "Should use 'a' before consonant" },
        { pattern: /\s{2,}/, description: "Multiple spaces" },
        { pattern: /\.\s*\./, description: "Double periods" }
      ];

      grammarPatterns.forEach(({ pattern, description }) => {
        if (pattern.test(page)) {
          grammarIssues.push(`Page ${index + 1}: ${description}`);
          score -= 5;
        }
      });

      // Word count issues
      const wordCount = countWords(page);
      if (wordCount > 200) {
        issues.push(`Page ${index + 1}: Excessive length (${wordCount} words)`);
        score -= 10;
      }
    });

    return { 
      score: Math.max(0, score), 
      issues, 
      grammarIssues 
    };
  };


  // Optimized batch test runner with progressive results
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setServiceComparisons([]);
    setLogs(['🚀 Starting optimized story generation tests...']);
    setProgress(0);
    
    // Clear validation cache for fresh tests
    validationCache.clear();

    // Use custom preferences if enabled, otherwise use all predefined profiles
    const profiles: [string, UserInfo][] = useCustomPreferences 
      ? [['custom', customUserPrefs] as [string, UserInfo]] 
      : Object.entries(testUserProfiles);
    
    const servicesCount = testMode === 'comparison' ? 3 : testMode === 'full' ? 2 : 1;
    const totalTests = profiles.length * servicesCount;
    let completed = 0;

    const comparisons: ServiceComparison[] = [];

    // Process tests in batches for better performance
    const batchSize = 2; // Process 2 tests at a time
    
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      
      // Process batch in parallel
      await Promise.all(batch.map(async ([level, userInfo]) => {
        setCurrentTest(`Testing ${level} (${userInfo.name})`);
        
        const comparison: ServiceComparison = { level };
        const batchResults: TestResult[] = [];
        
        try {
          if (testMode === 'full') {
            // Test both Netflix and Live services for comprehensive testing
            const netflixResult = await testService(level, userInfo, 'netflix');
            const liveResult = await testService(level, userInfo, 'live');
            
            batchResults.push(netflixResult, liveResult);
            comparison.netflix = netflixResult;
            comparison.live = liveResult;
            
            completed += 2;
            setProgress((completed / totalTests) * 100);
          }

          if (testMode === 'ai-only') {
            // Test Netflix service only (AI-first complete stories)
            const netflixResult = await testService(level, userInfo, 'netflix');
            batchResults.push(netflixResult);
            comparison.netflix = netflixResult;
            completed++;
            setProgress((completed / totalTests) * 100);
          }

          if (testMode === 'live-only') {
            // Test Live service only (page-by-page generation)
            const liveResult = await testService(level, userInfo, 'live');
            batchResults.push(liveResult);
            comparison.live = liveResult;
            completed++;
            setProgress((completed / totalTests) * 100);
          }

          if (testMode === 'comparison') {
            // Test all three services for comparison
            const netflixResult = await testService(level, userInfo, 'netflix');
            const liveResult = await testService(level, userInfo, 'live');
            const templateResult = await testService(level, userInfo, 'template');
            
            batchResults.push(netflixResult, liveResult, templateResult);
            comparison.netflix = netflixResult;
            comparison.live = liveResult;
            comparison.template = templateResult;
            
            completed += 3;
            setProgress((completed / totalTests) * 100);
          }

          if (testMode === 'template-only') {
            // Test only template service
            const templateResult = await testService(level, userInfo, 'template');
            batchResults.push(templateResult);
            comparison.template = templateResult;
            completed++;
            setProgress((completed / totalTests) * 100);
          }

        } catch (error) {
          console.error(`Test failed for ${level}:`, error);
          setLogs(prev => [...prev, `❌ Test failed for ${level}: ${error}`]);
        }

        comparisons.push(comparison);
        
        // Update results with only the current batch's new results
        setTestResults(prev => [...prev, ...batchResults]);
        setServiceComparisons(prev => [...prev, comparison]);
      }));
      
      // Short delay between batches to prevent overwhelming the services
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setIsRunning(false);
    setCurrentTest('');
    setProgress(100);
    setLogs(prev => [...prev, `🎉 All tests completed! Cache size: ${validationCache.size}`]);
  };

  // Reset all tests and clear caches
  const resetTests = () => {
    setTestResults([]);
    setServiceComparisons([]);
    setProgress(0);
    setCurrentTest('');
    setLogs([]);
    
    // Clear performance caches
    validationCache.clear();
    
    // Clear any remaining timeouts
    testTimeouts.forEach(timeout => clearTimeout(timeout));
    testTimeouts.clear();
  };

  // Render source badge
  const renderSourceBadge = (source: string, emergencyUsed?: boolean) => {
    const sourceConfig = {
      'ai': { color: 'bg-green-500', icon: '🤖', label: 'AI Generated' },
      'fallback': { color: 'bg-yellow-500', icon: '📚', label: 'Template Fallback' },
      'emergency': { color: 'bg-red-500', icon: '🚨', label: emergencyUsed ? 'Emergency Rhyming' : 'Emergency Content' },
      'unknown': { color: 'bg-gray-500', icon: '❓', label: 'Unknown' }
    };
    
    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.unknown;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  // Render individual test result with unique key generation
  const renderTestResult = (result: TestResult, index: number) => {
    // Use index and additional identifiers to ensure unique keys
    const resultKey = `${result.level}-${result.service}-${index}-${result.wordCount}`;
    const isContentExpanded = expandedContent[resultKey] || false;
    const toggleContentExpanded = () => {
      setExpandedContent(prev => ({
        ...prev,
        [resultKey]: !prev[resultKey]
      }));
    };

    return (
      <Card key={resultKey} className={`mb-4 border-2 ${
          result.success ? 'border-green-200' : 'border-red-200'
        }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {result.level} - {result.service.toUpperCase()}
            </CardTitle>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {renderSourceBadge(result.source, result.emergencyContentUsed)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Pages</div>
            <div className="font-semibold">
              {result.service === 'netflix' && result.actualPages !== undefined ? (
                <span className="flex items-center gap-1">
                  Expected: {result.pages}, Got: {result.actualPages}
                  {result.pages === result.actualPages ? 
                    <span className="text-green-600">✅</span> : 
                    <span className="text-red-600">❌</span>
                  }
                </span>
              ) : (
                result.pages
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Words</div>
            <div className="font-semibold">{result.wordCount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Response Time</div>
            <div className="font-semibold">{result.responseTime}ms</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Session ID</div>
            <Input 
              readOnly
              value={result.sessionId || 'Not captured'}
              className="font-mono text-xs h-6 px-2 max-w-[200px] cursor-text"
              title={result.sessionId}
            />
          </div>
        </div>
        
        {result.contentPreview && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Content Preview</div>
            <div className="text-sm bg-muted p-2 rounded">
              {result.contentPreview}
            </div>
          </div>
        )}

        {result.generationPath && result.generationPath.length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Generation Path</div>
            <div className="text-xs space-y-1">
              {result.generationPath.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.fallbackReason && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Fallback Reason</div>
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {result.fallbackReason}
            </div>
          </div>
        )}

        {result.error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            ❌ {result.error}
          </div>
        )}


        {result.emergencyContentUsed && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
            ℹ️ Emergency educational content was used - this includes rhyming explanations to help users understand what happened
          </div>
        )}

        {/* Enhanced Content Validation Results */}
        {result.success && result.fullContent && result.fullContent.length > 0 && (result.placeholderValidation || result.tokenValidation) && (
          <div className="mt-4 space-y-3">
            {/* Placeholder Validation */}
            {result.placeholderValidation && (
              <div className={`p-3 rounded-lg border ${result.placeholderValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.placeholderValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">Placeholder Resolution</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getPlaceholderValidationMessage(result.placeholderValidation)}
                </p>
                {result.contentIssues && result.contentIssues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-yellow-800">Content Issues:</p>
                    {result.contentIssues.map((issue, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Token Validation */}
            {result.tokenValidation && (
              <div className={`p-3 rounded-lg border ${result.tokenValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.tokenValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Token Validation</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    {result.tokenValidation.actualTokens} / {result.tokenValidation.maxAllowed} tokens
                  </span>
                  {result.tokenValidation.templateMode && (
                    <Badge variant="outline" className="text-xs">Template Mode</Badge>
                  )}
                </div>
                {result.tokenValidation.warnings && result.tokenValidation.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.tokenValidation.warnings.map((warning, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty Content Alert */}
        {result.hasEmptyContent && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Empty Content Detected</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              This usually indicates placeholder resolution failure. The template returned {result.pages} pages but with 0 words total.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-red-800">Possible causes:</p>
              <ul className="text-xs text-red-700 space-y-1 ml-4">
                <li>• Missing userInfo data (name, favoriteColor, etc.)</li>
                <li>• Placeholder cleanup function removing all content</li>
                <li>• Template placeholders not matching resolver expectations</li>
                <li>• Fallback values not being applied properly</li>
              </ul>
            </div>
          </div>
        )}

        {/* Full Content Display - Always show for debugging, even when empty */}
        {result.fullContent && result.fullContent.length > 0 && (
          <Collapsible open={isContentExpanded} onOpenChange={toggleContentExpanded} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                {result.hasEmptyContent ? 
                  (isContentExpanded ? 'Hide Debug Info' : 'View Debug Info (Empty Content)') :
                  (isContentExpanded ? 'Hide Full Content' : 'View Full Content')
                }
                {isContentExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center justify-between">
                  <span>Complete Story Content ({result.pages} page{result.pages !== 1 ? 's' : ''})</span>
                  <span>Total: {result.wordCount} words</span>
                </div>
                
                {result.emergencyContentUsed && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-200 rounded">
                    <div className="text-sm font-medium text-red-800 mb-1">🚨 Emergency Content Alert</div>
                    <div className="text-sm text-red-700">
                      This content was generated using emergency fallback systems. It includes educational rhyming content 
                      to help explain technical issues to users.
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {result.fullContent.map((page, index) => {
                    const pageWordCount = countWords(page);
                    const isEmergencyPage = page && (page.includes('story machine took a little rest') || 
                                           page.includes('story elves went to play') ||
                                           page.includes('Try Again'));
                    const isEmpty = !page || page.trim().length === 0;
                    
                    return (
                      <div key={index} className={`border-l-2 pl-4 ${
                        isEmpty ? 'border-red-500 bg-red-50' : 
                        isEmergencyPage ? 'border-red-300 bg-red-50' : 'border-primary/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            Page {index + 1}
                            {isEmpty && <span className="ml-2 text-red-600 text-xs">[EMPTY PAGE]</span>}
                            {isEmergencyPage && <span className="ml-2 text-red-600 text-xs">[Emergency Content]</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pageWordCount} word{pageWordCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className={`text-sm leading-6 ${
                          isEmpty ? 'text-red-800 italic' :
                          isEmergencyPage ? 'text-red-800' : 'text-foreground'
                        }`}>
                          {isEmpty ? '(No content generated - likely placeholder resolution failure)' : page}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Guest cutoff notification for expert grades on Netflix service */}
                  {result.service === 'netflix' && 
                   (result.level.includes('grade') || result.level.includes('th')) && 
                   result.fullContent.length >= 6 && (
                    <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-300 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-orange-800">Guest User Demo Cutoff</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        📍 This is where guest users get cut off in a real demonstration
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Guest users can only read up to 6 pages per story before needing to upgrade to premium.
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Analysis */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Content Analysis</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total Words</div>
                      <div className="font-medium">{result.wordCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Characters</div>
                      <div className="font-medium">{result.characterAnalysis?.totalCharacters || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Words/Page</div>
                      <div className="font-medium">{Math.round(result.wordCount / (result.actualPages || result.pages || 1))}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Chars/Word</div>
                      <div className="font-medium">{result.characterAnalysis?.averageCharactersPerWord || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Source Type</div>
                      <div className="font-medium">
                        {result.emergencyContentUsed ? 'Emergency' : result.source.toUpperCase()}
                        {result.validationDecision && (
                          <div className="text-xs text-muted-foreground">
                            Val: {result.validationDecision}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional character metrics */}
                  {result.characterAnalysis && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Character Analysis</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-muted-foreground">Chars (no spaces)</div>
                          <div className="font-medium">{result.characterAnalysis.charactersNoSpaces}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Chars/Page</div>
                          <div className="font-medium">{result.characterAnalysis.averageCharactersPerPage}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Comprehensive Story Generation Testing</h2>
        <p className="text-muted-foreground mb-6">
          Test both Netflix-style complete stories and Live page-by-page generation with AI-first fallback chains
        </p>

        {/* Custom User Preferences Form */}
        <Card className="mb-6">
          <Collapsible open={customFormExpanded} onOpenChange={setCustomFormExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <CardTitle className="text-lg">Custom User Preferences</CardTitle>
                    <Badge variant={useCustomPreferences ? "default" : "secondary"}>
                      {useCustomPreferences ? "Active" : "Predefined Profiles"}
                    </Badge>
                  </div>
                  {customFormExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant={useCustomPreferences ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseCustomPreferences(!useCustomPreferences)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {useCustomPreferences ? "Using Custom Preferences" : "Switch to Custom"}
                  </Button>
                  {useCustomPreferences && (
                    <div className="text-sm text-muted-foreground">
                      Testing with custom user: {customUserPrefs.name}
                    </div>
                  )}
                </div>

                {useCustomPreferences && (
                  <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={customUserPrefs.name}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter user name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="3"
                            max="18"
                            value={customUserPrefs.age}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, age: parseInt(e.target.value) || 6 }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade</Label>
                          <Select
                            value={customUserPrefs.grade}
                            onValueChange={(value: Grade) => setCustomUserPrefs(prev => ({ ...prev, grade: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PreK">PreK</SelectItem>
                              <SelectItem value="K">Kindergarten</SelectItem>
                              <SelectItem value="1st">1st Grade</SelectItem>
                              <SelectItem value="2nd">2nd Grade</SelectItem>
                              <SelectItem value="3rd">3rd Grade</SelectItem>
                              <SelectItem value="4th">4th Grade</SelectItem>
                              <SelectItem value="5th">5th Grade</SelectItem>
                              <SelectItem value="6th+">6th+ Grade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select
                            value={customUserPrefs.difficultyLevel}
                            onValueChange={(value: DifficultyLevel) => setCustomUserPrefs(prev => ({ ...prev, difficultyLevel: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Avatar Preferences</h4>
                      <div className="space-y-2">
                        <Label>Avatar Type & Skin Tone</Label>
                        <AvatarPicker
                          value={customUserPrefs.avatar}
                          onChange={(avatar) => setCustomUserPrefs(prev => ({ ...prev, avatar }))}
                        />
                      </div>
                    </div>

                    {/* Language & Learning Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Language & Learning</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nativeLanguage">Native Language</Label>
                          <Select
                            value={customUserPrefs.nativeLanguage}
                            onValueChange={(value: LanguageCode) => setCustomUserPrefs(prev => ({ ...prev, nativeLanguage: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                              <SelectItem value="ar">Arabic</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                              <SelectItem value="fr-francophone-african">French (Francophone African)</SelectItem>
                              <SelectItem value="en-african-american">English (African American)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="learningGoal">Learning Goal</Label>
                          <Select
                            value={customUserPrefs.learningGoal}
                            onValueChange={(value: LearningGoal) => setCustomUserPrefs(prev => ({ ...prev, learningGoal: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="improve-english-reading">Improve English Reading</SelectItem>
                              <SelectItem value="learn-english-language">Learn English Language</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Vocabulary Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Vocabulary & Preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="targetVocabulary">Target Vocabulary Words</Label>
                          <Textarea
                            id="targetVocabulary"
                            value={customUserPrefs.targetVocabulary || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, targetVocabulary: e.target.value }))}
                            placeholder="e.g., explore, discover, adventure, friendship (comma-separated)"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="favoriteColor">Favorite Color</Label>
                          <Input
                            id="favoriteColor"
                            value={customUserPrefs.favoriteColor || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, favoriteColor: e.target.value }))}
                            placeholder="e.g., blue, red, green"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="favoriteAnimal">Favorite Animal</Label>
                          <Input
                            id="favoriteAnimal"
                            value={customUserPrefs.favoriteAnimal || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, favoriteAnimal: e.target.value }))}
                            placeholder="e.g., dog, cat, elephant"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hobbies">Hobbies</Label>
                          <Input
                            id="hobbies"
                            value={customUserPrefs.hobbies || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, hobbies: e.target.value }))}
                            placeholder="e.g., reading, sports, art"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="favoriteFood">Favorite Food</Label>
                          <Input
                            id="favoriteFood"
                            value={customUserPrefs.favoriteFood || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, favoriteFood: e.target.value }))}
                            placeholder="e.g., pizza, ice cream, tacos"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="specialRequest">Special Request</Label>
                          <Textarea
                            id="specialRequest"
                            value={customUserPrefs.specialRequest || ''}
                            onChange={(e) => setCustomUserPrefs(prev => ({ ...prev, specialRequest: e.target.value }))}
                            placeholder="e.g., adventure stories, mystery themes, sci-fi elements"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Test Mode Selection */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 min-w-64">
                {testMode === 'full' && <><Zap className="w-4 h-4" />Full Flow (AI→Template→Emergency)</>}
                {testMode === 'ai-only' && <><Brain className="w-4 h-4" />Netflix Only</>}
                {testMode === 'live-only' && <><Zap className="w-4 h-4" />Live Only</>}
                {testMode === 'template-only' && <><Shuffle className="w-4 h-4" />Template Only</>}
                {testMode === 'comparison' && <><AlertCircle className="w-4 h-4" />Compare All Services</>}
                <ChevronDown className="w-4 h-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-background border shadow-lg z-50">
              <DropdownMenuItem 
                onClick={() => setTestMode('full')}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted"
              >
                <Zap className="w-4 h-4" />
                Full Flow (AI→Template→Emergency)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTestMode('ai-only')}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted"
              >
                <Brain className="w-4 h-4" />
                Netflix Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTestMode('live-only')}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted"
              >
                <Zap className="w-4 h-4" />
                Live Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTestMode('template-only')}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted"
              >
                <Shuffle className="w-4 h-4" />
                Template Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTestMode('comparison')}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted"
              >
                <AlertCircle className="w-4 h-4" />
                Compare All Services
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 items-center">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Testing...' : 'Run All Tests'}
          </Button>
          
          <Button onClick={resetTests} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          {progress > 0 && (
            <div className="flex-1 ml-4">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground mt-1">
                {currentTest && `${currentTest} - `}{Math.round(progress)}% complete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {(testResults.length > 0 || serviceComparisons.length > 0) && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="netflix">Netflix Service</TabsTrigger>
            <TabsTrigger value="live">Live Service</TabsTrigger>
            <TabsTrigger value="comparison">Service Comparison</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="netflix" className="mt-6">
            <div className="space-y-4">
              {testResults
                .filter(r => r.service === 'netflix')
                .map((result, index) => renderTestResult(result, index))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <div className="space-y-4">
              {(() => {
                const liveResults = testResults.filter(r => r.service === 'live');
                if (liveResults.length === 0) {
                  return (
                    <Card className="p-6 text-center">
                      <div className="text-muted-foreground mb-2">No Live Generation results found</div>
                      <div className="text-sm text-muted-foreground">
                        Live service is tested in 'Full Flow', 'Live Only', and 'Compare All Services' modes.
                        <br />
                        Current mode: <strong>{testMode}</strong>
                      </div>
                    </Card>
                  );
                }
                return liveResults.map((result, index) => renderTestResult(result, index));
              })()}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-6">
              {serviceComparisons.map(comparison => (
                <Card key={comparison.level}>
                  <CardHeader>
                    <CardTitle>{comparison.level} - Service Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {comparison.netflix && (
                        <div className="border rounded p-3">
                          <h4 className="font-semibold mb-2">Netflix (Complete)</h4>
                          <div className="space-y-1 text-sm">
                            <div>Pages: {comparison.netflix.pages}</div>
                            <div>Words: {comparison.netflix.wordCount}</div>
                            <div>Time: {comparison.netflix.responseTime}ms</div>
                            <div>{renderSourceBadge(comparison.netflix.source, comparison.netflix.emergencyContentUsed)}</div>
                          </div>
                        </div>
                      )}
                      {comparison.live && (
                        <div className="border rounded p-3">
                          <h4 className="font-semibold mb-2">Live (First Page)</h4>
                          <div className="space-y-1 text-sm">
                            <div>Pages: {comparison.live.pages}</div>
                            <div>Words: {comparison.live.wordCount}</div>
                            <div>Time: {comparison.live.responseTime}ms</div>
                            <div>{renderSourceBadge(comparison.live.source, comparison.live.emergencyContentUsed)}</div>
                          </div>
                        </div>
                      )}
                      {comparison.template && (
                        <div className="border rounded p-3">
                          <h4 className="font-semibold mb-2">Template Only</h4>
                          <div className="space-y-1 text-sm">
                            <div>Pages: {comparison.template.pages}</div>
                            <div>Words: {comparison.template.wordCount}</div>
                            <div>Time: {comparison.template.responseTime}ms</div>
                            <div>{renderSourceBadge(comparison.template.source, comparison.template.emergencyContentUsed)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Success Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Rates by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const sourceCounts = testResults.reduce((acc, result) => {
                      const key = result.emergencyContentUsed && result.source === 'emergency' ? 'emergency-rhyming' : result.source;
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const total = testResults.length;
                    
                    return (
                      <div className="space-y-3">
                        {Object.entries(sourceCounts).map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {source === 'emergency-rhyming' ? 
                                renderSourceBadge('emergency', true) : 
                                renderSourceBadge(source)}
                            </div>
                            <div className="text-sm">
                              {count}/{total} ({total > 0 ? Math.round((count/total) * 100) : 0}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const responseTimeResults = testResults.filter(r => r.responseTime);
                    const avgResponseTime = responseTimeResults.length > 0 
                      ? responseTimeResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responseTimeResults.length
                      : 0;
                    
                    const emergencyUsage = testResults.length > 0 
                      ? testResults.filter(r => r.emergencyContentUsed).length / testResults.length
                      : 0;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Avg Response Time</span>
                          <span className="font-semibold">
                            {isNaN(avgResponseTime) ? "No data" : Math.round(avgResponseTime)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emergency Content Used</span>
                          <span className="font-semibold">
                            {isNaN(emergencyUsage) ? "No data" : Math.round(emergencyUsage * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Tests Run</span>
                          <span className="font-semibold">{testResults.length}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Test Logs */}
              {logs.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Test Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto space-y-1 text-sm font-mono">
                      {logs.map((log, idx) => (
                        <div key={idx} className={`${
                          log.includes('❌') ? 'text-red-600' :
                          log.includes('✅') ? 'text-green-600' :
                          log.includes('🚀') ? 'text-blue-600' :
                          'text-muted-foreground'
                        }`}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}