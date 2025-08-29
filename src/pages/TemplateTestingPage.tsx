import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickTemplateTest } from '@/components/template-testing/QuickTemplateTest';
import { AdvancedTemplateTest } from '@/components/template-testing/AdvancedTemplateTest';
import { BatchTemplateTest } from '@/components/template-testing/BatchTemplateTest';
import { TemplateExplorer } from '@/components/template-testing/TemplateExplorer';
import { TemplateSystemMonitor } from '@/components/template-testing/TemplateSystemMonitor';
import { SystematicWordCountTest } from '@/components/template-testing/SystematicWordCountTest';

export default function TemplateTestingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-fun font-bold text-foreground mb-2">
                Template System Testing
              </h1>
              <p className="text-muted-foreground">
                Test and explore the complete template system with all 9 difficulty levels
              </p>
            </div>
            <Link to="/prompt-testing">
              <Button variant="outline">
                ← Story Generation Testing
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="quick">Quick Test</TabsTrigger>
            <TabsTrigger value="wordcount">Word Count Test</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="batch">Batch Test</TabsTrigger>
            <TabsTrigger value="explorer">Explorer</TabsTrigger>
            <TabsTrigger value="monitor">System Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-6">
            <QuickTemplateTest />
          </TabsContent>
          
          <TabsContent value="wordcount" className="mt-6">
            <SystematicWordCountTest />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedTemplateTest />
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <BatchTemplateTest />
          </TabsContent>

          <TabsContent value="explorer" className="mt-6">
            <TemplateExplorer />
          </TabsContent>

          <TabsContent value="monitor" className="mt-6">
            <TemplateSystemMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}