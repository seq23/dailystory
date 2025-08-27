import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Temporarily disable template validation functionality until consolidation is complete
export const TemplateSystemMonitor = () => {
  return (
    <Alert className="border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Template System Status:</strong> Template validation system temporarily disabled during consolidation.
        All template functionality is now handled by edge functions.
      </AlertDescription>
    </Alert>
  );
};