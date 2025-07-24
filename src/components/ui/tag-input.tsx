import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput = ({ value, onChange, placeholder, className }: TagInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  
  // Parse existing items from comma-separated string
  const items = value ? value.split(',').map(h => h.trim()).filter(h => h.length > 0) : [];

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !items.includes(trimmedItem)) {
      const newItems = [...items, trimmedItem];
      onChange(newItems.join(', '));
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
      "min-h-[100px] p-4 rounded-2xl border-2 border-primary/20 focus-within:border-primary/50 bg-background",
      className
    )}>
      {/* Display existing items as tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Input for new items */}
      <input
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={items.length === 0 ? placeholder : "Type another item..."}
        className="w-full bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
        onBlur={() => {
          if (currentInput.trim()) {
            addItem(currentInput);
          }
        }}
      />
      
      <div className="text-xs text-muted-foreground mt-2">
        Press Enter to add each item
      </div>
    </div>
  );
};