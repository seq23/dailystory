import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, Hash, BookOpen, Zap, CheckCircle } from 'lucide-react';

// Robust word counting function - consistent with StoryPromptTester
const countWords = (content: string | string[]): number => {
  if (!content) return 0;
  
  // Handle array of pages
  if (Array.isArray(content)) {
    return content.reduce((total, page) => total + countWords(page), 0);
  }
  
  // Handle single string
  if (typeof content === 'string') {
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
  
  return 0;
};

interface StoryResult {
  success: boolean;
  level?: string;
  templateCount?: number;
  pages?: string[];
  expectedPages?: number;
  metadata?: {
    sourceSystem: string;
    templateLevel: string;
    selectedTemplate?: number;
    processingTime?: number;
    placeholdersResolved?: number;
    grammarFixesApplied?: number;
    mode?: string;
    targetWordDensity?: string;
  };
  testingData?: {
    templateStructure: {
      title: string;
      theme: string;
      level: string;
      totalScenes: number;
      totalEndings: number;
    };
    sceneDetails: Array<{
      index: number;
      mainText: string;
      alternatives: string[];
      optionalDetails: string[];
      hook: string;
      pause: boolean;
    }>;
    endingDetails: Array<{
      index: number;
      type: string;
      mainText: string;
      variants: string[];
    }>;
    reusableElements: {
      swappableElements: Record<string, string[]>;
      weatherVariants: string[];
      settingVariants: string[];
      randomSeed?: number;
    };
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
              <div className="text-2xl font-bold text-primary">
                {pages.length}{result.expectedPages && result.expectedPages !== pages.length && 
                  <span className="text-sm text-muted-foreground ml-1">/{result.expectedPages}</span>
                }
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Pages Generated
                {result.expectedPages && result.expectedPages !== pages.length && 
                  <span className="text-xs">(Expected: {result.expectedPages})</span>
                }
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {countWords(pages)}
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
                {metadata.mode && (
                  <Badge variant="secondary">Mode: {metadata.mode}</Badge>
                )}
                {metadata.targetWordDensity && (
                  <Badge variant="outline">Density: {metadata.targetWordDensity}</Badge>
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
                    {countWords(page)} words
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

      {/* Testing Mode: Complete Template Structure */}
      {result.testingData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Template Structure Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{result.testingData.templateStructure.totalScenes}</div>
                    <div className="text-sm text-muted-foreground">Total Scenes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{result.testingData.templateStructure.totalEndings}</div>
                    <div className="text-sm text-muted-foreground">Total Endings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{Object.keys(result.testingData.reusableElements.swappableElements).length}</div>
                    <div className="text-sm text-muted-foreground">Swappable Elements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fun">{result.testingData.reusableElements.weatherVariants.length + result.testingData.reusableElements.settingVariants.length}</div>
                    <div className="text-sm text-muted-foreground">Environment Variants</div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Title: {result.testingData.templateStructure.title}</Badge>
                    <Badge variant="secondary">Theme: {result.testingData.templateStructure.theme}</Badge>
                    <Badge variant="outline">Level: {result.testingData.templateStructure.level}</Badge>
                    {result.testingData.reusableElements.randomSeed && (
                      <Badge variant="outline">Random Seed: {result.testingData.reusableElements.randomSeed}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Scene Variants & Alternatives ({result.testingData.sceneDetails.length} scenes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.testingData.sceneDetails.map((scene, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <Badge variant="outline">Scene {scene.index}</Badge>
                      {scene.hook && <Badge variant="secondary" className="ml-2">Hook: {scene.hook}</Badge>}
                      {scene.pause && <Badge variant="secondary" className="ml-2">Pause Point</Badge>}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Main Text ({countWords(scene.mainText)} words):</div>
                        <div className="p-3 bg-muted rounded text-sm">{scene.mainText}</div>
                      </div>
                      
                      {scene.alternatives.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Alternatives ({scene.alternatives.length}):</div>
                          <div className="space-y-2">
                            {scene.alternatives.map((alt, altIndex) => (
                              <div key={altIndex} className="p-2 bg-muted/50 rounded text-sm">
                                <Badge variant="outline" className="mr-2">Alt {altIndex + 1}</Badge>
                                {alt} <span className="text-xs text-muted-foreground">({countWords(alt)} words)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {scene.optionalDetails.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Optional Details ({scene.optionalDetails.length}):</div>
                          <div className="space-y-2">
                            {scene.optionalDetails.map((detail, detailIndex) => (
                              <div key={detailIndex} className="p-2 bg-secondary/10 rounded text-sm">
                                <Badge variant="secondary" className="mr-2">Detail {detailIndex + 1}</Badge>
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Ending Variations ({result.testingData.endingDetails.length} endings)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.testingData.endingDetails.map((ending, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <Badge variant="outline">Ending {ending.index}</Badge>
                      <Badge variant="secondary" className="ml-2 capitalize">{ending.type}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Main Ending ({countWords(ending.mainText)} words):</div>
                        <div className="p-3 bg-muted rounded text-sm">{ending.mainText}</div>
                      </div>
                      
                      {ending.variants.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Ending Variants ({ending.variants.length}):</div>
                          <div className="space-y-2">
                            {ending.variants.map((variant, variantIndex) => (
                              <div key={variantIndex} className="p-2 bg-primary/10 rounded text-sm">
                                <Badge variant="outline" className="mr-2">Variant {variantIndex + 1}</Badge>
                                {variant} <span className="text-xs text-muted-foreground">({countWords(variant)} words)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(Object.keys(result.testingData.reusableElements.swappableElements).length > 0 || 
            result.testingData.reusableElements.weatherVariants.length > 0 || 
            result.testingData.reusableElements.settingVariants.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-fun" />
                  Reusable Template Elements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(result.testingData.reusableElements.swappableElements).length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Swappable Elements:</div>
                      <div className="space-y-2">
                        {Object.entries(result.testingData.reusableElements.swappableElements).map(([key, options]) => (
                          <div key={key} className="p-3 bg-muted rounded">
                            <div className="text-sm font-medium mb-1">{key}:</div>
                            <div className="flex flex-wrap gap-1">
                              {options.map((option, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{option}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.testingData.reusableElements.weatherVariants.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Weather Variants ({result.testingData.reusableElements.weatherVariants.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {result.testingData.reusableElements.weatherVariants.map((variant, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{variant}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.testingData.reusableElements.settingVariants.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Setting Variants ({result.testingData.reusableElements.settingVariants.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {result.testingData.reusableElements.settingVariants.map((variant, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{variant}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

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
                {pages.length > 0 ? Math.round(countWords(pages) / pages.length) : 0}
                {metadata?.targetWordDensity === 'Template-optimized' && (
                  <span className="text-xs text-muted-foreground ml-1">(Template density)</span>
                )}
              </span>
            </div>
            
            {result.expectedPages && result.expectedPages !== pages.length && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page count variance:</span>
                <span className="font-medium text-accent">
                  {pages.length - result.expectedPages > 0 ? '+' : ''}{pages.length - result.expectedPages} from expected
                </span>
              </div>
            )}
            
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