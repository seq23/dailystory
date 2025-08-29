import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play, RotateCcw, Zap, Brain, Shuffle, ChevronDown, ChevronUp, Eye, AlertTriangle } from 'lucide-react';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { LiveGenerationService } from '@/services/LiveGenerationService';
import { useTemplateService } from '@/hooks/useTemplateService';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { validatePageTokenDistribution, getTokenLimitForDifficulty } from '@/utils/tokenLimitValidator';
import { validatePlaceholders, getPlaceholderValidationMessage, checkForPlaceholderIssues } from '@/utils/placeholderValidator';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel, Grade, LanguageCode, LearningGoal } from '@/types';

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
  wordCount: number;
  source: 'ai' | 'fallback' | 'emergency' | 'unknown';
  hasPageConcatenation: boolean;
  contentPreview: string;
  fullContent: string[];
  withinTokenLimits: boolean;
  responseTime?: number;
  error?: string;
  fallbackReason?: string;
  generationPath?: string[];
  emergencyContentUsed?: boolean;
  // Enhanced validation fields
  placeholderValidation?: any;
  contentIssues?: string[];
  tokenValidation?: any;
  hasEmptyContent?: boolean;
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
    avatar: { type: "girl", skinTone: "light" },
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
    avatar: { type: "boy", skinTone: "medium" },
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
    name: 'Zara',
    age: 12,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "girl", skinTone: "olive" },
    difficultyLevel: 'expert',
    favoriteColor: 'silver',
    favoriteAnimal: 'eagle',
    hobbies: 'chess strategy',
    favoriteFood: 'pasta',
    specialRequest: 'adventure mysteries'
  },
  
  // Grade-specific expert levels
  grade6: {
    name: 'Sam',
    age: 11,
    grade: "6th+" as Grade,
    nativeLanguage: "en" as LanguageCode,
    learningGoal: "improve-english-reading" as LearningGoal,
    avatar: { type: "boy", skinTone: "light" },
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

  const templateService = useTemplateService();

  // Test individual service
  const testService = async (
    level: string, 
    userInfo: UserInfo, 
    service: 'netflix' | 'live' | 'template'
  ): Promise<TestResult> => {
    const startTime = Date.now();
    let result: TestResult = {
      level,
      service,
      success: false,
      pages: 0,
      wordCount: 0,
      source: 'unknown',
      hasPageConcatenation: false,
      contentPreview: '',
      fullContent: [],
      withinTokenLimits: false,
      generationPath: [],
      emergencyContentUsed: false
    };

    try {
      let response: any = null;
      result.generationPath = [`Starting ${service} service test`];

      if (service === 'netflix') {
        result.generationPath.push('Calling NetflixStyleStoryService.generateStory()');
        response = await NetflixStyleStoryService.generateStory(userInfo);
        result.source = response.source || 'unknown';
        result.pages = response.pageCount || response.pages?.length || 0;
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 Netflix Service Result for ${level}:`, {
          source: response.source,
          hasContent: !!response.content,
          pageCount: response.content?.length || 0,
          contentPreview: response.content?.[0]?.substring(0, 50) + '...'
        });
        
        if (response.content && Array.isArray(response.content)) {
          result.wordCount = countWords(response.content);
          result.contentPreview = response.content[0]?.substring(0, 100) + '...' || '';
          result.fullContent = response.content;
          result.hasPageConcatenation = checkPageConcatenation(response.content, level);
          
          // Check for emergency content (rhyming educational content)
          const firstPage = response.content[0] || '';
          if (firstPage.includes('story machine took a little rest') || 
              firstPage.includes('story elves went to play') ||
              firstPage.includes('Try Again')) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used emergency rhyming content');
          }
        }
        
      } else if (service === 'live') {
        result.generationPath.push('Calling LiveGenerationService.generateFirstPage()');
        response = await LiveGenerationService.generateFirstPage(userInfo);
        
        // Check global source tracking
        const globalSource = (globalThis as any).__LAST_PAGE_SOURCE__;
        result.source = globalSource || 'unknown';
        result.pages = 1; // Live service generates one page at a time
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 Live Service Result for ${level}:`, {
          source: globalSource,
          hasContent: !!response.content,
          contentLength: response.content?.length || 0,
          contentPreview: response.content?.substring(0, 50) + '...'
        });
        
        if (response.content) {
          result.wordCount = countWords(response.content);
          result.contentPreview = response.content.substring(0, 100) + '...';
          result.fullContent = [response.content];
          result.hasPageConcatenation = false; // Single page, no concatenation possible
          
          // Check for emergency content
          if (response.content.includes('began a wonderful adventure') && response.content.length < 50) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used basic emergency content');
          }
        }
        
      } else if (service === 'template') {
        result.generationPath.push('Calling template service directly');
        response = await templateService.generateStory(userInfo, 'testing');
        result.source = response.success ? 'fallback' : 'emergency'; // Templates are fallback, emergency if they fail
        result.pages = response.pageCount || response.pages?.length || 0;
        
        // Enhanced logging for source detection debugging
        console.log(`🔍 Template Service Result for ${level}:`, {
          source: response.success ? 'fallback' : 'emergency',
          success: response.success,
          hasPages: !!response.pages,
          pageCount: response.pages?.length || 0,
          contentPreview: response.pages?.[0]?.substring(0, 50) + '...'
        });
        
        if (response.pages && Array.isArray(response.pages)) {
          result.wordCount = countWords(response.pages);
          result.contentPreview = response.pages[0]?.substring(0, 100) + '...' || '';
          result.fullContent = response.pages;
          result.hasPageConcatenation = checkPageConcatenation(response.pages, level);
          
          // Check for emergency rhyming content from ErrorHandlingManager
          const firstPage = response.pages[0] || '';
          if (firstPage.includes('story machine took a little rest') || 
              firstPage.includes('story elves went to play') ||
              firstPage.includes('Try Again')) {
            result.emergencyContentUsed = true;
            result.source = 'emergency';
            result.generationPath.push('Used ErrorHandlingManager emergency content');
          }
        }
      }

      result.responseTime = Date.now() - startTime;
      result.success = true;
      result.withinTokenLimits = analyzeTokenLimits(result.wordCount, level);
      
      // Enhanced validation - check for placeholder and content issues
      if (result.fullContent && result.fullContent.length > 0) {
        result.placeholderValidation = validatePlaceholders(result.fullContent);
        result.contentIssues = checkForPlaceholderIssues(result.fullContent);
        result.tokenValidation = validatePageTokenDistribution(
          result.fullContent, 
          level as DifficultyLevel, 
          result.source === 'ai' ? 'ai' : 'template'
        );
        result.hasEmptyContent = result.wordCount === 0 || result.fullContent.every(page => page.trim().length === 0);
        
        // If we have empty content, mark as failed
        if (result.hasEmptyContent) {
          result.success = false;
          result.error = 'Content generation resulted in empty pages - likely placeholder resolution failure';
          result.generationPath.push('❌ Content validation failed: Empty pages detected');
        }
        
        // Add placeholder validation to generation path
        if (!result.placeholderValidation.isValid) {
          result.generationPath.push(`⚠️ Placeholder issues: ${result.placeholderValidation.unresolvedPlaceholders.join(', ')}`);
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

      // Add log entry
      setLogs(prev => [...prev, `✅ ${service} test for ${level}: ${result.source} source, ${result.pages} pages, ${result.wordCount} words`]);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.responseTime = Date.now() - startTime;
      result.generationPath.push(`Error: ${result.error}`);
      setLogs(prev => [...prev, `❌ ${service} test failed for ${level}: ${result.error}`]);
      console.error(`${service} test failed for ${level}:`, error);
    }

    return result;
  };

  // Enhanced page concatenation detection with specific patterns from logs
  const checkPageConcatenation = (pages: string[], level: string): boolean => {
    if (!pages || pages.length <= 1) return false;
    
    const difficultyLimits = {
      'beginner': 25,
      'easy': 35,
      'medium': 50,
      'hard': 75,
      'expert': 100,
      '6th': 80,
      '7th': 85,
      '8th': 90,
      '9th': 95,
      '10th': 100
    };
    
    const expectedWordLimit = difficultyLimits[level as keyof typeof difficultyLimits] || 50;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageWordCount = countWords(page);
      
      // 1. Excessive word count (clear concatenation)
      if (pageWordCount > expectedWordLimit * 2) return true;
      
      // 2. Multiple "Page X:" markers
      if (page.includes('Page ') && page.includes('Page ', 10)) return true;
      
      // 3. Multiple disconnected sentences (3+ full sentences ending abruptly)
      if (page.match(/\.\s+[A-Z].*\.\s+[A-Z].*\.\s+[A-Z]/g)) return true;
      
      // 4. Specific concatenation patterns from logs
      if (page.match(/, and [a-z]/g)) return true; // ", and lowercase" unnatural grammar
      if (page.match(/technology begins behaving.*artifact/i)) return true; // Specific pattern
      if (page.match(/ancient texts mention.*expedition that found/i)) return true; // Another pattern
      if (page.match(/\. [A-Z][^.]{20,}\. [A-Z][^.]{20,}\. [A-Z]/)) return true; // Long fragments
      
      // 5. Excessive comma usage (often indicates concatenated details)
      const commaCount = (page.match(/,/g) || []).length;
      if (commaCount > 6 && pageWordCount < 150) return true; // High comma density
      
      // 6. Awkward conjunctions indicating forced connections
      if (page.match(/, while .*, and /g)) return true; // Complex nested connectors
      if (page.match(/, suggesting .*, and /g)) return true; // Another concatenation pattern
    }
    
    return false;
  };

  // Enhanced content validation
  const validateContentQuality = (pages: string[]): { 
    score: number;
    issues: string[];
    concatenationDetails: string[];
    grammarIssues: string[];
  } => {
    const issues: string[] = [];
    const concatenationDetails: string[] = [];
    const grammarIssues: string[] = [];
    let score = 100;

    pages.forEach((page, index) => {
      if (!page || typeof page !== 'string') {
        issues.push(`Page ${index + 1}: Invalid content type`);
        score -= 20;
        return;
      }

      // Concatenation detection with details
      const concatenationPatterns = [
        { pattern: /, and [a-z]/, description: "Unnatural lowercase conjunction" },
        { pattern: /\. [A-Z][^.]{20,}\. [A-Z][^.]{20,}/, description: "Multiple long disconnected sentences" },
        { pattern: /, while .*, and /, description: "Complex nested connectors" },
        { pattern: /technology begins behaving.*artifact/i, description: "Specific template concatenation" },
        { pattern: /ancient texts mention.*expedition/i, description: "Another template concatenation" }
      ];

      concatenationPatterns.forEach(({ pattern, description }) => {
        if (pattern.test(page)) {
          concatenationDetails.push(`Page ${index + 1}: ${description}`);
          score -= 15;
        }
      });

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

      // Comma density (indication of concatenation)
      const commaCount = (page.match(/,/g) || []).length;
      if (commaCount > 6 && wordCount < 150) {
        concatenationDetails.push(`Page ${index + 1}: High comma density (${commaCount} commas in ${wordCount} words)`);
        score -= 10;
      }
    });

    return { 
      score: Math.max(0, score), 
      issues, 
      concatenationDetails, 
      grammarIssues 
    };
  };

  // Token limit analysis
  const analyzeTokenLimits = (wordCount: number, level: string): boolean => {
    const tokenLimits = {
      'beginner': { min: 15, max: 100 },
      'easy': { min: 25, max: 150 },
      'medium': { min: 40, max: 200 },
      'hard': { min: 60, max: 300 },
      'expert': { min: 80, max: 400 },
      '6th': { min: 70, max: 350 },
      '7th': { min: 75, max: 365 },
      '8th': { min: 80, max: 380 },
      '9th': { min: 85, max: 390 },
      '10th': { min: 90, max: 400 }
    };

    const limits = tokenLimits[level as keyof typeof tokenLimits] || { min: 30, max: 200 };
    return wordCount >= limits.min && wordCount <= limits.max;
  };

  // Run comprehensive tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setServiceComparisons([]);
    setLogs(['🚀 Starting comprehensive story generation tests...']);
    setProgress(0);

    const profiles = Object.entries(testUserProfiles);
    const servicesCount = testMode === 'comparison' ? 3 : testMode === 'full' ? 2 : 1;
    const totalTests = profiles.length * servicesCount;
    let completed = 0;

    const results: TestResult[] = [];
    const comparisons: ServiceComparison[] = [];

    for (const [level, userInfo] of profiles) {
      setCurrentTest(`Testing ${level} (${userInfo.name})`);
      
      const comparison: ServiceComparison = { level };
      
      try {
        if (testMode === 'full') {
          // Test both Netflix and Live services for comprehensive testing
          const netflixResult = await testService(level, userInfo, 'netflix');
          const liveResult = await testService(level, userInfo, 'live');
          
          results.push(netflixResult, liveResult);
          comparison.netflix = netflixResult;
          comparison.live = liveResult;
          
          completed += 2;
          setProgress((completed / totalTests) * 100);
        }

        if (testMode === 'ai-only') {
          // Test Netflix service only (AI-first complete stories)
          const netflixResult = await testService(level, userInfo, 'netflix');
          results.push(netflixResult);
          comparison.netflix = netflixResult;
          completed++;
          setProgress((completed / totalTests) * 100);
        }

        if (testMode === 'live-only') {
          // Test Live service only (page-by-page generation)
          const liveResult = await testService(level, userInfo, 'live');
          results.push(liveResult);
          comparison.live = liveResult;
          completed++;
          setProgress((completed / totalTests) * 100);
        }

        if (testMode === 'comparison') {
          // Test all three services for comparison
          const netflixResult = await testService(level, userInfo, 'netflix');
          const liveResult = await testService(level, userInfo, 'live');
          const templateResult = await testService(level, userInfo, 'template');
          
          results.push(netflixResult, liveResult, templateResult);
          comparison.netflix = netflixResult;
          comparison.live = liveResult;
          comparison.template = templateResult;
          
          completed += 3;
          setProgress((completed / totalTests) * 100);
        }

        if (testMode === 'template-only') {
          // Test only template service
          const templateResult = await testService(level, userInfo, 'template');
          results.push(templateResult);
          comparison.template = templateResult;
          completed++;
          setProgress((completed / totalTests) * 100);
        }

      } catch (error) {
        console.error(`Test failed for ${level}:`, error);
        setLogs(prev => [...prev, `❌ Test failed for ${level}: ${error}`]);
      }

      comparisons.push(comparison);
      
      // Short delay to prevent overwhelming the services
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setServiceComparisons(comparisons);
    setIsRunning(false);
    setCurrentTest('');
    setProgress(100);
    setLogs(prev => [...prev, '🎉 All tests completed!']);
  };

  // Reset all tests
  const resetTests = () => {
    setTestResults([]);
    setServiceComparisons([]);
    setProgress(0);
    setCurrentTest('');
    setLogs([]);
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

  // Render individual test result
  const renderTestResult = (result: TestResult) => {
    const resultKey = `${result.level}-${result.service}`;
    const isContentExpanded = expandedContent[resultKey] || false;
    const toggleContentExpanded = () => {
      setExpandedContent(prev => ({
        ...prev,
        [resultKey]: !prev[resultKey]
      }));
    };

    return (
      <Card key={`${result.level}-${result.service}`} className="mb-4">
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
              
              {/* Concatenation Detection Status */}
              {result.hasPageConcatenation !== undefined && (
                <Badge variant={result.hasPageConcatenation ? 'destructive' : 'default'} className="ml-2">
                  {result.hasPageConcatenation ? 'Concatenation Detected' : 'No Concatenation'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Pages</div>
            <div className="font-semibold">{result.pages}</div>
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
            <div className="text-sm text-muted-foreground">Token Limits</div>
            <div className={`font-semibold ${result.withinTokenLimits ? 'text-green-500' : 'text-red-500'}`}>
              {result.withinTokenLimits ? '✓ Valid' : '✗ Invalid'}
            </div>
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

        {result.hasPageConcatenation && (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded mt-2">
            ⚠️ Page concatenation detected
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
                </div>

                {/* Content Analysis */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Content Analysis</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Avg Words/Page</div>
                      <div className="font-medium">{Math.round(result.wordCount / result.pages)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Source Type</div>
                      <div className="font-medium">{result.emergencyContentUsed ? 'Emergency' : result.source.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Generation Time</div>
                      <div className="font-medium">{result.responseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Quality</div>
                      <div className={`font-medium ${result.withinTokenLimits ? 'text-green-600' : 'text-red-600'}`}>
                        {result.withinTokenLimits ? 'Valid' : 'Invalid'}
                      </div>
                    </div>
                  </div>
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

        {/* Test Mode Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={testMode === 'full' ? 'default' : 'outline'}
            onClick={() => setTestMode('full')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Full Flow (AI→Template→Emergency)
          </Button>
            <Button
            variant={testMode === 'ai-only' ? 'default' : 'outline'}
            onClick={() => setTestMode('ai-only')}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Netflix Only
          </Button>
          <Button
            variant={testMode === 'live-only' ? 'default' : 'outline'}
            onClick={() => setTestMode('live-only')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Live Only
          </Button>
          <Button
            variant={testMode === 'template-only' ? 'default' : 'outline'}
            onClick={() => setTestMode('template-only')}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Template Only
          </Button>
          <Button
            variant={testMode === 'comparison' ? 'default' : 'outline'}
            onClick={() => setTestMode('comparison')}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Compare All Services
          </Button>
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
                .map(renderTestResult)}
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
                return liveResults.map(renderTestResult);
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
                              {count}/{total} ({Math.round((count/total) * 100)}%)
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
                    const avgResponseTime = testResults
                      .filter(r => r.responseTime)
                      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
                      testResults.filter(r => r.responseTime).length;
                    
                    const tokenValidation = testResults.filter(r => r.withinTokenLimits).length / testResults.length;
                    const emergencyUsage = testResults.filter(r => r.emergencyContentUsed).length / testResults.length;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Avg Response Time</span>
                          <span className="font-semibold">{Math.round(avgResponseTime)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Token Validation Rate</span>
                          <span className="font-semibold">{Math.round(tokenValidation * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emergency Content Used</span>
                          <span className="font-semibold">{Math.round(emergencyUsage * 100)}%</span>
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