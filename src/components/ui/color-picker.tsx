import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export const ColorPicker = React.forwardRef<
  HTMLButtonElement,
  ColorPickerProps
>(({ value, onChange, className }, ref) => {
  const primaryColors = [
    { name: "Red", color: "#ff0000" },
    { name: "Orange", color: "#ffa500" },
    { name: "Yellow", color: "#ffff00" },
    { name: "Green", color: "#008000" },
    { name: "Blue", color: "#0000ff" },
    { name: "Purple", color: "#800080" },
    { name: "Brown", color: "#8b4513" },
    { name: "Black", color: "#000000" },
    { name: "White", color: "#ffffff" },
  ];

  const handleColorSelect = (colorName: string) => {
    onChange(colorName)
  }

  const getSelectedColor = () => {
    const selectedColorObj = primaryColors.find(c => c.name.toLowerCase() === value.toLowerCase());
    return selectedColorObj ? selectedColorObj.color : value;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {value && (
                <div
                  className="h-6 w-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: getSelectedColor() }}
                />
              )}
              <span>{value || "Pull down to select color"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-2xl shadow-lg z-50" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {primaryColors.map((colorObj) => (
              <button
                key={colorObj.name}
                type="button"
                onClick={() => handleColorSelect(colorObj.name)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 hover:scale-105 transition-transform",
                  value === colorObj.name 
                    ? "border-primary bg-primary/10" 
                    : "border-gray-200 hover:border-primary/50"
                )}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: colorObj.color }}
                />
                <span className="text-sm font-medium">{colorObj.name}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
ColorPicker.displayName = "ColorPicker"