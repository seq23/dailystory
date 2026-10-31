import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeStoryChoices } from '../../../supabase/functions/_shared/storyChoices';

export function StoryChoices({ choices, grade, disabled, onChoose }: {
  choices: unknown;
  grade?: string;
  disabled: boolean;
  onChoose: (choice: string) => Promise<void>;
}) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const choose = async (choice: string) => {
    if (disabled || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try { await onChoose(choice); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return (
    <section aria-label="Pick what happens next" aria-busy={disabled || busy} className="my-4 w-full">
      <p className="mb-2 text-center font-semibold">What happens next? Pick one!</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {normalizeStoryChoices(choices, grade).map((choice) => (
          <Button key={choice} type="button" variant="outline" disabled={disabled || busy}
            className="h-auto min-h-14 w-full whitespace-normal break-words px-4 py-3 text-base"
            onClick={() => { void choose(choice); }}>
            {choice}
          </Button>
        ))}
      </div>
    </section>
  );
}
