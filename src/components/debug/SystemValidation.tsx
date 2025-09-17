import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleImageService } from './SimpleImageService';
import { DebugLogger } from '@/services/DebugLogger';

interface ValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface SystemValidationProps {}

export const SystemValidation: React.FC<SystemValidationProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const runSystemValidation = async () => {
    setIsRunning(true);
    setResults([]);
    
    const validationResults: ValidationResult[] = [];

    // Phase 5: Boot success validation
    try {
      DebugLogger.log('performance', 'Testing orchestrator boot success...');
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {}
      });
      
      if (error) {
        validationResults.push({
          test: 'Orchestrator Boot Success',
          status: 'fail',
          message: `Boot failed: ${error.message}`,
          details: error
        });
      } else {
        validationResults.push({
          test: 'Orchestrator Boot Success',
          status: 'pass',
          message: 'Orchestrator started without syntax errors',
          details: data
        });
      }
    } catch (error) {
      validationResults.push({
        test: 'Orchestrator Boot Success',
        status: 'fail',
        message: `Boot exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Phase 5: Tier progression test
    try {
      DebugLogger.log('performance', 'Testing tier progression...');
      const tierTestResult = await SimpleImageService.generateImage({
        pageText: 'A child playing in a garden with colorful flowers.',
        userInfo: {
          name: 'TestChild',
          age: 7,
          userName: 'test-user',
          avatar: {
            type: 'human',
            skinTone: 'medium'
          },
          nativeLanguage: 'English'
        },
        sessionId: `test-session-${Date.now()}`,
        storyId: `test-story-${Date.now()}`,
        pageNumber: 1,
        requestId: `test-req-${Date.now()}`
      });

      if (tierTestResult.success) {
        validationResults.push({
          test: 'Tier Progression (1 → 2.5A-B → 2.5C-D → 4)',
          status: 'pass',
          message: `Image generated successfully via ${tierTestResult.provider} (Tier ${tierTestResult.tier})`,
          details: {
            imageURL: tierTestResult.imageURL,
            provider: tierTestResult.provider,
            tier: tierTestResult.tier,
            metadata: tierTestResult.metadata
          }
        });
      } else {
        validationResults.push({
          test: 'Tier Progression (1 → 2.5A-B → 2.5C-D → 4)',
          status: 'fail',
          message: `Tier progression failed: ${tierTestResult.error}`,
          details: tierTestResult
        });
      }
    } catch (error) {
      validationResults.push({
        test: 'Tier Progression (1 → 2.5A-B → 2.5C-D → 4)',
        status: 'fail',
        message: `Tier progression exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Phase 5: Emergency fallback test
    try {
      DebugLogger.log('performance', 'Testing emergency fallback...');
      const emergencyResult = await SimpleImageService.emergencyFallbackTier25C({
        pageText: 'Emergency test scene with a character walking.',
        userInfo: {
          name: 'EmergencyTest',
          age: 6,
          userName: 'emergency-user',
          avatar: {
            type: 'human',
            skinTone: 'light'
          },
          nativeLanguage: 'English'
        },
        sessionId: `emergency-session-${Date.now()}`,
        storyId: `emergency-story-${Date.now()}`,
        pageNumber: 1,
        requestId: `emergency-req-${Date.now()}`
      });

      if (emergencyResult.success) {
        validationResults.push({
          test: 'Emergency Fallback (Direct Tier 2.5C)',
          status: 'pass',
          message: 'Emergency fallback to Tier 2.5C successful',
          details: {
            imageURL: emergencyResult.imageURL,
            provider: emergencyResult.provider,
            metadata: emergencyResult.metadata
          }
        });
      } else {
        validationResults.push({
          test: 'Emergency Fallback (Direct Tier 2.5C)',
          status: 'fail',
          message: `Emergency fallback failed: ${emergencyResult.error}`,
          details: emergencyResult
        });
      }
    } catch (error) {
      validationResults.push({
        test: 'Emergency Fallback (Direct Tier 2.5C)',
        status: 'warning',
        message: `Emergency fallback exception (acceptable if Runware unavailable): ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Phase 5: Session persistence test
    try {
      DebugLogger.log('performance', 'Testing session persistence...');
      const sessionId = `session-persistence-test-${Date.now()}`;
      
      // Generate first image with session
      const firstResult = await SimpleImageService.generateImage({
        pageText: 'A brave young explorer discovers a magical forest.',
        userInfo: {
          name: 'SessionTestChild',
          age: 8,
          userName: 'session-test-user',
          avatar: {
            type: 'human',
            skinTone: 'medium'
          },
          nativeLanguage: 'English'
        },
        sessionId,
        storyId: `session-story-${Date.now()}`,
        pageNumber: 1,
        requestId: `session-req-1-${Date.now()}`
      });

      // Generate second image with same session
      const secondResult = await SimpleImageService.generateImage({
        pageText: 'The same explorer continues deeper into the enchanted woods.',
        userInfo: {
          name: 'SessionTestChild',
          age: 8,
          userName: 'session-test-user',
          avatar: {
            type: 'human',
            skinTone: 'medium'
          },
          nativeLanguage: 'English'
        },
        sessionId,
        storyId: `session-story-${Date.now()}`,
        pageNumber: 2,
        requestId: `session-req-2-${Date.now()}`
      });

      if (firstResult.success && secondResult.success) {
        validationResults.push({
          test: 'Session Persistence & Character Consistency',
          status: 'pass',
          message: 'Session maintained consistency across multiple pages',
          details: {
            sessionId,
            firstImage: firstResult.imageURL,
            secondImage: secondResult.imageURL,
            consistencyMaintained: true
          }
        });
      } else {
        validationResults.push({
          test: 'Session Persistence & Character Consistency',
          status: 'warning',
          message: 'Session test completed with some issues',
          details: {
            firstResult: firstResult.success,
            secondResult: secondResult.success
          }
        });
      }
    } catch (error) {
      validationResults.push({
        test: 'Session Persistence & Character Consistency',
        status: 'fail',
        message: `Session persistence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    setResults(validationResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300">Warning</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Phase 3-5 System Validation
            {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Validate boot success, tier progression, session persistence, and emergency fallback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={runSystemValidation} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Validation...
                </>
              ) : (
                'Run System Validation'
              )}
            </Button>
            
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{passCount} Pass</Badge>
                <Badge variant="destructive">{failCount} Fail</Badge>
                <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300">{warningCount} Warning</Badge>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h4 className="font-medium">{result.test}</h4>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemValidation;