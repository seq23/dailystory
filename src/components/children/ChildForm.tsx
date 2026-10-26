import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { cn } from "@/lib/utils";
import type { AvatarType, SkinTone } from "@/types";
import { useChildProfiles, type ChildProfile } from "@/hooks/useChildProfiles";
import { CHILD_GRADES, childAge } from "./childInfo";
import { AGES, normalizeGrade } from "@/lib/grades";

interface ChildFormProps {
  /** Edit this child; leave out to add a new one. */
  child?: ChildProfile | null;
  onSaved?: (child: ChildProfile) => void;
  onCancel?: () => void;
  submitLabel?: string;
}



/**
 * One calm form for a child: name, School grade (sets topics), Reads at (sets how hard
 * the words are; starts at the school grade), age (3 to 15, optional), picture. Every choice shows as selected; Save shows a spinner, then the parent
 * sees the saved child (or a plain error with "Try again").
 */
export function ChildForm({ child, onSaved, onCancel, submitLabel }: ChildFormProps) {
  const { addChild, updateChild } = useChildProfiles();
  const existingAvatar = (child?.avatar ?? null) as { type?: AvatarType; skinTone?: SkinTone } | null;
  const [name, setName] = useState(child?.display_name ?? "");
  const [grade, setGrade] = useState<string>(normalizeGrade(child?.grade_level) ?? "");
  // "Reads at" (child_profiles.reading_grade): follows the school grade until the parent picks one.
  const [readsAt, setReadsAt] = useState<string>(normalizeGrade((child as { reading_grade?: string | null } | null | undefined)?.reading_grade) ?? normalizeGrade(child?.grade_level) ?? "");
  const [readsAtChosen, setReadsAtChosen] = useState<boolean>(Boolean((child as { reading_grade?: string | null } | null | undefined)?.reading_grade));
  const [age, setAge] = useState<number | null>(child ? childAge(child) : null);
  const [avatar, setAvatar] = useState<{ type: AvatarType; skinTone: SkinTone }>({
    type: existingAvatar?.type ?? "prefer-not-to-answer",
    skinTone: existingAvatar?.skinTone ?? "medium",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missing = !name.trim() ? "Please type the child's first name." : !grade ? "Please pick a grade." : null;

  const save = async () => {
    if (missing) {
      setError(missing);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input = {
        display_name: name.trim(),
        grade_level: grade,
        reading_grade: readsAt || grade,
        birth_year: age != null ? new Date().getFullYear() - age : null,
        birth_month: null,
        avatar,
      };
      const saved = child ? await updateChild(child.id, input) : await addChild(input);
      onSaved?.(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't save that just now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      data-testid="child-form"
    >
      <div className="space-y-2">
        <Label htmlFor="child-name" className="text-base font-semibold">Child's first name</Label>
        <Input
          id="child-name"
          data-testid="child-name"
          value={name}
          autoComplete="off"
          placeholder="For example, Maya"
          onChange={(e) => setName(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">First name only. It goes into their stories.</p>
      </div>

      <GradeChoice
        legend="School grade"
        help="The grade they are in at school. It keeps story topics right for them."
        testIdPrefix="child-grade"
        value={grade}
        onChange={(g) => {
          setGrade(g);
          if (!readsAtChosen) setReadsAt(g);
        }}
      />

      <GradeChoice
        legend="Reads at"
        help="How hard the words are. It starts at their school grade; the story page's Make it easier / Make it harder buttons change it too."
        testIdPrefix="child-reads-at"
        value={readsAt}
        onChange={(g) => {
          setReadsAt(g);
          setReadsAtChosen(true);
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="child-age" className="text-base font-semibold">
          Age <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <select
          id="child-age"
          data-testid="child-age"
          value={age ?? ""}
          onChange={(e) => setAge(e.target.value ? Number(e.target.value) : null)}
          className="h-11 w-full max-w-[12rem] rounded-md border bg-background px-3 text-base"
        >
          <option value="">Choose age</option>
          {AGES.map((a) => (
            <option key={a} value={a}>{a} years old</option>
          ))}
        </select>
      </div>

      <AvatarPicker value={avatar} onChange={setAvatar} />

      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="min-h-11">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving} className="min-h-11" data-testid="child-save">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden /> Saving…</>
          ) : error ? (
            "Try again"
          ) : (
            submitLabel ?? (child ? "Save changes" : "Add child")
          )}
        </Button>
      </div>
    </form>
  );
}

/** A row of grade buttons (Pre-K to 10th), the chosen one plainly marked. */
function GradeChoice({ legend, help, testIdPrefix, value, onChange }: {
  legend: string; help: string; testIdPrefix: string; value: string; onChange: (g: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-base font-semibold">{legend}</legend>
      <p className="text-xs text-muted-foreground">{help}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label={legend}>
        {CHILD_GRADES.map((g) => {
          const selected = value === g.value;
          return (
            <button
              key={g.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`${testIdPrefix}-${g.value}`}
              onClick={() => onChange(g.value)}
              className={cn(
                "min-h-11 rounded-lg border text-sm font-medium transition",
                selected ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" : "bg-background hover:border-primary/60",
              )}
            >
              {selected ? `✓ ${g.label}` : g.label}
            </button>
          );
        })}
      </div>
      <p className="text-sm" aria-live="polite">
        {value ? <>Selected: <strong>{CHILD_GRADES.find((g) => g.value === value)?.label}</strong></> : <span className="text-muted-foreground">Pre-K to 10th grade.</span>}
      </p>
    </fieldset>
  );
}

export default ChildForm;
