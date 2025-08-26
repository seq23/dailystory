import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { RunwareConnectionTest } from '@/components/RunwareConnectionTest';

export default function PromptTesting() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-fun font-bold text-foreground mb-2">
                Story Generation Testing
              </h1>
              <p className="text-muted-foreground">
                Test story generation with AI models and external services
              </p>
            </div>
            <Link to="/template-testing">
              <Button variant="outline">
                Template Testing →
              </Button>
            </Link>
          </div>
        </div>
        
        <RunwareConnectionTest />
        <StoryPromptTester />
      </div>
    </div>
  );
}