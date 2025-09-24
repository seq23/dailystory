import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MobileOptimizedInteractiveWord } from '@/components/MobileOptimizedInteractiveWord';
import { Languages, Volume2, HelpCircle, Layers, Globe } from 'lucide-react';
import type { UserInfo } from '@/types';

interface MultilingualWordTesterProps {
  userInfo: UserInfo;
  selectedLanguage: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

export const MultilingualWordTester = ({ 
  userInfo, 
  selectedLanguage, 
  difficulty 
}: MultilingualWordTesterProps) => {
  const [testingMode, setTestingMode] = useState<'individual' | 'sentence'>('individual');
  const [lastInteraction, setLastInteraction] = useState<{
    word: string;
    action: string;
    language: string;
    timestamp: Date;
  } | null>(null);

  // Create userInfo with selected language
  const testUserInfo: UserInfo = {
    ...userInfo,
    nativeLanguage: selectedLanguage as any
  };

  const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'pt': 'Portuguese',
    'fr': 'French',
    'de': 'German'
  } as const;

  // Test words organized by difficulty
  const testWords = {
    beginner: ['cat', 'dog', 'house', 'tree', 'happy', 'run'],
    easy: ['adventure', 'beautiful', 'explore', 'magical', 'wonderful', 'journey'],
    medium: ['mysterious', 'enchanted', 'discovery', 'magnificent', 'extraordinary', 'fascinating'],
    hard: ['serendipitous', 'ephemeral', 'ubiquitous', 'perspicacious', 'quintessential', 'metamorphosis'],
    expert: ['perspicacious', 'sesquipedalian', 'antidisestablishmentarianism', 'pneumonoultramicroscopicsilicovolcanoconios', 'floccinaucinihilipilification', 'hippopotomonstrosesquippedaliophobia']
  };

  // Sample sentences for testing
  const testSentences = {
    beginner: "The cat runs fast.",
    easy: "The magical forest was full of wonderful adventures.",
    medium: "She discovered a mysterious and enchanted garden behind the house.",
    hard: "The serendipitous encounter led to an ephemeral but profound transformation.",
    expert: "His perspicacious observations about the sesquipedalian nature of academic discourse were quite remarkable."
  };

  const currentWords = testWords[difficulty];
  const currentSentence = testSentences[difficulty];

  const handleWordInteraction = (word: string, action: string) => {
    setLastInteraction({
      word,
      action,
      language: selectedLanguage,
      timestamp: new Date()
    });
  };

  const renderInteractiveWords = (text: string) => {
    return text.split(/(\s+)/).map((segment, index) => {
      if (/^\s+$/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }
      
      return (
                <MobileOptimizedInteractiveWord
                  word={segment}
                  className="inline"
                  difficulty={difficulty}
                  userInfo={testUserInfo}
                  isPremium={true}
                  forceModal={true}
                />
      );
    });
  };

  const resetInteractionLog = () => {
    setLastInteraction(null);
  };

  return (
    <div className="space-y-6">
      {/* Testing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Multilingual Word Interaction Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Testing Mode</label>
              <Select value={testingMode} onValueChange={(value: typeof testingMode) => setTestingMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Words</SelectItem>
                  <SelectItem value="sentence">Sentence Context</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Language</label>
              <div className="p-2 bg-muted rounded text-center">
                <Badge variant="default" className="flex items-center gap-1 w-fit mx-auto">
                  <Globe className="w-3 h-3" />
                  {languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <div className="p-2 bg-muted rounded text-center">
                <Badge variant="outline">{difficulty}</Badge>
              </div>
            </div>
          </div>

          <Button onClick={resetInteractionLog} variant="outline" size="sm">
            Clear Interaction Log
          </Button>
        </CardContent>
      </Card>

      {/* Individual Words Testing */}
      {testingMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Individual Word Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {currentWords.map((word, index) => (
                <div key={index} className="p-3 border rounded-lg text-center">
                    <MobileOptimizedInteractiveWord
                      word={word}
                      className="text-lg font-medium"
                      difficulty={difficulty}
                      userInfo={testUserInfo}
                      isPremium={true}
                      forceModal={true}
                    />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentence Context Testing */}
      {testingMode === 'sentence' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Sentence Context Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none p-4 border rounded-lg bg-muted/50">
              <div className="text-lg leading-relaxed">
                {renderInteractiveWords(currentSentence)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Click any word in the sentence above to test contextual explanations
            </p>
          </CardContent>
        </Card>
      )}

      {/* Syllable Breakdown Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Syllable Breakdown Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Complex Words for Syllable Testing</h4>
              <div className="space-y-2">
                {['extraordinary', 'magnificent', 'encyclopedia', 'pronunciation', 'interpretation'].map((word, index) => (
                  <div key={index} className="p-2 border rounded flex justify-between items-center">
                    <MobileOptimizedInteractiveWord
                      word={word}
                      className="font-medium"
                      difficulty={difficulty}
                      userInfo={testUserInfo}
                      isPremium={true}
                      forceModal={true}
                    />
                    <Badge variant="outline" className="text-xs">
                      {word.split(/[aeiou]/i).length - 1}+ syllables
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Phonetic Challenge Words</h4>
              <div className="space-y-2">
                {['through', 'ough', 'colonel', 'psychology', 'anemone'].map((word, index) => (
                  <div key={index} className="p-2 border rounded flex justify-between items-center">
                    <MobileOptimizedInteractiveWord
                      word={word}
                      className="font-medium"
                      difficulty={difficulty}
                      userInfo={testUserInfo}
                      isPremium={true}
                      forceModal={true}
                    />
                    <Badge variant="outline" className="text-xs">
                      Irregular
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Log */}
      {lastInteraction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last Interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Languages className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Word:</strong> "{lastInteraction.word}"</div>
                  <div><strong>Action:</strong> {lastInteraction.action}</div>
                  <div><strong>Language:</strong> {languageNames[lastInteraction.language as keyof typeof languageNames] || lastInteraction.language}</div>
                  <div><strong>Time:</strong> {lastInteraction.timestamp.toLocaleTimeString()}</div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multilingual Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Language Selection:</strong> Change the native language in the main controls to test different explanation languages
            </div>
            <div>
              <strong>2. Word Interactions:</strong> Click any word to open the modal and test:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Hear It:</strong> Word pronunciation (always in English)</li>
                <li><strong>Explain:</strong> Definition in the selected native language</li>
                <li><strong>Syllables:</strong> Syllable breakdown with click-to-hear</li>
              </ul>
            </div>
            <div>
              <strong>3. Context Testing:</strong> Use sentence mode to test how word context affects explanations
            </div>
            <div>
              <strong>4. Syllable Testing:</strong> Test complex words to verify syllable breakdown accuracy
            </div>
            <div>
              <strong>5. Phonetic Testing:</strong> Test irregular words to check pronunciation accuracy</div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <strong>Expected Behavior:</strong> Word pronunciation should always be in English, but explanations should be in the selected native language. Syllable breakdowns should be clickable for individual pronunciation.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};