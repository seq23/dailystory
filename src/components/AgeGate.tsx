import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Info } from "lucide-react";

interface AgeGateProps {
  isUnder13: boolean;
  parentEmail: string;
  onUnder13Change: (checked: boolean) => void;
  onParentEmailChange: (email: string) => void;
  showValidationError?: boolean;
}

export const AgeGate = ({
  isUnder13,
  parentEmail,
  onUnder13Change,
  onParentEmailChange,
  showValidationError = false,
}: AgeGateProps) => {
  const [emailTouched, setEmailTouched] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showEmailError = 
    isUnder13 && 
    (emailTouched || showValidationError) && 
    !isValidEmail(parentEmail);

  return (
    <div className="space-y-4">
      {/* COPPA Notice */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            Children's Privacy Protection
          </p>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            We comply with COPPA (Children's Online Privacy Protection Act) to keep young readers safe.
          </p>
        </div>
      </div>

      {/* Age Checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="under13"
          checked={isUnder13}
          onCheckedChange={(checked) => onUnder13Change(checked === true)}
          className="mt-1"
        />
        <div className="flex-1">
          <Label
            htmlFor="under13"
            className="font-medium cursor-pointer leading-tight"
          >
            This account is for a child under 13 years old
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            If checked, we'll need a parent or guardian's email address for verification.
          </p>
        </div>
      </div>

      {/* Parent Email Field (only shown when under 13) */}
      {isUnder13 && (
        <div className="space-y-2 pl-7 animate-in slide-in-from-top-2 duration-200">
          <Label htmlFor="parent-email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Parent/Guardian Email Address
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="parent-email"
            type="email"
            value={parentEmail}
            onChange={(e) => onParentEmailChange(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="parent@example.com"
            className={showEmailError ? "border-destructive" : ""}
            required
          />
          
          {showEmailError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <Info className="w-3 h-3" />
              Please enter a valid parent/guardian email address
            </p>
          )}

          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> We will send a verification email to this address. 
              Your child's account features may be limited until a parent/guardian provides consent.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default AgeGate;
