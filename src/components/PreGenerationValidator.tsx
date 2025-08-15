// Pre-generation Validation Component
// Phase 4: User-facing validation with recommendations and auto-fix options

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PromptValidationEngine, type ValidationResult, type PromptValidationConfig } from '@/utils/promptValidationEngine';
import type { UserInfo, DifficultyLevel } from '@/types';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Shield,
  Settings,
  RefreshCw
} from 'lucide-react';

interface PreGenerationValidatorProps {
  promptText: string;
  userInfo: UserInfo;
  difficultyLevel: DifficultyLevel;
  onValidationChange?: (result: ValidationResult) => void;
  onAutoFix?: (fixedPrompt: string) => void;
  className?: string;
}

export const PreGenerationValidator: React.FC<PreGenerationValidatorProps> = ({
  promptText,
  userInfo,
  difficultyLevel,
  onValidationChange,
  onAutoFix,
  className
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationConfig, setValidationConfig] = useState<PromptValidationConfig>({
    maxLength: 2800,
    warnLength: 2500,
    complexityThreshold: 0.8,
    enableFallback: true,
    allowAutoOptimization: true
  });
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const validatePrompt = async () => {
    if (!promptText.trim()) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = PromptValidationEngine.validatePromptBeforeGeneration(
        promptText,
        userInfo,
        difficultyLevel,
        validationConfig
      );
      
      setValidationResult(result);
      onValidationChange?.(result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(validatePrompt, 500);
    return () => clearTimeout(debounceTimer);
  }, [promptText, validationConfig, userInfo, difficultyLevel]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'length': return <AlertCircle className="h-3 w-3" />;
      case 'complexity': return <Zap className="h-3 w-3" />;
      case 'content': return <Shield className="h-3 w-3" />;
      case 'compatibility': return <Settings className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const handleAutoFix = () => {
    if (validationResult && onAutoFix) {
      // Here you would implement the actual auto-fix logic
      // For now, we'll simulate it
      console.log('Auto-fixing prompt...');
      onAutoFix(promptText); // In reality, this would be the fixed prompt
    }
  };

  const promptLength = promptText.length;
  const lengthPercentage = (promptLength / validationConfig.maxLength) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Length Indicator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Prompt Length Analysis</CardTitle>
            <Badge variant={lengthPercentage > 100 ? 'destructive' : lengthPercentage > 85 ? 'default' : 'secondary'}>
              {promptLength} / {validationConfig.maxLength} chars
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={Math.min(lengthPercentage, 100)} 
            className={lengthPercentage > 100 ? 'progress-destructive' : ''}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {lengthPercentage > 100 
              ? `${Math.round(lengthPercentage - 100)}% over limit`
              : `${Math.round(100 - lengthPercentage)}% remaining`
            }
          </p>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {isValidating ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Validating prompt...</span>
            </div>
          </CardContent>
        </Card>
      ) : validationResult ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getSeverityIcon(validationResult.severity)}
              <CardTitle className="text-sm">
                Validation {validationResult.isValid ? 'Passed' : 'Issues Found'}
              </CardTitle>
              <Badge variant={getSeverityColor(validationResult.severity)}>
                {validationResult.severity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Issues */}
            {validationResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Issues Detected:</h4>
                {validationResult.issues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'default'}>
                    <div className="flex items-start space-x-2">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <AlertDescription>
                          <div className="font-medium">{issue.message}</div>
                          <div className="text-sm mt-1">{issue.suggestion}</div>
                          {issue.autoFixAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={handleAutoFix}
                            >
                              Auto-fix
                            </Button>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  {validationResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Info className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fallback Suggestion */}
            {validationResult.fallbackSuggested && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Fallback Recommended</div>
                  <div className="text-sm mt-1">
                    Consider using the simple generation mode for reliable results.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Validation Settings</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvancedSettings ? 'Hide' : 'Show'} Settings
            </Button>
          </div>
        </CardHeader>
        {showAdvancedSettings && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-fallback">Enable Automatic Fallback</Label>
                <Switch
                  id="enable-fallback"
                  checked={validationConfig.enableFallback}
                  onCheckedChange={(checked) =>
                    setValidationConfig(prev => ({ ...prev, enableFallback: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-optimization">Allow Auto-optimization</Label>
                <Switch
                  id="auto-optimization"
                  checked={validationConfig.allowAutoOptimization}
                  onCheckedChange={(checked) =>
                    setValidationConfig(prev => ({ ...prev, allowAutoOptimization: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Length Limits</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <Label htmlFor="warn-length">Warning: {validationConfig.warnLength}</Label>
                </div>
                <div>
                  <Label htmlFor="max-length">Maximum: {validationConfig.maxLength}</Label>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};