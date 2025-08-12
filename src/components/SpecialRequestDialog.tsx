import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
interface SpecialRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSubmit: (value: string) => void;
  isGenerating?: boolean;
}

export const SpecialRequestDialog: React.FC<SpecialRequestDialogProps> = ({
  open,
  onOpenChange,
  initialValue = "",
  onSubmit,
  isGenerating = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [targetVocab, setTargetVocab] = useState<string>("");

  useEffect(() => {
    setValue(initialValue || "");
    setTargetVocab("");
  }, [initialValue, open]);

  const handleSubmit = () => {
    const base = (value || "").trim();
    const vocab = (targetVocab || "").trim();
    const composed = vocab ? `${base ? base + "\n" : ""}Target vocabulary: ${vocab}` : base;
    onSubmit(composed);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Update special requests before generating a new story">
        <DialogHeader>
          <DialogTitle>Re-write this story</DialogTitle>
          <DialogDescription>
            Update any special requests. These guide the AI when creating your next page-by-page story.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="special-requests" className="text-sm font-medium text-muted-foreground">
            Special requests (optional)
          </label>
          <Textarea
            id="special-requests"
            placeholder="E.g., add a friendly dragon, set it in a space school, keep sentences short, include sight words, etc."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <div className="space-y-2 mt-4">
          <label htmlFor="target-vocab" className="text-sm font-medium text-muted-foreground">
            Target vocabulary (optional)
          </label>
          <TagInput
            value={targetVocab}
            onChange={setTargetVocab}
            placeholder="Add words, then press Enter"
          />
          <p className="text-xs text-muted-foreground">Words here will guide the AI to include them in the next story.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Start new story"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
