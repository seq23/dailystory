import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { ChildForm } from "./ChildForm";

export const OPEN_CHILD_DIALOG = "open-child-dialog";

/** Open the add-child form (no id) or the edit form for one child, from anywhere. */
export function openChildDialog(childId?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CHILD_DIALOG, { detail: { childId: childId ?? null } }));
}

/** The one add/edit-child form, as a focused dialog (never a long dashboard). */
export function ChildDialog() {
  const { children } = useChildProfiles();
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setChildId((e as CustomEvent<{ childId: string | null }>).detail?.childId ?? null);
      setOpen(true);
    };
    window.addEventListener(OPEN_CHILD_DIALOG, onOpen);
    return () => window.removeEventListener(OPEN_CHILD_DIALOG, onOpen);
  }, []);

  const child = childId ? children.find((c) => c.id === childId) ?? null : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[100dvh] overflow-y-auto sm:max-w-lg" data-testid="child-dialog">
        <DialogHeader>
          <DialogTitle>{child ? `Edit ${child.display_name}` : "Add a child"}</DialogTitle>
          <DialogDescription>
            {child ? "Change their name, grade, age or picture." : "Each child gets stories at their own level."}
          </DialogDescription>
        </DialogHeader>
        <ChildForm
          key={childId ?? "new"}
          child={child}
          onCancel={() => setOpen(false)}
          onSaved={(saved) => {
            setOpen(false);
            toast.success(child ? `Saved: ${saved.display_name}'s profile` : `Saved: ${saved.display_name}. ${saved.display_name} is reading now.`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ChildDialog;
