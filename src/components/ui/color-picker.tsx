import * as React from "react"
import { HexColorPicker } from "react-colorful"
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
  const [color, setColor] = React.useState(value || "")

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  const colorName = React.useMemo(() => {
    const colorMap: Record<string, string> = {
      // Basic colors
      "#ff0000": "Red",
      "#ff4500": "Orange Red",
      "#ff6347": "Tomato",
      "#ff7f50": "Coral",
      "#ff8c00": "Dark Orange",
      "#ffa500": "Orange", 
      "#ffb347": "Peach",
      "#ffd700": "Gold",
      "#ffff00": "Yellow",
      "#adff2f": "Green Yellow",
      "#7fff00": "Chartreuse",
      "#32cd32": "Lime Green",
      "#00ff00": "Lime",
      "#00ff7f": "Spring Green",
      "#00ffff": "Cyan",
      "#87ceeb": "Sky Blue",
      "#4169e1": "Royal Blue",
      "#0000ff": "Blue",
      "#0000cd": "Medium Blue",
      "#000080": "Navy Blue",
      "#4b0082": "Indigo",
      "#8a2be2": "Blue Violet",
      "#9400d3": "Violet",
      "#9932cc": "Dark Orchid",
      "#ba55d3": "Medium Orchid",
      "#da70d6": "Orchid",
      "#ee82ee": "Violet Light",
      "#ff69b4": "Hot Pink",
      "#ff1493": "Deep Pink",
      "#ffc0cb": "Pink",
      "#ffb6c1": "Light Pink",
      "#f08080": "Light Coral",
      "#cd5c5c": "Indian Red",
      "#a52a2a": "Brown",
      "#8b4513": "Saddle Brown",
      "#d2691e": "Chocolate",
      "#daa520": "Goldenrod",
      "#b8860b": "Dark Goldenrod",
      "#228b22": "Forest Green",
      "#006400": "Dark Green",
      "#2e8b57": "Sea Green",
      "#3cb371": "Medium Sea Green",
      "#20b2aa": "Light Sea Green",
      "#008b8b": "Dark Cyan",
      "#5f9ea0": "Cadet Blue",
      "#708090": "Slate Gray",
      "#2f4f4f": "Dark Slate Gray",
      "#696969": "Dim Gray",
      "#808080": "Gray",
      "#a9a9a9": "Dark Gray",
      "#c0c0c0": "Silver",
      "#d3d3d3": "Light Gray",
      "#dcdcdc": "Gainsboro",
      "#f5f5f5": "White Smoke",
      "#ffffff": "White",
      "#000000": "Black",
      "#fffaf0": "Floral White",
      "#f0f8ff": "Alice Blue",
      "#e6e6fa": "Lavender",
      "#fff0f5": "Lavender Blush",
      "#ffefd5": "Papaya Whip",
      "#ffebcd": "Blanched Almond",
      "#f5deb3": "Wheat",
      "#deb887": "Burlywood",
      "#d2b48c": "Tan",
      "#bc8f8f": "Rosy Brown",
      "#f4a460": "Sandy Brown"
    }
    
    if (!color) return ""
    
    // Find closest match by converting to lowercase and comparing
    const colorHex = color.toLowerCase()
    const exactMatch = Object.keys(colorMap).find(hex => 
      hex.toLowerCase() === colorHex
    )
    
    if (exactMatch) {
      return colorMap[exactMatch]
    }
    
    // If no exact match, try to find a close color name based on the hex value
    const hexToColorName = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      
      // Simple color classification based on RGB values
      if (r > 200 && g < 100 && b < 100) return "Red"
      if (r > 200 && g > 150 && b < 100) return "Orange"
      if (r > 200 && g > 200 && b < 100) return "Yellow"
      if (r < 100 && g > 150 && b < 100) return "Green"
      if (r < 100 && g < 100 && b > 150) return "Blue"
      if (r > 150 && g < 100 && b > 150) return "Purple"
      if (r > 200 && g > 100 && b > 150) return "Pink"
      if (r < 100 && g > 150 && b > 150) return "Cyan"
      if (r > 200 && g > 200 && b > 200) return "White"
      if (r < 50 && g < 50 && b < 50) return "Black"
      if (r > 100 && g > 100 && b > 100 && r < 150 && g < 150 && b < 150) return "Gray"
      if (r > 100 && g > 50 && b < 50) return "Brown"
      
      return color // Return hex if no match
    }
    
    return hexToColorName(color)
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
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {color && (
                <div
                  className="h-6 w-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                />
              )}
              <span>{color ? colorName : "Pull down to select color"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-2xl shadow-lg z-50" align="start">
        <div className="space-y-4">
          <HexColorPicker color={color || "#3b82f6"} onChange={handleColorChange} />
          <div className="text-sm text-center text-muted-foreground">
            Selected: {colorName || "No color selected"}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
ColorPicker.displayName = "ColorPicker"