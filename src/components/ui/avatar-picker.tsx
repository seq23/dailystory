import * as React from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import type { AvatarType, SkinTone } from "@/types"
import { DebugLogger } from '@/services/DebugLogger'

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
    pale: "/avatar-boy-pale.jpg",
    light: "/avatar-boy-light.jpg",
    medium: "/avatar-boy-medium.jpg",
    olive: "/avatar-boy-olive.jpg",
    dark: "/avatar-boy-dark.jpg",
  },
  girl: {
    pale: "/avatar-girl-pale.jpg",
    light: "/avatar-girl-light.jpg",
    medium: "/avatar-girl-medium.jpg",
    olive: "/avatar-girl-olive.jpg",
    dark: "/avatar-girl-dark.jpg",
  },
  "prefer-not-to-answer": {
    pale: "/avatar-prefer-not-to-answer-pale.jpg",
    light: "/avatar-prefer-not-to-answer-light.jpg",
    medium: "/avatar-prefer-not-to-answer-medium.jpg",
    olive: "/avatar-prefer-not-to-answer-olive.jpg",
    dark: "/avatar-prefer-not-to-answer-dark.jpg",
  }
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
  const { t } = useTranslation()
  
  const handleTypeChange = (type: AvatarType) => {
    onChange({ ...value, type })
  }

  const handleSkinToneChange = (skinTone: SkinTone) => {
    onChange({ ...value, skinTone })
  }

  // Get avatar directly from the avatar images mapping
  const currentAvatar = avatarImages[value.type as keyof typeof avatarImages]?.[value.skinTone]
  
  // Add debugging for avatar image selection
  React.useEffect(() => {
    DebugLogger.log('ui', 'AvatarPicker current selection:', {
      type: value.type,
      skinTone: value.skinTone,
      currentAvatar,
      imageExists: !!currentAvatar
    });
  }, [value.type, value.skinTone, currentAvatar]);

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Avatar Type Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          {t("userInfoForm.fields.avatarTypes.label", "Avatar Type:")}
        </Label>
        <RadioGroup
          value={value.type}
          onValueChange={handleTypeChange}
          className="flex gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="boy" id="boy" />
            <Label htmlFor="boy" className="text-base cursor-pointer">{t("userInfoForm.fields.avatarTypes.boy", "Boy")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="girl" id="girl" />
            <Label htmlFor="girl" className="text-base cursor-pointer">{t("userInfoForm.fields.avatarTypes.girl", "Girl")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefer-not-to-answer" id="prefer-not-to-answer" />
            <Label htmlFor="prefer-not-to-answer" className="text-base cursor-pointer">{t("userInfoForm.fields.avatarTypes.preferNotToAnswer", "Prefer not to answer")}</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Skin Tone Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-foreground">
          {t("userInfoForm.fields.skinTone.label", "Skin Tone:")}
        </Label>
        <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
          {(Object.keys(skinToneColors) as Array<keyof typeof skinToneColors>).map((tone) => (
            <div key={tone} className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSkinToneChange(tone)}
                className={cn(
                  "w-12 h-12 rounded-full border-4 hover:scale-110 transition-all duration-200 hover:shadow-lg",
                  value.skinTone === tone 
                    ? "border-primary shadow-lg scale-110 ring-2 ring-primary/20" 
                    : "border-gray-300 hover:border-primary/50"
                )}
                style={{ backgroundColor: skinToneColors[tone] }}
                aria-label={`${t("userInfoForm.fields.skinTone.select", "Select")} ${t(`userInfoForm.fields.skinTone.options.${tone}`, tone)} ${t("userInfoForm.fields.skinTone.label", "skin tone")}`}
              />
              <span className="text-xs text-muted-foreground text-center capitalize">
                {t(`userInfoForm.fields.skinTone.options.${tone}`, tone)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Preview */}
      {currentAvatar && (
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-foreground">
            {t("userInfoForm.fields.avatarPreview.label", "Your avatar:")}
          </Label>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <img
                src={currentAvatar}
                alt={`${value.type} avatar with ${value.skinTone} skin tone`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  DebugLogger.error('ui', 'Avatar image failed to load:', {
                    src: currentAvatar,
                    type: value.type,
                    skinTone: value.skinTone
                  });
                  // Use existing fallback image from avatar mapping
                  const fallbackImage = avatarImages.boy[value.skinTone] || avatarImages.boy.medium;
                  (e.target as HTMLImageElement).src = fallbackImage;
                  DebugLogger.log('ui', 'Using fallback image:', fallbackImage);
                }}
                onLoad={() => {
                  DebugLogger.log('ui', 'Avatar image loaded successfully:', currentAvatar);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
AvatarPicker.displayName = "AvatarPicker"