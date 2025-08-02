import React from 'react';
import { MultilingualTestComponent } from './MultilingualTestComponent';

// Simple page component to test multilingual functionality
export const TestMultilingualPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌍 Multilingual Translation & Audio Test
          </h1>
          <p className="text-gray-600 text-lg">
            Test button translations and audio explanations for all supported languages
          </p>
        </header>
        
        <MultilingualTestComponent />
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Check browser console for detailed debug information</p>
        </footer>
      </div>
    </div>
  );
};