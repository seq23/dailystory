import { useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { childAvatarUrl, childSummary } from "./childInfo";
import { openChildDialog } from "./ChildDialog";

/**
 * Every child in the account, each with their picture, grade and age; who is
 * reading now is marked; "+ Add another child" is always at the end.
 */
export function ChildrenList({ className }: { className?: string }) {
  const { children, activeChild, setActiveChild, loading, error, refresh } = useChildProfiles();
  const [switching, setSwitching] = useState<string | null>(null);

  if (loading) {
    return (
      <p className={cn("text-sm text-muted-foreground flex items-center gap-2", className)}>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Loading your children…
      </p>
    );
  }
  if (error) {
    return (
      <div className={cn("text-sm", className)} role="alert">
        {error}{" "}
        <button type="button" className="underline font-medium" onClick={() => refresh()}>Try again</button>
      </div>
    );
  }

  return (
    <section className={cn("space-y-3", className)} aria-labelledby="children-heading" data-testid="children-list">
      <h2 id="children-heading" className="text-lg font-semibold">Your children</h2>
      {children.length === 0 && <p className="text-sm text-muted-foreground">No children yet. Add the first one to start reading.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {children.map((c) => {
          const reading = activeChild?.id === c.id;
          return (
            <li
              key={c.id}
              className={cn("flex items-center gap-3 rounded-xl border p-3", reading && "border-primary bg-primary/5")}
              data-testid="child-card"
            >
              <img
                src={childAvatarUrl(c)}
                alt={`${c.display_name}'s picture`}
                className={cn("h-14 w-14 rounded-full object-cover", reading ? "ring-4 ring-primary" : "ring-1 ring-border")}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{c.display_name}</p>
                {childSummary(c) && <p className="text-sm text-muted-foreground">{childSummary(c)}</p>}
                {reading ? (
                  <p className="text-sm font-medium text-primary">✓ Reading now</p>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-medium text-primary underline"
                    disabled={switching !== null}
                    onClick={async () => {
                      setSwitching(c.id);
                      try {
                        await setActiveChild(c.id);
                        toast.success(`${c.display_name} is reading now`);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Please try again.");
                      } finally {
                        setSwitching(null);
                      }
                    }}
                  >
                    {switching === c.id ? "Switching…" : `Read as ${c.display_name}`}
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" className="min-h-10" onClick={() => openChildDialog(c.id)} aria-label={`Edit ${c.display_name}`}>
                <Pencil className="w-4 h-4 mr-1" aria-hidden /> Edit
              </Button>
            </li>
          );
        })}
      </ul>
      <Button variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => openChildDialog()} data-testid="add-child-button">
        <Plus className="w-4 h-4 mr-2" aria-hidden /> {children.length ? "Add another child" : "Add a child"}
      </Button>
    </section>
  );
}

export default ChildrenList;
