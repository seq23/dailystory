import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useTemplateService } from '@/hooks/useTemplateService';
import { StoryResultDisplay } from './StoryResultDisplay';
import type { UserInfo, DifficultyLevel, Grade, LanguageCode, LearningGoal, AvatarType, SkinTone } from '@/types';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';

export function AdvancedTemplateTest() {
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>({
    name: 'Alex',
    age: 8,
    grade: '3',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'dragon',
    hobbies: 'playing games',
    favoriteFood: 'pizza',
    specialRequest: 'adventure with magic',
    difficultyLevel: 'beginner',
  });

  const { generateStory, isLoading, result, error } = useTemplateService();

  const handleInputChange = (field: keyof UserInfo, value: any) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (field: 'type' | 'skinTone', value: any) => {
    setUserInfo(prev => ({
      ...prev,
      avatar: { ...prev.avatar, [field]: value }
    }));
  };

  const handleTest = async () => {
    if (!userInfo.difficultyLevel) return;
    
    // Convert frontend difficulty to backend for the service
    await generateStory(userInfo as UserInfo);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-fun">Advanced Template Test</CardTitle>
          <CardDescription>
            Customize all user information fields to test personalization and placeholder resolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userInfo.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Child's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={userInfo.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={userInfo.grade || ''} onValueChange={(value) => handleInputChange('grade', value as Grade)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PreK">Pre-K</SelectItem>
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
              <Select value={userInfo.difficultyLevel || ''} onValueChange={(value) => handleInputChange('difficultyLevel', value as DifficultyLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-reader">Pre-Reader (Level 0)</SelectItem>
                  <SelectItem value="beginner">Beginner (Level 1)</SelectItem>
                  <SelectItem value="developing">Developing (Level 2)</SelectItem>
                  <SelectItem value="independent">Independent (Level 3)</SelectItem>
                  <SelectItem value="advanced">Advanced (Level 4)</SelectItem>
                  <SelectItem value="grade6">Grade 6</SelectItem>
                  <SelectItem value="grade7">Grade 7</SelectItem>
                  <SelectItem value="grade8">Grade 8</SelectItem>
                  <SelectItem value="grade9">Grade 9</SelectItem>
                  <SelectItem value="grade10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativeLanguage">Native Language</Label>
              <Select value={userInfo.nativeLanguage || ''} onValueChange={(value) => handleInputChange('nativeLanguage', value as LanguageCode)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoal">Learning Goal</Label>
              <Select value={userInfo.learningGoal || ''} onValueChange={(value) => handleInputChange('learningGoal', value as LearningGoal)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improve-english-reading">Improve English Reading</SelectItem>
                  <SelectItem value="learn-english-language">Learn English Language</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarType">Avatar Type</Label>
              <Select value={userInfo.avatar?.type || ''} onValueChange={(value) => handleAvatarChange('type', value as AvatarType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select avatar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">Boy</SelectItem>
                  <SelectItem value="girl">Girl</SelectItem>
                  <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinTone">Skin Tone</Label>
              <Select value={userInfo.avatar?.skinTone || ''} onValueChange={(value) => handleAvatarChange('skinTone', value as SkinTone)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin tone" />
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

            <div className="space-y-2">
              <Label htmlFor="favoriteColor">Favorite Color</Label>
              <Input
                id="favoriteColor"
                value={userInfo.favoriteColor || ''}
                onChange={(e) => handleInputChange('favoriteColor', e.target.value)}
                placeholder="blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteAnimal">Favorite Animal</Label>
              <Input
                id="favoriteAnimal"
                value={userInfo.favoriteAnimal || ''}
                onChange={(e) => handleInputChange('favoriteAnimal', e.target.value)}
                placeholder="dragon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteFood">Favorite Food</Label>
              <Input
                id="favoriteFood"
                value={userInfo.favoriteFood || ''}
                onChange={(e) => handleInputChange('favoriteFood', e.target.value)}
                placeholder="pizza"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies</Label>
              <Input
                id="hobbies"
                value={userInfo.hobbies || ''}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                placeholder="playing games"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequest">Special Request</Label>
            <Textarea
              id="specialRequest"
              value={userInfo.specialRequest || ''}
              onChange={(e) => handleInputChange('specialRequest', e.target.value)}
              placeholder="adventure with magic"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleTest} 
            disabled={!userInfo.difficultyLevel || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              'Generate Story'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && <StoryResultDisplay result={result} />}
    </div>
  );
}