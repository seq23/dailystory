import React, { useState } from 'react';
import { InteractiveWord } from './InteractiveWord';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { UserInfo, LanguageCode } from '@/types';

// Test component to verify multilingual word explanations work correctly
export const MultilingualTestComponent = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo>({
    name: 'Test User',
    age: 8,
    grade: 'K',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'cat',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: ''
  });

  const testLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const testWords = ['happy', 'friend', 'beautiful', 'adventure', 'inherited'];

  const handleLanguageChange = (languageCode: string) => {
    setCurrentUser(prev => ({
      ...prev,
      nativeLanguage: languageCode as LanguageCode
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Multilingual Word Explanations Test</h2>
      
      {/* Language Selector */}
      <Card className="p-4 mb-6">
        <h3 className="font-semibold mb-3">Select User Language:</h3>
        <div className="flex flex-wrap gap-2">
          {testLanguages.map(lang => (
            <Button
              key={lang.code}
              variant={currentUser.nativeLanguage === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name} ({lang.code})
            </Button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Current user language: <strong>{currentUser.nativeLanguage}</strong>
        </p>
      </Card>

      {/* Test Words */}
      <Card className="p-4 mb-6">
        <h3 className="font-semibold mb-3">Test Words:</h3>
        <div className="space-y-4">
          {testWords.map((word, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <p className="text-lg">
                The word{' '}
                <InteractiveWord
                  word={word}
                  difficulty="medium"
                  userInfo={currentUser}
                  isPremium={true}
                  sentenceContext={`The word ${word} is a test word.`}
                  className="bg-yellow-100 px-1 rounded"
                />
                {' '}should explain in {testLanguages.find(l => l.code === currentUser.nativeLanguage)?.name}.
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>1. Select different languages using the buttons above</li>
          <li>2. Click "Explain" on any highlighted word</li>
          <li>3. For non-English languages: you should see a toast with the definition in that language</li>
          <li>4. Audio should include pronunciation in English + explanation in the selected language</li>
          <li>5. Story generation should always remain in English regardless of user language</li>
          <li>6. Premium features (Save Word) should work for premium users</li>
          <li>7. Translation button should only appear for non-English speakers</li>
        </ul>
      </Card>
    </div>
  );
};