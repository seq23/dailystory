// Backup Mode is a designed feature: when no AI provider answers, a family reads a
// pre-written story. It must never be invisible to us, so every time the app shows
// one it writes a row to public.story_generation_failures (migration
// 20261026220000, stage 'client_backup'). No personal data: reason, page, path.
// Fire-and-forget; never throws, never delays the backup story.
import { supabase } from '@/integrations/supabase/client';

export function reportBackupModeUsed(reason: string, pageNumber: number | null, detail?: unknown): void {
  try {
    const message = detail == null ? '' : String((detail as { message?: string })?.message ?? detail);
    // The generated types predate this table.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (supabase as any).from('story_generation_failures');
    Promise.resolve(
      table.insert({
        stage: 'client_backup',
        error_type: String(reason).slice(0, 60),
        message: message.slice(0, 500),
        page_number: typeof pageNumber === 'number' ? pageNumber : null,
        path: typeof location !== 'undefined' ? location.pathname.slice(0, 200) : null,
        build: String(import.meta.env?.VITE_BUILD_ID ?? import.meta.env?.MODE ?? '').slice(0, 60),
      })
    ).catch(() => {});
  } catch {
    /* reporting must never break Backup Mode */
  }
}
