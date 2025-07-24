import * as React from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Import avatar images
import avatarBoyLight from "@/assets/avatar-boy-light.jpg"
import avatarBoyMedium from "@/assets/avatar-boy-medium.jpg"
import avatarBoyDark from "@/assets/avatar-boy-dark.jpg"
import avatarGirlLight from "@/assets/avatar-girl-light.jpg"
import avatarGirlMedium from "@/assets/avatar-girl-medium.jpg"
import avatarGirlDark from "@/assets/avatar-girl-dark.jpg"

interface AvatarSelection {
  type: "boy" | "girl"
  skinTone: "light" | "medium" | "dark"
}

interface AvatarPickerProps {
  value: AvatarSelection
  onChange: (avatar: AvatarSelection) => void
  className?: string
}

const avatarImages = {
  boy: {
    light: avatarBoyLight,
    medium: avatarBoyMedium,
    dark: avatarBoyDark,
  },
  girl: {
    light: avatarGirlLight,
    medium: avatarGirlMedium,
    dark: avatarGirlDark,
  },
}

const skinToneLabels = {
  light: "Light",
  medium: "Medium", 
  dark: "Dark"
}

export const AvatarPicker = React.forwardRef<
  HTMLDivElement,
  AvatarPickerProps
>(({ value, onChange, className }, ref) => {
  const handleTypeChange = (type: "boy" | "girl") => {
    onChange({ ...value, type })
  }

  const handleSkinToneChange = (skinTone: "light" | "medium" | "dark") => {
    onChange({ ...value, skinTone })
  }

  const currentAvatar = avatarImages[value.type]?.[value.skinTone]

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Avatar Type Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          Choose your avatar type:
        </Label>
        <RadioGroup
          value={value.type}
          onValueChange={handleTypeChange}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="boy" id="boy" />
            <Label htmlFor="boy" className="text-base cursor-pointer">Boy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="girl" id="girl" />
            <Label htmlFor="girl" className="text-base cursor-pointer">Girl</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Skin Tone Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          Choose your skin tone:
        </Label>
        <RadioGroup
          value={value.skinTone}
          onValueChange={handleSkinToneChange}
          className="flex gap-4"
        >
          {(Object.keys(skinToneLabels) as Array<keyof typeof skinToneLabels>).map((tone) => (
            <div key={tone} className="flex items-center space-x-2">
              <RadioGroupItem value={tone} id={tone} />
              <Label htmlFor={tone} className="text-base cursor-pointer">
                {skinToneLabels[tone]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Avatar Preview */}
      {currentAvatar && (
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-foreground">
            Your avatar:
          </Label>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <img
                src={currentAvatar}
                alt={`${value.type} avatar with ${value.skinTone} skin tone`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
AvatarPicker.displayName = "AvatarPicker"