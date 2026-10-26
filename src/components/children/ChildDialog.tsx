import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { ChildForm } from "./ChildForm";

export const OPEN_CHILD_DIALOG = "open-child-dialog";

/** Open the add-child form (no id) or the edit form for one child, from anywhere. */
export function openChildDialog(childId?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CHILD_DIALOG, { detail: { childId: childId ?? null } }));
}

/** The one add/edit-child form, as a focused dialog (never a long dashboard). */
export function ChildDialog() {
  const { children, deleteChild } = useChildProfiles();
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setChildId((e as CustomEvent<{ childId: string | null }>).detail?.childId ?? null);
      setConfirmRemove(false);
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
        {/* Remove a child: only when editing, only with another child left, and only after a second tap. */}
        {child && children.length > 1 && (
          <div className="border-t pt-4" data-testid="child-remove-area">
            {!confirmRemove ? (
              <Button type="button" variant="ghost" className="min-h-11 text-destructive" onClick={() => setConfirmRemove(true)} data-testid="child-remove">
                Remove {child.display_name}
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm">Remove {child.display_name}? Their profile goes away. You can add them again any time.</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-h-11"
                    disabled={removing}
                    data-testid="child-remove-confirm"
                    onClick={async () => {
                      setRemoving(true);
                      try {
                        const name = child.display_name;
                        await deleteChild(child.id);
                        setOpen(false);
                        toast.success(`Removed: ${name}`);
                      } catch (e: any) {
                        toast.error(e?.message ?? "We couldn't remove that child just now. Please try again.");
                      } finally {
                        setRemoving(false);
                      }
                    }}
                  >
                    Yes, remove
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => setConfirmRemove(false)}>
                    Keep {child.display_name}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChildDialog;
