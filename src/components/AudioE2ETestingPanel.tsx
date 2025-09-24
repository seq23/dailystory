import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReadAloudCoach from '@/components/ReadAloudCoach';
import { Volume2, Mic, BookOpen, Languages, Users, Crown, Settings } from 'lucide-react';
import { InteractiveStoryTester } from '@/components/InteractiveStoryTester';
import { VoiceButtonTester } from '@/components/VoiceButtonTester';
import { MultilingualWordTester } from '@/components/MultilingualWordTester';
import { AudioEventMonitor } from '@/components/AudioEventMonitor';
import type { UserInfo, LanguageCode } from '@/types';
import { useLanguageSync } from '@/hooks/useLanguageSync';
export const AudioE2ETestingPanel = () => {
  const [userType, setUserType] = useState<'guest' | 'premium'>('premium');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'>('easy');
  const [highlightingEnabled, setHighlightingEnabled] = useState(true);
  const [showCoach, setShowCoach] = useState(false);

  const { storeLanguagePreference, getStoredLanguagePreference } = useLanguageSync();

  useEffect(() => {
    const stored = getStoredLanguagePreference();
    if (stored) setSelectedLanguage(stored);
  }, [getStoredLanguagePreference]);

  // Mock user info for testing
  const mockUserInfo: UserInfo = {
    name: 'Test User',
    age: 8,
    grade: difficulty === 'beginner' ? 'K' : difficulty === 'easy' ? '1' : difficulty === 'medium' ? '2' : '3',
    gradeLevel: difficulty === 'beginner' ? 'K' : difficulty === 'easy' ? '1' : difficulty === 'medium' ? '2' : '3',
    nativeLanguage: selectedLanguage as LanguageCode,
    learningGoal: 'improve-english-reading',
    avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
    favoriteAnimal: 'cat',
    favoriteColor: 'blue',
    favoriteFood: 'pizza',
    readingLevel: difficulty,
    hobbies: 'reading, playing games',
    specialRequest: 'Test user for audio testing'
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  const resetAllAudio = () => {
    // Stop all audio services
    try {
      (window as any).__CharlotteVoiceService?.stop?.();
      window.dispatchEvent(new CustomEvent('audio:stop'));
      window.dispatchEvent(new CustomEvent('voice:stop'));
      window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
      
      // Reset ElevenLabsAudio component state
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
      
      // Clear guest user session storage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('t2r_audio_session_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Clear guest session data
      localStorage.removeItem('t2r_session_id');

      // Dispatch session reset event for guest UI reset
      window.dispatchEvent(new CustomEvent('audio:session:reset'));
      
    } catch (error) {
      console.warn('Error stopping audio services:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Audio E2E Testing Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Type
              </Label>
              <Select value={userType} onValueChange={(value: 'guest' | 'premium') => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">
                    <div className="flex items-center gap-2">
                      Guest User
                      <Badge variant="secondary">20 min</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Premium User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Native Language
              </Label>
              <Select value={selectedLanguage} onValueChange={(value) => { setSelectedLanguage(value); storeLanguagePreference(value as LanguageCode); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: typeof difficulty) => setDifficulty(value)}>
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

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="highlighting"
                  checked={highlightingEnabled}
                  onCheckedChange={setHighlightingEnabled}
                />
                <Label htmlFor="highlighting">Word Highlighting</Label>
              </div>
              <Button onClick={resetAllAudio} variant="outline" size="sm" className="w-full">
                Reset All Audio
              </Button>
              <Button onClick={() => setShowCoach(true)} variant="outline" size="sm" className="w-full">
                Help Me Read
              </Button>
            </div>
          </div>

          {/* Status Display */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <Badge variant={userType === 'premium' ? 'default' : 'secondary'}>
              {userType === 'premium' ? 'Premium' : 'Guest'} Mode
            </Badge>
            <Badge variant="outline">
              Lang: {languageOptions.find(l => l.value === selectedLanguage)?.label}
            </Badge>
            <Badge variant="outline">
              Difficulty: {difficulty}
            </Badge>
            <Badge variant={highlightingEnabled ? 'default' : 'secondary'}>
              Highlighting: {highlightingEnabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Testing Interface */}
      <Tabs defaultValue="story" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="story" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Interactive Story
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice Commands
          </TabsTrigger>
          <TabsTrigger value="words" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Word Interactions
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Audio Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <InteractiveStoryTester
            userInfo={mockUserInfo}
            isPremium={userType === 'premium'}
            difficulty={difficulty}
            highlightingEnabled={highlightingEnabled}
          />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceButtonTester
            userInfo={mockUserInfo}
            isPremium={userType === 'premium'}
            difficulty={difficulty}
          />
        </TabsContent>

        <TabsContent value="words">
          <MultilingualWordTester
            userInfo={mockUserInfo}
            selectedLanguage={selectedLanguage}
            difficulty={difficulty}
          />
        </TabsContent>

        <TabsContent value="events">
          <AudioEventMonitor />
        </TabsContent>
      </Tabs>

      {/* Help Me Read Dialog */}
      <Dialog open={showCoach} onOpenChange={setShowCoach}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Help Me Read - Testing Mode</DialogTitle>
          </DialogHeader>
          <ReadAloudCoach 
            targetText="Luna and Max found a hidden door in the library and stepped into a world of stories."
            userInfo={mockUserInfo}
            isPremium={userType === 'premium'}
            language={selectedLanguage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};