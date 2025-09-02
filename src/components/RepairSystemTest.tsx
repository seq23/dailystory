// End-to-End Repair System Test with Real Backend Integration
// Tests actual repair flows through services to production backend

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { LiveGenerationService } from '@/services/LiveGenerationService';
import type { UserInfo } from '@/types';

interface EndToEndTestResult {
  scenario: string;
  service: 'Netflix' | 'Live';
  finalOutcome: 'success' | 'failure';
  details: string;
  timing: number;
  contentSource: 'ai' | 'template' | 'emergency';
  revalidated?: boolean;
  attempts?: number;
}

const mockUserInfo: UserInfo = {
  name: "TestUser",
  age: 8,
  grade: "3rd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "boy", skinTone: "medium" },
  favoriteColor: "blue",
  favoriteAnimal: "dragon",
  hobbies: "adventure",
  favoriteFood: "pizza",
  specialRequest: "magical adventures",
  difficultyLevel: "medium"
};

export function RepairSystemTest() {
  const [testResults, setTestResults] = useState<EndToEndTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runNetflixServiceTest = async (): Promise<EndToEndTestResult> => {
    const startTime = Date.now();
    setCurrentTest('Testing Netflix Service end-to-end with repair system...');
    
    try {
      const result = await NetflixStyleStoryService.generateStory(mockUserInfo);
      
      const timing = Date.now() - startTime;
      const success = result.content && result.content.length > 0;
      
      // Check source tracking
      let contentSource: 'ai' | 'template' | 'emergency' = 'emergency';
      try {
        const rawSource = (globalThis as any).__LAST_STORY_SOURCE__ || 'emergency';
        // Map all variations to our enum
        if (rawSource === 'ai') contentSource = 'ai';
        else if (rawSource === 'fallback' || rawSource === 'template') contentSource = 'template';
        else contentSource = 'emergency';
      } catch {}

      return {
        scenario: 'Netflix Service Full Flow',
        service: 'Netflix',
        finalOutcome: success ? 'success' : 'failure',
        details: success 
          ? `✅ Generated ${result.content.length} pages from ${contentSource} source`
          : `❌ Generation failed: ${result.error || 'Unknown error'}`,
        timing,
        contentSource
      };
    } catch (error) {
      return {
        scenario: 'Netflix Service Full Flow',
        service: 'Netflix',
        finalOutcome: 'failure',
        details: `❌ Netflix service test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime,
        contentSource: 'emergency'
      };
    }
  };

  const runLiveServiceTest = async (): Promise<EndToEndTestResult> => {
    const startTime = Date.now();
    setCurrentTest('Testing Live Service end-to-end with repair system...');
    
    try {
      const result = await LiveGenerationService.generateFirstPage(mockUserInfo);
      
      const timing = Date.now() - startTime;
      const success = result.content && result.content.length > 10;
      
      // Check source tracking
      let contentSource: 'ai' | 'template' | 'emergency' = 'emergency';
      try {
        contentSource = (globalThis as any).__LAST_PAGE_SOURCE__ || 'emergency';
      } catch {}

      return {
        scenario: 'Live Service First Page',
        service: 'Live',
        finalOutcome: success ? 'success' : 'failure',
        details: success 
          ? `✅ Generated first page (${result.content.length} chars) from ${contentSource} source` +
            (result.nextContext ? ' with valid context for continuation' : '')
          : `❌ First page generation failed: ${result.error || 'Unknown error'}`,
        timing,
        contentSource
      };
    } catch (error) {
      return {
        scenario: 'Live Service First Page',
        service: 'Live',
        finalOutcome: 'failure',
        details: `❌ Live service test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime,
        contentSource: 'emergency'
      };
    }
  };

  const runSecurityLoopProtectionTest = async (): Promise<EndToEndTestResult> => {
    const startTime = Date.now();
    setCurrentTest('Testing repair loop protection and security measures...');
    
    try {
      // Force a scenario that would trigger multiple repair attempts
      const stressTestUserInfo = {
        ...mockUserInfo,
        specialRequest: "extremely complex philosophical quantum mechanical advanced scientific terminology requiring sophisticated vocabulary"
      };
      
      const result = await NetflixStyleStoryService.generateStory(stressTestUserInfo);
      
      const timing = Date.now() - startTime;
      const success = result.content && result.content.length > 0;
      
      // Check if it took reasonable time (should not loop infinitely)
      const reasonableTime = timing < 60000; // Less than 60 seconds
      
      return {
        scenario: 'Security Loop Protection',
        service: 'Netflix',
        finalOutcome: (success && reasonableTime) ? 'success' : 'failure',
        details: success 
          ? `✅ Completed in ${timing}ms without infinite loops`
          : `❌ Failed or took too long (${timing}ms): ${result.error || 'Possible infinite loop'}`,
        timing,
        contentSource: result.source as 'ai' | 'template' | 'emergency' || 'emergency'
      };
    } catch (error) {
      return {
        scenario: 'Security Loop Protection',
        service: 'Netflix',
        finalOutcome: 'failure',
        details: `❌ Security test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime,
        contentSource: 'emergency'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Starting end-to-end repair system tests...');

    const results: EndToEndTestResult[] = [];

    // Test Netflix service
    const netflixResult = await runNetflixServiceTest();
    results.push(netflixResult);

    // Test Live service  
    const liveResult = await runLiveServiceTest();
    results.push(liveResult);

    // Test security and loop protection
    const securityResult = await runSecurityLoopProtectionTest();
    results.push(securityResult);

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');
  };

  const successCount = testResults.filter(r => r.finalOutcome === 'success').length;
  const totalTests = testResults.length;
  const aiSourceCount = testResults.filter(r => r.contentSource === 'ai').length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            End-to-End Repair System Test
            <div className="flex gap-2">
              <Badge variant={aiSourceCount > 0 ? 'default' : 'secondary'}>
                {aiSourceCount}/{totalTests} AI Generated
              </Badge>
              <Badge variant={isRunning ? 'secondary' : totalTests > 0 ? (successCount === totalTests ? 'default' : 'destructive') : 'outline'}>
                {isRunning ? 'Running...' : totalTests > 0 ? `${successCount}/${totalTests} Passed` : 'Ready'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run End-to-End Tests'}
            </Button>
          </div>

          {currentTest && (
            <div className="text-sm text-muted-foreground animate-pulse">
              {currentTest}
            </div>
          )}

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Card key={index} className={result.finalOutcome === 'success' ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.scenario}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.service}
                        </Badge>
                        <Badge variant={result.contentSource === 'ai' ? 'default' : 'secondary'} className="text-xs">
                          {result.contentSource}
                        </Badge>
                        {result.attempts && (
                          <Badge variant="outline" className="text-xs">
                            {result.attempts} attempts
                          </Badge>
                        )}
                        {result.revalidated && (
                          <Badge variant="outline" className="text-xs">
                            re-validated
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {result.timing}ms
                        </Badge>
                        <Badge variant={result.finalOutcome === 'success' ? 'default' : 'destructive'}>
                          {result.finalOutcome}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm">
                      {result.details}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RepairSystemTest;