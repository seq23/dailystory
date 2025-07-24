import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const [color, setColor] = React.useState(value || "#3b82f6")

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  const colorName = React.useMemo(() => {
    const colorMap: Record<string, string> = {
      "#ff0000": "Red",
      "#ff6b35": "Orange", 
      "#ffff00": "Yellow",
      "#00ff00": "Green",
      "#0000ff": "Blue",
      "#8a2be2": "Purple",
      "#ff69b4": "Pink",
      "#ffc0cb": "Light Pink",
      "#a52a2a": "Brown",
      "#000000": "Black",
      "#ffffff": "White",
      "#808080": "Gray"
    }
    
    // Find closest match or return hex value
    const closest = Object.keys(colorMap).find(hex => 
      hex.toLowerCase() === color.toLowerCase()
    )
    return closest ? colorMap[closest] : color
  }, [color])

  React.useEffect(() => {
    if (value && value !== color) {
      setColor(value)
    }
  }, [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50",
            !color && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span>{colorName || "Select color"}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <HexColorPicker color={color} onChange={handleColorChange} />
          <div className="text-sm text-center text-muted-foreground">
            Selected: {colorName}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
ColorPicker.displayName = "ColorPicker"