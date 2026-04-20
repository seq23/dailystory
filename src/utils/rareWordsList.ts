/**
 * Curated list of rare/advanced English words that should ALWAYS be
 * highlighted as interactive (clickable for definition + TTS) regardless
 * of word length.
 *
 * Rationale: Length-based heuristics (>=7 chars) miss short but obscure
 * words like "piqued", "wry", "deft", "apt". This deterministic list
 * guarantees those are always tappable for advanced/independent readers.
 *
 * Source: hand-curated from common literary vocabulary lists, SAT prep
 * lists, and frequently-misunderstood words in middle-grade fiction.
 */

const RARE_WORDS_RAW = [
  // Short but rare (the main gap length-heuristic misses)
  'apt', 'awe', 'coy', 'deft', 'dire', 'dour', 'ebb', 'eke', 'fey', 'gait',
  'glib', 'guile', 'hue', 'ilk', 'jest', 'keen', 'lithe', 'lull', 'meek',
  'mire', 'muse', 'oaf', 'pang', 'pine', 'plod', 'quip', 'rife', 'rove',
  'rue', 'sage', 'scoff', 'sear', 'sly', 'smug', 'snide', 'spry', 'stoic',
  'tact', 'taut', 'tepid', 'terse', 'trove', 'vex', 'vile', 'wane', 'wary',
  'whet', 'whim', 'wily', 'wince', 'wrath', 'wry', 'yore', 'zeal',

  // Common literary verbs
  'piqued', 'pique', 'beckon', 'beckoned', 'bemoan', 'beseech', 'bestow',
  'brandish', 'cajole', 'careen', 'chastise', 'clamor', 'clamber', 'concede',
  'condone', 'confound', 'cower', 'cringe', 'decree', 'denote', 'depict',
  'deride', 'devour', 'discern', 'dispel', 'divulge', 'efface', 'elicit',
  'elude', 'emanate', 'embolden', 'engulf', 'enthrall', 'eschew', 'evade',
  'extol', 'falter', 'fathom', 'flounder', 'foment', 'forsake', 'gambol',
  'glean', 'grapple', 'hearken', 'heed', 'imbue', 'implore', 'impart',
  'incur', 'inflict', 'inquire', 'invoke', 'jostle', 'languish', 'lament',
  'loathe', 'lurch', 'meander', 'mollify', 'muster', 'nestle', 'ogle',
  'parry', 'peruse', 'placate', 'plummet', 'ponder', 'procure', 'prowl',
  'quell', 'ransack', 'recoil', 'relinquish', 'remit', 'renounce', 'resound',
  'revere', 'rummage', 'sashay', 'scour', 'scurry', 'shun', 'simmer',
  'skulk', 'slumber', 'snarl', 'sneer', 'soothe', 'spurn', 'stagger',
  'stifle', 'subdue', 'surmise', 'swoon', 'thwart', 'topple', 'traipse',
  'transcend', 'traverse', 'tread', 'trudge', 'usurp', 'vacate', 'vanquish',
  'vex', 'wallow', 'waver', 'wield', 'writhe', 'yearn',

  // Adjectives
  'abject', 'aloof', 'amiable', 'arcane', 'ardent', 'astute', 'auspicious',
  'austere', 'banal', 'bashful', 'belated', 'benign', 'bleak', 'boisterous',
  'brazen', 'brusque', 'callous', 'candid', 'cantankerous', 'capricious',
  'churlish', 'clandestine', 'coarse', 'cogent', 'coherent', 'comely',
  'contrite', 'copious', 'cordial', 'corpulent', 'craven', 'cunning',
  'cynical', 'dapper', 'dauntless', 'demure', 'derelict', 'derisive',
  'desolate', 'devout', 'diaphanous', 'didactic', 'diligent', 'discreet',
  'doleful', 'dubious', 'eclectic', 'effusive', 'elated', 'elusive',
  'eminent', 'enigmatic', 'ephemeral', 'erudite', 'esoteric', 'ethereal',
  'exuberant', 'fastidious', 'feeble', 'feral', 'fervent', 'flagrant',
  'flippant', 'florid', 'forlorn', 'frenetic', 'frugal', 'furtive',
  'garish', 'garrulous', 'genteel', 'ghastly', 'gracious', 'gregarious',
  'grueling', 'guileless', 'haggard', 'hapless', 'haughty', 'heinous',
  'idyllic', 'impassive', 'impetuous', 'impudent', 'inane', 'incessant',
  'incisive', 'indignant', 'indolent', 'ineffable', 'inept', 'inert',
  'insipid', 'insolent', 'intrepid', 'jaunty', 'jocular', 'jovial',
  'judicious', 'lackadaisical', 'languid', 'latent', 'laudable', 'lavish',
  'lethargic', 'listless', 'lofty', 'loquacious', 'lucid', 'lurid',
  'maudlin', 'mawkish', 'meager', 'meandering', 'mellifluous', 'mercurial',
  'meticulous', 'morose', 'mundane', 'munificent', 'myriad', 'nascent',
  'nebulous', 'nefarious', 'noxious', 'obstinate', 'obtuse', 'odious',
  'ominous', 'opulent', 'ornate', 'ostentatious', 'pallid', 'palpable',
  'paltry', 'parsimonious', 'pedantic', 'pensive', 'perfunctory', 'perilous',
  'pernicious', 'petulant', 'pious', 'placid', 'plaintive', 'poignant',
  'portly', 'precocious', 'prodigious', 'profuse', 'prudent', 'pungent',
  'querulous', 'quixotic', 'raucous', 'redolent', 'reluctant', 'resolute',
  'resplendent', 'reticent', 'rotund', 'rueful', 'sallow', 'sanguine',
  'sardonic', 'scant', 'scrupulous', 'sedate', 'sedulous', 'serene',
  'shrewd', 'sinuous', 'somber', 'sordid', 'sparse', 'spurious', 'squalid',
  'staid', 'stalwart', 'stark', 'steadfast', 'stoic', 'strident', 'stupendous',
  'sublime', 'succinct', 'sullen', 'supercilious', 'surly', 'svelte',
  'taciturn', 'tedious', 'temerity', 'tenacious', 'tepid', 'timorous',
  'torpid', 'tranquil', 'transient', 'tremulous', 'trenchant', 'trepid',
  'truculent', 'turbid', 'turgid', 'ubiquitous', 'unctuous', 'unwieldy',
  'urbane', 'vacuous', 'vapid', 'vehement', 'venerable', 'verdant',
  'vexing', 'vivacious', 'voluble', 'voracious', 'wanton', 'wistful',
  'wizened', 'zealous',

  // Nouns
  'abode', 'acumen', 'adversary', 'affinity', 'aficionado', 'alacrity',
  'allegory', 'altruism', 'ambiance', 'ambivalence', 'anguish', 'anomaly',
  'antipathy', 'apathy', 'apex', 'aplomb', 'apparition', 'arbiter',
  'archetype', 'arsenal', 'artifice', 'aspersion', 'assemblage', 'atrocity',
  'avarice', 'azure', 'bedlam', 'behemoth', 'belligerence', 'benefactor',
  'bequest', 'bevy', 'bolster', 'bourgeois', 'bravado', 'brevity',
  'cacophony', 'cadence', 'cajolery', 'camaraderie', 'candor', 'caprice',
  'caricature', 'catalyst', 'caveat', 'cessation', 'chagrin', 'charlatan',
  'chasm', 'chicanery', 'chortle', 'citadel', 'clemency', 'cloister',
  'cohort', 'commotion', 'compendium', 'composure', 'conjecture', 'connoisseur',
  'consort', 'contempt', 'contrivance', 'conundrum', 'conviviality', 'corollary',
  'countenance', 'covenant', 'crescendo', 'crevice', 'crony', 'cusp',
  'debacle', 'decorum', 'demeanor', 'demise', 'denizen', 'dirge',
  'discord', 'dismay', 'disparity', 'doldrums', 'dossier', 'duress',
  'edifice', 'effigy', 'effrontery', 'egress', 'elegy', 'emissary',
  'enclave', 'ennui', 'entourage', 'entreaty', 'envoy', 'epitaph',
  'epithet', 'epoch', 'equanimity', 'equilibrium', 'escapade', 'estuary',
  'eulogy', 'euphoria', 'expanse', 'facade', 'facet', 'facsimile',
  'fanfare', 'fatigue', 'fauna', 'fervor', 'fiasco', 'fissure',
  'flora', 'foible', 'foray', 'forte', 'fracas', 'gambit',
  'gamut', 'gauntlet', 'genesis', 'gist', 'glade', 'glimmer',
  'gorge', 'grimace', 'grotto', 'grove', 'gusto', 'hamlet',
  'harbinger', 'haven', 'hearth', 'hegemony', 'heirloom', 'hiatus',
  'hubris', 'hue', 'hullabaloo', 'idyll', 'impasse', 'impetus',
  'impunity', 'incantation', 'inception', 'inkling', 'innuendo', 'insignia',
  'interlude', 'interloper', 'interregnum', 'jamboree', 'jubilation', 'juncture',
  'kerfuffle', 'kismet', 'knack', 'lagoon', 'lair', 'lampoon',
  'larder', 'largesse', 'lattice', 'legion', 'liaison', 'lineage',
  'litany', 'locale', 'loft', 'lull', 'lumen', 'luminary',
  'machination', 'maelstrom', 'malaise', 'malady', 'mandate', 'manifesto',
  'mantle', 'maverick', 'mecca', 'medley', 'melange', 'melee',
  'memento', 'mendicant', 'mercenary', 'meridian', 'milieu', 'minutiae',
  'mire', 'misnomer', 'monarch', 'monolith', 'morass', 'mosaic',
  'motif', 'mountebank', 'multitude', 'murmur', 'myriad', 'nadir',
  'nemesis', 'niche', 'nuance', 'oasis', 'oblivion', 'odyssey',
  'omen', 'opus', 'oration', 'palette', 'paragon', 'pariah',
  'parley', 'paroxysm', 'parsimony', 'pastiche', 'pathos', 'pediment',
  'penchant', 'penumbra', 'penury', 'peril', 'periphery', 'persona',
  'phalanx', 'philistine', 'pinnacle', 'pittance', 'plateau', 'plethora',
  'poise', 'pomp', 'portent', 'precipice', 'precursor', 'predicament',
  'predilection', 'premonition', 'prerogative', 'pretext', 'proclivity',
  'prodigy', 'promontory', 'propensity', 'protege', 'province', 'pseudonym',
  'quagmire', 'quandary', 'quarry', 'quintessence', 'quirk', 'rampart',
  'rapport', 'raptor', 'rarity', 'ravine', 'realm', 'rebuff',
  'rebuke', 'recluse', 'rectitude', 'refuge', 'regimen', 'reign',
  'reliquary', 'remnant', 'remorse', 'renown', 'repast', 'repertoire',
  'reprieve', 'reproach', 'requiem', 'reservoir', 'residue', 'resolve',
  'respite', 'reverie', 'rhetoric', 'rift', 'rigor', 'rigmarole',
  'rivulet', 'rogue', 'rostrum', 'ruckus', 'ruse', 'sanctuary',
  'savant', 'savor', 'scoundrel', 'scribe', 'scuttle', 'segue',
  'semblance', 'sentinel', 'serenity', 'shroud', 'sieve', 'silhouette',
  'siren', 'skein', 'skiff', 'skirmish', 'slumber', 'sojourn',
  'solace', 'solitude', 'soliloquy', 'specter', 'splendor', 'sprawl',
  'squall', 'stalwart', 'stature', 'stigma', 'stipend', 'strife',
  'stupor', 'subterfuge', 'succor', 'suitor', 'summit', 'sundry',
  'surge', 'swath', 'tableau', 'taboo', 'talisman', 'tangent',
  'tantrum', 'tapestry', 'tedium', 'temerity', 'tempest', 'tenacity',
  'tenet', 'thicket', 'threshold', 'thrum', 'tirade', 'titan',
  'token', 'torrent', 'torso', 'tract', 'tranquility', 'trauma',
  'travesty', 'treatise', 'trellis', 'tremor', 'tribute', 'trinket',
  'triumph', 'trove', 'tryst', 'tumult', 'tundra', 'turmoil',
  'tutelage', 'tycoon', 'umbrage', 'undertow', 'usurper', 'utopia',
  'vagary', 'valor', 'vanguard', 'vendetta', 'veneer', 'venue',
  'verge', 'vermin', 'vestige', 'vigil', 'vignette', 'vista',
  'voyage', 'waft', 'waif', 'waiver', 'wedge', 'whir',
  'whirlwind', 'wisp', 'woe', 'yarn', 'yonder', 'zenith', 'zephyr',
];

// Frozen Set for O(1) lookup; lower-cased once at module load.
export const RARE_WORDS = new Set<string>(
  RARE_WORDS_RAW.map((w) => w.toLowerCase())
);

/**
 * Returns true if the given word is in the curated rare-word list.
 * Strips common punctuation before lookup.
 */
export function isRareWord(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().replace(/[.,!?;:'"()\u2018\u2019\u201C\u201D]/g, '');
  return RARE_WORDS.has(clean);
}
