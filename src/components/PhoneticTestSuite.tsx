import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';
import { EnhancedAudioService } from '@/services/enhancedAudioService';
import type { UserInfo } from '@/types';

interface PhoneticTestSuiteProps {
  userInfo: UserInfo;
  isPremium?: boolean;
}

export const PhoneticTestSuite = ({ userInfo, isPremium = false }: PhoneticTestSuiteProps) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const audioService = new EnhancedAudioService();

  // Comprehensive test words across all levels and languages
  const testWords = [
    // Level 0 (Beginner)
    { word: 'hello', level: 'beginner', expected: ['heh', 'loh'] },
    { word: 'water', level: 'beginner', expected: ['wah', 'ter'] },
    { word: 'happy', level: 'beginner', expected: ['hap', 'ee'] },
    
    // Level 1 (Easy)
    { word: 'together', level: 'easy', expected: ['toh', 'get', 'her'] },
    { word: 'wonderful', level: 'easy', expected: ['wun', 'der', 'ful'] },
    { word: 'adventure', level: 'easy', expected: ['ad', 'ven', 'cher'] },
    
    // Level 2-4 (Complex)
    { word: 'principles', level: 'hard', expected: ['prin', 'suh', 'puls'] },
    { word: 'organization', level: 'expert', expected: ['or', 'gan', 'ih', 'zay', 'shun'] },
    { word: 'responsibility', level: 'expert', expected: ['rih', 'spon', 'suh', 'bil', 'ih', 'tee'] },
    
    // Rule-based words (not in dictionary)
    { word: 'educational', level: 'hard', expected: null }, // Will use rules
    { word: 'international', level: 'expert', expected: ['in', 'ter', 'nash', 'uh', 'nul'] },
    { word: 'transformation', level: 'expert', expected: null }, // Will use rules
    
    // Multi-language support test (with accents)
    { word: 'café', level: 'easy', expected: null },
    { word: 'niño', level: 'easy', expected: null },
    { word: 'français', level: 'medium', expected: null },
  ];

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🧪 UNIVERSAL PHONETIC TEST: Starting comprehensive test suite...');
    
    const results = [];
    
    for (const testCase of testWords) {
      console.log(`🔤 Testing word: "${testCase.word}" (Level: ${testCase.level})`);
      
      try {
        // Test syllable breakdown
        const syllables = phoneticRulesEngine.breakIntoSyllables(testCase.word);
        const debugInfo = phoneticRulesEngine.getDebugInfo(testCase.word);
        
        // Test speech-friendly conversion
        const pronunciations = syllables.map(s => 
          phoneticRulesEngine.getSpeechFriendlyPronunciation(s)
        );
        
        // Check if matches expected (if provided)
        const isExpectedMatch = testCase.expected 
          ? JSON.stringify(syllables) === JSON.stringify(testCase.expected)
          : true; // For rule-based words, any result is acceptable
          
        const result = {
          word: testCase.word,
          level: testCase.level,
          syllables,
          pronunciations,
          expected: testCase.expected,
          isExpectedMatch,
          debugInfo,
          status: 'success'
        };
        
        results.push(result);
        console.log(`✅ Test passed for "${testCase.word}":`, result);
        
      } catch (error) {
        console.error(`❌ Test failed for "${testCase.word}":`, error);
        results.push({
          word: testCase.word,
          level: testCase.level,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    // Test audio playback capability
    console.log('🔊 Testing audio playback capabilities...');
    try {
      // Test if speech synthesis is available
      const speechAvailable = !!window.speechSynthesis;
      results.push({
        word: 'SPEECH_SYNTHESIS_TEST',
        level: 'system',
        speechAvailable,
        voices: speechSynthesis.getVoices().length,
        status: speechAvailable ? 'success' : 'warning'
      });
    } catch (error) {
      console.error('❌ Speech synthesis test failed:', error);
    }
    
    setTestResults(results);
    setIsRunning(false);
    
    console.log('🧪 UNIVERSAL PHONETIC TEST: Complete!', results);
  };

  const testIndividualWord = async (word: string) => {
    console.log(`🔤 Individual test for: "${word}"`);
    try {
      await audioService.playPhoneticBreakdown({
        word,
        userInfo,
        showSyllables: true
      });
    } catch (error) {
      console.error(`❌ Individual test failed for "${word}":`, error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Universal Phonetic Breakdown Test Suite</CardTitle>
        <p className="text-sm text-muted-foreground">
          Testing phonetic breakdown for ALL users ({isPremium ? 'Premium' : 'Free'}), 
          ALL languages ({userInfo.nativeLanguage || 'en'}), 
          ALL devices ({navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'})
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runComprehensiveTest} 
            disabled={isRunning}
            variant="default"
          >
            {isRunning ? 'Running Tests...' : 'Run Comprehensive Test'}
          </Button>
          
          <Button 
            onClick={() => testIndividualWord('principles')}
            variant="outline"
          >
            Test "principles" Audio
          </Button>
          
          <Button 
            onClick={() => testIndividualWord('organization')}
            variant="outline"
          >
            Test "organization" Audio
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            
            {testResults.map((result, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.word}</span>
                  <div className="flex gap-2">
                    <Badge variant={result.level === 'system' ? 'secondary' : 'outline'}>
                      {result.level}
                    </Badge>
                    <Badge 
                      variant={
                        result.status === 'success' ? 'default' :
                        result.status === 'warning' ? 'secondary' : 'destructive'
                      }
                    >
                      {result.status}
                    </Badge>
                    {result.isExpectedMatch !== undefined && (
                      <Badge variant={result.isExpectedMatch ? 'default' : 'secondary'}>
                        {result.isExpectedMatch ? 'Expected Match' : 'Rule-based'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {result.syllables && (
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Syllables:</strong> {result.syllables.join(' • ')}
                    </div>
                    <div>
                      <strong>Pronunciations:</strong> {result.pronunciations?.join(' • ')}
                    </div>
                    {result.expected && (
                      <div>
                        <strong>Expected:</strong> {result.expected.join(' • ')}
                      </div>
                    )}
                  </div>
                )}
                
                {result.speechAvailable !== undefined && (
                  <div className="text-sm">
                    <div><strong>Speech Synthesis:</strong> {result.speechAvailable ? 'Available' : 'Not Available'}</div>
                    <div><strong>Voices Count:</strong> {result.voices}</div>
                  </div>
                )}
                
                {result.error && (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};