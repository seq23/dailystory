import * as React from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Import avatar images
import avatarBoyPale from "@/assets/avatar-boy-pale.jpg"
import avatarBoyLight from "@/assets/avatar-boy-light.jpg"
import avatarBoyMedium from "@/assets/avatar-boy-medium.jpg"
import avatarBoyOlive from "@/assets/avatar-boy-olive.jpg"
import avatarBoyDark from "@/assets/avatar-boy-dark.jpg"
import avatarGirlPale from "@/assets/avatar-girl-pale.jpg"
import avatarGirlLight from "@/assets/avatar-girl-light.jpg"
import avatarGirlMedium from "@/assets/avatar-girl-medium.jpg"
import avatarGirlOlive from "@/assets/avatar-girl-olive.jpg"
import avatarGirlDark from "@/assets/avatar-girl-dark.jpg"

import type { AvatarType, SkinTone } from "@/types"

interface AvatarSelection {
  type: AvatarType
  skinTone: SkinTone
}

interface AvatarPickerProps {
  value: AvatarSelection
  onChange: (avatar: AvatarSelection) => void
  className?: string
}

const avatarImages = {
  boy: {
    pale: avatarBoyPale,
    light: avatarBoyLight,
    medium: avatarBoyMedium,
    olive: avatarBoyOlive,
    dark: avatarBoyDark,
  },
  girl: {
    pale: avatarGirlPale,
    light: avatarGirlLight,
    medium: avatarGirlMedium,
    olive: avatarGirlOlive,
    dark: avatarGirlDark,
  },
}

const skinToneColors = {
  pale: "#fde2e7",
  light: "#f7d7a3", 
  medium: "#d4a574",
  olive: "#c19a6b",
  dark: "#8b5a3c"
}

export const AvatarPicker = React.forwardRef<
  HTMLDivElement,
  AvatarPickerProps
>(({ value, onChange, className }, ref) => {
  const handleTypeChange = (type: AvatarType) => {
    onChange({ ...value, type })
  }

  const handleSkinToneChange = (skinTone: SkinTone) => {
    onChange({ ...value, skinTone })
  }

  // For "prefer-not-to-answer", default to boy avatar for display but we'll handle pronouns separately
  const displayType = value.type === "prefer-not-to-answer" ? "boy" : value.type
  const currentAvatar = avatarImages[displayType as "boy" | "girl"]?.[value.skinTone]

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Avatar Type Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          Avatar Type:
        </Label>
        <RadioGroup
          value={value.type}
          onValueChange={handleTypeChange}
          className="flex gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="boy" id="boy" />
            <Label htmlFor="boy" className="text-base cursor-pointer">Boy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="girl" id="girl" />
            <Label htmlFor="girl" className="text-base cursor-pointer">Girl</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefer-not-to-answer" id="prefer-not-to-answer" />
            <Label htmlFor="prefer-not-to-answer" className="text-base cursor-pointer">Prefer not to answer</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Skin Tone Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          Skin Tone:
        </Label>
        <div className="flex gap-3 flex-wrap">
          {(Object.keys(skinToneColors) as Array<keyof typeof skinToneColors>).map((tone) => (
            <Button
              key={tone}
              type="button"
              variant="outline"
              onClick={() => handleSkinToneChange(tone)}
              className={cn(
                "w-12 h-12 rounded-full border-4 hover:scale-110 transition-transform",
                value.skinTone === tone 
                  ? "border-primary shadow-lg scale-110" 
                  : "border-gray-300 hover:border-primary/50"
              )}
              style={{ backgroundColor: skinToneColors[tone] }}
              aria-label={`Select ${tone} skin tone`}
            />
          ))}
        </div>
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