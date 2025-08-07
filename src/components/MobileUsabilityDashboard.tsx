import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tablet, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { MobileUsabilityTester, type UsabilityTestSuite } from '@/utils/mobileUsabilityTester';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileUsabilityDashboard = () => {
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [testResults, setTestResults] = useState<UsabilityTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    
    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const results = MobileUsabilityTester.runFullTestSuite();
      setTestResults(results);
      setLastTestTime(new Date());
    } catch (error) {
      console.error('Usability test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!testResults) return;
    
    const report = MobileUsabilityTester.generateReport(testResults);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-usability-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {isMobile ? <Smartphone className="w-6 h-6" /> : 
             isTablet ? <Tablet className="w-6 h-6" /> : 
             <Eye className="w-6 h-6" />}
            Mobile Usability Testing
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of mobile and tablet user experience
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
          
          {testResults && (
            <Button 
              variant="outline" 
              onClick={downloadReport}
              className="min-h-[44px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Current Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Screen Size</p>
              <p className="font-medium">{window.innerWidth}×{window.innerHeight}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Touch Support</p>
              <p className="font-medium">
                {'ontouchstart' in window ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Test</p>
              <p className="font-medium">
                {lastTestTime ? lastTestTime.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Usability Score</span>
              <Badge variant={getScoreBadgeVariant(testResults.overallScore)}>
                {testResults.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={testResults.overallScore} className="mb-4" />
            
            {testResults.criticalIssues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Issues Found
                </h4>
                <ul className="space-y-1">
                  {testResults.criticalIssues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {testResults && (
        <Tabs defaultValue="touchTargets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="touchTargets">Touch Targets</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="floating">Floating Elements</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="touchTargets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Touch Target Analysis
                  <div className="flex items-center gap-2">
                    {testResults.touchTargets.passed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <Badge variant={getScoreBadgeVariant(testResults.touchTargets.score)}>
                      {testResults.touchTargets.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={testResults.touchTargets.score} className="mb-4" />
                
                {testResults.touchTargets.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-800">Issues Found:</h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1">
                        {testResults.touchTargets.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {testResults.touchTargets.recommendations.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium text-blue-800">Recommendations:</h4>
                    <ul className="space-y-1">
                      {testResults.touchTargets.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Layout Analysis
                  <div className="flex items-center gap-2">
                    {testResults.layout.passed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <Badge variant={getScoreBadgeVariant(testResults.layout.score)}>
                      {testResults.layout.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={testResults.layout.score} className="mb-4" />
                
                {testResults.layout.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-800">Issues Found:</h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1">
                        {testResults.layout.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {testResults.layout.recommendations.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium text-blue-800">Recommendations:</h4>
                    <ul className="space-y-1">
                      {testResults.layout.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="floating" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Floating Elements Analysis
                  <div className="flex items-center gap-2">
                    {testResults.floating.passed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <Badge variant={getScoreBadgeVariant(testResults.floating.score)}>
                      {testResults.floating.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={testResults.floating.score} className="mb-4" />
                
                {testResults.floating.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-800">Issues Found:</h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1">
                        {testResults.floating.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {testResults.floating.recommendations.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium text-blue-800">Recommendations:</h4>
                    <ul className="space-y-1">
                      {testResults.floating.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Accessibility Analysis
                  <div className="flex items-center gap-2">
                    {testResults.accessibility.passed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <Badge variant={getScoreBadgeVariant(testResults.accessibility.score)}>
                      {testResults.accessibility.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={testResults.accessibility.score} className="mb-4" />
                
                {testResults.accessibility.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-800">Issues Found:</h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1">
                        {testResults.accessibility.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {testResults.accessibility.recommendations.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium text-blue-800">Recommendations:</h4>
                    <ul className="space-y-1">
                      {testResults.accessibility.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};