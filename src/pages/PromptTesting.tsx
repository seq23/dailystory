import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Brain, Zap, Cable, ArrowRight } from 'lucide-react';
import { BasicLevelTestRunner } from '@/components/BasicLevelTestRunner';
import { ValidationTestRunner } from '@/components/ValidationTestRunner';
import { StoryPromptTester } from '@/components/StoryPromptTester';
import { RunwareConnectionTest } from '@/components/RunwareConnectionTest';

export default function PromptTesting() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start mb-6">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-fun font-bold text-foreground mb-2">
                Story Generation Testing
              </h1>
              <p className="text-muted-foreground">
                Comprehensive testing suite for AI story generation, validation, and infrastructure
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Link to="/template-testing">
                <Button variant="outline" className="flex items-center gap-2">
                  Template Testing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <GraduationCap className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Basic Levels</p>
                  <p className="text-sm text-muted-foreground">PreK - 4th Grade</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Expert Levels</p>
                  <p className="text-sm text-muted-foreground">6th - 10th Grade</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Zap className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Advanced Tests</p>
                  <p className="text-sm text-muted-foreground">Multi-service</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Cable className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Infrastructure</p>
                  <p className="text-sm text-muted-foreground">Connectivity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Sections */}
        <div className="space-y-8">
          {/* Basic Level Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Basic Level Testing</h2>
            </div>
            <BasicLevelTestRunner />
          </section>

          <Separator />

          {/* Expert Level Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Expert Level Testing</h2>
            </div>
            <ValidationTestRunner />
          </section>

          <Separator />

          {/* Advanced Comprehensive Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Advanced Testing Suite</h2>
            </div>
            <StoryPromptTester />
          </section>

          <Separator />

          {/* Infrastructure Tests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cable className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Infrastructure Testing</h2>
            </div>
            <RunwareConnectionTest />
          </section>
        </div>
      </div>
    </div>
  );
}