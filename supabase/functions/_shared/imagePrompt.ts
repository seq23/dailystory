/**
 * imagePrompt.ts — THE single source of truth for story-image prompts.
 *
 * Replaces: CharacterConsistencyService.ts, CharacterConsistencyServiceInline.js,
 * ai-visual-scene-creator, runware-template-ab, runware-template-cd and the
 * TIER_1/DIRECT/T25A-D cascade.
 *
 * Three deterministic parts + one tiny AI part:
 *   1. SCENE     — AI-distilled one-liner describing what the page looks like.
 *   2. CHARACTER — deterministic, built from the reader's saved settings.
 *   3. BACKDROP  — cultural flavour derived from native_language.
 *   4. SEED      — deterministic, keeps the hero consistent page to page.
 *
 * IMPORTANT: story text is ALWAYS English. `nativeLanguage` is a *cultural
 * background* signal (a French reader may get a Parisian street), never a
 * translation instruction.
 */

export interface ImageUserInfo {
  name?: string;
  age?: number;
  grade?: string;
  gradeLevel?: string;
  nativeLanguage?: string;
  avatar?: { type?: string; skinTone?: string };
  favoriteColor?: string;
  favoriteAnimal?: string;
}

export interface BuiltPrompt {
  positivePrompt: string;
  negativePrompt: string;
  seed: number;
  scene: string;
  sceneSource: 'ai' | 'extracted';
}

// ---------------------------------------------------------------------------
// 1. CULTURE — from the reader's native language. Presentation + backdrop only.
// ---------------------------------------------------------------------------

interface Culture {
  appearance: string;
  backdrop: string;
}

const CULTURES: Record<string, Culture> = {
  en: {
    appearance: 'North American features',
    backdrop: 'a friendly North American neighbourhood',
  },
  'en-african-american': {
    appearance:
      'African American features with richly melanated skin and natural textured hair',
    backdrop: 'a warm American neighbourhood',
  },
  es: {
    appearance: 'Latin American / Hispanic features',
    backdrop: 'a sunlit plaza with colourful tiled buildings',
  },
  fr: {
    appearance: 'French European features',
    backdrop: 'a Parisian street with wrought-iron balconies and a distant Eiffel Tower',
  },
  'fr-francophone-african': {
    appearance:
      'West African features with deep melanated skin and natural textured hair',
    backdrop: 'a vibrant Francophone West African street market',
  },
  pt: {
    appearance: 'Brazilian / Portuguese features',
    backdrop: 'a lush coastal Brazilian street with mosaic pavements',
  },
  ar: {
    appearance: 'Middle Eastern / North African features',
    backdrop: 'a sunlit courtyard with arched doorways and geometric tilework',
  },
  ur: {
    appearance: 'South Asian Pakistani features',
    backdrop: 'a lively South Asian street with colourful awnings and Mughal-style arches',
  },
  hi: {
    appearance: 'South Asian Indian features',
    backdrop: 'a bright Indian courtyard with marigold garlands and carved stonework',
  },
  zh: {
    appearance: 'East Asian Chinese features',
    backdrop: 'a peaceful garden with curved rooftops and red lanterns',
  },
};

export function getCulture(nativeLanguage?: string): Culture {
  if (!nativeLanguage) return CULTURES.en;
  return CULTURES[nativeLanguage] ?? CULTURES[nativeLanguage.split('-')[0]] ?? CULTURES.en;
}

// ---------------------------------------------------------------------------
// 2. CHARACTER SHEET — deterministic, identical on every page of a session.
// ---------------------------------------------------------------------------

const SKIN_TONES: Record<string, string> = {
  pale: 'pale fair skin',
  light: 'light skin',
  medium: 'warm medium-tan skin',
  olive: 'olive skin',
  dark: 'deep brown skin',
};

const AVATAR_TYPES: Record<string, string> = {
  boy: 'boy',
  girl: 'girl',
  'prefer-not-to-answer': 'child',
};

function sanitizeName(name?: string): string {
  const raw = (name ?? '').trim();
  // Never let an email local-part or an id leak into the prompt.
  if (!raw || raw.includes('@') || /\d{3}/.test(raw)) return 'the child';
  return raw.split(/\s+/)[0].slice(0, 24);
}

export function buildCharacterSheet(user: ImageUserInfo): string {
  const culture = getCulture(user.nativeLanguage);
  const kind = AVATAR_TYPES[user.avatar?.type ?? ''] ?? 'child';
  const skin = SKIN_TONES[user.avatar?.skinTone ?? ''] ?? 'warm medium-tan skin';
  const age = user.age && user.age >= 3 && user.age <= 17 ? user.age : 7;

  const parts = [
    `a cheerful ${age}-year-old ${kind}`,
    `${culture.appearance}`,
    skin,
    'expressive friendly eyes',
    'neat age-appropriate hair',
  ];

  if (user.favoriteColor) {
    parts.push(`wearing a ${user.favoriteColor} shirt`);
  }

  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// 3. SCENE — AI distiller with a deterministic fallback.
// ---------------------------------------------------------------------------

/** Deterministic fallback: the first couple of sentences, stripped of dialogue. */
export function extractScene(pageText: string): string {
  const cleaned = (pageText ?? '')
    .replace(/[""«»„"]/g, '"')
    .replace(/"[^"]*"/g, ' ')            // drop spoken lines
    .replace(/\b(said|asked|whispered|shouted|replied|thought|wondered|felt)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 8);
  const scene = sentences.slice(0, 2).join(' ').trim() || cleaned;
  return scene.slice(0, 300);
}

const DISTILL_TIMEOUT_MS = 3000;

/**
 * Turn a story page into ONE concrete visual sentence.
 * Never throws — falls back to `extractScene` on any failure or timeout.
 */
export async function distillScene(
  pageText: string,
  previousScene: string | undefined,
  apiKey: string | undefined,
): Promise<{ scene: string; source: 'ai' | 'extracted' }> {
  const fallback = { scene: extractScene(pageText), source: 'extracted' as const };
  if (!apiKey || !pageText || pageText.trim().length < 12) return fallback;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISTILL_TIMEOUT_MS);

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.6-flash',
        messages: [
          {
            role: 'system',
            content:
              'You convert a page of a children\'s story into ONE short English sentence describing only what is VISUALLY happening, for an illustrator. ' +
              'Rules: concrete nouns, actions, objects, place and time of day only. ' +
              'Never mention character names. Never describe the main character\'s face, age, skin, hair or clothing. ' +
              'No dialogue, no thoughts, no emotions, no adjectives about feelings. ' +
              'Under 30 words. Reply with the sentence only.',
          },
          {
            role: 'user',
            content:
              (previousScene ? `Previous illustration: ${previousScene}\n\n` : '') +
              `Page text:\n${pageText.slice(0, 1200)}`,
          },
        ],
        max_tokens: 80,
        temperature: 0.3,
      }),
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const scene = (data?.choices?.[0]?.message?.content ?? '')
      .replace(/^["'\s]+|["'\s.]+$/g, '')
      .trim();

    if (!scene || scene.length < 8) return fallback;
    return { scene: scene.slice(0, 300), source: 'ai' };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 4. SEED — same hero look across every page of a session.
// ---------------------------------------------------------------------------

export function seedFrom(sessionId: string, characterName: string): number {
  const input = `${sessionId}::${characterName}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 2147483647;
}

// ---------------------------------------------------------------------------
// 5. ASSEMBLY
// ---------------------------------------------------------------------------

const STYLE =
  'warm hand-painted children\'s picture-book illustration, soft rounded shapes, ' +
  'gentle natural lighting, rich saturated colours, clean composition, ' +
  'wholesome and age-appropriate, single illustration';

const NEGATIVE =
  'text, letters, words, captions, watermark, signature, speech bubbles, ' +
  'blurry, low quality, deformed, extra limbs, extra fingers, distorted face, ' +
  'multiple heads, scary, horror, violence, blood, weapons, gore, ' +
  'adult content, nudity, suggestive, photorealistic, 3d render, collage, grid';

export function assemblePrompt(opts: {
  scene: string;
  user: ImageUserInfo;
  sessionId: string;
}): { positivePrompt: string; negativePrompt: string; seed: number } {
  const { scene, user, sessionId } = opts;
  const culture = getCulture(user.nativeLanguage);
  const characterSheet = buildCharacterSheet(user);
  const name = sanitizeName(user.name);

  // The page's own setting always wins; culture only fills an unstated backdrop.
  const backdropHint = sceneHasSetting(scene)
    ? ''
    : `, set in ${culture.backdrop}`;

  const positivePrompt = [
    `${characterSheet}.`,
    `Scene: ${scene}${backdropHint}.`,
    STYLE,
  ].join(' ');

  return {
    positivePrompt,
    negativePrompt: NEGATIVE,
    seed: seedFrom(sessionId, name),
  };
}

/** Cheap check: does the distilled scene already state where we are? */
const SETTING_WORDS = [
  'forest', 'wood', 'tree', 'garden', 'park', 'house', 'home', 'kitchen', 'bedroom',
  'room', 'school', 'classroom', 'playground', 'beach', 'ocean', 'sea', 'lake',
  'river', 'mountain', 'hill', 'field', 'farm', 'city', 'town', 'village', 'castle',
  'library', 'store', 'shop', 'market', 'cafe', 'zoo', 'museum', 'space', 'ship',
  'cave', 'desert', 'island', 'bridge', 'street', 'road', 'train', 'boat', 'sky',
  'barn', 'attic', 'basement', 'yard', 'pond', 'meadow', 'jungle', 'snow', 'moon',
];

export function sceneHasSetting(scene: string): boolean {
  const lower = scene.toLowerCase();
  return SETTING_WORDS.some((w) => lower.includes(w));
}

/** One-call convenience wrapper used by the edge function. */
export async function buildImagePrompt(opts: {
  pageText: string;
  previousScene?: string;
  user: ImageUserInfo;
  sessionId: string;
  lovableApiKey?: string;
}): Promise<BuiltPrompt> {
  const { scene, source } = await distillScene(
    opts.pageText,
    opts.previousScene,
    opts.lovableApiKey,
  );
  const assembled = assemblePrompt({ scene, user: opts.user, sessionId: opts.sessionId });
  return { ...assembled, scene, sceneSource: source };
}