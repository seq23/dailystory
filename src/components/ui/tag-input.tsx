import { useState, KeyboardEvent } from "react";
import { X, AlertTriangle, Shield, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationTooltip } from "./ValidationTooltip";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  supportStructured?: boolean; // New prop for structured format support
  validateInput?: (text: string) => { isValid: boolean; issues?: string[] };
  validationError?: string[];
}

export const TagInput = ({ value, onChange, placeholder, className, onBlur, disabled = false, supportStructured = false, validateInput, validationError }: TagInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  
  // Parse existing items - support both structured and simple formats
  const items = value ? value.split(',').map(h => h.trim()).filter(h => h.length > 0) : [];
  
  // Check if an item is in structured format (e.g., "Themes: value" or "Themes: 'value'")
  const isStructuredItem = (item: string) => {
    return supportStructured && /^[A-Za-z\s]+:\s*.+$/.test(item.trim());
  };

  const addItem = (item: string) => {
    if (disabled) return;
    const trimmedItem = item.trim();
    
    // Validate input if validation function is provided
    if (validateInput && trimmedItem) {
      const validation = validateInput(trimmedItem);
      if (!validation.isValid) {
        // Don't add invalid items
        return;
      }
    }
    
    if (trimmedItem && !items.includes(trimmedItem)) {
      const newItems = [...items, trimmedItem];
      const newValue = newItems.join(', ');
      onChange(newValue);
      if (onBlur) {
        onBlur(newValue);
      }
    }
    setCurrentInput("");
  };

  const removeItem = (indexToRemove: number) => {
    if (disabled) return;
    const newItems = items.filter((_, index) => index !== indexToRemove);
    onChange(newItems.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      const trimmed = currentInput.trim();
      
      // Check validation before allowing Enter to create tags
      if (validateInput && trimmed) {
        const validation = validateInput(trimmed);
        if (!validation.isValid) {
          e.preventDefault();
          return; // Block Enter if validation fails
        }
      }
      
      // For structured format, allow Enter without creating tags unless it's a complete line
      if (supportStructured) {
        // Create tag if structured format is detected or if it's a simple input
        if (trimmed && (!trimmed.includes(':') || /^[A-Za-z\s]+:\s*.+$/.test(trimmed))) {
          e.preventDefault();
          addItem(currentInput);
        }
        // Otherwise allow the Enter to create a new line
      } else {
        // Simple format - always create tag on Enter
        e.preventDefault();
        if (currentInput.trim()) {
          addItem(currentInput);
        }
      }
    } else if (e.key === 'Backspace' && !currentInput && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  // Check if current input has validation errors
  const hasCurrentInputErrors = validateInput && currentInput.trim() ? !validateInput(currentInput.trim()).isValid : false;
  const currentInputErrors = validateInput && currentInput.trim() ? validateInput(currentInput.trim()).issues || [] : [];
  const hasCoppaViolation = currentInputErrors.some(issue => 
    issue.includes('personal') || 
    issue.includes('contact') || 
    issue.includes('number') ||
    issue.includes('email') ||
    issue.includes('address')
  );

  return (
    <ValidationTooltip
      isValid={!hasCurrentInputErrors}
      errors={currentInputErrors}
      hasCoppaViolation={hasCoppaViolation}
    >
      <div className={cn(
        "min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-primary/20 focus-within:border-primary/50 bg-background touch-target transition-all",
        supportStructured && "min-h-[80px] sm:min-h-[100px]", // Slightly taller for structured input
        disabled && "opacity-60 pointer-events-none",
        validationError && validationError.length > 0 && "border-destructive/50 focus-within:border-destructive",
        hasCurrentInputErrors && "border-destructive/50 focus-within:border-destructive shadow-sm shadow-destructive/20",
        className
      )}>
        {/* Display existing items as tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium",
                isStructuredItem(item) 
                  ? "bg-gradient-to-r from-primary/15 to-secondary/15 text-foreground border border-primary/30 rounded-lg" 
                  : "bg-primary/10 text-primary rounded-full"
              )}
            >
              <span className="break-words">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors touch-target-small"
                aria-label="remove"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Real-time validation errors below tags */}
        {validationError && validationError.length > 0 && (
          <div className="mb-3 p-2 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive">Content not suitable for children</p>
                {validationError.map((error, index) => (
                  <p key={index} className="text-xs text-muted-foreground">{error}</p>
                ))}
                <div className="flex items-center gap-1 text-xs mt-2">
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  <a 
                    href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Learn about child safety
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Textarea for new items with multi-line placeholder support */}
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={items.length === 0 ? (placeholder || "") : ""}
          className={cn(
            "w-full bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-xs sm:placeholder:text-sm placeholder:text-muted-foreground resize-none touch-target",
            supportStructured ? "min-h-[40px]" : "min-h-[30px]",
            hasCurrentInputErrors && "text-destructive"
          )}
          disabled={disabled}
          rows={supportStructured ? 3 : 2}
          onBlur={() => {
            if (currentInput.trim() && !disabled) {
              addItem(currentInput);
            }
            if (onBlur) {
              onBlur(value);
            }
          }}
        />
        
        {/* Real-time typing feedback */}
        {hasCurrentInputErrors && currentInput.trim() && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-amber-500" />
            <span>This content cannot be added - try different words</span>
          </div>
        )}
      </div>
    </ValidationTooltip>
  );
};