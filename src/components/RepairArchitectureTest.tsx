// Comprehensive Test for REPAIR vs RETRY_WITH_HINT Architecture
// Tests all validation scenarios end-to-end

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnifiedValidator, type ValidationResult } from '@/utils/unifiedValidator';
import { RepairService } from '@/services/repairService';
import { HintRegenerationService } from '@/services/hintRegenerationService';
import { NetflixStyleStoryService } from '@/services/NetflixStyleStoryService';
import { LiveGenerationService } from '@/services/LiveGenerationService';
import type { UserInfo, DifficultyLevel } from '@/types';

interface TestResult {
  scenario: string;
  validationDecision: string;
  finalOutcome: 'success' | 'failure';
  details: string;
  attempts?: number;
  timing: number;
}

const mockUserInfo: UserInfo = {
  name: "Alex",
  age: 8,
  grade: "3",
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

export function RepairArchitectureTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const testScenarios = [
    {
      name: 'ACCEPT Scenario',
      content: 'Alex discovered a magical blue dragon in the enchanted forest. The dragon had shimmering scales and kind eyes. "Hello, Alex," said the dragon. "I have been waiting for you. Would you like to go on an adventure together?" Alex nodded excitedly and climbed onto the dragon\'s back.',
      expectedDecision: 'ACCEPT'
    },
    {
      name: 'REPAIR_AND_SPLIT Scenario',
      content: 'Alex discovered a magical blue dragon in the enchanted forest. The dragon had shimmering scales that reflected all the colors of the rainbow, and its eyes sparkled with ancient wisdom and kindness. The forest around them was filled with towering trees whose leaves whispered secrets in the wind, and magical flowers that glowed softly in the dappled sunlight filtering through the canopy. "Hello, Alex," said the dragon in a voice like gentle thunder. "I have been waiting for you for a very long time. My name is Azurite, and I am the guardian of this magical realm. Would you like to go on an adventure together and discover the hidden treasures of the enchanted kingdom?" Alex nodded excitedly, feeling a sense of wonder and anticipation, and carefully climbed onto the dragon\'s magnificent back.',
      expectedDecision: 'REPAIR_AND_SPLIT'
    },
    {
      name: 'REPAIR Scenario',
      content: 'Alex encountered a magnificent cerulean wyrm within the sylvan glade. The draconic entity possessed iridescent integumentary structures and benevolent ocular appendages.',
      expectedDecision: 'REPAIR'
    },
    {
      name: 'RETRY_WITH_HINT Scenario',
      content: 'Alex saw dragon.',
      expectedDecision: 'RETRY_WITH_HINT'
    },
    {
      name: 'REJECT Scenario',
      content: 'Alex found a scary monster that wanted to hurt everyone and cause terrible damage.',
      expectedDecision: 'REJECT'
    }
  ];

  const runValidationTest = async (content: string, expectedDecision: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const level = UnifiedValidator.mapDifficultyToLevel('medium');
      const validationResult = UnifiedValidator.validateContent(content, {
        mode: 'guest',
        level,
        userLanguage: 'en'
      });

      const timing = Date.now() - startTime;
      const actualDecision = validationResult.decision;
      const matches = actualDecision === expectedDecision;

      return {
        scenario: `Validation: ${expectedDecision}`,
        validationDecision: actualDecision,
        finalOutcome: matches ? 'success' : 'failure',
        details: matches 
          ? `✅ Correctly returned ${actualDecision}` 
          : `❌ Expected ${expectedDecision}, got ${actualDecision}. Reasons: ${validationResult.reasons.join(', ')}`,
        timing
      };
    } catch (error) {
      return {
        scenario: `Validation: ${expectedDecision}`,
        validationDecision: 'ERROR',
        finalOutcome: 'failure',
        details: `❌ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime
      };
    }
  };

  const runRepairTest = async (): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      // Test with content that should trigger REPAIR
      const repairContent = 'Alex encountered a magnificent cerulean wyrm within the sylvan glade.';
      
      const level = UnifiedValidator.mapDifficultyToLevel('medium');
      const validationResult = UnifiedValidator.validateContent(repairContent, {
        mode: 'guest',
        level,
        userLanguage: 'en'
      });

      if (validationResult.decision !== 'REPAIR') {
        return {
          scenario: 'Repair Flow Test',
          validationDecision: validationResult.decision,
          finalOutcome: 'failure',
          details: `❌ Content didn't trigger REPAIR (got ${validationResult.decision})`,
          timing: Date.now() - startTime
        };
      }

      // Test RepairService
      const repairResult = await RepairService.repairContent({
        originalContent: [repairContent],
        repairReasons: validationResult.reasons,
        hints: validationResult.hints,
        userInfo: mockUserInfo,
        difficulty: 'medium'
      });

      return {
        scenario: 'Repair Flow Test',
        validationDecision: 'REPAIR',
        finalOutcome: repairResult.success ? 'success' : 'failure',
        details: repairResult.success 
          ? `✅ Repair successful after ${repairResult.attempts} attempts` 
          : `❌ Repair failed: ${repairResult.error}`,
        attempts: repairResult.attempts,
        timing: Date.now() - startTime
      };
    } catch (error) {
      return {
        scenario: 'Repair Flow Test',
        validationDecision: 'ERROR',
        finalOutcome: 'failure',
        details: `❌ Repair test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime
      };
    }
  };

  const runHintRegenerationTest = async (): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      // Test with content that should trigger RETRY_WITH_HINT
      const shortContent = 'Alex saw dragon.';
      
      const level = UnifiedValidator.mapDifficultyToLevel('medium');
      const validationResult = UnifiedValidator.validateContent(shortContent, {
        mode: 'guest',
        level,
        userLanguage: 'en'
      });

      if (validationResult.decision !== 'RETRY_WITH_HINT') {
        return {
          scenario: 'Hint Regeneration Test',
          validationDecision: validationResult.decision,
          finalOutcome: 'failure',
          details: `❌ Content didn't trigger RETRY_WITH_HINT (got ${validationResult.decision})`,
          timing: Date.now() - startTime
        };
      }

      // Test HintRegenerationService
      const regenerationResult = await HintRegenerationService.regenerateWithHints({
        userInfo: mockUserInfo,
        difficulty: 'medium',
        hints: validationResult.hints || [],
        failureReasons: validationResult.reasons,
        sessionType: 'guest'
      });

      return {
        scenario: 'Hint Regeneration Test',
        validationDecision: 'RETRY_WITH_HINT',
        finalOutcome: regenerationResult.success ? 'success' : 'failure',
        details: regenerationResult.success 
          ? `✅ Regeneration successful after ${regenerationResult.attempts} attempts` 
          : `❌ Regeneration failed: ${regenerationResult.error}`,
        attempts: regenerationResult.attempts,
        timing: Date.now() - startTime
      };
    } catch (error) {
      return {
        scenario: 'Hint Regeneration Test',
        validationDecision: 'ERROR',
        finalOutcome: 'failure',
        details: `❌ Hint regeneration test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime
      };
    }
  };

  const runFullSystemTest = async (service: 'netflix' | 'live'): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      let result;
      
      if (service === 'netflix') {
        setCurrentTest('Testing Netflix Service Integration');
        result = await NetflixStyleStoryService.generateStory(mockUserInfo);
      } else {
        setCurrentTest('Testing Live Service Integration');
        result = await LiveGenerationService.generateFirstPage(mockUserInfo);
      }

      const success = service === 'netflix' 
        ? result.content && result.content.length > 0
        : result.content && result.content.length > 10;

      return {
        scenario: `${service.charAt(0).toUpperCase() + service.slice(1)} Service Integration`,
        validationDecision: 'N/A',
        finalOutcome: success ? 'success' : 'failure',
        details: success 
          ? `✅ ${service} service integration working` 
          : `❌ ${service} service integration failed`,
        timing: Date.now() - startTime
      };
    } catch (error) {
      return {
        scenario: `${service.charAt(0).toUpperCase() + service.slice(1)} Service Integration`,
        validationDecision: 'ERROR',
        finalOutcome: 'failure',
        details: `❌ ${service} integration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timing: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Starting comprehensive architecture test...');

    const results: TestResult[] = [];

    // Test all validation scenarios
    for (const scenario of testScenarios) {
      setCurrentTest(`Testing ${scenario.name}...`);
      const result = await runValidationTest(scenario.content, scenario.expectedDecision);
      results.push(result);
    }

    // Test repair flow
    setCurrentTest('Testing repair flow...');
    const repairResult = await runRepairTest();
    results.push(repairResult);

    // Test hint regeneration flow
    setCurrentTest('Testing hint regeneration flow...');
    const hintResult = await runHintRegenerationTest();
    results.push(hintResult);

    // Test full service integration
    const netflixResult = await runFullSystemTest('netflix');
    results.push(netflixResult);

    const liveResult = await runFullSystemTest('live');
    results.push(liveResult);

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');
  };

  const successCount = testResults.filter(r => r.finalOutcome === 'success').length;
  const totalTests = testResults.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Repair vs Retry Architecture Test
            <Badge variant={isRunning ? 'secondary' : totalTests > 0 ? (successCount === totalTests ? 'default' : 'destructive') : 'outline'}>
              {isRunning ? 'Running...' : totalTests > 0 ? `${successCount}/${totalTests} Passed` : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
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
                        {result.attempts && (
                          <Badge variant="outline" className="text-xs">
                            {result.attempts} attempts
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
                    <div className="text-sm text-muted-foreground mb-1">
                      Validation Decision: <span className="font-mono">{result.validationDecision}</span>
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

export default RepairArchitectureTest;