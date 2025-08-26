import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, Hash, BookOpen, Zap, CheckCircle } from 'lucide-react';

interface StoryResult {
  success: boolean;
  level?: string;
  templateCount?: number;
  pages?: string[];
  metadata?: {
    sourceSystem: string;
    templateLevel: string;
    selectedTemplate?: number;
    processingTime?: number;
    placeholdersResolved?: number;
    grammarFixesApplied?: number;
  };
  error?: string;
}

interface StoryResultDisplayProps {
  result: StoryResult;
}

export function StoryResultDisplay({ result }: StoryResultDisplayProps) {
  if (!result.success) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Generation Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{result.error || 'Unknown error occurred'}</p>
        </CardContent>
      </Card>
    );
  }

  const pages = result.pages || [];
  const metadata = result.metadata;

  return (
    <div className="space-y-6">
      {/* Metadata Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Story Generation Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pages.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Pages Generated
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {pages.join(' ').split(' ').length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Hash className="h-3 w-3" />
                Total Words
              </div>
            </div>

            {metadata?.processingTime && (
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{metadata.processingTime}ms</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Processing Time
                </div>
              </div>
            )}

            {result.templateCount && (
              <div className="text-center">
                <div className="text-2xl font-bold text-fun">{result.templateCount}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Available Templates
                </div>
              </div>
            )}
          </div>

          {metadata && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{metadata.sourceSystem}</Badge>
                <Badge variant="secondary">{metadata.templateLevel}</Badge>
                {metadata.selectedTemplate !== undefined && (
                  <Badge variant="outline">Template #{metadata.selectedTemplate}</Badge>
                )}
                {metadata.placeholdersResolved && (
                  <Badge variant="outline">{metadata.placeholdersResolved} placeholders resolved</Badge>
                )}
                {metadata.grammarFixesApplied && (
                  <Badge variant="outline">{metadata.grammarFixesApplied} grammar fixes</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Generated Story Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Page {index + 1}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {page.split(' ').length} words
                  </span>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed font-body">{page}</p>
                </div>
                {index < pages.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Technical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average words per page:</span>
              <span className="font-medium">
                {pages.length > 0 ? Math.round(pages.join(' ').split(' ').length / pages.length) : 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated reading time:</span>
              <span className="font-medium">
                {Math.ceil(pages.join(' ').split(' ').length / 100)} minutes
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Template system:</span>
              <span className="font-medium">{metadata?.sourceSystem || 'Unknown'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Template level:</span>
              <span className="font-medium">{metadata?.templateLevel || result.level || 'Unknown'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}