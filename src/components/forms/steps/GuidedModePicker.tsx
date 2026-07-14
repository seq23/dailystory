import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import {
  GUIDED_THEMES,
  GUIDED_CHARACTERS,
  GUIDED_SETTINGS,
  GUIDED_VOCAB_PACKS,
  type GuidedChip,
  type VocabPack,
} from "@/data/guidedModeOptions";

interface GuidedModePickerProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  selected: {
    themes: string[];
    characters: string[];
    settings: string[];
    vocabPack: string | null;
  };
  onChange: (next: GuidedModePickerProps["selected"]) => void;
}

function ChipRow({
  chips,
  selectedIds,
  onToggle,
  multi = true,
}: {
  chips: GuidedChip[] | VocabPack[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const active = selectedIds.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onToggle(chip.id)}
            className={`px-3 py-2 rounded-full text-sm border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-accent/50"
            }`}
            aria-pressed={active}
          >
            <span className="mr-1">{chip.emoji}</span>
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export const GuidedModePicker: React.FC<GuidedModePickerProps> = ({
  enabled,
  onToggle,
  selected,
  onChange,
}) => {
  const toggleId = (list: string[], id: string, max?: number) => {
    if (list.includes(id)) return list.filter((x) => x !== id);
    if (max && list.length >= max) return [...list.slice(1), id];
    return [...list, id];
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-sm font-medium text-foreground">Guided Mode</Label>
            <p className="text-xs text-muted-foreground">
              Tap-to-pick presets for young or ESL learners. No typing required.
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Toggle Guided Mode" />
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Theme (pick up to 2)</Label>
            <ChipRow
              chips={GUIDED_THEMES}
              selectedIds={selected.themes}
              onToggle={(id) => onChange({ ...selected, themes: toggleId(selected.themes, id, 2) })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Character (pick up to 2)</Label>
            <ChipRow
              chips={GUIDED_CHARACTERS}
              selectedIds={selected.characters}
              onToggle={(id) =>
                onChange({ ...selected, characters: toggleId(selected.characters, id, 2) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Setting (pick 1)</Label>
            <ChipRow
              chips={GUIDED_SETTINGS}
              selectedIds={selected.settings}
              onToggle={(id) => onChange({ ...selected, settings: toggleId(selected.settings, id, 1) })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Vocabulary Pack (optional)</Label>
            <ChipRow
              chips={GUIDED_VOCAB_PACKS}
              selectedIds={selected.vocabPack ? [selected.vocabPack] : []}
              onToggle={(id) =>
                onChange({ ...selected, vocabPack: selected.vocabPack === id ? null : id })
              }
              multi={false}
            />
            <p className="text-xs text-muted-foreground">
              A teacher word-list (if set) still takes priority over the pack.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
