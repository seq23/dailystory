import { useState, useRef } from 'react';
// FIX: 2025-09-20 - React object rendering error fixed by proper aiSchema property access
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { HealthCheckService } from '@/services/HealthCheckService';
import { ImageFallbackService } from '@/services/ImageFallbackService';
import { Sparkles, Zap, Network, Search, Camera, RefreshCw, RotateCcw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  tier: string;
  success: boolean;
  imageURL?: string;
  details: {
    processingTime?: number;
    requestId?: string;
    error?: string;
    probableCause?: string;
    errorCategory?: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'CONFIG' | 'INTERNAL' | 'UNKNOWN' | 'SUCCESS' | 'VALIDATION';
    healthCheck?: {
      endpoint: string;
      available: boolean;
      responseTime?: number;
      status?: number;
      triageResult?: string;
    };
    testType?: 'REAL' | 'FORCED' | 'CONNECTIVITY' | 'ENHANCED_CONNECTIVITY' | 'HEALTH' | 'TRIAGE' | 'TIER_1_COMPLETE_FLOW' | 'FORCED_TEMPLATE_BYPASS' | 'E2E_SIMULATION';
    timeoutTest?: boolean;
    abortReason?: string;
    sceneGenerationOnly?: boolean;
    primaryScene?: string;
    aiSchema?: any;
    setting?: string;
    action?: string;
    mood?: string;
    pose?: string;
    realRoutingFlow?: boolean;
    fallbackReason?: string;
    routingCascade?: string[];
    avatarAnalysis?: {
      completeness: number;
      presentFields: string[];
      missingFields: string[];
    };
  };
}

const ImageTierTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTestProgress, setCurrentTestProgress] = useState<string>('');
  
  const resetTester = () => {
    setResults([]);
    setIsLoading(false);
    setCurrentTestProgress('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Image Tier Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Component temporarily simplified to resolve syntax errors.
            Full functionality will be restored after structural fixes.
            {/* Cache bust: 2025-09-27 */}
          </div>
          
          <Button onClick={resetTester} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          {/* Results Display */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.tier}</span>
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.success ? 'SUCCESS' : 'FAILED'}
                        </Badge>
                      </div>
                      
                      {result.details.error && (
                        <div className="text-sm text-red-600 mt-2">
                          <div className="font-medium">Error:</div>
                          <div className="text-xs font-mono bg-red-50 p-2 rounded mt-1">
                            {result.details.error}
                          </div>
                        </div>
                      )}

                      {result.imageURL && (
                        <div className="mt-2">
                          <img 
                            src={result.imageURL} 
                            alt="Test result" 
                            className="max-w-xs rounded border"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageTierTester;