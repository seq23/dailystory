import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccessCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  label?: string;
}

/** "Have a code?" box shown wherever a parent starts the trial. Optional; checkout works without it. */
export function AccessCodeField({ value, onChange, error, disabled, label = "Have a code?" }: AccessCodeFieldProps) {
  const [open, setOpen] = useState(Boolean(value));
  if (!open) {
    return (
      <button
        type="button"
        className="text-sm text-primary underline hover:opacity-90"
        onClick={() => setOpen(true)}
        data-testid="access-code-toggle"
      >
        {label}
      </button>
    );
  }
  return (
    <div className="space-y-1 text-left max-w-xs mx-auto w-full">
      <Label htmlFor="access-code">{label}</Label>
      <Input
        id="access-code"
        data-testid="access-code-input"
        value={value}
        disabled={disabled}
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="Enter your code"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "access-code-error" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id="access-code-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default AccessCodeField;
