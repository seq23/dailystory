import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { processTextForPhonetics } from '@/utils/textProcessor';
import type { UserInfo } from '@/types';

export const MobileTestPage = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo>({
    name: 'Mobile User',
    age: 8,
    grade: 'K',
    nativeLanguage: 'fr', // Default to French for testing
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'cat',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: ''
  });

  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    screenSize: '',
    isNativeApp: false,
    touchSupport: false
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceInfo({
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        isNativeApp: !!(window as any).Capacitor?.isNativePlatform?.(),
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    }
  }, []);

  const testStory = "Once upon a time, there was a brave little cat named Whiskers. The beautiful cat loved to explore the magical forest behind his house. One day, he discovered a hidden treasure that sparkled in the sunlight.";

  const processedStory = processTextForPhonetics(
    testStory,
    "text-lg leading-relaxed",
    "medium",
    currentUser,
    true
  );

  const languageTests = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-safe">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">📱 Mobile & Tablet Test</h1>
          <p className="text-center text-gray-600">Testing multilingual word explanations on mobile devices</p>
        </Card>

        {/* Device Information */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            📋 Device Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Screen Size:</strong> {deviceInfo.screenSize}
            </div>
            <div>
              <strong>Touch Support:</strong> 
              <Badge variant={deviceInfo.touchSupport ? "default" : "secondary"} className="ml-2">
                {deviceInfo.touchSupport ? "✅ Yes" : "❌ No"}
              </Badge>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <strong>Native App:</strong> 
              <Badge variant={deviceInfo.isNativeApp ? "default" : "secondary"} className="ml-2">
                {deviceInfo.isNativeApp ? "📱 Capacitor" : "🌐 Web"}
              </Badge>
            </div>
            <div className="col-span-1 sm:col-span-2 text-xs text-gray-500 break-all">
              <strong>User Agent:</strong> {deviceInfo.userAgent}
            </div>
          </div>
        </Card>

        {/* Language Selector */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="font-semibold mb-3">🌍 Select Test Language</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {languageTests.map(lang => (
              <Button
                key={lang.code}
                variant={currentUser.nativeLanguage === lang.code ? "default" : "outline"}
                size="sm"
                className="touch-target text-sm"
                onClick={() => setCurrentUser(prev => ({ ...prev, nativeLanguage: lang.code }))}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.name}
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Current: <strong>{languageTests.find(l => l.code === currentUser.nativeLanguage)?.name}</strong>
          </p>
        </Card>

        {/* Test Story */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            📖 Interactive Story Test
          </h2>
          <div className="prose max-w-none">
            <div className="leading-relaxed text-lg">
              {processedStory}
            </div>
          </div>
        </Card>

        {/* Testing Instructions */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h2 className="font-semibold mb-3 text-blue-800">📝 Testing Instructions</h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• <strong>Tap highlighted words</strong> to test touch interaction</p>
            <p>• <strong>Try "Explain" button</strong> - should show definition in selected language</p>
            <p>• <strong>Test different languages</strong> - switch above and test again</p>
            <p>• <strong>Listen to audio</strong> - pronunciation should be in English</p>
            <p>• <strong>Check toast notifications</strong> - should appear for non-English languages</p>
            <p>• <strong>Test on different orientations</strong> - portrait and landscape</p>
          </div>
        </Card>

        {/* Native App Instructions */}
        {deviceInfo.isNativeApp ? (
          <Card className="p-4 bg-green-50 border-green-200">
            <h2 className="font-semibold mb-2 text-green-800">✅ Running as Native App</h2>
            <p className="text-sm text-green-700">
              Great! You're testing the native Capacitor app. All mobile optimizations are active.
            </p>
          </Card>
        ) : (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h2 className="font-semibold mb-2 text-yellow-800">🌐 Running as Web App</h2>
            <p className="text-sm text-yellow-700 mb-3">
              To test as a native mobile app, follow these steps:
            </p>
            <div className="text-xs text-yellow-600 space-y-1">
              <p>1. Export project to GitHub</p>
              <p>2. Run: <code className="bg-yellow-100 px-1 rounded">npm install</code></p>
              <p>3. Add platform: <code className="bg-yellow-100 px-1 rounded">npx cap add ios</code> or <code className="bg-yellow-100 px-1 rounded">npx cap add android</code></p>
              <p>4. Build: <code className="bg-yellow-100 px-1 rounded">npm run build</code></p>
              <p>5. Sync: <code className="bg-yellow-100 px-1 rounded">npx cap sync</code></p>
              <p>6. Run: <code className="bg-yellow-100 px-1 rounded">npx cap run ios</code> or <code className="bg-yellow-100 px-1 rounded">npx cap run android</code></p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};