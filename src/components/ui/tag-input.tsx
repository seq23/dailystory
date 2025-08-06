import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: (value: string) => void;
}

export const TagInput = ({ value, onChange, placeholder, className, onBlur }: TagInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  
  // Parse existing items from comma-separated string
  const items = value ? value.split(',').map(h => h.trim()).filter(h => h.length > 0) : [];

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !items.includes(trimmedItem)) {
      const newItems = [...items, trimmedItem];
      const newValue = newItems.join(', ');
      onChange(newValue);
      // Trigger blur processing for the new item
      if (onBlur) {
        onBlur(newValue);
      }
    }
    setCurrentInput("");
  };

  const removeItem = (indexToRemove: number) => {
    const newItems = items.filter((_, index) => index !== indexToRemove);
    onChange(newItems.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        addItem(currentInput);
      }
    } else if (e.key === 'Backspace' && !currentInput && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  return (
    <div className={cn(
      "min-h-[100px] sm:min-h-[120px] p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-primary/20 focus-within:border-primary/50 bg-background touch-target",
      className
    )}>
      {/* Display existing items as tags */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
          >
            <span className="break-words">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors touch-target-small"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Input for new items with better placeholder handling */}
      <div className="space-y-2">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={items.length === 0 ? "" : "Type another item..."}
          className="w-full bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-muted-foreground touch-target"
          onBlur={() => {
            if (currentInput.trim()) {
              addItem(currentInput);
            }
            // Trigger blur processing for complete value
            if (onBlur) {
              onBlur(value);
            }
          }}
        />
        
        {/* Show placeholder suggestions when empty */}
        {items.length === 0 && placeholder && (
          <div className="text-sm text-muted-foreground/80 leading-relaxed break-words">
            <span className="font-medium">Examples: </span>
            <span className="italic">{placeholder}</span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mt-3 opacity-75">
        Press Enter to add each item
      </div>
    </div>
  );
};