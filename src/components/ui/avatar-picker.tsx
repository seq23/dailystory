import * as React from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { User, Users, Sparkles } from "lucide-react"

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

const skinToneInfo = {
  pale: { color: "#fde2e7", name: "Fair", emoji: "🌸" },
  light: { color: "#f7d7a3", name: "Light", emoji: "☀️" }, 
  medium: { color: "#d4a574", name: "Medium", emoji: "🌿" },
  olive: { color: "#c19a6b", name: "Olive", emoji: "🫒" },
  dark: { color: "#8b5a3c", name: "Deep", emoji: "🌰" }
}

const avatarTypeInfo = {
  boy: { icon: User, label: "Boy", emoji: "👦", description: "He/Him pronouns" },
  girl: { icon: User, label: "Girl", emoji: "👧", description: "She/Her pronouns" },
  "prefer-not-to-answer": { icon: Users, label: "Non-Binary", emoji: "🌈", description: "They/Them pronouns" }
}

export const AvatarPicker = React.forwardRef<
  HTMLDivElement,
  AvatarPickerProps
>(({ value, onChange, className }, ref) => {
  const [selectedPreview, setSelectedPreview] = React.useState<AvatarSelection>(value)

  const handleTypeChange = (type: AvatarType) => {
    const newSelection = { ...value, type }
    onChange(newSelection)
    setSelectedPreview(newSelection)
  }

  const handleSkinToneChange = (skinTone: SkinTone) => {
    const newSelection = { ...value, skinTone }
    onChange(newSelection)
    setSelectedPreview(newSelection)
  }

  // For "prefer-not-to-answer", default to boy avatar for display but we'll handle pronouns separately
  const displayType = value.type === "prefer-not-to-answer" ? "boy" : value.type
  const currentAvatar = avatarImages[displayType as "boy" | "girl"]?.[value.skinTone]

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Label className="text-xl font-bold text-foreground">
            Choose Your Avatar
          </Label>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Pick an avatar that represents you in your stories!
        </p>
      </div>

      {/* Avatar Type Selection - Enhanced Cards */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5" />
          Avatar Style
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(avatarTypeInfo) as Array<keyof typeof avatarTypeInfo>).map((type) => {
            const info = avatarTypeInfo[type]
            const isSelected = value.type === type
            const Icon = info.icon
            
            return (
              <Card 
                key={type} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-primary/50"
                )}
                onClick={() => handleTypeChange(type)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                      isSelected ? "bg-primary/20" : "bg-gray-100"
                    )}>
                      {info.emoji}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">{info.label}</h3>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selected ✨
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Skin Tone Selection - Enhanced */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Skin Tone
        </Label>
        <div className="grid grid-cols-5 gap-4">
          {(Object.keys(skinToneInfo) as Array<keyof typeof skinToneInfo>).map((tone) => {
            const info = skinToneInfo[tone]
            const isSelected = value.skinTone === tone
            
            return (
              <div key={tone} className="text-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSkinToneChange(tone)}
                  className={cn(
                    "w-16 h-16 rounded-full border-4 hover:scale-110 transition-all duration-200 relative overflow-hidden",
                    isSelected 
                      ? "border-primary shadow-xl scale-110 ring-4 ring-primary/20" 
                      : "border-gray-300 hover:border-primary/50 shadow-md"
                  )}
                  style={{ backgroundColor: info.color }}
                  aria-label={`Select ${info.name} skin tone`}
                >
                  <span className="text-lg">{info.emoji}</span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </Button>
                <div className="space-y-1">
                  <p className="text-xs font-medium">{info.name}</p>
                  {isSelected && (
                    <Badge variant="outline" className="text-xs px-1">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Avatar Preview - Enhanced */}
      {currentAvatar && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Avatar Preview
          </Label>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                    <img
                      src={currentAvatar}
                      alt={`${value.type} avatar with ${value.skinTone} skin tone`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg">
                      {avatarTypeInfo[value.type]?.emoji}
                    </span>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Perfect! This is your character! 🎉
                  </h3>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-sm">
                      {avatarTypeInfo[value.type]?.label}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {skinToneInfo[value.skinTone]?.name} skin
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This avatar will appear in your personalized stories!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
})
AvatarPicker.displayName = "AvatarPicker"