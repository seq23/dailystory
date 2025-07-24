import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HobbyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const HobbyInput = ({ value, onChange, placeholder, className }: HobbyInputProps) => {
  const [currentInput, setCurrentInput] = useState("");
  
  // Parse existing hobbies from comma-separated string
  const hobbies = value ? value.split(',').map(h => h.trim()).filter(h => h.length > 0) : [];

  const addHobby = (hobby: string) => {
    const trimmedHobby = hobby.trim();
    if (trimmedHobby && !hobbies.includes(trimmedHobby)) {
      const newHobbies = [...hobbies, trimmedHobby];
      onChange(newHobbies.join(', '));
    }
    setCurrentInput("");
  };

  const removeHobby = (indexToRemove: number) => {
    const newHobbies = hobbies.filter((_, index) => index !== indexToRemove);
    onChange(newHobbies.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentInput.trim()) {
        addHobby(currentInput);
      }
    } else if (e.key === 'Backspace' && !currentInput && hobbies.length > 0) {
      removeHobby(hobbies.length - 1);
    }
  };

  return (
    <div className={cn(
      "min-h-[100px] p-4 rounded-2xl border-2 border-primary/20 focus-within:border-primary/50 bg-background",
      className
    )}>
      {/* Display existing hobbies as tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {hobbies.map((hobby, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
          >
            <span>{hobby}</span>
            <button
              type="button"
              onClick={() => removeHobby(index)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Input for new hobbies */}
      <input
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={hobbies.length === 0 ? placeholder : "Type another activity..."}
        className="w-full bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
        onBlur={() => {
          if (currentInput.trim()) {
            addHobby(currentInput);
          }
        }}
      />
      
      <div className="text-xs text-muted-foreground mt-2">
        Press Space or Enter to add each activity
      </div>
    </div>
  );
};