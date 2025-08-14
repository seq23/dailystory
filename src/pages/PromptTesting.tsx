import React from 'react';
import { StoryPromptTester } from '@/components/StoryPromptTester';

export default function PromptTesting() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <StoryPromptTester />
      </div>
    </div>
  );
}