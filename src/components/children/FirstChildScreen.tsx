import { ChildForm } from "./ChildForm";
import { toast } from "sonner";
import { premiumUntilLabel } from "@/lib/accessCode";

/**
 * First run, before anything else: the grown-up made the account; now one calm
 * step adds the first child (name, grade, age, picture). Stories come after.
 */
export function FirstChildScreen({ parentName, premiumUntil, hasPremium }: { parentName?: string | null; premiumUntil?: string | null; hasPremium?: boolean }) {
  const first = (parentName ?? "").trim().split(/\s+/)[0];
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8" data-testid="first-child-screen">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-5 sm:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <img src="/icon-192.png" alt="" className="h-10 w-10" />
          <span className="text-lg font-bold text-gray-900">Time-2-Read</span>
        </div>
        {hasPremium && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm font-medium text-green-900" data-testid="premium-badge">
            <span aria-hidden>✓</span> {premiumUntilLabel(premiumUntil) ?? "Premium is on"}
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{first ? `Welcome, ${first}!` : "Welcome!"}</h1>
        <p className="mt-1 text-gray-700">
          Who's reading? Add your first child. You can add brothers and sisters next.
        </p>
        <div className="mt-6">
          <ChildForm
            submitLabel="Add child and start reading"
            onSaved={(c) => toast.success(`Saved: ${c.display_name}. Tap "New Story" to start.`)}
          />
        </div>
      </div>
    </div>
  );
}

export default FirstChildScreen;
