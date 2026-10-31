import { gradeProfile } from "./grades.ts";

/** Choice metadata travels with the page, never through another model request. */
export type StoryChoices = [string, string, string];

function earlyReader(grade?: string | null): boolean {
  return (gradeProfile(grade)?.maxSentenceWords ?? 6) <= 10;
}

export function safeStoryChoices(grade?: string | null): StoryChoices {
  return earlyReader(grade)
    ? ['Look around', 'Ask for help', 'Try a new way']
    : ['Search nearby for a clue', 'Ask a friend for help', 'Try a different idea'];
}

export function normalizeStoryChoices(value: unknown, grade?: string | null): StoryChoices {
  const maxWords = earlyReader(grade) ? 5 : 9;
  const maxLength = earlyReader(grade) ? 36 : 72;
  if (!Array.isArray(value) || value.length !== 3) return safeStoryChoices(grade);
  const choices = value.map((v) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');
  if (choices.some((v) => !v || v.length > maxLength || v.split(' ').length > maxWords || /[<>{}\[\]\n\r]|[\u0000-\u001f]/.test(v)) ||
      new Set(choices.map((v) => v.toLocaleLowerCase().replace(/[.!?]+$/, ''))).size !== 3) {
    return safeStoryChoices(grade);
  }
  return choices as StoryChoices;
}

/** Even a truncated/broken metadata block leaves the readable page intact. */
export function parseStoryChoices(answer: string, grade?: string | null): { text: string; choices: StoryChoices } {
  const start = answer.search(/<choices\b/i);
  if (start < 0) return { text: answer, choices: safeStoryChoices(grade) };
  const text = answer.slice(0, start).trim();
  const payload = answer.slice(start).match(/^<choices>\s*([\s\S]*?)\s*<\/choices>/i)?.[1];
  try {
    return { text, choices: normalizeStoryChoices(JSON.parse(payload ?? ''), grade) };
  } catch {
    return { text, choices: safeStoryChoices(grade) };
  }
}

export function storyChoiceInstruction(grade?: string | null): string {
  return `\n\nAfter the story page, append exactly <choices>["option one","option two","option three"]</choices>. These are metadata, not story text. Give three distinct, safe, age-appropriate actions that follow THIS page and keep the adventure going. Use ${earlyReader(grade) ? '2–5 words, at most 36 characters, simple short words a beginning reader knows' : 'at most 9 words and 72 characters, vocabulary at the reader\'s grade'} per option. Do not offer an ending. Write the complete page before this block.`;
}

/** Fixed backup choices still lead into the selected action, without inference. */
export function backupChoiceLead(choice?: string): string {
  if (!choice) return '';
  const fixed = [...safeStoryChoices('K'), ...safeStoryChoices('3')];
  const leads = ['They look around.', 'They ask for help.', 'They try a new way.',
    'They search nearby and find a clue.', 'They ask a friend for help.', 'They try a different idea.'];
  const index = fixed.indexOf(choice);
  return index >= 0 ? `${leads[index]} ` : `They choose: “${choice}”. `;
}
