import { uiText, useUiLanguage } from "@/i18n/uiText";
import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
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

const TYPE_LABELS: Record<string, string> = {
  boy: "Boy",
  girl: "Girl",
  "prefer-not-to-answer": "Other",
}

/** Small check-mark badge on whatever is selected, so the choice is never a guess. */
const SelectedMark = () => (
  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow ring-2 ring-background" aria-hidden>
    ✓
  </span>
)

export const avatarImageFor = (type: string | undefined, tone: string | undefined): string =>
  avatarImages[(type as keyof typeof avatarImages) ?? "prefer-not-to-answer"]?.[(tone as SkinTone) ?? "medium"] ??
  avatarImages["prefer-not-to-answer"].medium

/**
 * Pick a picture, then a skin tone. Each choice shows a thick ring, a ✓ and the
 * word "Selected", so a parent on a phone always sees what is picked.
 */
export const AvatarPicker = React.forwardRef<
  HTMLDivElement,
  AvatarPickerProps
>(({ value, onChange, className }, ref) => {
  const { t } = useTranslation()
  const types = Object.keys(avatarImages) as AvatarType[]
  const tones = Object.keys(skinToneColors) as SkinTone[]

  return (
    <div ref={ref} className={cn("space-y-5", className)} data-testid="avatar-picker">
      <fieldset className="space-y-2">
        <legend className="text-base font-semibold text-foreground">
          {t("avatarPicker.picture", "Picture")}
        </legend>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {types.map((type) => {
            const selected = value.type === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ ...value, type })}
                aria-pressed={selected}
                aria-label={`${TYPE_LABELS[type]} picture${selected ? uiText(", selected") : ""}`}
                data-testid={`avatar-type-${type}`}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl p-2 transition",
                  selected ? "ring-4 ring-primary bg-primary/10" : "ring-1 ring-border hover:ring-primary/50",
                )}
              >
                {selected && <SelectedMark />}
                <img src={avatarImageFor(type, value.skinTone)} alt="" className="h-16 w-16 rounded-full object-cover" />
                <span className="text-sm">{TYPE_LABELS[type]}</span>
                <span className={cn("text-xs font-semibold", selected ? "text-primary" : "invisible")}>{uiText("Selected")}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-base font-semibold text-foreground">
          {t("avatarPicker.skinTone", "Skin tone")}
        </legend>
        <div className="grid grid-cols-5 gap-2 max-w-sm">
          {tones.map((tone) => {
            const selected = value.skinTone === tone
            return (
              <button
                key={tone}
                type="button"
                onClick={() => onChange({ ...value, skinTone: tone })}
                aria-pressed={selected}
                aria-label={`${tone} skin tone${selected ? uiText(", selected") : ""}`}
                data-testid={`avatar-tone-${tone}`}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "relative h-11 w-11 rounded-full border-2",
                    selected ? "ring-4 ring-primary ring-offset-2 border-white" : "border-gray-300",
                  )}
                  style={{ backgroundColor: skinToneColors[tone] }}
                >
                  {selected && <SelectedMark />}
                </span>
                {/* The name always stays; the chosen one also says "Selected". */}
                <span className={cn("text-xs capitalize", selected ? "font-semibold text-primary" : "text-muted-foreground")} data-testid={`avatar-tone-name-${tone}`}>
                  {t(`userInfoForm.fields.skinTone.options.${tone}`, tone)}
                </span>
                <span className={cn("text-xs font-semibold", selected ? "text-primary" : "invisible")}>{uiText("✓ Selected")}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3" data-testid="avatar-preview">
        <img
          src={avatarImageFor(value.type, value.skinTone)}
          alt={`Chosen picture: ${TYPE_LABELS[value.type] ?? uiText("Other")}, ${value.skinTone} skin tone`}
          className="h-14 w-14 rounded-full object-cover ring-4 ring-primary"
        />
        <p className="text-sm">
          <span className="font-semibold">{uiText("Selected:")}</span> {TYPE_LABELS[value.type] ?? uiText("Other")}, {value.skinTone} {uiText("skin tone")}
        </p>
      </div>
    </div>
  )
})
AvatarPicker.displayName = "AvatarPicker"
