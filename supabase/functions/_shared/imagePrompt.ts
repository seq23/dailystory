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
  /** Full location, used only when the page states no setting at all. */
  backdrop: string;
  /** Non-conflicting cultural styling, safe to add to ANY scene. */
  flavor: string;
}

const CULTURES: Record<string, Culture> = {
  en: {
    appearance: 'North American features',
    backdrop: 'a friendly North American neighbourhood',
    flavor:
      'North American everyday details',
  },
  'en-african-american': {
    appearance:
      'African American features with richly melanated skin and natural textured hair',
    backdrop: 'a warm American neighbourhood',
    flavor:
      'warm American community details',
  },
  es: {
    appearance: 'Latin American / Hispanic features',
    backdrop: 'a sunlit plaza with colourful tiled buildings',
    flavor:
      'Latin American cultural details, colourful tilework and textiles',
  },
  fr: {
    appearance: 'French European features',
    backdrop: 'a Parisian street with wrought-iron balconies and a distant Eiffel Tower',
    flavor:
      'French cultural details, café signage and wrought-iron trim',
  },
  'fr-francophone-african': {
    appearance:
      'West African features with deep melanated skin and natural textured hair',
    backdrop: 'a vibrant Francophone West African street market',
    flavor:
      'West African cultural details, bright wax-print fabrics',
  },
  pt: {
    appearance: 'Brazilian / Portuguese features',
    backdrop: 'a lush coastal Brazilian street with mosaic pavements',
    flavor:
      'Brazilian cultural details, tropical plants and mosaic patterns',
  },
  ar: {
    appearance: 'Middle Eastern / North African features',
    backdrop: 'a sunlit courtyard with arched doorways and geometric tilework',
    flavor:
      'Middle Eastern cultural details, arches and geometric tilework',
  },
  ur: {
    appearance: 'South Asian Pakistani features',
    backdrop: 'a lively South Asian street with colourful awnings and Mughal-style arches',
    flavor:
      'South Asian Pakistani cultural details, embroidered fabrics and truck-art patterns',
  },
  hi: {
    appearance: 'South Asian Indian features',
    backdrop: 'a bright Indian courtyard with marigold garlands and carved stonework',
    flavor:
      'South Asian Indian cultural details, marigolds and carved woodwork',
  },
  zh: {
    appearance: 'East Asian Chinese features',
    backdrop: 'a peaceful garden with curved rooftops and red lanterns',
    flavor:
      'East Asian Chinese cultural details, red lanterns and curved rooflines',
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

// "deep brown skin" alone renders medium-tan: the model washes deep tones out.
// Non-Afro readers (Urdu, Hindi, Arabic, Chinese…) keep their own ancestry
// wording from CULTURES and only get the tone fixed here.
const DEEP_SKIN =
  'deep rich brown skin with warm golden undertones, luminous and even, ' +
  'full tonal range with soft readable shadows';

// Anti-washout only — no ethnicity terms, those belong to the Afro path.
const DEEP_NEGATIVE =
  'washed out skin, desaturated skin, ashy grey skin, grey cast, pale skin, ' +
  'light brown skin, skin lightening, whitewashed, overexposed face, ' +
  'blown-out highlights, flat muddy skin tone';

const AVATAR_TYPES: Record<string, string> = {
  boy: 'boy',
  girl: 'girl',
  'prefer-not-to-answer': 'child',
};

// ---------------------------------------------------------------------------
// 2b. AFRO-DESCENT RENDERING
//
// "deep brown skin" alone gives diffusion models no ancestry anchor, so they
// fall back to their strongest dark-skin prior (usually South Asian / Middle
// Eastern features with straight hair). For readers whose cultural background
// is English / Spanish / Portuguese / French AND whose chosen skin tone is
// `dark`, we name the ancestry, the undertone and the hairstyle explicitly.
//
// Other languages are deliberately untouched: an Urdu reader with `dark`
// should still get South Asian features.
// ---------------------------------------------------------------------------

const AFRO_DESCENT: Record<string, string> = {
  en: 'African American Black child of West African descent',
  es: 'Afro-Latina/Afro-Latino Black child of African descent',
  pt: 'Afro-Brazilian Black child of African descent',
  fr: 'Black child of West African / Afro-Caribbean descent',
};

// Named tone word + explicit warm undertone (kills the grey/ashy cast) +
// "full tonal range" (kills shadows blocking up into black voids).
const AFRO_SKIN =
  'rich deep mahogany-brown African skin with warm golden-red undertones, ' +
  'luminous and even, natural healthy sheen, full tonal range with soft readable shadows';

// "curly hair" reliably produces loose Caucasian curls; type-4 coils only
// appear when the STYLE IS NAMED. One fixed style per boy/neutral, and four
// options for girls picked deterministically per child (see pickAfroHair).
const AFRO_HAIR_GIRL = [
  'natural 4C afro-textured hair in two neat afro puff buns with soft baby hairs',
  'shoulder-length box braids with colourful beads at the ends, neat parted rows',
  'neat cornrow braids in even rows gathered into a small ponytail',
  'soft rounded natural 4C afro, glossy and well-shaped',
];
const AFRO_HAIR_BOY = 'short natural 4C coily afro with a neatly shaped hairline';
const AFRO_HAIR_NEUTRAL = 'soft rounded natural 4C afro-textured hair';

// Lighting recipe for deep skin: large soft key + generous fill + gentle rim.
// Appended to STYLE on this path only.
const AFRO_LIGHTING =
  'soft warm wrap-around key light with generous fill, gentle rim light for ' +
  'separation, warm colour temperature that flatters deep skin';

const AFRO_NEGATIVE =
  // anti-washout / anti-ashy
  'washed out skin, desaturated skin, ashy grey skin, grey cast, purple shadow cast, ' +
  'pale skin, light brown skin, skin lightening, whitewashed, overexposed face, ' +
  'blown-out highlights, flat muddy skin tone, ' +
  // anti-wrong-ethnicity / anti-wrong-hair
  'straight hair, silky hair, loose wavy hair, blonde hair, South Asian features, ' +
  'Indian features, Middle Eastern features, Arab features, tanned white person';

/**
 * Returns the Afro-descent appearance/skin/hair triple, or null when this
 * reader is not on that path. Deterministic for a given (user, session).
 */
function afroProfile(
  user: ImageUserInfo,
  sessionId: string,
): { appearance: string; skin: string; hair: string } | null {
  if (user.avatar?.skinTone !== 'dark') return null;

  const lang = user.nativeLanguage ?? 'en';
  // The two explicitly Afro culture codes always qualify, whatever the base.
  const explicit = lang === 'en-african-american' || lang === 'fr-francophone-african';
  const base = lang.split('-')[0];
  const appearance = explicit ? AFRO_DESCENT[base] ?? AFRO_DESCENT.en : AFRO_DESCENT[base];
  if (!appearance) return null;

  const type = user.avatar?.type;
  let hair = AFRO_HAIR_NEUTRAL;
  if (type === 'boy') {
    hair = AFRO_HAIR_BOY;
  } else if (type === 'girl') {
    // Fixed for the whole session (same seed input as the image seed), but
    // different children get different styles.
    hair = AFRO_HAIR_GIRL[seedFrom(sessionId, sanitizeName(user.name)) % AFRO_HAIR_GIRL.length];
  }

  return { appearance, skin: AFRO_SKIN, hair };
}

function sanitizeName(name?: string): string {
  const raw = (name ?? '').trim();
  // Never let an email local-part or an id leak into the prompt.
  if (!raw || raw.includes('@') || /\d{3}/.test(raw)) return 'the child';
  return raw.split(/\s+/)[0].slice(0, 24);
}

export function buildCharacterSheet(user: ImageUserInfo, sessionId = ''): string {
  const culture = getCulture(user.nativeLanguage);
  const afro = afroProfile(user, sessionId);
  const kind = AVATAR_TYPES[user.avatar?.type ?? ''] ?? 'child';
  const skin = SKIN_TONES[user.avatar?.skinTone ?? ''] ?? 'warm medium-tan skin';
  const age = user.age && user.age >= 3 && user.age <= 17 ? user.age : 7;

  const parts = [
    // Explicit child cues: without them the model happily paints a young adult.
    `a cheerful young ${kind}, exactly ${age} years old, unmistakably a small child`,
    'child body proportions with a large head and short limbs',
    'round soft childlike face, no makeup, no jewellery',
    afro ? afro.appearance : culture.appearance,
    afro ? afro.skin : skin,
    'expressive friendly eyes',
    afro ? afro.hair : 'neat age-appropriate hair',
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

// Reasoning models spend ~2-4s before emitting the sentence; 3s aborted most
// calls and silently degraded every scene to the crude extracted fallback.
const DISTILL_TIMEOUT_MS = 7000;

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
        // This model burns budget on internal reasoning before emitting text,
        // and a truncated completion is garbage. Ask for no reasoning and keep
        // a budget large enough to survive it when the provider ignores us.
        reasoning_effort: 'none',
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn('[distiller] gateway HTTP', response.status);
      return fallback;
    }

    const data = await response.json();
    const choice = data?.choices?.[0];

    // A completion cut off by the token budget is reasoning debris, not a
    // scene ("ually happening for an"). Never let it reach the illustrator.
    if (choice?.finish_reason === 'length') {
      console.warn('[distiller] truncated completion, using extracted scene');
      return fallback;
    }

    const scene = (choice?.message?.content ?? '')
      .replace(/^["'\s]+|["'\s.]+$/g, '')
      .trim();

    if (!isUsableScene(scene)) {
      console.warn('[distiller] unusable scene, using extracted:', scene.slice(0, 80));
      return fallback;
    }
    return { scene: scene.slice(0, 300), source: 'ai' };
  } catch (error) {
    console.warn(
      '[distiller] failed, using extracted scene:',
      (error as Error)?.name === 'AbortError' ? 'timeout' : (error as Error)?.message,
    );
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Guards against truncated / meta / non-descriptive distiller output. */
export function isUsableScene(scene: string): boolean {
  const trimmed = (scene ?? '').trim();
  if (trimmed.length < 12) return false;
  if (trimmed.split(/\s+/).length < 4) return false;
  // Model talking about the task instead of describing the page.
  if (/\b(illustrator|page text|previous illustration|sentence|as an ai)\b/i.test(trimmed)) {
    return false;
  }
  // Truncated mid-word debris usually starts as a word fragment.
  if (/^[a-z]{1,6}\b/.test(trimmed) && !/^(a|an|the|two|three|inside|under|near|on|at|in)\b/i.test(trimmed)) {
    return false;
  }
  return true;
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
  'wholesome and age-appropriate, single full-bleed illustration filling the whole frame';

const NEGATIVE =
  'text, letters, words, captions, watermark, signature, speech bubbles, ' +
  'blurry, low quality, deformed, extra limbs, extra fingers, distorted face, ' +
  'multiple heads, scary, horror, violence, blood, weapons, gore, ' +
  'adult content, nudity, suggestive, photorealistic, 3d render, collage, grid, ' +
  'picture frame, border, matte, vignette, inset panel, ' +
  // The model drifts to young adults unless this is spelled out.
  'adult, grown woman, grown man, teenager, mature face, makeup, lipstick, ' +
  'earrings, jewellery, high heels, cleavage, disembodied hand, extreme close-up';

export function assemblePrompt(opts: {
  scene: string;
  user: ImageUserInfo;
  sessionId: string;
}): { positivePrompt: string; negativePrompt: string; seed: number } {
  const { scene, user, sessionId } = opts;
  const culture = getCulture(user.nativeLanguage);
  const characterSheet = buildCharacterSheet(user, sessionId);
  const afro = afroProfile(user, sessionId);
  const name = sanitizeName(user.name);

  // The page's own setting always wins; culture only fills an unstated backdrop.
  // A stated setting is never overridden — we only add non-conflicting
  // cultural styling. A setting-less scene gets the full cultural backdrop.
  const backdropHint = sceneHasSetting(scene)
    ? `, ${culture.flavor}`
    : `, set in ${culture.backdrop}`;

  const positivePrompt = [
    `${characterSheet}.`,
    `Scene: ${scene.replace(/[.\s]+$/, '')}${backdropHint}.`,
    // Keep the child whole and in context — stops close-ups of stray hands.
    'The child is fully visible in the scene, head to at least the waist.',
    afro ? `${STYLE}, ${AFRO_LIGHTING}` : STYLE,
  ].join(' ');

  return {
    positivePrompt,
    negativePrompt: afro ? `${NEGATIVE}, ${AFRO_NEGATIVE}` : NEGATIVE,
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
  'hall', 'hallway', 'corridor', 'doorway', 'porch', 'stairs', 'staircase', 'tent',
  'cabin', 'bus', 'car', 'plane', 'bathroom', 'hospital', 'stadium', 'rooftop',
  'tunnel', 'harbour', 'harbor', 'dock', 'alley', 'courtyard', 'stage', 'circus',
  'indoors', 'outdoors', 'inside', 'outside', 'underwater', 'planet', 'spaceship',
];

export function sceneHasSetting(scene: string): boolean {
  const lower = scene.toLowerCase();
  // Whole-word match: "street" must not count as "tree", "season" as "sea".
  return SETTING_WORDS.some((w) => new RegExp(`\\b${w}s?\\b`).test(lower));
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