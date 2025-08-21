import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';

interface ValidationFeedbackProps {
  hasErrors: boolean;
  errors: string[];
  hasCoppaViolation: boolean;
  onSubmissionAttempt?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  hasErrors,
  errors,
  hasCoppaViolation,
  onSubmissionAttempt = false
}) => {
  // Only show feedback on submission attempt, not real-time
  if (!onSubmissionAttempt || !hasErrors) return null;

  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">
            This content is not appropriate for children
          </p>
          
          {hasCoppaViolation && (
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Personal information detected. For your child's safety, please remove:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Phone numbers, addresses, or contact information</li>
                  <li>Full names, birthdates, or personal details</li>
                  <li>School names or specific locations</li>
                </ul>
                <p className="mt-2 text-xs">
                  Learn more about{' '}
                  <a 
                    href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    COPPA compliance
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};