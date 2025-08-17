import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  supportStructured?: boolean; // New prop for structured format support
}

export const TagInput = ({ value, onChange, placeholder, className, onBlur, disabled = false, supportStructured = false }: TagInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  
  // Parse existing items - support both structured and simple formats
  const items = value ? value.split(',').map(h => h.trim()).filter(h => h.length > 0) : [];
  
  // Check if an item is in structured format (e.g., "Themes: 'value'")
  const isStructuredItem = (item: string) => {
    return supportStructured && /^[A-Za-z\s]+:\s*['"].*['"]$/.test(item.trim());
  };

  const addItem = (item: string) => {
    if (disabled) return;
    const trimmedItem = item.trim();
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
      // For structured format, allow Enter without creating tags unless it's a complete line
      if (supportStructured) {
        // Only create tag if the line appears complete (ends with quote or has no quotes)
        const trimmed = currentInput.trim();
        if (trimmed && (!trimmed.includes(':') || trimmed.match(/['"].*['"]$/))) {
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

  return (
    <div className={cn(
      "min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-primary/20 focus-within:border-primary/50 bg-background touch-target",
      supportStructured && "min-h-[80px] sm:min-h-[100px]", // Slightly taller for structured input
      disabled && "opacity-60 pointer-events-none",
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
      
      {/* Textarea for new items with multi-line placeholder support */}
      <textarea
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={items.length === 0 ? (placeholder || "") : ""}
        className={cn(
          "w-full bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-xs sm:placeholder:text-sm placeholder:text-muted-foreground resize-none touch-target",
          supportStructured ? "min-h-[40px]" : "min-h-[30px]"
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
    </div>
  );
};