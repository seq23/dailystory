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
  // Show feedback immediately when there are errors (real-time)
  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium text-sm">
            {hasCoppaViolation 
              ? "Personal information detected - please review for safety" 
              : "This content is not appropriate for children"
            }
          </p>
          
          {/* Show individual error messages */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-xs bg-destructive/5 p-2 rounded border border-destructive/20">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
          
          {hasCoppaViolation && (
            <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-800">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  🛡️ Protecting Your Child's Privacy
                </p>
                <p className="text-amber-700 dark:text-amber-300 mb-2">
                  For your child's safety, please avoid sharing:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-300 mb-3">
                  <li>Phone numbers, addresses, or contact information</li>
                  <li>Full names, birthdates, or personal details</li>
                  <li>School names or specific locations</li>
                </ul>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-amber-700 dark:text-amber-300">Learn more about</span>
                  <a 
                    href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 dark:text-amber-200 underline hover:no-underline font-medium"
                  >
                    COPPA compliance
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};