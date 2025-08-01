import type { UserInfo, DifficultyLevel } from "@/types";

export interface StoryTemplate {
  pages: string[];
  name: string;
}

export interface LanguageStoryTemplates {
  easy: StoryTemplate[];
  medium: StoryTemplate[];
  hard: StoryTemplate[];
  expert: StoryTemplate[];
}

export interface PronounSet {
  subject: string;
  object: string;
  possessive: string;
}

export interface LanguageConfig {
  templates: LanguageStoryTemplates;
  getPronouns: (gender: 'boy' | 'girl' | 'prefer-not-to-answer') => PronounSet;
  continuationText: (name: string, pronoun: string) => string;
  animalTranslations?: Record<string, string>;
  colorTranslations?: Record<string, string>;
}

// Helper function to get gender-appropriate pronouns for each language
const createPronounGetter = (
  boyPronouns: PronounSet,
  girlPronouns: PronounSet,
  neutralPronouns?: PronounSet
) => {
  return (gender: 'boy' | 'girl' | 'prefer-not-to-answer'): PronounSet => {
    if (gender === 'girl') return girlPronouns;
    if (gender === 'prefer-not-to-answer' && neutralPronouns) return neutralPronouns;
    return boyPronouns;
  };
};

// English language configuration
const englishConfig: LanguageConfig = {
  getPronouns: createPronounGetter(
    { subject: 'he', object: 'him', possessive: 'his' },
    { subject: 'she', object: 'her', possessive: 'her' },
    { subject: 'they', object: 'them', possessive: 'their' }
  ),
  continuationText: (name: string, pronoun: string) => `Meanwhile, ${name} continued ${pronoun} adventure.`,
  templates: {
    easy: [
      {
        name: "Morning Adventure",
        pages: [
          `{name} woke up early one morning.`,
          `Outside, {name} saw something wonderful.`,
          `A friendly {color} {animal} was playing.`,
          `"Hello!" said {name} with a smile.`,
          `The {animal} came over to play.`,
          `{subject_cap} had so much fun together.`,
          `{name} gave the {animal} some food.`,
          `"Thank you!" the {animal} seemed to say.`,
          `{subject_cap} became the very best friends.`,
          `Every day was full of joy.`
        ]
      },
      {
        name: "Garden Discovery",
        pages: [
          `{name} was playing in the garden.`,
          `{subject_cap} heard a soft sound.`,
          `Behind a {color} flower sat a tiny {animal}.`,
          `The {animal} looked lost and scared.`,
          `{name} sat down very quietly.`,
          `"Don't worry," {name} whispered softly.`,
          `The {animal} slowly came closer.`,
          `{name} was very gentle and kind.`,
          `Soon they were playing together happily.`,
          `{name} had found a wonderful new friend.`
        ]
      },
      {
        name: "Rainy Day Story",
        pages: [
          `It was raining outside today.`,
          `{name} felt a little sad inside.`,
          `Then {subject} saw a {color} {animal} outside.`,
          `The {animal} was getting very wet.`,
          `{name} opened the door quickly.`,
          `"Come in!" {name} called out warmly.`,
          `The {animal} ran inside gratefully.`,
          `{subject_cap} dried off by the warm fire.`,
          `Now the rainy day felt perfect.`,
          `{name} learned that helping feels wonderful.`
        ]
      }
    ],
    medium: [
      {
        name: "Magical Meeting",
        pages: [
          `{name} loved exploring the world around {object}.`,
          `One sunny afternoon, something magical happened.`,
          `A beautiful {color} {animal} appeared in {possessive} garden.`,
          `This wasn't just any ordinary {animal} - it was special.`,
          `"I've been waiting for someone like you," it said gently.`,
          `{name} felt excited and a little nervous too.`,
          `Together, they walked to a secret place.`,
          `The {animal} showed {name} hidden wonders everywhere.`,
          `"You have a kind heart," said the {animal} warmly.`,
          `From that day on, they shared amazing adventures.`
        ]
      }
    ],
    hard: [
      {
        name: "Courage Quest",
        pages: [
          `{name} had always felt different from other children.`,
          `While friends played normal games, {name} dreamed of bigger adventures.`,
          `One night, an extraordinary {color} {animal} arrived at {possessive} door.`,
          `"I need your help," said the {animal} urgently.`,
          `"There's trouble in the enchanted forest, and only someone with your courage can help."`,
          `{name} didn't hesitate - this was the adventure {subject} had been waiting for.`,
          `{subject_cap} traveled through mysterious paths filled with wonder and danger.`,
          `Along the way, {name} discovered hidden strengths and new confidence.`,
          `Together, they solved the forest's ancient mystery.`,
          `{name} returned home changed forever, knowing {subject} was truly special.`
        ]
      }
    ],
    expert: [
      {
        name: "World Bridge",
        pages: [
          `{name} had always possessed an unusual gift for understanding the world differently.`,
          `Where others saw ordinary things, {name} glimpsed the extraordinary magic hidden beneath.`,
          `The arrival of a wise {color} {animal} confirmed what {name} had long suspected.`,
          `"Your perspective is needed to heal an ancient rift between our worlds," it explained.`,
          `This wasn't just about helping - this was about {name}'s destiny and purpose.`,
          `The journey would test not only {name}'s courage but {possessive} wisdom and compassion.`,
          `Through trials that challenged everything {name} believed about {object}self, {subject} persevered.`,
          `The {animal} became not just a guide, but a teacher of life's deepest truths.`,
          `By the story's end, {name} had not only saved both worlds but discovered {possessive} true calling.`,
          `The adventure was over, but {name}'s real journey of purpose had only just begun.`
        ]
      }
    ]
  }
};

// Spanish language configuration
const spanishConfig: LanguageConfig = {
  getPronouns: createPronounGetter(
    { subject: 'él', object: 'lo', possessive: 'su' },
    { subject: 'ella', object: 'la', possessive: 'su' }
  ),
  continuationText: (name: string, pronoun: string) => `Mientras tanto, ${name} continuó ${pronoun} aventura.`,
  animalTranslations: {
    'cat': 'gato',
    'dog': 'perro',
    'bird': 'pájaro',
    'rabbit': 'conejo',
    'bear': 'oso',
    'fox': 'zorro'
  },
  colorTranslations: {
    'blue': 'azul',
    'red': 'rojo',
    'green': 'verde',
    'yellow': 'amarillo',
    'purple': 'morado',
    'pink': 'rosa',
    'orange': 'naranja'
  },
  templates: {
    easy: [
      {
        name: "Aventura Matutina",
        pages: [
          `{name} se despertó temprano una mañana.`,
          `Afuera, {name} vio algo maravilloso.`,
          `Un {animal} {color} amigable estaba jugando.`,
          `"¡Hola!" dijo {name} con una sonrisa.`,
          `El {animal} se acercó a jugar.`,
          `{subject_cap} se divirtieron mucho juntos.`,
          `{name} le dio comida al {animal}.`,
          `"¡Gracias!" el {animal} parecía decir.`,
          `{subject_cap} se convirtieron en los mejores amigos.`,
          `Cada día estaba lleno de alegría.`
        ]
      },
      {
        name: "Descubrimiento en el Jardín",
        pages: [
          `{name} estaba jugando en el jardín.`,
          `{subject_cap} escuchó un sonido suave.`,
          `Detrás de una flor {color} estaba sentado un pequeño {animal}.`,
          `El {animal} se veía perdido y asustado.`,
          `{name} se sentó muy tranquilo.`,
          `"No te preocupes," susurró {name} suavemente.`,
          `El {animal} se acercó lentamente.`,
          `{name} fue muy gentil y amable.`,
          `Pronto estuvieron jugando juntos felizmente.`,
          `{name} había encontrado un nuevo amigo maravilloso.`
        ]
      },
      {
        name: "Historia del Día Lluvioso",
        pages: [
          `Estaba lloviendo afuera hoy.`,
          `{name} se sintió un poco triste por dentro.`,
          `Entonces {subject} vio un {animal} {color} afuera.`,
          `El {animal} se estaba mojando mucho.`,
          `{name} abrió la puerta rápidamente.`,
          `"¡Entra!" gritó {name} cálidamente.`,
          `El {animal} corrió adentro agradecido.`,
          `{subject_cap} se secó junto al fuego cálido.`,
          `Ahora el día lluvioso se sintió perfecto.`,
          `{name} aprendió que ayudar se siente maravilloso.`
        ]
      }
    ],
    medium: [
      {
        name: "Encuentro Mágico",
        pages: [
          `A {name} le encantaba explorar el mundo a su alrededor.`,
          `Una tarde soleada, algo mágico sucedió.`,
          `Un hermoso {animal} {color} apareció en su jardín.`,
          `Este no era un {animal} ordinario - era especial.`,
          `"He estado esperando a alguien como tú," dijo gentilmente.`,
          `{name} se sintió emocionado y un poco nervioso también.`,
          `Juntos, caminaron a un lugar secreto.`,
          `El {animal} le mostró a {name} maravillas ocultas por todas partes.`,
          `"Tienes un corazón bondadoso," dijo el {animal} cálidamente.`,
          `Desde ese día, compartieron aventuras increíbles.`
        ]
      }
    ],
    hard: [
      {
        name: "Misión de Coraje",
        pages: [
          `{name} siempre se había sentido diferente de otros niños.`,
          `Mientras los amigos jugaban juegos normales, {name} soñaba con aventuras más grandes.`,
          `Una noche, un extraordinario {animal} {color} llegó a su puerta.`,
          `"Necesito tu ayuda," dijo el {animal} urgentemente.`,
          `"Hay problemas en el bosque encantado, y solo alguien con tu coraje puede ayudar."`,
          `{name} no dudó - esta era la aventura que había estado esperando.`,
          `{subject_cap} viajó por senderos misteriosos llenos de maravilla y peligro.`,
          `En el camino, {name} descubrió fuerzas ocultas y nueva confianza.`,
          `Juntos, resolvieron el misterio antiguo del bosque.`,
          `{name} regresó a casa cambiado para siempre, sabiendo que era verdaderamente especial.`
        ]
      }
    ],
    expert: [
      {
        name: "Puente del Mundo",
        pages: [
          `{name} siempre había poseído un don inusual para entender el mundo de manera diferente.`,
          `Cuando otros veían cosas ordinarias, {name} vislumbraba la magia extraordinaria oculta debajo.`,
          `La llegada de un sabio {animal} {color} confirmó lo que {name} había sospechado por mucho tiempo.`,
          `"Tu perspectiva es necesaria para sanar una grieta antigua entre nuestros mundos," explicó.`,
          `Esto no se trataba solo de ayudar - se trataba del destino y propósito de {name}.`,
          `El viaje pondría a prueba no solo el coraje de {name} sino su sabiduría y compasión.`,
          `A través de pruebas que desafiaron todo lo que {name} creía sobre sí mismo, perseveró.`,
          `El {animal} se convirtió no solo en un guía, sino en un maestro de las verdades más profundas de la vida.`,
          `Al final de la historia, {name} no solo había salvado ambos mundos sino descubierto su verdadera vocación.`,
          `La aventura había terminado, pero el verdadero viaje de propósito de {name} apenas había comenzado.`
        ]
      }
    ]
  }
};

// Main registry of all supported languages
export const STORY_LANGUAGES: Record<string, LanguageConfig> = {
  'en': englishConfig,
  'es': spanishConfig,
  // Framework ready for other languages:
  // 'fr': frenchConfig,
  // 'pt': portugueseConfig,
  // 'ar': arabicConfig,
  // 'zh': chineseConfig,
  // 'hi': hindiConfig,
};

// Helper function to process story templates with user data
export function processStoryTemplate(
  template: StoryTemplate,
  userInfo: UserInfo,
  language: string
): string[] {
  const config = STORY_LANGUAGES[language] || STORY_LANGUAGES['en'];
  const name = userInfo.name || 'Alex';
  const gender = userInfo.avatar?.type || 'boy';
  const pronouns = config.getPronouns(gender);
  
  // Get translated animal and color if available
  let animal = userInfo.favoriteAnimal || 'cat';
  let color = userInfo.favoriteColor || 'blue';
  
  if (config.animalTranslations && config.animalTranslations[animal]) {
    animal = config.animalTranslations[animal];
  }
  
  if (config.colorTranslations && config.colorTranslations[color]) {
    color = config.colorTranslations[color];
  }
  
  // Process each page with variable substitution
  return template.pages.map((page, index) => {
    const processedPage = page
      .replace(/{name}/g, name)
      .replace(/{animal}/g, animal)
      .replace(/{color}/g, color)
      .replace(/{subject}/g, pronouns.subject)
      .replace(/{subject_cap}/g, pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1))
      .replace(/{object}/g, pronouns.object)
      .replace(/{possessive}/g, pronouns.possessive)
      // Clean up any remaining malformed characters or brackets
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\{[^}]*\}/g, '') // Remove any unmatched template variables
      .replace(/\s+/g, ' ') // Clean up extra whitespace
      .trim();
    
    // Log for debugging if there are suspicious characters
    if (processedPage.includes(']') || processedPage.includes('[') || processedPage.includes('{')) {
      console.warn(`Malformed text detected on page ${index + 1}:`, processedPage);
    }
    
    return processedPage;
  });
}

// Helper function to get random story template for a language/difficulty
export function getRandomStoryTemplate(
  language: string,
  difficulty: DifficultyLevel
): StoryTemplate {
  const config = STORY_LANGUAGES[language] || STORY_LANGUAGES['en'];
  const templates = config.templates[difficulty];
  
  if (!templates || templates.length === 0) {
    // Fallback to English if no templates available for this difficulty
    const fallbackTemplates = STORY_LANGUAGES['en'].templates[difficulty];
    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Helper function to get continuation text in the user's language
export function getContinuationText(
  name: string,
  userInfo: UserInfo,
  language: string
): string {
  const config = STORY_LANGUAGES[language] || STORY_LANGUAGES['en'];
  const gender = userInfo.avatar?.type || 'boy';
  const pronouns = config.getPronouns(gender);
  
  return config.continuationText(name, pronouns.possessive);
}