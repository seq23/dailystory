import React from 'react';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { RunwareConnectionTest } from '@/components/RunwareConnectionTest';

export default function PromptTesting() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <RunwareConnectionTest />
        <StoryPromptTester />
      </div>
    </div>
  );
}